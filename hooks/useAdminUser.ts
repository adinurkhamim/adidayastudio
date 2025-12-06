import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function useAdminUser(allowedRoles: string[]) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // tidak ada session → balik ke login
      if (!session) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      // ambil profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !data) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      // check role
      if (!allowedRoles.includes(data.role)) {
        router.replace("/no-access");
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    }

    loadUser();
  }, []);

  return { profile, loading };
}
