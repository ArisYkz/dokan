import type { OrderRow } from "@/types/store";
const STATUS_LABELS: Record<string, string> = {
  new: "New", awaiting_verification: "Awaiting Verification",
  paid_confirmed: "Payment Confirmed", payment_rejected: "Payment Not Received",
  shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
  confirmed: "Confirmed", archived: "Archived",
  returned: "Returned", refunded: "Refunded",
};
import { OrderStatus, OrderStatusValue } from "@/constants/business";
// Re-export from centralized constants for backward compatibility
export {
  ARCHIVED_STATUSES,
  FREE_PRODUCT_LIMIT,
  FREE_IMAGE_LIMIT,
  PRO_IMAGE_LIMIT,
  FREE_CATEGORY_LIMIT,
  FREE_CONFIRMED_LIMIT,
  SUPPORT_TELEGRAM,
  FILTER_STATUS_MAP as filterStatuses,
} from "@/constants/business";

/** Format a numeric price to Bangladeshi Taka display string */
export const formatPrice = (price: number) =>
  new Intl.NumberFormat("bn-BD", { numberingSystem: "latn" }).format(price) + " ৳";

/** Human-readable status label (English) */
export const statusLabel = (status: string): string =>
  STATUS_LABELS[status] || status;

/** Tailwind class string for order-status badge colouring */
export const statusColor = (status: string): string => {
  if (
    ([OrderStatus.PAID_CONFIRMED, OrderStatus.CONFIRMED, OrderStatus.DELIVERED] as string[]).includes(
      status,
    )
  )
    return "bg-accent/15 text-accent";
  if (status === OrderStatus.NEW) return "bg-secondary text-secondary-foreground";
  if (status === OrderStatus.AWAITING_VERIFICATION)
    return "bg-[hsl(45,80%,50%)]/15 text-[hsl(45,80%,35%)]";
  if (
    ([OrderStatus.PAYMENT_REJECTED, OrderStatus.CANCELLED] as string[]).includes(status)
  )
    return "bg-destructive/10 text-destructive";
  if (status === OrderStatus.SHIPPED) return "bg-primary/10 text-primary";
  return "bg-muted text-muted-foreground";
};

/** Normalize a phone into bare international digits for wa.me links:
 *  "+880 1320-836093" and local "01320836093" → "8801320836093".
 *  Also repairs numbers corrupted by the legacy +7 rewrite. */
export const toWaMeDigits = (raw: string): string => {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("880")) return d;
  if (d.startsWith("7801")) return "8" + d.slice(1); // legacy bug turned 880… into 780…
  if (d.startsWith("0")) return "880" + d.slice(1);
  if (d.length === 10) return "880" + d; // 1XXXXXXXXX without the trunk zero
  return d;
};

/** Order filter types */
export type OrderFilter = "all" | "new" | "payment" | "shipped";

/** Search orders by customer name, phone, or order ID */
export const filterOrdersBySearch = (orders: OrderRow[], query: string): OrderRow[] => {
  if (!query.trim()) return orders;
  const q = query.toLowerCase();
  return orders.filter(
    (order) =>
      order.customer_name.toLowerCase().includes(q) ||
      order.customer_phone.toLowerCase().includes(q) ||
      order.public_order_id.toLowerCase().includes(q),
  );
};
