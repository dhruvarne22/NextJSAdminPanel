export type PropertyStatus = "W" | "Y" | "N";

export interface Property {
  id: number;
  name: string | null;
  location: string | null;
  totalCost: number | null;
  status: PropertyStatus;
  images: string | null;
  youtubeVideo: string | null;
}


export interface PropertyActivityLog {
  id: number;
  property_id: number;
  from_status: PropertyStatus | null;
  to_status: PropertyStatus | null;
  comment: string;
  activity_type: "STATUS_CHANGE" | "COMMENT_ONLY";
  created_at: string;
}