"use client";

import { TabsContent } from "@/components/ui/tabs";
import { StakePanel } from "@/views/locked-metros/stake-panel";

export default function LockedMetrosPage() {
  return (
    <TabsContent value="lock" className="mt-4">
      <StakePanel />
    </TabsContent>
  );
}
