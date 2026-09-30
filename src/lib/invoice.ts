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

const STATUS_LABELS: Record<string, string> = {
  new: "Pending Order", awaiting_verification: "Awaiting Verification",
  paid_confirmed: "Payment Confirmed", payment_rejected: "Payment Not Received",
  shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
  confirmed: "Confirmed", returned: "Returned", refunded: "Refunded",
};

/** Teal by default; red for failed/cancelled, green for delivered. */
const statusBadgeClass = (status: string): string => {
  if (["cancelled", "payment_rejected", "refunded"].includes(status)) return "badge badge-red";
  if (status === "delivered") return "badge badge-green";
  return "badge badge-teal";
};

const paymentLabel = (method: string | null): string | null => {
  if (!method) return null;
  if (method === "cod") return "Cash On";
  if (method === "contact_us") return "Contact Us";
  return method.charAt(0).toUpperCase() + method.slice(1);
};

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
        <td class="num">${formatPrice(item.product_price * item.quantity)}</td>
      </tr>`,
    )
    .join("");

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const date = fmtDate(order.created_at) + (fmtDate(new Date().toISOString()) === fmtDate(order.created_at) ? " (Today)" : "");

  const status = STATUS_LABELS[order.status] || order.status;
  const payment = paymentLabel(order.payment_method);
  const subtotal = order.subtotal || order.order_items.reduce((s, i) => s + i.product_price * i.quantity, 0);

  return `
    <div class="sheet">
      <div class="card">
        <p class="oid">Order ID: #${esc(order.public_order_id)}</p>
        <span class="${statusBadgeClass(order.status)}">${esc(status)}</span>
        <p class="date">${esc(date)}</p>
        <span class="total-pill">Total&nbsp;&nbsp;<b>${formatPrice(order.total_price)}</b></span>

        <h2>Customer Information</h2>
        <p class="row"><span class="lbl">Name:</span> ${esc(order.customer_name)}</p>
        <p class="row"><span class="lbl">Phone:</span> ${esc(order.customer_phone)}</p>
        ${order.customer_address ? `<p class="row"><span class="lbl">Address:</span> ${esc(order.customer_address)}</p>` : ""}

        <h2>Order Information</h2>
        <p class="row"><span class="lbl">Payment:</span> ${payment ? `<span class="badge badge-teal">${esc(payment)}</span>` : "—"}</p>
        ${order.tax_amount > 0 ? `<p class="row"><span class="lbl">Delivery Charge:</span> ${formatPrice(order.tax_amount)}</p>` : ""}
      </div>

      <div class="card">
        <h2>Order Items</h2>
        <table>
          <thead>
            <tr>
              <th class="img-cell"></th>
              <th>Product</th>
              <th class="num">Quantity</th>
              <th class="num">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <div class="totals">
          <p><span>Subtotal</span><span class="num">${formatPrice(subtotal)}</span></p>
          ${order.discount_amount > 0 ? `<p class="discount"><span>Discount${order.promo_code ? ` (${esc(order.promo_code)})` : ""}</span><span class="num">-${formatPrice(order.discount_amount)}</span></p>` : ""}
          ${order.tax_amount > 0 ? `<p><span>Delivery Charge</span><span class="num">${formatPrice(order.tax_amount)}</span></p>` : ""}
          <p class="grand"><span>Total</span><span class="num">${formatPrice(order.total_price)}</span></p>
        </div>
      </div>

      <p class="muted footnote">Thank you for shopping with ${esc(storeName)}.</p>
    </div>
    <style>
      .sheet { width: ${PAGE_W_PX}px; background: #f1f5f9; color: #111; padding: 32px 40px; box-sizing: border-box; font-family: -apple-system, "Segoe UI", "Noto Sans Bengali", Roboto, Arial, sans-serif; }
      .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px 28px; margin-bottom: 20px; }
      .oid { margin: 0 0 12px; font-size: 20px; font-weight: 700; }
      .badge { display: inline-block; padding: 5px 14px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
      .badge-teal { background: #5eead4; color: #134e4a; }
      .badge-red { background: #fecaca; color: #b91c1c; }
      .badge-green { background: #a7f3d0; color: #065f46; }
      .date { margin: 12px 0 16px; font-size: 14px; color: #64748b; }
      .total-pill { display: inline-block; background: #f472b6; color: #fff; border-radius: 999px; padding: 10px 22px; font-size: 15px; margin-bottom: 24px; }
      h2 { margin: 24px 0 10px; font-size: 16px; font-weight: 700; }
      h2:first-of-type { margin-top: 0; }
      .row { margin: 6px 0; font-size: 14px; }
      .lbl { display: inline-block; width: 130px; color: #64748b; }
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
      .muted { color: #888; }
      .footnote { margin-top: 8px; font-size: 11px; text-align: center; }
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
