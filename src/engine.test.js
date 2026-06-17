import { describe, it, expect } from "vitest";
import {
  calc, calcQ, sf,
  DOMAINS, DT, CX, ASIL, CYBER, OTA_C, VAR, VEH, ASP_L, IMPLS, INIT_F,
} from "./engine.js";

// ════════════════════════════════════════════════════════════════
// SW Cost Book AI v6.1 — 비용 엔진 정합성 / 회귀 테스트
//
// 목적:
//  (1) calc()/calcQ() 의 현재(v6.1) 산출값을 golden 값으로 고정 → 회귀 방지
//  (2) 상수표 무결성(가중치 합, 단조성)을 검증
//  (3) 문서와 코드 사이의 "의도된 모델링 특성"을 명시적 테스트로 박제
//      → 추후 수정 시 어느 동작을 바꾸는지 테스트가 즉시 드러냄
// ════════════════════════════════════════════════════════════════

describe("상수표 무결성", () => {
  it("calcQ 가중치 합 = 1.00 (20+15+20+15+15+15)", () => {
    // 모든 지표 만점이면 종합 100점
    const q = calcQ({ swc: 100, dyn: 100, test: 100, stat: 100, def: 100, del: 100 });
    expect(q.t).toBe(100);
    expect(q.g).toBe("A");
  });

  it("구현방식별 비용구성 비율 합 = 1.00", () => {
    for (const im of IMPLS) {
      const sum = im.matP + im.swP + im.toolP + im.testP + im.integP + im.riskP;
      expect(sum).toBeCloseTo(1.0, 10);
    }
  });

  it("개발유형 계수: 신규(1.0)가 최대, 모든 재사용/CO < 1.0", () => {
    expect(DT.NEW.c).toBe(1.0);
    for (const [k, v] of Object.entries(DT)) {
      if (k !== "NEW") expect(v.c).toBeLessThan(1.0);
    }
  });

  it("ASIL 계수 단조 증가 QM<A<B<C<D", () => {
    const order = ["QM", "A", "B", "C", "D"].map((k) => ASIL[k]);
    for (let i = 1; i < order.length; i++) expect(order[i]).toBeGreaterThan(order[i - 1]);
  });

  it("복잡도 계수 단조 증가 LOW<MID<HIGH<VHIGH", () => {
    const order = ["LOW", "MID", "HIGH", "VHIGH"].map((k) => CX[k].c);
    for (let i = 1; i < order.length; i++) expect(order[i]).toBeGreaterThan(order[i - 1]);
  });

  it("도메인 생산성: ADAS가 가장 높고(=가장 비쌈) IVI가 가장 낮음", () => {
    // v4 Rationale 핵심 수정사항: ADAS > Body > IVI 순으로 h/FP
    expect(DOMAINS.ADAS.prod).toBeGreaterThan(DOMAINS.BODY.prod);
    expect(DOMAINS.BODY.prod).toBeGreaterThan(DOMAINS.IVI.prod);
  });
});

describe("sf() 규모 비선형 보정 — 경계값", () => {
  // 문서 표기: ≤150 → 1.00, 151~250 → 1.08, 251~400 → 1.15, >400 → 1.25
  // 코드는 strict '>' 사용 → 정확히 150/250/400 은 아래 구간에 속함
  it.each([
    [150, 1.0],
    [151, 1.08],
    [250, 1.08],
    [251, 1.15],
    [400, 1.15],
    [401, 1.25],
  ])("sf(%i) === %f", (size, expected) => {
    expect(sf(size)).toBe(expected);
  });
});

describe("calcQ() 등급 경계", () => {
  it.each([
    [85, "A", 15],
    [84, "B", 10],
    [70, "B", 10],
    [69, "C", 3],
    [55, "C", 3],
    [54, "D", 0],
  ])("종합 %i점 → 등급 %s, 인센티브 +%i%%", (target, grade, inc) => {
    // 모든 지표를 같은 값으로 두면 종합점수 = 그 값 (가중치 합=1)
    const q = calcQ({ swc: target, dyn: target, test: target, stat: target, def: target, del: target });
    expect(q.t).toBe(target);
    expect(q.g).toBe(grade);
    expect(q.inc).toBe(inc);
  });
});

describe("calc() — golden 회귀값 (mech=redundancy, impl=sw, ASPICE=L2)", () => {
  // 현재 v6.1 산출값을 고정. 엔진 변경 시 의도치 않은 값 변화를 즉시 감지.
  const golden = {
    "FTR-001": { adjH: 4875, devH: 6194, devCost: 86714, vCost: 125706, should: 231016 },
    "FTR-002": { adjH: 1584, devH: 2013, devCost: 22138, vCost: 23162, should: 46145 },
    "FTR-003": { adjH: 708, devH: 899, devCost: 10792, vCost: 14421, should: 26048 },
    "FTR-004": { adjH: 561, devH: 713, devCost: 6415, vCost: 4690, should: 11059 },
    "FTR-005": { adjH: 2111, devH: 2682, devCost: 21459, vCost: 18935, should: 39977 },
  };
  it.each(INIT_F.map((f) => [f.id, f]))("%s", (id, f) => {
    const c = calc(f, "redundancy", "sw", "L2");
    expect(c.adjH).toBe(golden[id].adjH);
    expect(c.devH).toBe(golden[id].devH);
    expect(c.devCost).toBe(golden[id].devCost);
    expect(c.vCost).toBe(golden[id].vCost);
    expect(c.should).toBe(golden[id].should);
  });
});

describe("정합성 — 문서 대비 의도된 동작 박제", () => {
  const f = INIT_F[0]; // FTR-001

  it("Should-Cost 는 직접비(dirCost)를 포함한다 (v6.1 개발문서 §4.1 기준)", () => {
    // ⚠ v4 Rationale §3.3 공식은 dirCost 를 제외 → 코드(v6.1)와 불일치.
    //   본 테스트는 v6.1(=코드) 기준이 정답임을 명시한다.
    const c = calc(f, "redundancy", "sw", "L2");
    const withDir = c.should;
    const withoutDir = Math.round((c.devCost + c.vCost + c.iCost + c.tCost + c.rCost) * c.co.im);
    expect(withDir).toBeGreaterThan(withoutDir);
    // should 는 합계 전체에 한 번만 round → 개별 round(dirCost*im) 과 ±1 오차 가능(집계 반올림)
    expect(Math.abs(withDir - withoutDir - c.dirCost * c.co.im)).toBeLessThanOrEqual(1);
  });

  it("ASPICE overhead 는 devH 산식에서 PM 공수에 복리로 적용된다", () => {
    // devH = (adjH + adjH*0.12*asp) * asp  →  PM(12%) 부분이 asp^2 로 곱해짐.
    // v6.1 개발문서 §4.1 공식과 코드는 일치하나, PM 복리 적용은 모델링 특성이므로
    // 의도 여부를 팀이 확인해야 함. 본 테스트는 현재 동작을 고정한다.
    const asp = ASP_L.L2.oh; // 1.12
    const c = calc(f, "redundancy", "sw", "L2");
    const adjH = c.adjH;
    const devH_compound = (adjH + adjH * 0.12 * asp) * asp; // 현재 코드
    const devH_singleOverhead = (adjH + adjH * 0.12) * asp; // overhead 1회만 적용했다면
    expect(c.devH).toBe(Math.round(devH_compound));
    expect(devH_compound).toBeGreaterThan(devH_singleOverhead); // 복리분 존재 확인
  });

  it("ASPICE L1(×1.00)에서는 복리 이슈가 사라진다 (asp=1)", () => {
    const c1 = calc(f, "redundancy", "sw", "L1");
    expect(c1.co.asp).toBe(1.0);
    // L1 에서 devH = adjH*1.12 (12% PM)
    expect(c1.devH).toBe(Math.round(c1.adjH * 1.12));
  });

  it("ASPICE 레벨이 높을수록 should-cost 가 단조 증가", () => {
    const s1 = calc(f, "redundancy", "sw", "L1").should;
    const s2 = calc(f, "redundancy", "sw", "L2").should;
    const s3 = calc(f, "redundancy", "sw", "L3").should;
    expect(s2).toBeGreaterThan(s1);
    expect(s3).toBeGreaterThan(s2);
  });
});

describe("calc() — 불변식 (property)", () => {
  const mechs = ["redundancy", "monitoring", "degradation"];
  const impls = ["hw", "sys", "sw"];
  const asps = ["L1", "L2", "L3"];

  it("모든 조합에서 검증비율 tvr 은 도메인 기준비율 이상이고 양수", () => {
    for (const f of INIT_F) {
      for (const m of mechs) for (const i of impls) for (const a of asps) {
        const c = calc(f, m, i, a);
        expect(c.tvr).toBeGreaterThanOrEqual(DOMAINS[f.domain].vR);
        expect(c.tvr).toBeGreaterThan(0);
      }
    }
  });

  it("모든 산출 금액/공수는 NaN 이 아니고 0 이상", () => {
    for (const f of INIT_F) {
      const c = calc(f, "redundancy", "sw", "L2");
      for (const k of ["bH", "adjH", "devH", "devCost", "dirCost", "vH", "vCost", "iCost", "tCost", "rCost", "should"]) {
        expect(Number.isFinite(c[k]), `${f.id}.${k}`).toBe(true);
        expect(c[k]).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("CO/Reuse 유형은 coB(잔존 활동 분해)를 가지며 신규는 갖지 않는다", () => {
    const co = calc({ ...INIT_F[0], devType: "CO_ASIS" }, "redundancy", "sw", "L2");
    expect(co.isCO).toBe(true);
    expect(co.coB).not.toBeNull();
    expect(co.coB.save).toBeGreaterThan(0); // 신규 대비 절감률 > 0

    const neu = calc({ ...INIT_F[0], devType: "NEW" }, "redundancy", "sw", "L2");
    expect(neu.isCO).toBe(false);
    expect(neu.coB).toBeNull();
  });

  it("이중화(1.30) > 모니터링(1.15) > 단계적축소(1.10) 순으로 검증비 증가", () => {
    const f = INIT_F[0];
    const vRed = calc(f, "redundancy", "sw", "L2").vCost;
    const vMon = calc(f, "monitoring", "sw", "L2").vCost;
    const vDeg = calc(f, "degradation", "sw", "L2").vCost;
    expect(vRed).toBeGreaterThan(vMon);
    expect(vMon).toBeGreaterThan(vDeg);
  });

  it("동일 조건에서 규모(FP)가 크면 should-cost 도 크다", () => {
    const small = calc({ ...INIT_F[0], size: 100 }, "redundancy", "sw", "L2").should;
    const large = calc({ ...INIT_F[0], size: 300 }, "redundancy", "sw", "L2").should;
    expect(large).toBeGreaterThan(small);
  });
});
