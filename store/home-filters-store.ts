import type { IncidentCategory } from '@/types';
import { create } from 'zustand';

type TimeRange = 'today' | '7days' | '30days';

interface HomeFiltersStore {
  timeRange: TimeRange | null;
  category: IncidentCategory | null;
  setTimeRange: (v: TimeRange | null) => void;
  setCategory: (v: IncidentCategory | null) => void;
}

export const useHomeFilters = create<HomeFiltersStore>((set) => ({
  timeRange: null,
  category: null,
  setTimeRange: (timeRange) => set({ timeRange }),
  setCategory: (category) => set({ category }),
}));
