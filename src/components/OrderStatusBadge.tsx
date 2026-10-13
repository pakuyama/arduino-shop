import { ORDER_STATUS, cn } from "@/lib/utils";

export default function OrderStatusBadge({ status }: { status: string }) {
  const s = ORDER_STATUS[status] ?? { label: status, className: "bg-gray-100 text-gray-700" };
  return <span className={cn("rounded px-2 py-0.5 text-xs font-semibold", s.className)}>{s.label}</span>;
}
