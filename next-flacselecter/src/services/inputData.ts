import { create } from 'zustand';

interface InputData {
  // 構造条件
  tunnelKeizyo: number;
  fukukouMakiatsu: number;
  invert: number;
  
  // 調査・計測結果
  haimenKudo: number;
  henkeiMode: number;
  jiyamaKyodo: number;
  naikuHeniSokudo: number;
  monitoringData?: string;

  // 対策工の条件
  uragomeChunyuko: number;
  lockBoltKou: number;
  lockBoltLength: number;
  downwardLockBoltKou: number;
  downwardLockBoltLength: number;
  uchimakiHokyo: number;
}

interface InputDataStore {
  inputData: InputData;
  setInputData: (data: Partial<InputData>) => void;
  resetInputData: () => void;
}

const initialInputData: InputData = {
  // 構造条件
  tunnelKeizyo: 1,
  fukukouMakiatsu: 30,
  invert: 0,
  
  // 調査・計測結果
  haimenKudo: 0,
  henkeiMode: 1,
  jiyamaKyodo: 2,
  naikuHeniSokudo: 0,
  monitoringData: '',
  
  // 対策工の条件
  uragomeChunyuko: 1, // デフォルト: 無し
  lockBoltKou: 1,     // デフォルト: 無し
  lockBoltLength: 1,  // デフォルト: 3m
  downwardLockBoltKou: 1, // デフォルト: 無し
  downwardLockBoltLength: 1, // デフォルト: 3m
  uchimakiHokyo: 1    // デフォルト: 無し
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
