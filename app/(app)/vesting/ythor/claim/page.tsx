import { TabsContent } from "@/components/ui/tabs";
import YThorClaimPanel from "@/views/vesting/ythor-claim-panel";

export default function VestingPage() {
  return (
    <TabsContent value="claim" className="mt-4">
      <YThorClaimPanel />
    </TabsContent>
  );
}
