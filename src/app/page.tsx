import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { PrimitivesDemo } from "@/components/dev/primitives-demo";

// Placeholder home — showcases the task-05 UI primitives. The real sticker-book
// landing screen is built in task 06.
export default function HomePage() {
  return (
    <TabletShell>
      <ScreenHeader title="OLA English Adventure" />
      <div className="flex flex-1 flex-col justify-center py-6">
        <PrimitivesDemo />
      </div>
    </TabletShell>
  );
}
