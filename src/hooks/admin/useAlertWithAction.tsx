import { create } from "zustand";

interface useAlertWithActionStore {
  isOpen: boolean;
  isLoading: boolean;
  action: () => void;
  onOpen: (action: () => void) => void;
  setIsLoading: (isLoading: boolean) => void;
  onClose: () => void;
}

export const useAlertWithAction = create<useAlertWithActionStore>((set) => ({
  isOpen: false,
  isLoading: false,
  action: () => void 0,
  onOpen: (action) => set({ isOpen: true, action }),
  onClose: () => set({ isOpen: false, action: () => void 0 }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
