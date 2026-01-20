import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyQuestion } from '../entities/daily-question.entity';
import { DailyAnswer } from '../entities/daily-answer.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { QueryAnswerDto, QueryFeedDto } from './dto/query-answer.dto';

@Injectable()
export class DailyQuestionsService {
  constructor(
    @InjectRepository(DailyQuestion)
    private questionRepository: Repository<DailyQuestion>,
    @InjectRepository(DailyAnswer)
    private answerRepository: Repository<DailyAnswer>,
  ) {}

  async getTodayQuestion(userId: string) {
    // 활성화된 질문들 조회
    const questions = await this.questionRepository.find({
      where: { isActive: true },
      order: { questionOrder: 'ASC' },
    });

    if (questions.length === 0) {
      throw new NotFoundException('등록된 질문이 없습니다.');
    }

    // 날짜 기반으로 질문 순환 (오늘 날짜 기준)
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const questionIndex = dayOfYear % questions.length;
    const todayQuestion = questions[questionIndex];

    // 오늘 날짜로 이미 답변했는지 확인
    const todayDateStr = today.toISOString().split('T')[0];
    const existingAnswer = await this.answerRepository.findOne({
      where: {
        userId,
        questionId: todayQuestion.id,
        answeredDate: new Date(todayDateStr),
      },
    });

    // 남은 시간 계산
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const remainingMs = endOfDay.getTime() - today.getTime();
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      id: todayQuestion.id,
      content: todayQuestion.content,
      hasAnswered: !!existingAnswer,
      remainingTime: `${remainingHours}시간 ${remainingMinutes}분`,
    };
  }

  async createAnswer(userId: string, createDto: CreateAnswerDto) {
    const { questionId, content, imageUrl, weather } = createDto;

    // 질문 존재 확인
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('질문을 찾을 수 없습니다.');
    }

    // 오늘 날짜
    const today = new Date();
    const todayDateStr = today.toISOString().split('T')[0];
    const answeredDate = new Date(todayDateStr);

    // 이미 답변했는지 확인
    const existingAnswer = await this.answerRepository.findOne({
      where: {
        userId,
        questionId,
        answeredDate,
      },
    });

    if (existingAnswer) {
      throw new BadRequestException('오늘 이미 답변하셨습니다.');
    }

    // 답변 생성
    const answer = this.answerRepository.create({
      userId,
      questionId,
      content,
      imageUrl,
      weather,
      answeredDate,
    });

    await this.answerRepository.save(answer);

    return {
      id: answer.id,
      questionId: answer.questionId,
      content: answer.content,
      imageUrl: answer.imageUrl,
      weather: answer.weather,
      answeredDate: todayDateStr,
      createdAt: answer.createdAt,
    };
  }

  async getMyAnswers(userId: string, queryDto: QueryAnswerDto) {
    const { page = 1, limit = 20 } = queryDto;

    const [items, totalCount] = await this.answerRepository.findAndCount({
      where: { userId },
      relations: ['question'],
      order: { answeredDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map((answer) => ({
        id: answer.id,
        question: {
          id: answer.question.id,
          content: answer.question.content,
        },
        content: answer.content,
        imageUrl: answer.imageUrl,
        weather: answer.weather,
        answeredDate: answer.answeredDate,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getFeed(userId: string, queryDto: QueryFeedDto) {
    const { date, page = 1, limit = 20 } = queryDto;

    // 날짜 설정 (기본: 오늘)
    const targetDate = date ? new Date(date) : new Date();
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // 해당 날짜의 질문 가져오기
    const questions = await this.questionRepository.find({
      where: { isActive: true },
      order: { questionOrder: 'ASC' },
    });

    if (questions.length === 0) {
      throw new NotFoundException('등록된 질문이 없습니다.');
    }

    const startOfYear = new Date(targetDate.getFullYear(), 0, 0);
    const diff = targetDate.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const questionIndex = dayOfYear % questions.length;
    const targetQuestion = questions[questionIndex];

    // 해당 날짜의 답변들 조회
    const queryBuilder = this.answerRepository
      .createQueryBuilder('answer')
      .leftJoinAndSelect('answer.user', 'user')
      .where('answer.answeredDate = :answeredDate', { answeredDate: targetDateStr })
      .andWhere('answer.questionId = :questionId', { questionId: targetQuestion.id });

    const totalCount = await queryBuilder.getCount();

    const items = await queryBuilder
      .orderBy('answer.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      question: {
        id: targetQuestion.id,
        content: targetQuestion.content,
      },
      items: items.map((answer) => ({
        id: answer.id,
        user: {
          id: answer.user.id,
          nickname: answer.user.nickname,
          profileImage: answer.user.profileImage,
          userType: answer.user.userType,
        },
        content: answer.content,
        imageUrl: answer.imageUrl,
        weather: answer.weather,
        createdAt: answer.createdAt,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }
}
