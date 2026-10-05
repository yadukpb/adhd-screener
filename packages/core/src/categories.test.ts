import { describe, it, expect } from "vitest";
import { categoriesNeedingAttention, CATEGORY_KEYS, REPORT_CATEGORIES } from "./categories";
import type { Indicator } from "./types";

function indicator(key: string, level: Indicator["level"]): Indicator {
  return { key, label: key, z: null, level, valueText: "", meaning: "", regions: [], refs: [] };
}

describe("categoriesNeedingAttention", () => {
  it("returns nothing when every indicator is typical", () => {
    const all = REPORT_CATEGORIES.flatMap((cat) => CATEGORY_KEYS[cat].map((k) => indicator(k, "typical")));
    expect(categoriesNeedingAttention(all)).toEqual([]);
  });

  it("flags a category when any of its keys is non-typical", () => {
    const indicators = [indicator("cpt-commission", "elevated"), indicator("stop-ssrt", "typical")];
    expect(categoriesNeedingAttention(indicators)).toEqual(["Impulse control"]);
  });

  it("ignores a missing indicator rather than treating it as needing attention", () => {
    // Regression: an earlier version of this check (in apps/web) read
    // `byKey.get(k)?.level !== "typical"` without checking presence first,
    // which is true for a key that was never measured at all.
    const indicators = [indicator("asrs", "typical")];
    expect(categoriesNeedingAttention(indicators)).toEqual([]);
  });

  it("can flag multiple categories at once", () => {
    const indicators = [indicator("asrs", "mild"), indicator("nback-dprime", "elevated")];
    const result = categoriesNeedingAttention(indicators);
    expect(result).toContain("Self-reported symptoms");
    expect(result).toContain("Working memory");
    expect(result).toHaveLength(2);
  });
});
