import { TabsContent } from "@/components/ui/tabs";
import TeamVestingPanel from "@/views/vesting/team-vesting-panel";

export default function VestingPage() {
  return (
    <TabsContent value="team" className="mt-4">
      <TeamVestingPanel />
    </TabsContent>
  );
}
