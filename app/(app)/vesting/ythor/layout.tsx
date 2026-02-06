"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
/**
 * YTHOR vesting panel component
 * Contains tabs for Lock and Claim operations
 */
export default function YThorVesting({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <TabsContent value="ythor" className="mt-4">
      <Tabs
        value={pathname.split("/").pop() || "lock"}
        onValueChange={(value) => router.push(`/vesting/ythor/${value}`)}
        className="w-2xl mx-auto relative"
      >
        <TabsList
          className={clsx("absolute top-[-60px] right-0 grid", "grid-cols-2")}
        >
          <TabsTrigger value="lock">Vest</TabsTrigger>
          <TabsTrigger value="claim">Claim</TabsTrigger>
        </TabsList>

        {children}
      </Tabs>
    </TabsContent>
  );
}
