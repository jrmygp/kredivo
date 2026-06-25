"use client";

import type { RootState } from "@/redux";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const publicRoutes = ["/"];

export default function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!user && !isPublicRoute) {
      router.replace("/");
    }
  }, [isPublicRoute, router, user]);

  if (!user && !isPublicRoute) {
    return null;
  }

  return children;
}
