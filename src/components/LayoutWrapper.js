"use client";

import { usePathname, useRouter } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";
import { supabase } from "../utils/supabaseClient";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthOrTest = pathname.startsWith('/login') || pathname.startsWith('/test-redirect');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (isAuthOrTest) {
    return children;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300">
      <DashboardSidebar onLogout={handleLogout} />
      <main className="flex-1">{children}</main>
    </div>
  );
} 