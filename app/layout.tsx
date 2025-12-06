import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PaddingWrapper from "./PaddingWrapper";

export const metadata = {
  title: "Adidaya Studio",
  description: "Architecture • Design • Development",
};

import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {

  return (
    <html lang="en">
      <body className="bg-adidaya-bg text-adidaya-text font-sans">
        <Navbar />
        
       {/* WRAPPER to decide padding */}
        <PaddingWrapper>
          {children}
        </PaddingWrapper>

        <Footer />
      </body>
    </html>
  );
}



import { Toaster } from "react-hot-toast";

<Toaster
  position="top-right"
  toastOptions={{
    style: {
      background: "adidaya-red",
      color: "#fff",
      border: "1px solid #333",
    },
  }}
/>
