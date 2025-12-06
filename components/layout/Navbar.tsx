import Image from "next/image";
import Link from "next/link";

const navItems = [
  { href: "/", label: "Intro" },
  { href: "/studio", label: "Studio" },
  { href: "/projects", label: "Project" },
  { href: "/insight", label: "Insight" },
  { href: "/network", label: "Network" },
];

export default function Navbar() {
  return (
    <header className="w-full flex justify-center pt-8 z-[9999] relative">
      <div className="w-full max-w-5xl px-6 flex items-center justify-between z-[9999] relative">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-adidaya-red.svg"
            alt="Adidaya Studio"
            width={24}
            height={24}
            priority
            className="object-contain"
          />

          <span className="text-label tracking-[0.2em] uppercase text-adidaya-text-muted">
            Adidaya Studio
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8 text-body-sm">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span
                className="
                  text-adidaya-text-muted
                  hover:text-adidaya-red
                  transition-colors duration-200
                "
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

      </div>
    </header>
  );
}
