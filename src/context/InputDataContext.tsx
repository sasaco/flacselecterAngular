'use client';

import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

export interface InputData {
  tunnelKeizyo: number;
  fukukouMakiatsu: number;
  invert: number;
  haimenKudo: number;
  henkeiMode: number;
  jiyamaKyodo: number;
  naikuHeniSokudo: number;
  uragomeChunyuko: number;
  lockBoltKou: number;
  lockBoltLength: number;
  downwardLockBoltKou: number;
  downwardLockBoltLength: number;
  uchimakiHokyo: number;
  MonitoringData: string;
}

export interface InputDataContextType {
  data: InputData;
  setData: React.Dispatch<React.SetStateAction<InputData>>;
  resetData: () => void;
  getCaseStrings: (flg?: boolean) => string[];
  getEffectionNum: () => Promise<number>;
}

const defaultInputData: InputData = {
  tunnelKeizyo: 1,
  fukukouMakiatsu: 30,
  invert: 0,
  haimenKudo: 0,
  henkeiMode: 1,
  jiyamaKyodo: 2,
  naikuHeniSokudo: 0,
  uragomeChunyuko: 0,
  lockBoltKou: 0,
  lockBoltLength: 3,
  downwardLockBoltKou: 0,
  downwardLockBoltLength: 4,
  uchimakiHokyo: 0,
  MonitoringData: ''
};

const InputDataContext = createContext<InputDataContextType | undefined>(undefined);

function InputDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<InputData>(defaultInputData);
  const csvDataRef = React.useRef<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const initialized = React.useRef(false);
  const loadingRef = React.useRef(false);

  const parseCSVData = React.useCallback((csvText: string) => {
    if (!csvText || typeof csvText !== 'string') {
      console.error('Invalid CSV text provided to parser');
      return;
    }
    const tmp = csvText.trim().split("\n");
    if (tmp.length < 2) {
      console.error('CSV data has insufficient lines');
      return;
    }
    
    const newData: any[] = [];
    for (let i = 1; i < tmp.length; ++i) {
      try {
        const line = tmp[i].trim();
        if (!line) continue;
        
        const columns = line.split(',');
        if (columns.length < 7) continue;
        
        let list = [];
        // First two columns
        list.push(columns[0], columns[1]);
        
        // Parse case string
        const caseStr = columns[1];
        if (caseStr && caseStr.startsWith('case')) {
          const col = caseStr.split('-');
          for (let j = 0; j < Math.min(11, col.length); ++j) {
            const str = col[j].replace("case", "");
            list.push(str);
          }
        }
        
        // Add effection values
        for (let j = 2; j < Math.min(7, columns.length); ++j) {
          list.push(columns[j]);
        }
        
        if (list.length >= 13) { // Ensure we have all required data
          newData.push(list);
        }
      } catch (e) {
        console.error('Error parsing CSV line:', e);
      }
    }
    csvDataRef.current = newData;
  }, []); // No dependencies needed since we're using refs

  useEffect(() => {
    if (initialized.current || loadingRef.current) return;
    initialized.current = true;
    loadingRef.current = true;

    const controller = new AbortController();
    let isMounted = true;
    
    const loadCSV = async () => {
      try {
        const response = await fetch('/assets/data.csv', {
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        if (!text || typeof text !== 'string') {
          throw new Error('Invalid CSV data received');
        }
        if (isMounted) {
          parseCSVData(text);
          setDataLoaded(true);
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error loading CSV:', errorMessage);
        if (isMounted) {
          csvDataRef.current = [];
          setDataLoaded(true);
        }
      } finally {
        if (isMounted) {
          loadingRef.current = false;
        }
      }
    };

    loadCSV();
    
    return () => {
      controller.abort();
      isMounted = false;
    };
  }, []); // No dependencies needed since we're using refs

  const getTargetData = (flg: boolean): number[] => {
    let makiatsu: number = data.fukukouMakiatsu;
    let kyodo: number = data.jiyamaKyodo;
    if (flg === true) {
      if (data.tunnelKeizyo < 3) {
        makiatsu = (makiatsu < 45) ? 30 : 60;
        kyodo = (kyodo < 5) ? 2 : 8;
      } else {
        makiatsu = (makiatsu < 60) ? 50 : 70;
        kyodo = (kyodo < 5) ? 2 : 8;
      }
    }

    const targetData: number[] = [];
    targetData.push(data.tunnelKeizyo);
    targetData.push(makiatsu);
    targetData.push(data.invert);
    targetData.push(data.haimenKudo);
    targetData.push(data.henkeiMode);
    targetData.push(kyodo);
    targetData.push(data.uragomeChunyuko);
    targetData.push(data.lockBoltKou);
    targetData.push(data.uchimakiHokyo);
    targetData.push(data.downwardLockBoltKou);

    let lockBoltLength: number = data.lockBoltLength;
    if (lockBoltLength <= 0) {
      lockBoltLength = data.downwardLockBoltLength;
    }
    targetData.push(lockBoltLength);

    return targetData;
  };

  const getCaseStrings = (flg: boolean = true): string[] => {
    const result: string[] = [];

    function caseString(numbers: number[]): string {
      let str: string = numbers[0].toString();
      for (let i = 1; i < numbers.length; i++) {
        str += '-' + numbers[i].toString();
      }
      return 'case' + str;
    }

    let numbers: number[] = getTargetData(flg);
    result.push(caseString(numbers));

    numbers = getTargetData(flg);
    for (let i: number = 6; i < numbers.length; i++) {
      numbers[i] = 0;
    }
    result.push(caseString(numbers));

    numbers = getTargetData(flg);
    if (numbers[0] < 3) {
      numbers[1] = (numbers[1] < 45) ? 30 : 60;
    } else {
      numbers[1] = (numbers[1] < 60) ? 50 : 70;
    }
    numbers[5] = (numbers[5] < 5) ? 2 : 8;
    result.push(caseString(numbers));

    numbers = getTargetData(flg);
    numbers[1] = (numbers[0] < 3) ? 30 : 50;
    numbers[5] = 2;
    result.push(caseString(numbers));

    numbers = getTargetData(flg);
    numbers[1] = (numbers[0] < 3) ? 60 : 70;
    numbers[5] = 2;
    result.push(caseString(numbers));

    numbers = getTargetData(flg);
    numbers[1] = (numbers[0] < 3) ? 30 : 50;
    numbers[5] = 8;
    result.push(caseString(numbers));

    numbers = getTargetData(flg);
    numbers[1] = (numbers[0] < 3) ? 60 : 70;
    numbers[5] = 8;
    result.push(caseString(numbers));

    return result;
  };

  const getEffection = (data: any[], index: number, naikuHeniSokudo: number): number => {
    if (!data || !data[index]) {
      console.error('Invalid data or index in getEffection');
      return 0;
    }
    const d = data[index];
    if (naikuHeniSokudo < 1) {
      return d[13] || 0;
    } else if (naikuHeniSokudo < 2) {
      return d[14] || 0;
    } else if (naikuHeniSokudo < 3) {
      return d[15] || 0;
    } else if (naikuHeniSokudo < 10) {
      return d[16] || 0;
    } else {
      return d[17] || 0;
    }
  };

  const findMatchingEffection = (): number => {
    const csvData = csvDataRef.current;
    if (!csvData || !Array.isArray(csvData)) {
      console.error('Data is not properly initialized');
      return 0;
    }

    const caseStrings = getCaseStrings(false);
    if (!caseStrings) {
      console.error('Failed to get case strings');
      return 0;
    }

    let crrentData: number[][] = [[-1.0, -1.0], [-1.0, -1.0]];
    let counter = 0;
    const naikuHeniSokudo = data?.naikuHeniSokudo || 0;

    for (let index = 0; index < csvData.length; index++) {
      const row = csvData[index];
      if (!row || !row[1]) continue;
      
      const crrent = row[1];

      if (caseStrings[0] === crrent) {
        return getEffection(csvData, index, naikuHeniSokudo);
      }

      if (caseStrings[3] === crrent) {
        crrentData[0][0] = getEffection(csvData, index, naikuHeniSokudo);
        counter++;
      }
      if (caseStrings[4] === crrent) {
        crrentData[1][0] = getEffection(csvData, index, naikuHeniSokudo);
        counter++;
      }
      if (caseStrings[5] === crrent) {
        crrentData[0][1] = getEffection(csvData, index, naikuHeniSokudo);
        counter++;
      }
      if (caseStrings[6] === crrent) {
        crrentData[1][1] = getEffection(csvData, index, naikuHeniSokudo);
        counter++;
      }
    }

    if (counter < 4) {
      return 0;
    }

    const temp1 = (crrentData[1][0] - crrentData[0][0]) * (data?.fukukouMakiatsu || 0) / 30 + 2 * crrentData[0][0] - crrentData[1][0];
    const temp2 = (crrentData[1][1] - crrentData[0][1]) * (data?.fukukouMakiatsu || 0) / 30 + 2 * crrentData[0][1] - crrentData[1][1];
    const temp3 = (temp2 - temp1) * (data?.jiyamaKyodo || 0) / 6 + 4 * temp1 / 3 - temp2 / 3;

    return Math.round(temp3 * 10) / 10;
  };

  const getEffectionNum = async (): Promise<number> => {
    try {
      if (!dataLoaded) {
        return 0;
      }
      return findMatchingEffection();
    } catch (error) {
      console.error('Error getting effection number:', error);
      return 0;
    }
  };

  const resetData = () => {
    setData(defaultInputData);
  };

  const contextValue = useMemo(() => ({
    data,
    setData,
    resetData,
    getCaseStrings,
    getEffectionNum
  }), [data]);

  return (
    <InputDataContext.Provider value={contextValue}>
      {children}
    </InputDataContext.Provider>
  );
}

function useInputData() {
  const context = useContext(InputDataContext);
  if (context === undefined) {
    throw new Error('useInputData must be used within an InputDataProvider');
  }
  return context;
}

export { InputDataContext, InputDataProvider, useInputData };
