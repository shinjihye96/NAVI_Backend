import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Patient } from '../entities/patient.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password, nickname, patient: patientDto, ...userData } = signupDto;

    // Check email duplicate
    const existingEmail = await this.userRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // Check nickname duplicate
    const existingNickname = await this.userRepository.findOne({ where: { nickname } });
    if (existingNickname) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      ...userData,
      email,
      nickname,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    // Create patient if provided
    if (patientDto) {
      const patient = this.patientRepository.create({
        ...patientDto,
        userId: user.id,
      });
      await this.patientRepository.save(patient);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        userType: user.userType,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const tokens = await this.generateTokens(user.id);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        userType: user.userType,
        profileImage: user.profileImage,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      const tokens = await this.generateTokens(user.id);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  async logout(userId: string) {
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ refreshToken: () => 'NULL' })
      .where('id = :id', { id: userId })
      .execute();
    return { message: '로그아웃 되었습니다.' };
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, { refreshToken: hashedRefreshToken });
  }
}
