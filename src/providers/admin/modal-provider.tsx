"use client";

import { useEffect, useState } from "react";

import { StoreModal } from "~/components/admin/modals/store-modal";
import { ShippingModal } from "~/components/admin/orders/shipping-modal";
import { useShippingModal } from "~/hooks/admin/use-shipping-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { data } = useShippingModal();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <StoreModal />
      <ShippingModal data={data} />
    </>
  );
};
