export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import type { ReactNode } from "react";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
