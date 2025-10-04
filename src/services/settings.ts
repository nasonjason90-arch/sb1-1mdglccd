export interface PlatformSettings {
  commission: number;
  trial_days: number;
  auto_approve_seekers: boolean;
  manual_approve_landlord_agent: boolean;
  manual_approve_agencies: boolean;
  maintenance_mode: boolean;
  allow_registrations: boolean;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  commission: 5,
  trial_days: 14,
  auto_approve_seekers: true,
  manual_approve_landlord_agent: true,
  manual_approve_agencies: true,
  maintenance_mode: false,
  allow_registrations: true,
};
