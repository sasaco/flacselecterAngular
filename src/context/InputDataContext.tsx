'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';

// Replicating the InputData interface
interface InputData {
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

interface InputDataContextType {
  data: InputData;
  setData: React.Dispatch<React.SetStateAction<InputData>>;
  getCaseStrings: (flg?: boolean) => string[];
  getEffectionNum: () => Promise<number>;
}

export const InputDataContext = createContext<InputDataContextType | null>(null);

export function InputDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<InputData>({
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
  });

  const [csvData, setCsvData] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState<Promise<void>>(Promise.resolve());

  useEffect(() => {
    // In a browser environment, we'll load the CSV from the public folder
    const loadCSV = async () => {
      try {
        const response = await fetch('/data.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        if (!text) {
          throw new Error('Empty CSV data received');
        }
        console.log('CSV data loaded successfully');
        parseCSVData(text);
      } catch (error) {
        console.error('Error loading CSV in browser mode:', error);
        throw error;
      }
    };

    setDataLoaded(loadCSV());
  }, []);

  const parseCSVData = useCallback((csvText: string): void => {
    if (!csvText) {
      console.error('Empty CSV text provided to parser');
      return;
    }
    const tmp = csvText.split("\n").filter(line => line.trim() !== '');
    const parsedData: any[] = [];
    for (let i = 1; i < tmp.length; ++i) {
      try {
        const line = tmp[i].split(',');
        if (line.length < 7) {
          console.warn(`Skipping invalid line ${i}: insufficient columns`);
          continue;
        }
        let list: string[] = [];
        for (let j = 0; j < 2; ++j) {
          list.push(line[j] || '');
        }
        if (!line[1]) {
          console.warn(`Skipping line ${i}: missing case data`);
          continue;
        }
        const col = line[1].split('-');
        if (col.length < 11) {
          console.warn(`Skipping line ${i}: invalid case format`);
          continue;
        }
        for (let j = 0; j < 11; ++j) {
          const str: string = (col[j] || '').replace("case", "");
          list.push(str);
        }
        for (let j = 2; j < 7; ++j) {
          list.push(line[j] || '');
        }
        parsedData.push(list);
      } catch (e) {
        console.error(`Error parsing CSV data at line ${i}:`, e);
      }
    }
    console.log('Parsed CSV data:', parsedData);
    setCsvData(parsedData);
  }, []);

  const getTargetData = useCallback((flg: boolean): number[] => {
    let makiatsu: number = data.fukukouMakiatsu;
    let kyodo: number = data.jiyamaKyodo;
    if (flg === true) {
      if (data.tunnelKeizyo < 3) { // 単線, 複線
        makiatsu = (makiatsu < 45) ? 30 : 60;
        kyodo = (kyodo < 5) ? 2 : 8;
      } else { // 新幹線
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
  }, [data]);

  const getCaseStrings = useCallback((flg: boolean = true): string[] => {
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
  }, [getTargetData]);

  const getEffection = useCallback((data: any, index: number, naikuHeniSokudo: number): number => {
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
  }, []);

  const findMatchingEffection = useCallback((): number => {
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
  }, [csvData, data, getCaseStrings, getEffection]);

  const getEffectionNum = useCallback(async (): Promise<number> => {
    try {
      await dataLoaded;
      return findMatchingEffection();
    } catch (error) {
      console.error('Error getting effection number:', error);
      return 0;
    }
  }, [dataLoaded, findMatchingEffection]);

  return (
    <InputDataContext.Provider value={{ data, setData, getCaseStrings, getEffectionNum }}>
      {children}
    </InputDataContext.Provider>
  );
}

export function useInputData() {
  const context = React.useContext(InputDataContext);
  if (context === null) {
    throw new Error('useInputData must be used within an InputDataProvider');
  }
  return context;
}
