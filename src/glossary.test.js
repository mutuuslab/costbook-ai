import { describe, it, expect } from "vitest";
import { GLOSSARY, GTERM, GLOSSARY_CATS } from "./glossary.js";
import { buildCostRationale } from "./costRationale.js";
import { calc, INIT_F } from "./engine.js";

describe("용어집", () => {
  it("id 는 고유하고 모든 항목이 term·def·cat 을 갖는다", () => {
    const ids = GLOSSARY.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const g of GLOSSARY) {
      expect(g.term && g.def && g.cat).toBeTruthy();
      expect(GLOSSARY_CATS).toContain(g.cat);
    }
  });

  it("산정근거가 참조하는 모든 용어 tip 이 용어집에 존재한다 (툴팁 깨짐 방지)", () => {
    const r = buildCostRationale(INIT_F[0], calc(INIT_F[0], "redundancy", "sw", "L2"));
    const tips = [...r.work.map((w) => w.tip), ...r.items.map((i) => i.tip)].filter(Boolean);
    for (const t of tips) expect(GTERM[t], `tip "${t}"`).toBeTruthy();
    expect(GTERM.should).toBeTruthy(); // 합계에서 직접 참조
  });
});
