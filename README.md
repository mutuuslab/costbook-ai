# SW Cost Book AI v6.1 — 로컬 실행 환경

현대자동차 구매개발팀 제안용 **자동차 SW 개발비 산정 AI 도구**의 로컬 개발/검증 환경입니다.
원본 단일 파일(`costbook_final.jsx`)을 **순수 계산 엔진**과 **React UI**로 분리하여,
엔진을 단위 테스트로 검증할 수 있게 구성했습니다.

## 구조

```
costbook-ai/
├── index.html
├── vite.config.js          # dev 포트 9001 (포트 8000 금지 규칙 준수)
├── package.json
└── src/
    ├── main.jsx            # React entry
    ├── engine.js           # ★ 순수 비용 산정 엔진 (상수 + calc/calcQ/sf), UI 비의존
    ├── engine.test.js      # ★ 정합성/회귀 테스트 (Vitest, 32 케이스)
    └── App.jsx             # 9개 탭 UI (engine.js 를 import)
```

> 원본 `costbook_final.jsx` 는 모든 것을 한 파일에 담았으나, 검증을 위해 엔진을 분리했습니다.
> **계산 로직은 원본과 100% 동일**합니다(상수·공식 그대로 추출).

## 실행

```bash
npm install
npm run dev        # http://localhost:9001 (자동 오픈)
npm test           # 엔진 정합성/회귀 테스트 (Vitest)
npm run build      # 프로덕션 빌드 → dist/
```

## 엔진 정합성 검증 결과 (요약)

| 항목 | 결론 |
|------|------|
| 코드 ↔ v6.1 개발문서(`COSTBOOK_AI_DEV_GUIDE.md`) | **일치** |
| 코드 ↔ v4 Rationale(`costbook_v4_reference_rationale.md`) | **불일치 (v4 문서가 구버전)** |
| Should-Cost 에 직접비 포함 | 포함 (v6.1 기준). v4 문서 공식은 누락 |
| ASPICE overhead | PM 공수에 복리(asp²) 적용 — v6.1 문서·코드 공통 특성, **의도 확인 필요** |
| `sf()` 경계 | strict `>` 사용 → 정확히 150/250/400 FP 는 아래 구간(문서 `≤` 표기와 일치) |
| 상수 무결성 | calcQ 가중치 합=1.00, 구현방식 비용비율 합=1.00, 계수 단조성 OK |

자세한 근거와 수치상태는 `../costbook_v6.1_reference_rationale.md` 참조.

## 알려진 제한 (원본 동일)

- **상태 비영속**: localStorage 미사용 → 새로고침 시 초기화 (로드맵 v7 예정)
- **데모 난수**: Gap 견적/증적 Gate/실적 탭은 `Math.random()` 으로 초기화 (실데이터 입력 전 표시용)
- Feature 삭제 기능 없음, 단일 프로젝트, 데스크톱 우선
