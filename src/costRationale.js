// ════════════════════════════════════════════════════════════════
// 비용 산정근거(왜 이 숫자가 나왔는지) — 표시용 분해.
// calc() 결과(cc)를 받아 각 공수/비용 항목의 "공식 = 숫자 = 결과 + 근거"를 만든다.
// ⚠ engine.js 의 계수·공식은 그대로. 여기서는 cc 의 중간값을 재구성해 설명만 생성.
// ════════════════════════════════════════════════════════════════
import { DOMAINS, DT, CX, ASIL, CYBER, OTA_C, VAR, VEH } from "./engine.js";

// 만원 단위 → 억/만 표기 (App 의 fmt 와 동일 규칙)
export function won(v) {
  return Math.abs(v) >= 10000 ? `${(v / 10000).toFixed(1)}억` : `${Math.round(Math.abs(v)).toLocaleString()}만`;
}
const h = (v) => `${Math.round(v).toLocaleString()}h`;

// f: feature, cc: calc(f,...) 결과
export function buildCostRationale(f, cc) {
  const dom = DOMAINS[f.domain];
  const co = cc.co; // {dc,cc,vc,ve,sa,cy,ot,mm,im,asp}
  const rate = dom.rate;
  const pmH = Math.round(cc.adjH * 0.12 * co.asp); // PM/관리공수 (표시용 재계산)

  // ── 1) 공수 산정 ──
  const work = [
    {
      label: "보정 개발공수",
      expr: `${f.size}FP × 생산성 ${dom.prod}h/FP × 규모SF ${cc.sf} × 유형 ${co.dc} × 복잡도 ${co.cc} × Variant ${co.vc} × 차종 ${co.ve}`,
      result: h(cc.adjH),
      refs: ["R1", "R2", "R11", "R19"],
    },
    {
      label: "총 개발공수",
      expr: `(보정 ${cc.adjH.toLocaleString()} + PM ${pmH.toLocaleString()}[=보정×12%×ASPICE]) × ASPICE ${co.asp}`,
      result: h(cc.devH),
      refs: ["R6", "R31"],
    },
    {
      label: "검증비율(tvr)",
      expr: `도메인표준 ${dom.vR} + ASIL ${(co.sa).toFixed(2)} + Cyber ${(co.cy).toFixed(2)} + OTA ${(co.ot).toFixed(2)}`,
      result: cc.tvr.toFixed(2),
      refs: ["R5", "R7", "R14", "R16"],
    },
    {
      label: "검증공수",
      expr: `보정 ${cc.adjH.toLocaleString()} × 검증비율 ${cc.tvr.toFixed(2)} × 안전메커니즘 ${co.mm} × ASPICE ${co.asp}`,
      result: h(cc.vH),
      refs: ["R26", "R28"],
    },
  ];

  // ── 2) 비용 항목 (각 항목 = 공식 = 숫자 = 결과 + 근거) ──
  const sub = cc.devCost + cc.dirCost + cc.vCost + cc.iCost + cc.tCost + cc.rCost;
  const items = [
    {
      key: "dev", label: "개발비",
      formula: `총개발공수 ${h(cc.devH)} × 단가 ${rate}만원/h`,
      value: cc.devCost, refs: ["R17", "R18"],
      note: "도메인 단가 = NIPA 노임단가 + Tier1 실무단가",
    },
    {
      key: "dir", label: "직접비",
      formula: `개발비 ${won(cc.devCost)} × 3%`,
      value: cc.dirCost, refs: [],
      note: "출장·환경 등 직접경비율 3% (관행)",
    },
    {
      key: "ver", label: "검증비",
      formula: `검증공수 ${h(cc.vH)} × 단가 ${rate} × 1.1(검증환경)`,
      value: cc.vCost, refs: ["R5", "R6"],
      note: "검증비율(tvr)·안전메커니즘이 누적돼 개발비보다 클 수 있음",
    },
    {
      key: "int", label: "통합비",
      formula: `보정공수 ${h(cc.adjH)} × 10% × 단가 ${rate}`,
      value: cc.iCost, refs: ["R27"],
      note: "SIL/HIL 통합 공수 비율 10%",
    },
    {
      key: "tool", label: "도구비",
      formula: `개발비 ${won(cc.devCost)} × 5%`,
      value: cc.tCost, refs: [],
      note: "라이선스·툴체인 5% (관행)",
    },
    {
      key: "risk", label: "리스크비",
      formula: `(개발비 ${won(cc.devCost)} + 검증비 ${won(cc.vCost)}) × 8%`,
      value: cc.rCost, refs: [],
      note: "불확실성 예비비 8% (관행)",
    },
  ];

  const total = {
    formula: `소계 ${won(sub)} × 구현배분 ${co.im}`,
    value: cc.should,
    note: `구현배분 승수 = ${f.domain} 도메인 × ${co.im} (TSC HW/SW 배분, ⚠Seed)`,
    refs: ["R21", "R27"],
  };

  return { work, items, sub, total };
}
