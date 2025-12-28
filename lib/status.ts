export type PropertyStatus = "W" | "Y" | "N";

export const STATUS_MAP: Record<
  PropertyStatus,
  {
    label: string;
    color: string;
    bg: string;
    text: string;
  }
> = {
  W: {
    label: "Waiting",
    color: "yellow",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
  },
  Y: {
    label: "Approved",
    color: "green",
    bg: "bg-green-100",
    text: "text-green-800",
  },
  N: {
    label: "Rejected",
    color: "red",
    bg: "bg-red-100",
    text: "text-red-800",
  },
};
