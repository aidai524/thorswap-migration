"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
/**
 * Locked METROs operations component
 * Main component that contains stake and unstake panels
 */
export default function LockedMetros({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="space-y-8">
      <Tabs
        value={usePathname().split("/").pop() || "lock"}
        onValueChange={(value) => router.push(`/locked-metros/${value}`)}
        className="w-2xl mx-auto"
      >
        <TabsList className={clsx("grid", "grid-cols-2")}>
          <TabsTrigger value="lock">Lock</TabsTrigger>
          <TabsTrigger value="claim">Claim</TabsTrigger>
        </TabsList>

        {children}
      </Tabs>
    </div>
  );
}
