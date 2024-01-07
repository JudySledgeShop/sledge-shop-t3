import { create } from "zustand";
import type { DetailedProductFull } from "~/types";

interface PreviewModalStore {
  isOpen: boolean;
  data?: DetailedProductFull;
  onOpen: (data: DetailedProductFull) => void;
  onClose: () => void;
}

const usePreviewModal = create<PreviewModalStore>((set) => ({
  isOpen: false,
  data: undefined,
  onOpen: (data: DetailedProductFull) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false }),
}));

export default usePreviewModal;
