// ════════════════════════════════════════════════════════════════
// SW Cost Book AI — 비용 산정 엔진 (순수 함수, UI 비의존)
// costbook_final.jsx 의 상수/calc/calcQ/sf 를 그대로 추출 (동작 동일)
// 검증 및 회귀 테스트가 가능하도록 모듈로 분리
// ════════════════════════════════════════════════════════════════

export const C = { navy: "#002060", blue: "#1565C0", red: "#D32F2F", green: "#2E7D32", amber: "#EF6C00", purple: "#5E35B1", teal: "#00695C", g7: "#464646", g5: "#808080", g3: "#A0A0A0", g1: "#DEDEDE", g05: "#EAEAEA", g0: "#F5F5F7", w: "#FFFFFF" };

export const REFS = { R1: { s: "ISBSG 2023", d: "임베디드 8~15h/FP" }, R2: { s: "Capers Jones 2007", d: "Safety-critical 15~25h/FP" }, R3: { s: "COCOMO II", d: "Calibration" }, R6: { s: "VDA ASPICE PAM 3.1", d: "L2/L3 overhead" }, R7: { s: "Kugler Maag/SGS-TÜV", d: "ASIL +8~70%" }, R8: { s: "COCOMO II Reuse", d: "재사용 5~20%" }, R9: { s: "Capers Jones 2010", d: "재사용 15~80%" }, R11: { s: "COCOMO II CPLX", d: "L=0.87~XH=1.74" }, R14: { s: "ISO/SAE 21434", d: "Cyber 5~25%" }, R16: { s: "OTA 실무", d: "3~20%" }, R19: { s: "COCOMO II SF", d: "규모 비선형" }, R25: { s: "Toyota VE", d: "인센티브 5~15%" }, R26: { s: "ISO 26262-3 §8", d: "FSC 안전메커니즘" }, R27: { s: "ISO 26262-4 §7", d: "TSC HW/SW배분" }, R28: { s: "ISO 26262-5", d: "HW DC" }, R29: { s: "ISO 26262-6", d: "SW rigor" }, R31: { s: "VDA L2→L3", d: "+15~25%" } };

export const DOMAINS = { ADAS: { n: "ADAS/AD", prod: 20, vR: 0.65, rate: 14, color: C.blue }, CHAS: { n: "Chassis", prod: 16, vR: 0.55, rate: 12, color: "#283593" }, PT: { n: "Powertrain", prod: 15, vR: 0.55, rate: 12, color: C.teal }, CONN: { n: "Connectivity", prod: 12, vR: 0.40, rate: 11, color: "#AD1457" }, BODY: { n: "Body", prod: 10, vR: 0.35, rate: 9, color: C.purple }, IVI: { n: "Infotainment", prod: 8, vR: 0.35, rate: 8, color: "#E65100" } };
export const DT = { NEW: { l: "신규", c: 1.00 }, MODIFY: { l: "수정", c: 0.65 }, CO_ASIS: { l: "CO As-Is", c: 0.20 }, CO_REVAL: { l: "CO 재검증", c: 0.30 }, CO_ADAPT: { l: "CO 수정", c: 0.55 }, REUSE_ASIS: { l: "Reuse As-Is", c: 0.15 }, REUSE_ADAPT: { l: "Reuse 수정", c: 0.55 }, COTS: { l: "COTS", c: 0.40 } };
export const CX = { LOW: { l: "하", c: 0.85, color: C.green }, MID: { l: "중", c: 1.00, color: C.amber }, HIGH: { l: "상", c: 1.30, color: C.red }, VHIGH: { l: "최상", c: 1.70, color: "#B71C1C" } };
export const ASIL = { QM: 1.00, A: 1.10, B: 1.25, C: 1.38, D: 1.70 };
export const CYBER = { NONE: 1.00, LOW: 1.05, MID: 1.15, HIGH: 1.23 };
export const OTA_C = { NONE: 1.00, BASIC: 1.08, FULL: 1.20 };
export const VAR = { SINGLE: 1.00, FEW: 1.10, MANY: 1.25, COMPLEX: 1.45 };
export const VEH = { SAME: 1.00, DIFF_CAL: 1.10, DIFF_PLAT: 1.20, DIFF_ECU: 1.35, SAFETY_RE: 1.50 };
export const ASP_L = { L1: { l: "L1", oh: 1.00 }, L2: { l: "L2", oh: 1.12 }, L3: { l: "L3", oh: 1.25 } };
export const S_MECHS = [{ id: "redundancy", l: "이중화", desc: "ISO 26262-3 §8.4.3", mul: 1.30 }, { id: "monitoring", l: "모니터링+진단", desc: "ISO 26262-5 D.5~D.6", mul: 1.15 }, { id: "degradation", l: "단계적 축소", desc: "ISO 26262-3 §8.4.4", mul: 1.10 }];
export const IMPLS = [
  { id: "hw", l: "HW 배분", icon: "⬡", desc: "Part5", matP: .48, swP: .15, toolP: .08, testP: .14, integP: .08, riskP: .07, dm: { ADAS: 1.45, CHAS: 1.35, PT: 1.35, CONN: 1.25, BODY: 1.20, IVI: 1.10 } },
  { id: "sys", l: "외부시스템", icon: "◈", desc: "Other Tech", matP: .24, swP: .30, toolP: .10, testP: .19, integP: .10, riskP: .07, dm: { ADAS: 1.15, CHAS: 1.10, PT: 1.10, CONN: 1.05, BODY: 1.05, IVI: 1.00 } },
  { id: "sw", l: "SW 배분", icon: "◇", desc: "Part6", matP: .18, swP: .40, toolP: .12, testP: .15, integP: .08, riskP: .07, dm: { ADAS: 0.95, CHAS: 0.90, PT: 0.90, CONN: 0.88, BODY: 0.85, IVI: 0.85 } },
];
export const GATES = ["Requirement", "Design", "Code Review", "Unit Test", "Integration", "Safety", "Cyber", "OTA", "Validation", "Release"];

export function sf(s) { return s > 400 ? 1.25 : s > 250 ? 1.15 : s > 150 ? 1.08 : 1.00; }

export function calc(f, mId, iId, aspId) {
  const dom = DOMAINS[f.domain], s = sf(f.size), mm = S_MECHS.find(x => x.id === mId)?.mul || 1, imp = IMPLS.find(x => x.id === iId), im = imp?.dm?.[f.domain] || 1, asp = ASP_L[aspId]?.oh || 1;
  const bH = f.size * dom.prod * s, dc = DT[f.devType].c, cc = CX[f.complexity].c, vc = VAR[f.variant], ve = VEH[f.vehicleApp];
  const isCO = f.devType.startsWith("CO_") || f.devType.startsWith("REUSE_");
  const adjH = bH * dc * cc * vc * ve, pmH = adjH * 0.12 * asp, devH = (adjH + pmH) * asp, devCost = devH * dom.rate, dirCost = Math.round(devCost * 0.03);
  const sa = ASIL[f.asil] - 1, cy = CYBER[f.cyber] - 1, ot = OTA_C[f.ota] - 1, tvr = dom.vR + sa + cy + ot;
  const vH = adjH * tvr * mm * asp, vCost = vH * dom.rate * 1.1, iH = adjH * 0.10, iCost = iH * dom.rate, tCost = devCost * 0.05, rCost = (devCost + vCost) * 0.08;
  const should = Math.round((devCost + dirCost + vCost + iCost + tCost + rCost) * im);
  let coB = null; if (isCO) { const fb = f.size * dom.prod * s; coB = { coding: Math.round(adjH * .30), analysis: Math.round(fb * .08 * cc), integ: Math.round(fb * .06 * ve), cal: Math.round(fb * .04 * ve), doc: Math.round(fb * .05), rel: Math.round(fb * .03), save: Math.round((1 - dc) * 100) }; }
  return { bH: Math.round(bH), adjH: Math.round(adjH), devH: Math.round(devH), devCost: Math.round(devCost), dirCost, vH: Math.round(vH), vCost: Math.round(vCost), iCost: Math.round(iCost), tCost: Math.round(tCost), rCost: Math.round(rCost), should, tvr, sf: s, isCO, coB, co: { dc, cc, vc, ve, sa, cy, ot, mm, im, asp } };
}

export function calcQ(v) { const t = Math.round(v.swc * .20 + v.dyn * .15 + v.test * .20 + v.stat * .15 + v.def * .15 + v.del * .15); const g = t >= 85 ? "A" : t >= 70 ? "B" : t >= 55 ? "C" : "D"; return { t, g, inc: g === "A" ? 15 : g === "B" ? 10 : g === "C" ? 3 : 0 }; }

export const INIT_F = [
  { id: "FTR-001", name: "전방 충돌 경고(FCW)", domain: "ADAS", devType: "NEW", complexity: "HIGH", size: 150, asil: "B", cyber: "LOW", ota: "FULL", variant: "MANY", vehicleApp: "SAME" },
  { id: "FTR-002", name: "OTA 캠페인 관리", domain: "CONN", devType: "NEW", complexity: "MID", size: 120, asil: "QM", cyber: "HIGH", ota: "FULL", variant: "FEW", vehicleApp: "SAME" },
  { id: "FTR-003", name: "BMS 진단(CO)", domain: "PT", devType: "CO_REVAL", complexity: "MID", size: 130, asil: "C", cyber: "LOW", ota: "BASIC", variant: "FEW", vehicleApp: "DIFF_CAL" },
  { id: "FTR-004", name: "원격 공조(Reuse)", domain: "BODY", devType: "REUSE_ADAPT", complexity: "LOW", size: 80, asil: "QM", cyber: "MID", ota: "BASIC", variant: "MANY", vehicleApp: "DIFF_PLAT" },
  { id: "FTR-005", name: "운전자 모니터링", domain: "IVI", devType: "NEW", complexity: "HIGH", size: 140, asil: "A", cyber: "LOW", ota: "FULL", variant: "COMPLEX", vehicleApp: "SAME" },
];
