"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
/**
 * Main vesting page component
 * Contains tabs for TEAM and YTHOR vesting panels
 */
export default function Vesting({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const splits = pathname.split("/");
  return (
    <Tabs
      value={splits[2] || "team"}
      onValueChange={(value) => router.push(`/vesting/${value}`)}
      className="w-2xl mx-auto"
    >
      <TabsList className={clsx("grid", "grid-cols-2")}>
        <TabsTrigger value="team">TEAM</TabsTrigger>
        <TabsTrigger value="ythor">YTHOR</TabsTrigger>
      </TabsList>

      {children}
    </Tabs>
  );
}
