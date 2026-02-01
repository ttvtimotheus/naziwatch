/**
 * NaziWatch – TypeScript types for incidents, media, and filters.
 */

export type IncidentStatus = 'pending' | 'approved' | 'rejected';

export type IncidentCategory =
  | 'propaganda'      // Propaganda Symbolik
  | 'threat'          // Bedrohung Belästigung
  | 'violence'        // Gewalt Sachbeschädigung
  | 'online'          // Online Hetze
  | 'event'           // Veranstaltung Aufmarsch
  | 'other';          // Sonstiges

export interface Incident {
  id: string;
  created_at: string;
  category: IncidentCategory;
  description: string;
  occurred_at: string;
  lat: number;
  lon: number;
  precision_m: number;
  region_text: string | null;
  status: IncidentStatus;
  risk_flags: Record<string, unknown> | null;
  source_meta: Record<string, unknown> | null;
  media?: MediaRow[];
}

export interface MediaRow {
  id: string;
  incident_id: string;
  type: 'image' | 'video';
  url: string;
  created_at: string;
}

export interface IncidentWithMedia extends Incident {
  media?: MediaRow[];
}

export interface IncidentFilters {
  category?: IncidentCategory | null;
  timeRange?: 'today' | '7days' | '30days' | null;
  onlyApproved?: boolean;
  search?: string;
}

export interface BoundingBox {
  ne_lat: number;
  ne_lon: number;
  sw_lat: number;
  sw_lon: number;
}

export interface ReportDraft {
  category: IncidentCategory | null;
  lat: number | null;
  lon: number | null;
  precision_m: number | null;
  occurred_at: string | null;
  description: string;
  mediaUris: { uri: string; type: 'image' | 'video' }[];
}

export const INCIDENT_CATEGORY_LABELS: Record<IncidentCategory, string> = {
  propaganda: 'Propaganda Symbolik',
  threat: 'Bedrohung Belästigung',
  violence: 'Gewalt Sachbeschädigung',
  online: 'Online Hetze',
  event: 'Veranstaltung Aufmarsch',
  other: 'Sonstiges',
};

export const INCIDENT_CATEGORY_SHORT: Record<IncidentCategory, string> = {
  propaganda: 'Propaganda',
  threat: 'Bedrohung',
  violence: 'Gewalt',
  online: 'Online',
  event: 'Veranstaltung',
  other: 'Sonstiges',
};
