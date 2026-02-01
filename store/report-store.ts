/**
 * Zustand store for the multi-step report draft.
 */

import type { IncidentCategory, ReportDraft } from '@/types';
import { create } from 'zustand';

interface ReportStore extends ReportDraft {
  setCategory: (c: IncidentCategory) => void;
  setLocation: (lat: number, lon: number, precision_m: number) => void;
  setOccurredAt: (iso: string) => void;
  setDescription: (d: string) => void;
  addMedia: (uri: string, type: 'image' | 'video') => void;
  removeMedia: (index: number) => void;
  reset: () => void;
}

const initial: ReportDraft = {
  category: null,
  lat: null,
  lon: null,
  precision_m: null,
  occurred_at: null,
  description: '',
  mediaUris: [],
};

export const useReportStore = create<ReportStore>((set) => ({
  ...initial,
  setCategory: (category) => set({ category }),
  setLocation: (lat, lon, precision_m) => set({ lat, lon, precision_m }),
  setOccurredAt: (occurred_at) => set({ occurred_at }),
  setDescription: (description) => set({ description }),
  addMedia: (uri, type) =>
    set((s) => ({ mediaUris: [...s.mediaUris, { uri, type }] })),
  removeMedia: (index) =>
    set((s) => ({
      mediaUris: s.mediaUris.filter((_, i) => i !== index),
    })),
  reset: () => set(initial),
}));
