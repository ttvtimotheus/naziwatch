import type { IncidentCategory } from '@/types';

export const CATEGORY_ICONS: Record<IncidentCategory, string> = {
  propaganda: 'flag-outline',
  threat: 'warning-outline',
  violence: 'alert-circle-outline',
  online: 'globe-outline',
  event: 'calendar-outline',
  other: 'ellipsis-horizontal-circle-outline',
};
