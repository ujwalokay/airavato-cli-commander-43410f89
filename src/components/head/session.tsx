import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ROLES, can, type Permission, type Role } from "@/lib/head-data";

type Session = {
  role: Role;
  roleLabel: string;
  name: string;
  email: string | null;
  authenticated: boolean;
  loading: boolean;
  scopedCafeId: string | null;
  setRole: (r: Role) => void;
  signOut: () => Promise<void>;
  can: (p: Permission) => boolean;
  theme: "dark" | "light";
  toggleTheme: () => void;
};

const Ctx = createContext<Session | null>(null);

const VALID_ROLES = new Set<Role>([
  "platform_owner",
  "support_agent",
  "operations_manager",
  "cafe_owner",
  "auditor",
]);

function roleFromUser(user: { user_metadata?: Record<string, unknown> } | null): Role {
  const value = user?.user_metadata?.role;
  return typeof value === "string" && VALID_ROLES.has(value as Role) ? (value as Role) : "auditor";
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string | null; role: Role } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    let active = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const current = data.user;
      setUser(
        current
          ? {
              name:
                (typeof current.user_metadata?.full_name === "string" &&
                  current.user_metadata.full_name) ||
                current.email?.split("@")[0] ||
                "Authenticated user",
              email: current.email ?? null,
              role: roleFromUser(current),
            }
          : null,
      );
      setAuthLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, current) => {
      if (!active) return;
      setUser(
        current
          ? {
              name:
                (typeof current.user_metadata?.full_name === "string" &&
                  current.user_metadata.full_name) ||
                current.email?.split("@")[0] ||
                "Authenticated user",
              email: current.email ?? null,
              role: roleFromUser(current),
            }
          : null,
      );
      setAuthLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const role = user?.role ?? "auditor";
  const value = useMemo<Session>(
    () => ({
      role,
      roleLabel: user
        ? (ROLES.find((r) => r.id === role)?.label ?? "Read-Only Auditor")
        : "Signed out",
      name: user?.name ?? "Not signed in",
      email: user?.email ?? null,
      authenticated: Boolean(user),
      loading: authLoading,
      scopedCafeId: null,
      setRole: () => undefined,
      signOut: async () => {
        await supabase.auth.signOut();
      },
      can: (permission) => Boolean(user) && can(role, permission),
      theme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    }),
    [authLoading, role, theme, user],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
