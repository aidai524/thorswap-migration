"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StakePanel } from "./stake-panel";
import { UnstakePanel } from "./unstake-panel";
import { WithdrawPanel } from "./withdraw-panel";
import useUserStore from "@/stores/use-user";
import clsx from "clsx";

/**
 * Stake operations component
 * Main component that contains stake, unstake, and withdraw panels
 */
export function StakeOperations({ refetchData }: { refetchData: () => void }) {
  const { isContributor } = useUserStore();

  return (
    <Card className="mx-auto">
      <CardContent>
        <Tabs defaultValue="stake" className="w-full">
          <TabsList
            className={clsx(
              "grid w-full",
              isContributor ? "grid-cols-2" : "grid-cols-3"
            )}
          >
            <TabsTrigger value="stake">Stake</TabsTrigger>
            {!isContributor && (
              <TabsTrigger value="unstake">Unstake</TabsTrigger>
            )}
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          <TabsContent value="stake" className="mt-4">
            <StakePanel refetchData={refetchData} />
          </TabsContent>

          {!isContributor && (
            <TabsContent value="unstake" className="mt-4">
              <UnstakePanel refetchData={refetchData} />
            </TabsContent>
          )}

          <TabsContent value="withdraw" className="mt-4">
            <WithdrawPanel refetchData={refetchData} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
