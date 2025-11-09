import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

type UserRole = "admin" | "clinician" | "radiologist" | "user" | null;

export const useUserRole = (session: Session | null) => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!session?.user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) throw error;

        setUserRole(data?.role as UserRole || "user");
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole("user");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [session]);

  return {
    userRole,
    loading,
    isAdmin: userRole === "admin",
    isClinician: userRole === "clinician",
    isRadiologist: userRole === "radiologist",
    hasElevatedAccess: userRole === "admin" || userRole === "clinician" || userRole === "radiologist",
  };
};
