"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { User } from "@supabase/supabase-js";
import { Usuario } from "@/types/database.types";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  usuario: Usuario | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  usuario: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    let lastUserId: string | null = null;
    const initializeAuth = async () => {
      try {
        // 1. Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          lastUserId = session.user.id;
          await fetchUsuarioData(session.user.id);
        } else {
          setLoading(false);
        }

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            setUser(session.user);
            if (lastUserId !== session.user.id) {
              lastUserId = session.user.id;
              await fetchUsuarioData(session.user.id);
            }
          } else {
            setUser(null);
            setUsuario(null);
            setRole(null);
            setLoading(false);
            lastUserId = null;
          }
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchUsuarioData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*, rol(*)")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
      } else {
        console.log("User data fetched:", data);
        setUsuario(data);
        setRole(data.rol?.nombre || null);
      }
    } catch (err) {
      console.error("Unexpected error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUsuario(null);
    setRole(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, usuario, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
