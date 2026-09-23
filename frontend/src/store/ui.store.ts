import { create } from "zustand";

type UiState = {
  isMobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
  isBagOpen: boolean;
  openBag: () => void;
  closeBag: () => void;
  toggleBag: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  isMobileNavOpen: false,
  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  isBagOpen: false,
  openBag: () => set({ isBagOpen: true }),
  closeBag: () => set({ isBagOpen: false }),
  toggleBag: () => set((state) => ({ isBagOpen: !state.isBagOpen })),
}));
