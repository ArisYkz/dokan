import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import ProductGallery from "@/components/ProductGallery";

describe("ProductGallery", () => {
  it("renders without crashing (regression: missing useCallback import)", () => {
    expect(() =>
      render(<ProductGallery images={["https://img.example/1.jpg", "https://img.example/2.jpg"]} productName="Test product" />),
    ).not.toThrow();
  });
});