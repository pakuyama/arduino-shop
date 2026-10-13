"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/actions/admin";
import { ORDER_STATUS } from "@/lib/utils";

export default function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => updateOrderStatus(orderId, next));
      }}
      className="input w-32 py-1 text-xs"
    >
      {Object.entries(ORDER_STATUS)
        .filter(([key]) => key !== "pending")
        .map(([key, s]) => (
          <option key={key} value={key}>{s.label}</option>
        ))}
    </select>
  );
}
