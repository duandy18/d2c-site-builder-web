export type ReadinessLevel = "error" | "warning";
export type ReadinessStatus = "ready" | "blocked" | "warning" | "empty";

export type PublishReadinessIssue = {
  level: ReadinessLevel;
  code: string;
  message: string;
  template_region_code: string | null;
  slot_code: string | null;
  field_key: string | null;
  renderer_key: string | null;
};

export type PublishReadinessSlot = {
  slot_code: string;
  label: string;
  renderer_key: string;
  required: boolean;
  status: ReadinessStatus;
  is_filled: boolean;
  issue_count: number;
  warning_count: number;
};

export type PublishReadinessRegion = {
  template_region_code: string;
  label: string;
  required: boolean;
  status: ReadinessStatus;
  issue_count: number;
  warning_count: number;
  slots: PublishReadinessSlot[];
};

export type PublishReadinessSummary = {
  region_count: number;
  slot_count: number;
  required_slot_count: number;
  filled_slot_count: number;
  issue_count: number;
  warning_count: number;
  missing_required_slot_count: number;
};

export type PublishReadinessResponse = {
  site_code: string;
  surface_code: string;
  page_code: string;
  page_title: string;
  template_key: string;
  template_name: string;
  ready: boolean;
  status: "ready" | "blocked";
  summary: PublishReadinessSummary;
  issues: PublishReadinessIssue[];
  regions: PublishReadinessRegion[];
};
