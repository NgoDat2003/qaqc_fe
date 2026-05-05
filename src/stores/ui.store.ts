"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface UIState {
  sidebarOpen: boolean;
  notificationCount: number;
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setNotificationCount: (count: number) => void;
  decrementNotification: () => void;
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    sidebarOpen: true,
    notificationCount: 0,

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
  }))
);
