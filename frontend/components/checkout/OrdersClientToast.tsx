"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { clearCart } from "@/lib/cart-store";
import { PurchaseSuccessToast } from "./PurchaseSuccessToast";

export function OrdersClientToast() {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get("purchase") === "success") {
      setVisible(true);
      clearCart();
    }
  }, [searchParams]);

  if (!visible) return null;

  return <PurchaseSuccessToast visible={true} onDismiss={() => setVisible(false)} />;
}
