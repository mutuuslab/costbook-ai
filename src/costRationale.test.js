import { describe, it, expect } from "vitest";
import { calc, INIT_F } from "./engine.js";
import { buildCostRationale, won } from "./costRationale.js";

// 산정근거 분해가 calc() 결과와 일관되는지 검증 (표시값이 엔진값과 어긋나지 않도록)
describe("buildCostRationale — 분해 일관성", () => {
  const f = INIT_F[0]; // FTR-001
  const cc = calc(f, "redundancy", "sw", "L2");
  const r = buildCostRationale(f, cc);

  it("항목 6개(개발/직접/검증/통합/도구/리스크)를 모두 만든다", () => {
    expect(r.items.map((i) => i.key)).toEqual(["dev", "dir", "ver", "int", "tool", "risk"]);
  });

  it("각 항목 value 가 calc() 결과와 정확히 일치한다", () => {
    const m = Object.fromEntries(r.items.map((i) => [i.key, i.value]));
    expect(m.dev).toBe(cc.devCost);
    expect(m.dir).toBe(cc.dirCost);
    expect(m.ver).toBe(cc.vCost);
    expect(m.int).toBe(cc.iCost);
    expect(m.tool).toBe(cc.tCost);
    expect(m.risk).toBe(cc.rCost);
  });

  it("소계 = 6개 항목 합, 합계 = 소계×구현배분 = should (반올림 ±1)", () => {
    const sum = r.items.reduce((s, i) => s + i.value, 0);
    expect(r.sub).toBe(sum);
    expect(r.total.value).toBe(cc.should);
    expect(Math.abs(Math.round(r.sub * cc.co.im) - cc.should)).toBeLessThanOrEqual(1);
  });

  it("FTR-001 표기가 사용자 제시값과 맞는다 (8.7억/2,601만/12.6억/6,825만/4,336만/1.7억)", () => {
    const m = Object.fromEntries(r.items.map((i) => [i.key, won(i.value)]));
    expect(m.dev).toBe("8.7억");
    expect(m.dir).toBe("2,601만");
    expect(m.ver).toBe("12.6억");
    expect(m.int).toBe("6,825만");
    expect(m.tool).toBe("4,336만");
    expect(m.risk).toBe("1.7억");
  });

  it("검증비율(tvr) 분해 = 도메인+ASIL+Cyber+OTA 가산", () => {
    const tvrRow = r.work.find((w) => w.label === "검증비율(tvr)");
    expect(tvrRow.result).toBe(cc.tvr.toFixed(2));
  });
});
