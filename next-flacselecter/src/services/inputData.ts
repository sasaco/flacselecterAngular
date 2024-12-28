import { create } from 'zustand';

interface InputData {
  tunnelKeizyo: number;
  fukukouMakiatsu: number;
  invert: number;
  haimenKudo: number;
  henkeiMode: number;
  jiyamaKyodo: number;
  naikuHeniSokudo: number;
}

interface InputDataStore {
  inputData: InputData;
  setInputData: (data: Partial<InputData>) => void;
  resetInputData: () => void;
}

const initialInputData: InputData = {
  tunnelKeizyo: 1,
  fukukouMakiatsu: 0,
  invert: 0,
  haimenKudo: 0,
  henkeiMode: 1,
  jiyamaKyodo: 0,
  naikuHeniSokudo: 0
};

export const useInputDataStore = create<InputDataStore>((set) => ({
  inputData: initialInputData,
  setInputData: (data) => 
    set((state) => ({
      inputData: { ...state.inputData, ...data }
    })),
  resetInputData: () => 
    set({ inputData: initialInputData })
}));
