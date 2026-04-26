export interface TenantInfo {
  tenant_name: string;
  tenant_address: string;
  tenant_unit: string;
  landlord_name: string;
  landlord_address: string;
  letter_date: string;
}

export interface AnalysisSummary {
  issue_type: string;
  severity: "Low" | "Medium" | "High" | "Emergency";
  severity_reason: string;
  code_section: string;
  code_description: string;
  remediation: string;
}

export const LANGUAGES = [
  "English",
  "Spanish",
  "Chinese (Simplified)",
  "French",
  "Bengali",
  "Arabic",
  "Russian",
  "Korean",
  "Haitian Creole",
  "Polish",
] as const;

export type Language = (typeof LANGUAGES)[number];
