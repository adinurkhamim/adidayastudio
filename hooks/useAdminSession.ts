"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function useAdminSession() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        setSession(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (!ignore) setSession(sessionData.session);

      const userId = sessionData.session.user.id;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!ignore) setProfile(profileData || null);

      setLoading(false);
    };

    load();

    return () => {
      ignore = true;
    };
  }, []);

  return { session, profile, loading };
}
