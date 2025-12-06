"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export type ProfileType = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  position: string | null;
  image_url: string | null;
};

export default function useUserProfile() {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    // 1. GET AUTH USER
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // 2. FETCH PROFILE BY EMAIL (not id!)
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", user.email)
      .single();

    if (error) {
      console.log("PROFILE FETCH ERROR:", error);
      setProfile(null);
    } else {
      setProfile(data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return { profile, loading };
}
