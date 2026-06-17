# 온라인 배포 가이드 (개발비 산정 실습 publish)

각 개인이 URL 하나로 접속해 실습할 수 있도록 **정적 사이트로 publish** 합니다.
이 앱은 백엔드·라우터가 없는 단일 페이지(SPA)라 어떤 정적 호스트에도 그대로 올라갑니다.
`vite.config.js` 의 `base: "./"` 덕분에 루트 도메인이든 서브경로든 동작합니다.

> ⚠ 공개 범위 주의: 본 도구는 Seed 계수를 포함한 **제안용 프로토타입**입니다.
> 사내 한정이면 비공개(암호/팀 멤버 전용) 옵션을, 일반 공개면 공개 URL을 선택하세요.

배포 결과물은 항상 `npm run build` 가 만든 `dist/` 폴더입니다.

---

## 방법 A. Netlify Drop — 계정 가입만, CLI 불필요 (가장 빠름)

1. `npm run build` (→ `dist/` 생성)
2. 브라우저에서 https://app.netlify.com/drop 접속 (로그인/가입)
3. `costbook-ai/dist` 폴더를 페이지에 **드래그&드롭**
4. 즉시 `https://<랜덤이름>.netlify.app` 공개 URL 발급 → 팀에 공유
5. (선택) Site settings 에서 도메인 이름 변경, Access control 로 비공개 설정

## 방법 B. Vercel — git 연동 자동 배포

1. 이 폴더를 GitHub 리포지토리로 push
2. https://vercel.com → New Project → 리포 import
3. Framework=Vite 자동 인식 (`vercel.json` 포함됨) → Deploy
4. `https://<프로젝트>.vercel.app` 발급, 이후 push 시 자동 재배포
   - CLI 선호 시: `npm i -g vercel && vercel` (최초 1회 브라우저 인증)

## 방법 C. GitHub Pages — 무료, 리포 공개 필요

1. 이 폴더를 GitHub 리포지토리로 push (`.github/workflows/deploy.yml` 포함됨)
2. 리포 Settings → Pages → Source = **GitHub Actions**
3. main 브랜치 push 시 워크플로가 자동 빌드·게시
4. `https://<계정>.github.io/<리포>/` 발급
   - 서브경로 배포지만 `base:"./"` 라 그대로 동작

---

## 빠른 점검 (배포 전 로컬에서 빌드 결과 확인)

```bash
npm run build
npm run preview        # http://localhost:4173 에서 dist/ 그대로 미리보기
```

## 어떤 걸 고를까

| 상황 | 추천 |
|------|------|
| 지금 당장, 계정 인증 최소화 | **Netlify Drop (A)** |
| git 으로 버전 관리하며 자동 재배포 | Vercel (B) |
| 이미 GitHub 사용 중, 무료 공개 OK | GitHub Pages (C) |
