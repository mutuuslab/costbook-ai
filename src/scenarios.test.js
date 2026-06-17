import { describe, it, expect } from "vitest";
import { SCENARIOS, WORKSHOP } from "./scenarios.js";
import { calc, DOMAINS, DT, CX, ASIL, CYBER, OTA_C, VAR, VEH, S_MECHS } from "./engine.js";

const enums = {
  domain: Object.keys(DOMAINS), devType: Object.keys(DT), complexity: Object.keys(CX),
  asil: Object.keys(ASIL), cyber: Object.keys(CYBER), ota: Object.keys(OTA_C),
  variant: Object.keys(VAR), vehicleApp: Object.keys(VEH),
};
const mechIds = S_MECHS.map((m) => m.id);

describe("실습 시나리오 — 유효성", () => {
  it("시나리오 3개 + 워크숍 1개", () => {
    expect(SCENARIOS).toHaveLength(3);
    expect(WORKSHOP.goal).toContain("Explainable");
  });

  it.each(SCENARIOS.map((s) => [s.id, s]))("%s feature 가 모든 enum 유효값을 쓴다", (id, s) => {
    const f = s.feature;
    for (const [k, list] of Object.entries(enums)) {
      expect(list, `${id}.${k}=${f[k]}`).toContain(f[k]);
    }
    expect(Number.isInteger(f.size)).toBe(true);
    expect(f.size).toBeGreaterThan(0);
    expect(mechIds).toContain(s.mech);
  });

  it.each(SCENARIOS.map((s) => [s.id, s]))("%s 는 calc() 가 유한·양수 should-cost 를 산출한다", (id, s) => {
    const c = calc(s.feature, s.mech, "sw", "L2");
    expect(Number.isFinite(c.should)).toBe(true);
    expect(c.should).toBeGreaterThan(0);
  });

  it.each(SCENARIOS.map((s) => [s.id, s]))("%s 는 검토포인트·실습질문·협상방향·costMap 을 갖는다", (id, s) => {
    expect(s.checkPoints.length).toBeGreaterThan(0);
    expect(s.questions.length).toBeGreaterThan(0);
    expect(s.negotiation.length).toBeGreaterThan(0);
    expect(s.costMap.length).toBeGreaterThan(0);
  });

  it("ASIL D 시나리오(③)는 ASIL B 시나리오(①)보다 검증비가 크다 (안전요구↑)", () => {
    const s1 = SCENARIOS.find((s) => s.id === "S1");
    const s3 = SCENARIOS.find((s) => s.id === "S3");
    const v1 = calc(s1.feature, s1.mech, "sw", "L2").vCost;
    const v3 = calc(s3.feature, s3.mech, "sw", "L2").vCost;
    expect(v3).toBeGreaterThan(v1);
  });
});
