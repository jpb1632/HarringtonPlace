# Paragon 랜딩페이지

`I-Park Central` 홈페이지를 기반으로 복제한 Paragon 작업본입니다.
원본 폴더에는 영향을 주지 않고, 이 폴더에서 이미지, 문구, 현장 정보만 바꿔 새 분양 홈페이지로 이어서 작업하면 됩니다.

## 시작하기

- `npm install`
- `npm run preview`

## 현재 상태

- `I-Park Central`의 현재 작업본 기준으로 소스 구조를 복제
- 새 폴더명은 `Paragon`
- 원본과 분리하기 위해 `.git`은 제외하고 생성
- `npm install` 완료
- 패키지 이름은 `paragon`으로 변경
- 빠른상담신청 접수 URL과 대표번호는 기존 동작을 유지

## 먼저 바꾸면 좋은 항목

- `index.html`의 제목과 Open Graph 메타데이터
- 메인 페이지와 메뉴 페이지 내부의 현장명 텍스트
- 현장 상세정보, 이미지, 개인정보 문구
- 대표 이미지와 배포 URL
- `CNAME`의 배포 도메인

## 실행 스크립트

- `npm run preview`: Gulp 기반 미리보기 실행
- `npm run serve`: temha 서버 실행
