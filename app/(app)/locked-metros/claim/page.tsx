"use client";

import { TabsContent } from "@/components/ui/tabs";
import { UnstakePanel } from "@/views/locked-metros/unstake-panel";

export default function LockedMetrosPage() {
  return (
    <TabsContent value="claim" className="mt-4">
      <UnstakePanel />
    </TabsContent>
  );
}
