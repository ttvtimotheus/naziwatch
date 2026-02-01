/**
 * Generated Supabase DB types for NaziWatch (incidents, media).
 */

export type IncidentStatus = 'pending' | 'approved' | 'rejected';
export type IncidentCategory =
  | 'propaganda'
  | 'threat'
  | 'violence'
  | 'online'
  | 'event'
  | 'other';
export type MediaType = 'image' | 'video';

export interface Database {
  public: {
    Tables: {
      incidents: {
        Row: {
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
        };
        Insert: {
          id?: string;
          created_at?: string;
          category: IncidentCategory;
          description: string;
          occurred_at: string;
          lat: number;
          lon: number;
          precision_m: number;
          region_text?: string | null;
          status?: IncidentStatus;
          risk_flags?: Record<string, unknown> | null;
          source_meta?: Record<string, unknown> | null;
        };
        Update: Partial<Database['public']['Tables']['incidents']['Insert']>;
      };
      media: {
        Row: {
          id: string;
          incident_id: string;
          type: MediaType;
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          incident_id: string;
          type: MediaType;
          url: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['media']['Insert']>;
      };
    };
  };
}
