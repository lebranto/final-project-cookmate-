"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuth2SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    window.dispatchEvent(new Event("auth-state-changed"));
    router.replace("/");
    router.refresh();
  }, [router]);

  return null;
}
