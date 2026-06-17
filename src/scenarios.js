// ════════════════════════════════════════════════════════════════
// 개발비 산정 실습 시나리오 — 개발비실습_0617.pptx 전사(구조화 카드)
// 교육생이 선택하면 feature 가 플랫폼에 로드되어 산정 실습을 진행한다.
// feature 의 모든 값은 engine.js enum 키 (ADAS/CO_REVAL/HIGH/B/...).
// ════════════════════════════════════════════════════════════════

export const SCENARIOS = [
  {
    id: "S1",
    no: "①",
    title: "ADAS 전방카메라 SW (ASIL B)",
    badge: "ADAS · ASIL B",
    overview:
      "전방 충돌·차선 인식용 ADAS 카메라 SW. 기능안전 ASIL B, OTA·사이버 영향 큼. 공통 알고리즘·재사용 자산이 섞여 있어 NRE 중복 청구와 Royalty 기준이 핵심 쟁점.",
    feature: { id: "FTR-S1", name: "ADAS 전방카메라 SW(전방충돌·차선)", domain: "ADAS", devType: "CO_REVAL", complexity: "HIGH", size: 150, asil: "B", cyber: "MID", ota: "FULL", variant: "MANY", vehicleApp: "DIFF_CAL" },
    mech: "monitoring",
    costMap: [
      { slide: "NRE (비반복 개발)", platform: "개발비 + 직접비 + 통합비 + 도구비" },
      { slide: "검증 (V&V)", platform: "검증비 (ASIL B ≈ 1.6~2.0×)" },
      { slide: "Change Mgmt", platform: "Tab⑤ CR 변경비" },
      { slide: "Royalty (반복 단가)", platform: "⚠ 미모델링 — 협상 항목으로 별도" },
    ],
    checkPoints: [
      "NRE 범위에 고객 전용 개발분만 포함되는가? (공통/재사용 자산 중복 청구 여부)",
      "공통 알고리즘·재사용 자산이 NRE에 중복 청구되는가?",
      "Royalty 기준 단위가 명확한가? (차량/ECU/기능 중 무엇인가)",
      "ASIL B 검증(V&V) 공수가 적정한가? (참고 배수 ≈1.6~2.0)",
      "OTA·사이버 비용이 별도 항목으로 식별되는가?",
    ],
    questions: [
      "NRE 타입은 어떻게 나뉘며, 재사용분이 신규개발로 청구되지 않는가?",
      "로열티 산정 기준(차량/ECU/기능)이 무엇이고 양산 볼륨과 연계되는가?",
      "ASIL B 충족을 위한 검증 공수가 견적에 명확히 잡혀 있는가?",
      "OTA·사이버 증적 비용이 누락 또는 과다 계상되지 않았는가?",
    ],
    negotiation: [
      "고객 전용 개발분만 NRE로, 공통 모듈은 Royalty/라이선스로 분리",
      "양산 볼륨 연계 단가표로 Royalty 기준 합의",
      "검증비는 ASIL B 증적 요구와 연동해 근거 제시",
    ],
  },
  {
    id: "S2",
    no: "②",
    title: "IVI 인포테인먼트",
    badge: "IVI · QM",
    overview:
      "디스플레이 UI/UX·앱·서비스 연동, 플랫폼 커스터마이징, 다수 3rd-party/OSS 통합. 'Full NRE' 일괄 청구의 한계를 짚고, 재사용·라이프사이클을 반영한 가격 구조로 정렬하는 것이 목표.",
    feature: { id: "FTR-S2", name: "IVI 인포테인먼트(UI·앱·서비스)", domain: "IVI", devType: "NEW", complexity: "MID", size: 120, asil: "QM", cyber: "HIGH", ota: "FULL", variant: "FEW", vehicleApp: "SAME" },
    mech: "degradation",
    costMap: [
      { slide: "NRE (커스터마이징)", platform: "개발비 + 직접비 + 통합비" },
      { slide: "유지보수·OTA", platform: "검증비 + Tab⑤ CR (라이프사이클)" },
      { slide: "Royalty / 라이선스", platform: "⚠ 미모델링 — 3rd-party/OSS 별도" },
      { slide: "리스크", platform: "리스크비" },
    ],
    checkPoints: [
      "재사용 플랫폼까지 Full NRE로 청구되는가? (초기 개발비 과다)",
      "전체 NRE 청구 시 라이프사이클(유지보수·OTA) 비용이 분리되는가?",
      "3rd-party/OSS 라이선스·로열티가 NRE와 구분되는가?",
      "기능·OTA 갱신 주기와 단가가 명확한가?",
    ],
    questions: [
      "Full NRE가 왜 협상상 불리한가? (초기 일괄 vs 라이프사이클 분산)",
      "어떤 항목을 고정비(초기)와 반복비(사용량·구독)로 분리할 것인가?",
      "Hybrid(Royalty/라이선스 + 고객 커스터마이징 NRE + OTA 기간계약) 구조에서 책임·범위·SLA를 어떻게 명확히 하는가?",
    ],
    negotiation: [
      "공통 플랫폼은 Royalty/라이선스, 고객 커스터마이징분만 NRE",
      "OTA·유지보수는 기간계약(구독)으로 분리",
      "재사용·라이프사이클을 반영한 가격 구조로 정렬",
    ],
  },
  {
    id: "S3",
    no: "③",
    title: "파워트레인 제어 ECU (ASIL D)",
    badge: "PT · ASIL D",
    overview:
      "제어 SW + ECU 통합, 안전 요구 최고(ASIL D), ISO 26262 대응 공수 큼. ASIL D 안전활동(독립검증·정밀 분석·증적)으로 검증 공수가 대폭 증가 — '범위와 근거가 명확할 때만' 정당화된다.",
    feature: { id: "FTR-S3", name: "파워트레인 제어 ECU SW(ASIL D)", domain: "PT", devType: "NEW", complexity: "HIGH", size: 140, asil: "D", cyber: "LOW", ota: "BASIC", variant: "FEW", vehicleApp: "SAME" },
    mech: "redundancy",
    costMap: [
      { slide: "NRE (제어 SW 개발)", platform: "개발비 + 직접비 + 통합비 + 도구비" },
      { slide: "검증 (ASIL D V&V)", platform: "검증비 (ASIL D + 이중화 메커니즘 가산)" },
      { slide: "안전 분석·증적", platform: "검증비에 포함 (FMEA/FTA/Safety Case)" },
      { slide: "리스크", platform: "리스크비" },
    ],
    checkPoints: [
      "가산(검증 증가)이 적용된 범위가 개발·검증 전체인가, 안전 활동에 한정인가?",
      "추가 산정 항목(독립검증·리뷰·문서·증적)이 명시·근거 제시되는가?",
      "이미 공용 안전 자산이 있는 경우 중복 청구가 아닌가?",
      "양산 이후 변경·재인증 비용 근거가 분리되는가?",
    ],
    questions: [
      "ASIL D 검증 가산이 어디(개발/검증/문서)에 얼마나 적용되는가?",
      "추가 안전활동(HARA/FMEA/FTA·독립검증·증적)이 견적에 별도로 잡혀 있는가?",
      "재사용 가능한 안전 자산을 차감했는가?",
      "변경·재인증 비용을 미리 합의했는가?",
    ],
    negotiation: [
      "가산은 안전활동 공수에 한정, 적용 범위를 근거로 합의",
      "독립검증·증적은 ISO 26262 요구와 매핑해 정당화",
      "공용 안전 자산은 차감, 변경·재인증은 별도 단가",
    ],
  },
];

// 슬라이드④ — 협상전략 수립 워크숍(그룹 실습 진행 가이드)
export const WORKSHOP = {
  title: "협상전략 수립 워크숍 (그룹 실습)",
  intro:
    "그룹별로 한 시나리오를 골라 ① 비용을 산정하고 ② 계약·협상 전략을 수립한 뒤 ③ 발표·상호 토론합니다. 플랫폼의 각 탭이 단계에 1:1로 대응합니다.",
  // 진행 5단계 — 각 단계가 어떤 작업이고 플랫폼 어느 탭에서 하는지
  steps: [
    { n: "①", name: "시나리오 분석", detail: "시장·고객·요구, 법규·기능안전(ASIL), 요구사항 범위와 핵심 비용동인 파악", tab: "🎓 실습 탭에서 시나리오 선택" },
    { n: "②", name: "비용 구조 분해", detail: "NRE(비반복) vs 반복비 구분, 개발/검증 비중, OTA·사이버 별도화, 산정근거 확인", tab: "② 아키텍처 (Should-Cost·산정근거)" },
    { n: "③", name: "계약 모델 선택", detail: "NRE / Royalty·라이선스 / 기간계약(OTA·유지보수) 조합 설계, 고정비·반복비 분리", tab: "(개념 설계) + ④ Gap·계약" },
    { n: "④", name: "협상 포인트 정리", detail: "핵심 협상카드, 양보/방어 라인, 재사용 차감, 리스크·책임·SLA·변경(CR)", tab: "④ Gap·계약 + ⑤ CR" },
    { n: "⑤", name: "발표 & 토론", detail: "그룹별 5분 발표, 상호 피드백, 우수 사례 공유", tab: "대시보드로 결과 공유" },
  ],
  // 그룹 발표 항목
  present: [
    "범위·전체 비용 구조와 가정·일정",
    "비용 항목 분해(개발/검증/통합) + 고정비·반복비",
    "NRE·Royalty·OTA 구조를 어떻게 분리했는가",
    "주요 리스크(과소·과다 견적, 재사용 중복, 증적 누락)와 대응",
    "협상안(양보 가능/불가)과 기대 효과",
  ],
  // 토론 체크 포인트(상호 검증 질문)
  discuss: [
    "제안 구조가 재사용분과 양산 구조를 반영하는가?",
    "고정비와 반복비가 명확히 분리되는가?",
    "검증·기능안전 비용의 근거가 충분한가?",
    "변경(CR)·OTA·유지보수 책임이 명확한가?",
    "공급사와 구매팀 모두에게 설명 가능한 가격인가?",
  ],
  // 공통 평가 기준(각 1~5점)
  criteria: [
    "타당성 — 근거 기반 산정",
    "투명성 — 항목·기준 명확",
    "리스크 대응 — 누락·과다 식별",
    "설명 가능성 — 고객 설득력",
  ],
  evalMethod: "각 기준 1~5점 → 합산·평균, 코멘트 기록 후 우수 사례 공유",
  outputs: ["그룹별 협상안 1장", "공통 협상 기준표(Q&A 상정)", "후속 액션 아이템"],
  facilitation: "권장 진행(예시): 그룹 4~5명 · 분석/산정 20분 · 협상안 작성 15분 · 발표·토론 5분",
  goal: "설명 가능한 가격(Explainable Price)과 재사용 가능한 협상 기준(Standard)을 만드는 것",
};
