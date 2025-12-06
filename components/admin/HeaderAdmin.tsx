"use client";

import Image from "next/image";
import Link from "next/link";
import { ProfileType } from "@/hooks/useUserProfile";

export default function HeaderAdmin({ profile }: { profile: ProfileType }) {
  const avatarSrc = profile?.image_url || "/logo-adidaya-red.svg";

  return (
    <header className="mb-10">
      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
        Admin • Dashboard
      </p>

      <div className="mt-2 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white flex items-center gap-2">
            <span className="text-adidaya-red">*</span> Dashboard
          </h1>
        </div>

        <Link href="/admin/profile" className="flex items-center gap-4">
          <div className="text-right leading-tight">
            <p className="font-semibold text-white hover:text-adidaya-red">{profile.name}</p>
            <p className="text-xs text-gray-400 hover:text-adidaya-red-soft">
              {profile.position} · {profile.role?.toUpperCase()}
            </p>
          </div>

          <div className="h-10 w-10 rounded-full overflow-hidden border border-white/10">
            <Image src={avatarSrc} width={40} height={40} alt="avatar" />
          </div>
        </Link>
      </div>
    </header>
  );
}
