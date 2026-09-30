import { describe, it, expect, vi, beforeEach } from "vitest";

// Module under test imports the supabase client — mock it with a chainable
// query builder that resolves the primary-image rows.
const mockData = vi.hoisted(() => ({ data: null as unknown }));

vi.mock("@/integrations/supabase/client", () => {
  const chain = {
    select: () => chain,
    in: () => chain,
    eq: () => chain,
    then: (onfulfilled: (value: never) => unknown) => Promise.resolve(mockData).then(onfulfilled),
  };
  return { supabase: { from: () => chain } };
});

import { buildInvoiceHtml, fetchPrimaryImages } from "@/lib/invoice";
import type { OrderRow } from "@/types/store";

const makeOrder = (overrides: Partial<OrderRow> = {}): OrderRow => ({
  id: "o1", store_id: "s1", public_order_id: "DK-1001",
  customer_name: "Ayesha", customer_phone: "01320836093", customer_address: "Dhaka",
  total_price: 1100, subtotal: 1000, tax_amount: 100, status: "paid_confirmed",
  created_at: "2026-09-30T10:00:00Z", updated_at: "2026-09-30T10:00:00Z",
  reference_code: null, promo_code: null, discount_amount: 0, payment_method: null,
  order_items: [{ product_id: "p1", product_name: "Jamdani Saree", quantity: 2, product_price: 500 }],
  ...overrides,
});

describe("buildInvoiceHtml", () => {
  it("renders each item with name, quantity and line total", () => {
    const html = buildInvoiceHtml(makeOrder(), "My Store", {});
    expect(html).toContain("Jamdani Saree");
    expect(html).toContain('>2</td>');
    expect(html).toContain("1,000 ৳"); // line total 2 × 500
  });

  it("embeds the primary product image when available", () => {
    const html = buildInvoiceHtml(makeOrder(), "My Store", { p1: "https://img.example/1.jpg" });
    expect(html).toContain('src="https://img.example/1.jpg"');
  });

  it("omits the image cell when no primary image exists (deleted product)", () => {
    const html = buildInvoiceHtml(makeOrder(), "My Store", {});
    expect(html).not.toContain("<img");
  });

  it("shows subtotal, delivery charge and grand total; no discount line when none", () => {
    const html = buildInvoiceHtml(makeOrder(), "My Store", {});
    expect(html).toContain("Subtotal");
    expect(html).toContain("1,000 ৳");
    expect(html).toContain("Delivery Charge");
    expect(html).toContain("100 ৳");
    expect(html).toContain("1,100 ৳"); // grand total
    expect(html).not.toContain("Discount");
  });

  it("shows discount line with promo code when a promo is applied", () => {
    const order = makeOrder({ subtotal: 1000, discount_amount: 100, promo_code: "SAVE10", total_price: 1000 });
    const html = buildInvoiceHtml(order, "My Store", {});
    expect(html).toContain("Discount");
    expect(html).toContain("SAVE10");
    expect(html).toContain("-100 ৳");
  });

  it("escapes HTML in product names", () => {
    const order = makeOrder({ order_items: [{ product_id: "p1", product_name: "<b>Saree</b>", quantity: 1, product_price: 500 }] });
    const html = buildInvoiceHtml(order, "My Store", {});
    expect(html).toContain("&lt;b&gt;Saree&lt;/b&gt;");
    expect(html).not.toContain("<b>Saree</b>");
  });

  it("renders the human-readable status badge", () => {
    const html = buildInvoiceHtml(makeOrder({ status: "paid_confirmed" }), "My Store", {});
    expect(html).toContain("Payment Confirmed");
    expect(html).toContain("badge-teal");
  });

  it("uses a red badge for cancelled orders", () => {
    const html = buildInvoiceHtml(makeOrder({ status: "cancelled" }), "My Store", {});
    expect(html).toContain("Cancelled");
    expect(html).toContain("badge-red");
  });

  it("maps cod to a Cash On payment badge and omits the row for null", () => {
    expect(buildInvoiceHtml(makeOrder({ payment_method: "cod" }), "My Store", {})).toContain("Cash On");
    expect(buildInvoiceHtml(makeOrder({ payment_method: null }), "My Store", {})).not.toContain("Cash On");
  });

  it("marks today's date with (Today), but not past dates", () => {
    expect(buildInvoiceHtml(makeOrder({ created_at: new Date().toISOString() }), "My Store", {})).toContain("(Today)");
    expect(buildInvoiceHtml(makeOrder({ created_at: "2020-01-01T10:00:00Z" }), "My Store", {})).not.toContain("(Today)");
  });
});

describe("fetchPrimaryImages", () => {
  beforeEach(() => {
    mockData.data = [{ product_id: "p1", image_url: "https://img.example/1.jpg" }];
  });

  it("returns a map of product id to primary image url", async () => {
    const map = await fetchPrimaryImages(["p1"]);
    expect(map).toEqual({ p1: "https://img.example/1.jpg" });
  });

  it("skips the DB call when there are no product ids", async () => {
    const map = await fetchPrimaryImages([null, undefined]);
    expect(map).toEqual({});
  });
});
