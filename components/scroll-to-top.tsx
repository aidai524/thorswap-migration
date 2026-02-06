"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * 页面切换时自动滚动到顶部的组件
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
