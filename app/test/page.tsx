"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function TestPage() {
  const [session, setSession] = useState<any>(null); // ← FIX

  useEffect(() => {
    supabase.auth.getSession().then((res) => {
      console.log("SESSION:", res.data.session);
      setSession(res.data.session);
    });
  }, []);

  return (
    <pre className="text-white">
      {session ? "SESSION FOUND" : "NO SESSION"}
    </pre>
  );
}
