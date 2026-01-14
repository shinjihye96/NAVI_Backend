# 🦋 NAVI Backend

소아암 환우와 보호자를 위한 심리사회적 지지 커뮤니티 플랫폼

## 기술 스택

- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: TypeORM
- **Auth**: JWT

## 주요 기능

- **하루공유**: 매일 기분 이모지 + 세줄일기 기록
- **공감하기**: 6종 이모지 반응
- **팔로우**: 관심 유저 팔로우/피드 구독

## 🤖 AI로 구현하기

이 프로젝트는 **Claude AI**를 활용하여 개발했습니다.

- 기획 문서 분석 및 ERD 설계
- API 명세서 작성
- NestJS 백엔드 구현
- 코드 리뷰 및 리팩토링

## 실행 방법

```bash
# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env

# 서버 실행
npm run start:dev
```

## 문서

- [ERD 설계](./docs/ERD.md)
- [API 명세서](./docs/API.md)

## 관련 링크

- [Frontend Repository](https://github.com/shinjihye96/NAVI)
