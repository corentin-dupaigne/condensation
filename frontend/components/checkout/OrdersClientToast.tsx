"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearCart } from "@/lib/cart-store";
import { PurchaseSuccessToast } from "./PurchaseSuccessToast";

export function OrdersClientToast() {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(() => searchParams.get("purchase") === "success");
  const clearedRef = useRef(false);

  useEffect(() => {
    if (visible && !clearedRef.current) {
      clearedRef.current = true;
      clearCart();
    }
  }, [visible]);

  if (!visible) return null;

  return <PurchaseSuccessToast visible={true} onDismiss={() => setVisible(false)} />;
}
