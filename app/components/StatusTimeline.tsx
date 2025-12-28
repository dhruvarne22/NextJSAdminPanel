import { STATUS_MAP } from "@/lib/status";
import { PropertyActivityLog, PropertyStatus } from "@/lib/types";

export default function StatusTimeline({
  logs,
}: {
  logs: PropertyActivityLog[];
}) {
  return (
    <div className="border rounded p-4 space-y-4">
      <h3 className="font-semibold">Activity Timeline</h3>

      {logs.map((log) => {
        const from = log.from_status;
        const to = log.to_status;

        return (
          <div key={log.id} className="border-l pl-4">
            {log.activity_type === "STATUS_CHANGE" && to && (
              <p className="text-sm font-medium">
                {from ? STATUS_MAP[from].label : "—"} →{" "}
                {STATUS_MAP[to].label}
              </p>
            )}

            <p className="text-sm">{log.comment}</p>

            <p className="text-xs text-muted-foreground">
              {new Date(log.created_at).toLocaleString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}
