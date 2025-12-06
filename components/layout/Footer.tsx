import Link from "next/link";
import Image from "next/image";
import { Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-adidaya-border py-10 px-6">
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">

        {/* Left: Logo + Text */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo-adidaya-red.svg"
            alt="Adidaya Logo"
            width={28}
            height={28}
            className="flex-shrink-0"
          />

          <div className="flex flex-col">
            <p className="text-body font-semibold text-adidaya-text-muted">
              <span className="font-bold">adidaya</span><span className="font-light">studio</span>
            </p>

            <p className="text-xs text-adidaya-text-muted">
              architecture • construction • development
            </p>
          </div>
        </div>

        {/* Middle: Social Icons */}
        <div className="flex items-center gap-6">
          <Link
            href="https://instagram.com/adidayastudio"
            target="_blank"
            className="text-adidaya-text-muted hover:text-adidaya-red transition-colors"
          >
            <Instagram size={20} />
          </Link>

          <Link
            href="mailto:hello@adidayastudio.com"
            className="text-adidaya-text-muted hover:text-adidaya-red transition-colors"
          >
            <Mail size={20} />
          </Link>
        </div>

        {/* Right: Copyright */}
        <div className="text-right text-body-sm text-adidaya-text-muted leading-tight">
          <p>© 2025 PT Mahardika Adidaya</p>
          <span className="text-xs">All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}
