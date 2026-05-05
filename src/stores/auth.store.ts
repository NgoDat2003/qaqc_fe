"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import type { AuthUser, RoleKey } from "@/shared/types";

interface AuthState {
  user: AuthUser | null;
  activeRole: RoleKey | null;
  availableRoles: RoleKey[];
  isAuthenticated: boolean;
  // Actions
  setAuth: (user: AuthUser, availableRoles: RoleKey[], activeRole: RoleKey) => void;
  setActiveRole: (role: RoleKey) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      user: null,
      activeRole: null,
      availableRoles: [],
      isAuthenticated: false,

      setAuth: (user, availableRoles, activeRole) =>
        set((state) => {
          state.user = user;
          state.availableRoles = availableRoles;
          state.activeRole = activeRole;
          state.isAuthenticated = true;
        }),

      setActiveRole: (role) =>
        set((state) => {
          state.activeRole = role;
        }),

      logout: () =>
        set((state) => {
          state.user = null;
          state.activeRole = null;
          state.availableRoles = [];
          state.isAuthenticated = false;
        }),
    })),
    {
      name: "maycha_auth", // localStorage key — user display info only, NOT token
      partialize: (state) => ({
        user: state.user,
        activeRole: state.activeRole,
        availableRoles: state.availableRoles,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
