import { TabsContent } from "@/components/ui/tabs";
import YThorLockPanel from "@/views/vesting/ythor-lock-panel";

export default function VestingPage() {
  return (
    <TabsContent value="lock" className="mt-4">
      <YThorLockPanel />
    </TabsContent>
  );
}
