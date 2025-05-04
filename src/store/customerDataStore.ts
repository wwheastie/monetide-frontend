import { create } from 'zustand';

interface CustomerDataState {
  version: number;
  incrementVersion: () => void;
  resetVersion: () => void;
}

export const useCustomerDataStore = create<CustomerDataState>((set) => ({
  version: 0,
  incrementVersion: () => set((state) => ({ version: state.version + 1 })),
  resetVersion: () => set({ version: 0 }),
}));

interface FilterState {
  selectedBuckets: string[];
  setSelectedBuckets: (buckets: string[]) => void;
  selectedRegions: string[];
  setSelectedRegions: (regions: string[]) => void;
  selectedSegments: string[];
  setSelectedSegments: (segments: string[]) => void;
  selectedRenewalManagers: string[];
  setSelectedRenewalManagers: (managers: string[]) => void;
  selectedRenewalTeams: string[];
  setSelectedRenewalTeams: (teams: string[]) => void;
  selectedRenewalDates: string[];
  setSelectedRenewalDates: (dates: string[]) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedBuckets: [],
  setSelectedBuckets: (buckets) => set({ selectedBuckets: buckets }),
  selectedRegions: [],
  setSelectedRegions: (regions) => set({ selectedRegions: regions }),
  selectedSegments: [],
  setSelectedSegments: (segments) => set({ selectedSegments: segments }),
  selectedRenewalManagers: [],
  setSelectedRenewalManagers: (managers) => set({ selectedRenewalManagers: managers }),
  selectedRenewalTeams: [],
  setSelectedRenewalTeams: (teams) => set({ selectedRenewalTeams: teams }),
  selectedRenewalDates: [],
  setSelectedRenewalDates: (dates) => set({ selectedRenewalDates: dates }),
  resetFilters: () => set({
    selectedBuckets: [],
    selectedRegions: [],
    selectedSegments: [],
    selectedRenewalManagers: [],
    selectedRenewalTeams: [],
    selectedRenewalDates: [],
  }),
})); 