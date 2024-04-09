import { create } from 'zustand';

interface IPState {
  ip: string;
  setIP: (ip: string) => void;
}

export const useIPStore = create<IPState>((set) => ({
  ip: '',
  setIP: (ip) => set({ ip }),
}));
