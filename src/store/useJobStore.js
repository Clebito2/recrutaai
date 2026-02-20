import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Global store for managing active job context and analysis results
 */
export const useJobStore = create(
    persist(
        (set) => ({
            activeJobId: null,
            activeJob: null,
            lastAnalysis: null,

            // Actions
            setActiveJob: (job) => set({
                activeJob: job,
                activeJobId: job?.id || null
            }),

            setLastAnalysis: (analysis) => set({
                lastAnalysis: analysis
            }),

            clearActiveJob: () => set({
                activeJob: null,
                activeJobId: null,
                lastAnalysis: null
            }),
        }),
        {
            name: 'recruit-ai-storage', // saves to localStorage
            partialize: (state) => ({
                activeJobId: state.activeJobId,
                activeJob: state.activeJob,
                lastAnalysis: state.lastAnalysis
            }),
        }
    )
);
