import { create } from "zustand";
import type { OrderColumn } from "~/components/admin/orders/columns";

interface useShippingModalStore {
  isOpen: boolean;
  data?: OrderColumn;
  onOpen: (data: OrderColumn) => void;
  onClose: () => void;
}

export const useShippingModal = create<useShippingModalStore>((set) => ({
  isOpen: false,
  data: undefined,
  onOpen: (data: OrderColumn) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false, data: undefined }),
}));
