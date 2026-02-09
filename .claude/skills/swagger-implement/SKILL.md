# Swagger 스펙 기반 API 구현

## 절차

1. 사용자에게 Swagger 엔드포인트 정보를 요청하거나 스펙 파일을 읽는다
2. 스펙에서 **정확한 필드명, 타입, enum 값**을 목록으로 정리한다
3. 계획한 request/response TypeScript 타입을 보여주고 **구현 전 확인**을 받는다
4. DTO → Service → Controller 순서로 구현한다
5. 모든 enum 값이 스펙과 정확히 일치하는지 검증한다
6. `npm run build`로 타입 에러를 확인한다

## 주의사항

- 필드명을 추측하지 말 것 — 스펙에 없으면 사용자에게 확인
- optional/required 구분을 스펙 그대로 반영
- 날짜/시간 필드는 KST 타임존 처리 확인
