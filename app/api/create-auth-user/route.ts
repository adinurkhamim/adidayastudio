import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, role } = body;

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // SUPER KEY, SERVER-ONLY
  );

  const defaultPassword = "Adidaya2025"; // bisa kamu ganti / buat random generator

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: defaultPassword,
    user_metadata: { role },
  });

  if (error) {
    console.error("❌ Failed to create auth user:", error);
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ user: data.user });
}
