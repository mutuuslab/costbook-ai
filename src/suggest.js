// ════════════════════════════════════════════════════════════════
// AI 도움 — Feature 등록 항목 제안 (순수 모듈: 스키마/프롬프트/검증)
// api/suggest.js(서버리스)와 테스트가 공유. 네트워크 의존 없음.
// 허용값은 engine.js 상수에서 파생 → 단일 출처.
// ════════════════════════════════════════════════════════════════
import { DOMAINS, DT, CX, ASIL, CYBER, OTA_C, VAR, VEH } from "./engine.js";

export const FIELD_ENUMS = {
  domain: Object.keys(DOMAINS),
  devType: Object.keys(DT),
  complexity: Object.keys(CX),
  asil: Object.keys(ASIL),
  cyber: Object.keys(CYBER),
  ota: Object.keys(OTA_C),
  variant: Object.keys(VAR),
  vehicleApp: Object.keys(VEH),
};

// Structured Outputs JSON 스키마 (enum 으로 유효값 강제)
export const SUGGEST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string", description: "기능명(약어는 풀네임 병기)" },
    domain: { type: "string", enum: FIELD_ENUMS.domain },
    devType: { type: "string", enum: FIELD_ENUMS.devType },
    complexity: { type: "string", enum: FIELD_ENUMS.complexity },
    size: { type: "integer", description: "기능규모 Function Point 추정치" },
    asil: { type: "string", enum: FIELD_ENUMS.asil },
    cyber: { type: "string", enum: FIELD_ENUMS.cyber },
    ota: { type: "string", enum: FIELD_ENUMS.ota },
    variant: { type: "string", enum: FIELD_ENUMS.variant },
    vehicleApp: { type: "string", enum: FIELD_ENUMS.vehicleApp },
    rationale: { type: "string", description: "각 항목을 그렇게 판단한 근거(한국어, 항목별 한 줄)" },
  },
  required: ["name", "domain", "devType", "complexity", "size", "asil", "cyber", "ota", "variant", "vehicleApp", "rationale"],
};

export const SYSTEM_PROMPT = `당신은 자동차 SW 개발비 산정 도구의 Feature 등록 보조 AI입니다.
사용자가 입력한 기능명/설명을 바탕으로, 아래 11개 항목 중 분류 항목을 표준에 근거해 산정하세요.
근거 없이 추정한 값은 보수적으로(낮은 위험 쪽으로) 두되, rationale에 가정을 명시하세요.

[도메인] 차량 E/E 도메인. ADAS(ADAS/AD) · CHAS(섀시·제동·조향) · PT(파워트레인·BMS) · CONN(커넥티비티·텔레매틱스) · BODY(바디·공조) · IVI(인포테인먼트). 경계 시 안전요구가 높은 쪽.
[유형] COCOMO II Reuse. NEW(신규) · MODIFY(수정) · CO_ASIS/CO_REVAL/CO_ADAPT(Carry-over: 그대로/재검증/수정) · REUSE_ASIS/REUSE_ADAPT(재사용: 그대로/수정) · COTS(상용·오픈소스). 코드 변경 여부와 플랫폼/ECU/IF 변경 여부로 판정.
[복잡도] COCOMO II CPLX. LOW(단순 입출력) · MID(일반 제어) · HIGH(복잡 알고리즘·실시간·동시성) · VHIGH(센서퓨전·다중 실시간). 명시 없으면 도메인 통념으로 추정.
[규모] IFPUG Function Point 추정치(정수). 단서가 없으면 중규모 100~150 사이로.
[ASIL] ISO 26262-3 HARA. S(심각도)·E(노출)·C(제어성)로 결정. 실무 합산룰: S+E+C 합이 10→D, 9→C, 8→B, 7→A, 6이하 또는 0 포함 시 QM. 안전 무관 기능은 QM.
[Cyber] ISO/SAE 21434 TARA. NONE(외부통신 없음) · LOW(국지·낮은 노출) · MID(Gateway·내부망) · HIGH(텔레매틱스·V2X·충전·OTA서버 등 외부 인터페이스).
[OTA] UNECE R156. NONE(비대상) · BASIC(OTA 가능, 형식승인 무관) · FULL(형식승인 RXSWIN 관련 + OTA 대상).
[Variant] 차종/트림/지역 조합 수. SINGLE · FEW(2~3) · MANY(4~8) · COMPLEX(9+). 단서 없으면 FEW.
[차종적용] SAME(동일 플랫폼/ECU/IF/Cal) · DIFF_CAL(Cal 확인) · DIFF_PLAT(다른 플랫폼) · DIFF_ECU(다른 ECU) · SAFETY_RE(Safety/Cyber 증적 재검토). 단서 없으면 SAME.

반드시 제공된 JSON 스키마(enum)에 맞춰 출력하세요. rationale은 한국어로, 항목별 한 줄씩 근거를 적으세요.`;

const inOr = (v, list, dflt) => (list.includes(v) ? v : dflt);

// 모델 출력(또는 임의 입력)을 유효 범위로 정규화 — 잘못된 enum/규모 방어
export function coerceSuggestion(raw, fallbackName = "") {
  const r = raw && typeof raw === "object" ? raw : {};
  let size = Number(r.size);
  if (!Number.isFinite(size) || size < 1) size = 100;
  size = Math.round(size);
  return {
    name: (typeof r.name === "string" && r.name.trim()) || fallbackName || "AI 제안 기능",
    domain: inOr(r.domain, FIELD_ENUMS.domain, "BODY"),
    devType: inOr(r.devType, FIELD_ENUMS.devType, "NEW"),
    complexity: inOr(r.complexity, FIELD_ENUMS.complexity, "MID"),
    size,
    asil: inOr(r.asil, FIELD_ENUMS.asil, "QM"),
    cyber: inOr(r.cyber, FIELD_ENUMS.cyber, "NONE"),
    ota: inOr(r.ota, FIELD_ENUMS.ota, "NONE"),
    variant: inOr(r.variant, FIELD_ENUMS.variant, "FEW"),
    vehicleApp: inOr(r.vehicleApp, FIELD_ENUMS.vehicleApp, "SAME"),
    rationale: typeof r.rationale === "string" ? r.rationale : "",
  };
}
