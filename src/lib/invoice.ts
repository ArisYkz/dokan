import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";
import type { OrderRow } from "@/types/store";

/** A4 width in px at 96dpi; content taller than A4_HEIGHT gets a proportional page */
const PAGE_W_PX = 794;
const A4_H_MM = 297;
const A4_W_MM = 210;

/** Fetch the primary (is_main) image URL for each product id. */
export const fetchPrimaryImages = async (
  productIds: (string | null | undefined)[],
): Promise<Record<string, string>> => {
  const ids = [...new Set(productIds.filter((id): id is string => Boolean(id)))];
  if (ids.length === 0) return {};
  const { data } = await supabase
    .from("product_images")
    .select("product_id, image_url")
    .in("product_id", ids)
    .eq("is_main", true);
  const map: Record<string, string> = {};
  (data || []).forEach((row) => {
    map[row.product_id] = row.image_url;
  });
  return map;
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Build the invoice markup. Pure function so it can be unit-tested. */
export const buildInvoiceHtml = (
  order: OrderRow,
  storeName: string,
  images: Record<string, string>,
): string => {
  const itemRows = order.order_items
    .map(
      (item) => `
      <tr>
        <td class="img-cell">${images[item.product_id || ""] ? `<img src="${images[item.product_id || ""]}" />` : ""}</td>
        <td>${esc(item.product_name)}</td>
        <td class="num">${item.quantity}</td>
        <td class="num">${formatPrice(item.product_price)}</td>
        <td class="num">${formatPrice(item.product_price * item.quantity)}</td>
      </tr>`,
    )
    .join("");

  const date = new Date(order.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  const subtotal = order.subtotal || order.order_items.reduce((s, i) => s + i.product_price * i.quantity, 0);

  return `
    <div class="sheet">
      <div class="head">
        <div>
          <h1>${esc(storeName)}</h1>
          <p class="muted">INVOICE</p>
        </div>
        <div class="right">
          <p class="mono">${esc(order.public_order_id)}</p>
          <p class="muted">${date}</p>
        </div>
      </div>

      <div class="customer">
        <p class="bold">${esc(order.customer_name)}</p>
        <p>${esc(order.customer_phone)}${order.customer_address ? ` · ${esc(order.customer_address)}` : ""}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th class="img-cell"></th>
            <th>Item</th>
            <th class="num">Qty</th>
            <th class="num">Price</th>
            <th class="num">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div class="totals">
        <p><span>Subtotal</span><span class="num">${formatPrice(subtotal)}</span></p>
        ${order.discount_amount > 0 ? `<p class="discount"><span>Discount${order.promo_code ? ` (${esc(order.promo_code)})` : ""}</span><span class="num">-${formatPrice(order.discount_amount)}</span></p>` : ""}
        ${order.tax_amount > 0 ? `<p><span>Shipping</span><span class="num">${formatPrice(order.tax_amount)}</span></p>` : ""}
        <p class="grand"><span>Total</span><span class="num">${formatPrice(order.total_price)}</span></p>
      </div>

      <p class="muted footnote">Thank you for your order.</p>
    </div>
    <style>
      .sheet { width: ${PAGE_W_PX}px; background: #fff; color: #111; padding: 40px 48px; box-sizing: border-box; font-family: -apple-system, "Segoe UI", "Noto Sans Bengali", Roboto, Arial, sans-serif; }
      .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 16px; }
      .head h1 { margin: 0; font-size: 22px; font-weight: 700; }
      .head .muted { margin: 2px 0 0; font-size: 11px; letter-spacing: 0.2em; color: #888; }
      .head .right { text-align: right; }
      .head .right p { margin: 0; font-size: 12px; }
      .mono { font-family: ui-monospace, Menlo, monospace; }
      .bold { font-weight: 600; }
      .muted { color: #888; }
      .right { text-align: right; }
      .customer { margin: 16px 0 24px; }
      .customer p { margin: 0; font-size: 13px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th { text-align: left; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #888; border-bottom: 1px solid #ddd; padding: 6px 8px; }
      td { padding: 10px 8px; border-bottom: 1px solid #eee; vertical-align: middle; }
      th.num, td.num { text-align: right; white-space: nowrap; }
      td.img-cell, th.img-cell { width: 56px; }
      td.img-cell img { width: 48px; height: 48px; object-fit: cover; display: block; border-radius: 4px; }
      .totals { margin-top: 16px; margin-left: auto; width: 260px; font-size: 13px; }
      .totals p { display: flex; justify-content: space-between; margin: 4px 0; }
      .totals .discount { color: #b45309; }
      .totals .grand { border-top: 2px solid #111; margin-top: 8px; padding-top: 8px; font-weight: 700; font-size: 15px; }
      .footnote { margin-top: 32px; font-size: 11px; text-align: center; }
    </style>`;
};

/**
 * Build the invoice PDF for an order and trigger a browser download.
 * Content is rendered as HTML (system fonts — supports Bengali + ৳),
 * rasterized with html-to-image and placed on a PDF page.
 */
export const downloadInvoicePdf = async (order: OrderRow, storeName: string): Promise<void> => {
  const images = await fetchPrimaryImages(order.order_items.map((i) => i.product_id));

  // Offscreen positioning must live on a WRAPPER: html-to-image copies the
  // capture node's computed style (incl. left: -10000px) onto its clone,
  // which would push the content outside the SVG canvas → blank PDF.
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:fixed;left:-10000px;top:0;";
  const node = document.createElement("div");
  node.style.cssText = `width:${PAGE_W_PX}px;background:#fff;`;
  node.innerHTML = buildInvoiceHtml(order, storeName, images);
  wrapper.appendChild(node);
  document.body.appendChild(wrapper);

  try {
    let dataUrl: string;
    try {
      dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: "#ffffff", skipFonts: true });
    } catch {
      // Retry without product images if an image fetch blocks rasterization
      node.innerHTML = buildInvoiceHtml(order, storeName, {});
      dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: "#ffffff", skipFonts: true });
    }

    const hMm = A4_W_MM * (node.offsetHeight / PAGE_W_PX);
    const pdf =
      hMm <= A4_H_MM
        ? new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })
        : new jsPDF({ unit: "mm", format: [A4_W_MM, hMm], orientation: "portrait" });
    pdf.addImage(dataUrl, "PNG", 0, 0, A4_W_MM, hMm);
    pdf.save(`invoice-${order.public_order_id}.pdf`);
  } finally {
    document.body.removeChild(wrapper);
  }
};
