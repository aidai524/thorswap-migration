import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StakePanel } from "./stake-panel";
import { UnstakePanel } from "./unstake-panel";
import UnstakeHistory from "./unstake-history";
import useUnstakeRequests from "@/views/stake/use-unstake-requests";

export default function StakeUnstakePanel() {
  const { isLoading, error, unstakeRequests, refresh, withdrawableAmount } =
    useUnstakeRequests();
  return (
    <div className="w-[792px] bg-white shadow-[0px_4px_0px_0px_#111414_inset]">
      <div className="px-[30px] pb-[30px] pt-[10px]">
        <Tabs defaultValue="stake">
          <TabsList>
            <TabsTrigger value="stake">Stake</TabsTrigger>
            <TabsTrigger value="unstake">Unstake</TabsTrigger>
          </TabsList>

          <TabsContent value="stake">
            <StakePanel />
          </TabsContent>

          <TabsContent value="unstake">
            <UnstakePanel
              refetchData={() => {
                refresh();
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      <UnstakeHistory
        unstakeRequests={unstakeRequests}
        isLoading={isLoading}
        error={error}
        refresh={refresh}
        withdrawableAmount={withdrawableAmount}
      />
    </div>
  );
}
