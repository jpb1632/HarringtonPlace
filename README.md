# 의정부역 해링턴플레이스

정적 HTML / Gulp / iframe 구조의 분양 홈페이지입니다. 최종 작업과 GitHub Pages 배포는 `main` 브랜치를 사용합니다.

## 로컬 확인

```sh
npm install
npm run preview
```

콘솔에 표시된 미리보기 주소에서 확인합니다. 기존 메뉴·슬라이더·상담 기능과 `new-assets/paragon/` 내부 경로를 유지합니다.

## 배포 파일 생성

```sh
npm run build:deploy
```

`deployment.config.json`의 주소를 기준으로 `dist/`를 만듭니다. 현재 주소는 `https://jpb1632.github.io/HarringtonPlace/`입니다.

- HTML·CSS·JS에서 참조하는 자산과 인코딩된 영상 경로를 복사합니다.
- 공유 이미지·canonical·OG URL·sitemap을 배포 주소에 맞춰 생성합니다.
- 원본 자산과 `reference/`는 삭제하지 않습니다. 기존의 사용하지 않는 이미지와 원본 시안은 배포 폴더에 포함하지 않습니다.
- 실제 경로 대소문자와 누락된 파일을 검사합니다.
- 생성된 `dist/`는 Git에 넣지 않습니다.
- 이 명령은 배포하거나 상담을 전송하지 않습니다.

임시 주소로 검증하려면:

```sh
npm run build:deploy -- --url https://example.com/
```

## GitHub Pages

1. 저장소 **Settings → Pages → Source**를 **GitHub Actions**로 선택합니다.
2. **Settings → Environments → github-pages**에 배포 브랜치 제한이 있다면 `main`을 허용합니다.
3. 검증된 변경사항을 `main`에 커밋·푸시합니다.
4. **Actions → Deploy prepared static site**에서 빌드·배포 결과를 확인합니다. Pages 설정 전에 이미 푸시했다면 설정 완료 후 해당 실행의 **Re-run all jobs**를 사용합니다.
5. 배포 완료 후 `/HarringtonPlace/` 주소의 메인·메뉴·아이콘·영상을 확인합니다.

워크플로는 `main`에 push할 때 실행됩니다. **Run workflow**에서 main을 선택해 수동 배포할 수도 있습니다. 저장소 root 전체를 직접 배포하는 방식은 사용하지 않습니다.

GitHub Pages는 온라인 사업·상업 거래 촉진 사이트 용도를 제한합니다. 운영 서비스의 정책 적합성은 별도로 확인해야 합니다.
https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

## 가비아 도메인 연결 후

`deployment.config.json`을 다음과 같이 바꿉니다. 예시는 실제로 구매한 도메인으로 교체합니다.

```json
{
  "siteUrl": "https://구매한도메인/",
  "shareImage": "new-assets/paragon/og_p1.png",
  "customDomain": "구매한도메인"
}
```

다시 배포하면 `dist/CNAME`, OG·canonical·sitemap URL도 새 주소로 생성됩니다. GitHub Pages의 Custom domain 설정과 가비아 DNS 연결은 별도로 필요합니다. DNS 검증 후 HTTPS를 활성화합니다.

기존 회천 현장 도메인은 제거했습니다. 파비콘과 manifest는 상대경로이므로 기본 GitHub 주소와 자체 도메인에서 모두 사용할 수 있습니다.

## 상담·분석 연동

대표번호 `1688-4008`, Google Apps Script 상담 접수, Google Ads·GA4·Clarity·Statcounter는 사용자의 확인에 따라 유지합니다.

2026-10-09 사용자가 허용한 실제 상담 테스트 1건은 이름 `배포점검`, 테스트 번호 `01000000000`, 실제 예약이 아니라는 안내 문구로 전송했으며 HTTP 200 및 `result: success` 응답을 확인했습니다. 수신함·스프레드시트 기록은 이 응답만으로 확인할 수 없습니다. 이후 점검은 모의 전송을 사용합니다.
