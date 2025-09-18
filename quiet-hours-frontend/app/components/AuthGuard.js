"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) router.push("/auth");
      else setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return <>{children}</>;
}
