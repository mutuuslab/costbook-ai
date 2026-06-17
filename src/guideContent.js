// ════════════════════════════════════════════════════════════════
// Feature 등록 11개 항목 실무 가이드 — 콘텐츠(데이터). 레이아웃과 분리.
// "무엇을 / 어떤 근거로 / 어떤 기준으로" 채우는지 표준 근거와 함께 제공.
// ⚠ 계수값이 아니라 '입력 판정 기준' 설명임. engine.js 의 수치와 무관.
// ════════════════════════════════════════════════════════════════

// ISO 26262-3 HARA → ASIL 결정표 (S×E×C). 합(S+E+C): 10→D, 9→C, 8→B, 7→A, ≤6→QM
// (S0/E0/C0 중 하나라도 있으면 QM)
export const ASIL_TABLE = [
  { s: "S1", e: "E1", c1: "QM", c2: "QM", c3: "QM" },
  { s: "S1", e: "E2", c1: "QM", c2: "QM", c3: "QM" },
  { s: "S1", e: "E3", c1: "QM", c2: "QM", c3: "A" },
  { s: "S1", e: "E4", c1: "QM", c2: "A", c3: "B" },
  { s: "S2", e: "E1", c1: "QM", c2: "QM", c3: "QM" },
  { s: "S2", e: "E2", c1: "QM", c2: "QM", c3: "A" },
  { s: "S2", e: "E3", c1: "QM", c2: "A", c3: "B" },
  { s: "S2", e: "E4", c1: "A", c2: "B", c3: "C" },
  { s: "S3", e: "E1", c1: "QM", c2: "QM", c3: "A" },
  { s: "S3", e: "E2", c1: "QM", c2: "A", c3: "B" },
  { s: "S3", e: "E3", c1: "A", c2: "B", c3: "C" },
  { s: "S3", e: "E4", c1: "B", c2: "C", c3: "D" },
];

export const SEC_DEFS = {
  S: ["S0 상해 없음", "S1 경상~중상", "S2 중상~생명위협(생존가능)", "S3 생명위협~치명(사망가능)"],
  E: ["E0 매우 희박", "E1 매우 낮음(연 1회 미만)", "E2 낮음", "E3 중간", "E4 높음(대부분 주행조건)"],
  C: ["C0 일반적으로 제어가능", "C1 쉽게 제어", "C2 보통 제어가능", "C3 제어 어려움/불가"],
};

// ISO/SAE 21434 TARA → Cyber 등급 매핑
export const CYBER_TABLE = [
  { lv: "NONE", crit: "외부 통신·인터페이스 없음, 규제·안전 무관", risk: "1", ex: "독립 BCM 로직" },
  { lv: "LOW", crit: "국지적 영향, 외부 노출 낮음, 공격난이도 높음", risk: "2", ex: "차내 센서 신호" },
  { lv: "MID", crit: "Gateway·내부망 경유, 중간 영향", risk: "3", ex: "CAN Gateway, 진단포트" },
  { lv: "HIGH", crit: "외부 인터페이스(텔레매틱스·V2X·충전·OTA서버), 높은 영향", risk: "4~5", ex: "OTA 캠페인, 커넥티드" },
];

// 11개 필드 가이드
export const FIELDS = [
  {
    key: "ID",
    label: "ID — Cost Object 식별자",
    what: "비용을 산정·설명하는 최소 단위(Cost Object)의 고유번호.",
    how: "기능 목록에서 '독립적으로 개발·검증·납품 가능한 최소 기능'을 1건씩 분리해 부여.",
    criteria: [
      "형식: FTR-001 (FTR- + 3자리 일련번호)",
      "1 Feature = 1 비용 설명 단위. 너무 잘게(함수 단위) 쪼개거나 너무 크게(시스템 전체) 묶지 말 것",
      "판단 기준: 이 단위로 공급사 견적/증적/실적을 따로 받을 수 있는가?",
    ],
    refs: [],
    example: "FTR-001 (전방충돌경고). ECU 전체가 아니라 '기능' 하나.",
  },
  {
    key: "기능명",
    label: "기능명 — 외부 관점 명칭",
    what: "사용자/차량 관점에서 그 기능이 무엇을 하는지.",
    how: "구현 모듈명(예: 'CAN_Drv')이 아니라 기능 명칭(예: '전방충돌경고')으로 작성.",
    criteria: [
      "약어 사용 시 풀네임 병기: '전방충돌경고(FCW)'",
      "요구사항 문서/기능 목록(Feature List)의 명칭과 일치시킬 것",
    ],
    refs: [],
    example: "전방충돌경고(FCW), OTA 캠페인 관리, BMS 진단",
  },
  {
    key: "도메인",
    label: "도메인 — 차량 E/E 도메인",
    what: "Feature 가 속한 차량 전기/전자 도메인. 생산성(h/FP)·검증비율·단가가 자동 연동됨.",
    how: "기능의 1차 책임 ECU/도메인으로 매핑.",
    criteria: [
      "ADAS/AD · CHAS(섀시·제동·조향) · PT(파워트레인·BMS) · CONN(커넥티비티·텔레매틱스) · BODY(바디·공조) · IVI(인포테인먼트)",
      "여러 도메인에 걸치면 '안전요구가 더 높은(=h/FP가 큰) 쪽'으로",
      "도메인 선택이 단가·생산성을 바꾸므로 임의 변경 금지",
    ],
    refs: ["R1", "R2"],
    example: "FCW→ADAS, OTA캠페인→CONN, BMS진단→PT, 원격공조→BODY, 운전자모니터링→IVI",
  },
  {
    key: "유형",
    label: "유형 — 개발/재사용 유형 (COCOMO II Reuse)",
    what: "신규 개발인지, 기존 자산을 가져오는지(Carry-over/Reuse)에 따른 공수 차이.",
    how: "AAF = 0.4·DM + 0.3·CM + 0.3·IM (설계변경%·코드변경%·통합검증%) 관점으로 판정.",
    criteria: [
      "① 코드 변경이 있는가?",
      "  └ 없음 + 동일 플랫폼/ECU/IF/Cal → REUSE_ASIS (그대로 재사용)",
      "  └ 없음 + 대상 차종/Cal/Variant만 다름 → CO_REVAL (재검증)",
      "  └ 일부 변경(IF·Cal 수정) → CO_ADAPT",
      "② 기존 기능 기반 + 요구사항 변경 큼 → REUSE_ADAPT / MODIFY",
      "③ 완전 신규 → NEW",
      "④ 상용/오픈소스 통합 → COTS",
    ],
    refs: ["R8", "R9"],
    example: "FCW(신규)→NEW, BMS진단(타차종 재검증)→CO_REVAL, 원격공조(수정재사용)→REUSE_ADAPT",
  },
  {
    key: "복잡도",
    label: "복잡도 — COCOMO II CPLX",
    what: "기능 자체의 개발 난이도. 효과가 가장 큰 인자 중 하나.",
    how: "CPLX 5영역(제어흐름·연산·기기의존·데이터관리·UI) 난이도를 종합.",
    criteria: [
      "LOW(하): 단순 입출력/상태관리, 실시간 제약 약함",
      "MID(중): 일반적 제어 로직",
      "HIGH(상): 복잡한 알고리즘·실시간 제약·동시성·하드웨어 밀착",
      "VHIGH(최상): 센서퓨전·다중 실시간 루프·고난도 수치/제어 (예: AD 인지)",
      "기준: 5영역 중 다수가 High 이상이면 HIGH, 대부분 Extra-High면 VHIGH",
    ],
    refs: ["R11"],
    example: "FCW→HIGH (실시간 센서처리), 단순 공조→LOW",
  },
  {
    key: "규모",
    label: "규모 — 기능규모(Function Point, IFPUG)",
    what: "기능의 크기. h/FP·SF(규모 비선형) 산정의 기준량.",
    how: "IFPUG 5요소를 카운트하거나, 초기엔 유사기능 대비 상대규모로 추정.",
    criteria: [
      "트랜잭션: EI(입력)·EO(출력)·EQ(조회)",
      "데이터: ILF(내부논리파일)·EIF(외부인터페이스파일)",
      "각 요소를 Low/Avg/High 복잡도로 가중 합산 → 미조정 FP",
      "실습 팁: 정확 카운트 어려우면 '유사기능 A=100FP 대비 1.5배' 식 상대추정 허용",
      "참고: 150 이하는 SF 1.00, 초과 시 비선형 가산(151~250:1.08, 251~400:1.15, >400:1.25)",
    ],
    refs: ["R12", "R19"],
    example: "FCW≈150FP (중규모 ADAS 기능)",
  },
  {
    key: "ASIL",
    label: "ASIL — 기능안전 등급 (ISO 26262-3 HARA)",
    what: "위험사건의 심각도·노출·제어성으로 결정되는 안전 무결성 등급. 개발·검증 rigor를 좌우.",
    how: "HARA 결과의 S(심각도)·E(노출)·C(제어성)를 결정표에 대입.",
    criteria: [
      "실무 합산룰: 합(S+E+C) = 10→D, 9→C, 8→B, 7→A, 6 이하 또는 S/E/C 중 0 → QM",
      "QM(비안전) ~ D(최고). 높을수록 Safety 활동(FMEA/FTA/Safety Case) 추가",
    ],
    table: "ASIL",
    refs: ["R32", "R7"],
    example: "FCW: S3(충돌 치명)·E4(상시 주행)·C 일부 회피가능 → 합 8~9, 단 경고기능 개입여지 → B 배정",
  },
  {
    key: "Cyber",
    label: "Cyber — 사이버보안 등급 (ISO/SAE 21434 TARA)",
    what: "사이버 위협 노출/영향 수준. 보안 검증·TARA 증적 비용에 영향.",
    how: "TARA: 영향도(Safety·Financial·Operational·Privacy) × 공격가능성(ET·SE·KoIC·WoO·Eq) → 위험값.",
    criteria: [
      "외부 통신·인터페이스 노출도와 침해 시 영향으로 NONE~HIGH 판정",
      "공격가능성 5요소: 소요시간·전문성·대상지식·기회창·장비",
    ],
    table: "CYBER",
    refs: ["R14"],
    example: "OTA캠페인(외부서버 통신)→HIGH, FCW(국지 센서)→LOW",
  },
  {
    key: "OTA",
    label: "OTA — 무선 업데이트 영향 (UNECE R156)",
    what: "OTA 갱신 대상 여부와 형식승인(RXSWIN) 영향 수준. 패키징·서명·rollback 검증비에 반영.",
    how: "이 SW가 OTA로 갱신되는가, 형식승인 관련(RXSWIN) SW인가로 판정.",
    criteria: [
      "NONE: OTA 비대상",
      "BASIC: OTA 가능하나 형식승인 무관(편의 기능 등) — 패키징·서명 수준",
      "FULL: 형식승인 관련(RXSWIN) + OTA 대상 — SUMS 절차·rollback·안전조건 검증 포함",
    ],
    refs: ["R15", "R16"],
    example: "FCW(형식승인 관련 OTA)→FULL, 단순 편의기능 OTA→BASIC",
  },
  {
    key: "Var",
    label: "Var — Variant 복잡도  ⚠Seed",
    what: "차종/트림/지역 조합 수에 따른 통합·검증 비용 증가.",
    how: "이 Feature 가 적용되는 변형(Variant) 조합 수를 센다.",
    criteria: [
      "SINGLE: 단일 / FEW: 2~3종 / MANY: 4~8종 / COMPLEX: 9종+",
      "Variant 증가 시 통합테스트는 비선형(O(n·log n)~O(n²))으로 증가",
      "⚠ 계수는 Seed(업계표준 부재) — 내부 실적으로 반드시 보정",
    ],
    refs: ["R13"],
    example: "FCW 다차종 적용→MANY",
  },
  {
    key: "차종",
    label: "차종 — 차종적용 조건  ⚠Seed",
    what: "다른 차종에 적용할 때 플랫폼/ECU/IF/Cal 변경 정도.",
    how: "대상 차종과의 차이(동일 플랫폼? ECU 변경? Safety/Cyber 증적 재검토?)로 판정.",
    criteria: [
      "SAME: 동일 플랫폼/ECU/IF/Cal",
      "DIFF_CAL: 동일 플랫폼, Cal 확인 필요",
      "DIFF_PLAT: 다른 플랫폼, IF 동일",
      "DIFF_ECU: 다른 ECU/네트워크 변경",
      "SAFETY_RE: Safety/Cyber 증적 재검토 필요",
      "⚠ 계수는 Seed — 내부 실적으로 보정",
    ],
    refs: [],
    example: "BMS진단 타차종 적용(Cal만 다름)→DIFF_CAL",
  },
];
