/**
 * Incidents API: fetch approved incidents with filters and bounding box.
 */

import { supabase } from '@/lib/supabase';
import type { BoundingBox, Incident, IncidentFilters } from '@/types';

export interface FetchIncidentsParams {
  filters?: IncidentFilters;
  bbox?: BoundingBox;
  page?: number;
  pageSize?: number;
}

export async function fetchIncidents(params: FetchIncidentsParams = {}): Promise<{
  data: Incident[];
  hasMore: boolean;
}> {
  const { filters = {}, bbox, page = 0, pageSize = 20 } = params;
  let query = supabase
    .from('incidents')
    .select('*')
    .eq('status', 'approved')
    .order('occurred_at', { ascending: false });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.timeRange) {
    const now = new Date();
    let from: Date;
    if (filters.timeRange === 'today') {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (filters.timeRange === '7days') {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    query = query.gte('occurred_at', from.toISOString());
  }
  if (bbox) {
    query = query
      .gte('lat', bbox.sw_lat)
      .lte('lat', bbox.ne_lat)
      .gte('lon', bbox.sw_lon)
      .lte('lon', bbox.ne_lon);
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await query.range(from, to);

  if (error) throw error;
  const list = (data ?? []) as Incident[];
  return { data: list, hasMore: list.length === pageSize };
}

export async function fetchIncidentById(id: string): Promise<Incident | null> {
  const { data, error } = await supabase
    .from('incidents')
    .select('*, media(*)')
    .eq('id', id)
    .eq('status', 'approved')
    .single();
  if (error || !data) return null;
  return data as Incident;
}
