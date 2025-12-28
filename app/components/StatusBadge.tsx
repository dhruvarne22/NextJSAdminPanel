import { PropertyStatus, STATUS_MAP } from "@/lib/status";


export default function StatusBadge({ status }: { status: PropertyStatus }) {
  const s = STATUS_MAP[status];

  return (
    <span className={`px-3 py-1 text-xs rounded ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}
