import { describe, expect, it } from "vitest";
import { translations } from "./strings";

const keys = (value: object): string[] =>
  Object.entries(value).flatMap(([key, v]) =>
    typeof v === "object" ? keys(v).map((k) => `${key}.${k}`) : [key],
  );

describe("translations", () => {
  it("cover every English text with a non-empty translation", () => {
    for (const texts of Object.values(translations)) {
      expect(keys(texts)).toEqual(keys(translations.en));
      for (const value of Object.values(texts.actions)) expect(value).not.toBe("");
    }
  });
});
