import { ReactNode } from "react";
import LandingNav from "@/components/LandingNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#EB0A1E]/10 via-transparent to-[#EB0A1E]/10 pointer-events-none" />
      <div className="relative z-10">
        <LandingNav />
        <main>{children}</main>
      </div>
    </div>
  );
}
