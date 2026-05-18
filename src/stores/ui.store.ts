"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface UIState {
  sidebarOpen: boolean;
  notificationCount: number;
  /** Counter (not boolean) — incremented per in-flight request; bar shows when > 0 */
  loadingCount: number;
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setNotificationCount: (count: number) => void;
  decrementNotification: () => void;
  /** For non-query requests (uploads, etc.) that TanStack Query doesn't track */
  startLoading: () => void;
  stopLoading: () => void;
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    sidebarOpen: true,
    notificationCount: 0,
    loadingCount: 0,

    toggleSidebar: () =>
      set((state) => {
        state.sidebarOpen = !state.sidebarOpen;
      }),

    setSidebarOpen: (open) =>
      set((state) => {
        state.sidebarOpen = open;
      }),

    setNotificationCount: (count) =>
      set((state) => {
        state.notificationCount = count;
      }),

    decrementNotification: () =>
      set((state) => {
        if (state.notificationCount > 0) state.notificationCount -= 1;
      }),

    startLoading: () =>
      set((state) => {
        state.loadingCount += 1;
      }),

    stopLoading: () =>
      set((state) => {
        if (state.loadingCount > 0) state.loadingCount -= 1;
      }),
  }))
);

/** Derived selector — true when any manual request is in flight */
export const useIsGlobalLoading = () => useUIStore((s) => s.loadingCount > 0);
