"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StakePanel } from "./stake-panel";
import { UnstakePanel } from "./unstake-panel";
import clsx from "clsx";

/**
 * Stake operations component
 * Main component that contains stake, unstake, and withdraw panels
 */
export default function StakeOperations({
  refetchData
}: {
  refetchData: () => void;
}) {
  return (
    <Card className="mx-auto w-2xl">
      <CardContent>
        <Tabs defaultValue="stake">
          <TabsList className={clsx("grid", "grid-cols-2")}>
            <TabsTrigger value="stake">Stake</TabsTrigger>
            <TabsTrigger value="unstake">Unstake</TabsTrigger>
          </TabsList>

          <TabsContent value="stake" className="mt-4">
            <StakePanel />
          </TabsContent>

          <TabsContent value="unstake" className="mt-4">
            <UnstakePanel refetchData={refetchData} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
