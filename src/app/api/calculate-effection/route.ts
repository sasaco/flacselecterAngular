import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface CSVData {
  case: string;
  effections: number[];
}

async function parseCSVData(csvText: string): Promise<CSVData[]> {
  const data: CSVData[] = [];
  const lines = csvText.split("\n");
  
  for (let i = 1; i < lines.length; i++) {
    try {
      const line = lines[i].split(',');
      if (line.length < 18) continue; // Need at least 18 columns (matching Angular's indices)
      
      // Match Angular's parsing logic
      const list = [];
      // First two columns
      for (let j = 0; j < 2; j++) {
        list.push(line[j]);
      }
      // Split case string into components
      const col = line[1].split('-');
      for (let j = 0; j < 11; j++) {
        const str = col[j].replace("case", "");
        list.push(str);
      }
      // Get effection values from indices 13-17 (matching Angular)
      const effections = [
        Number(list[13]) || 0,
        Number(list[14]) || 0,
        Number(list[15]) || 0,
        Number(list[16]) || 0,
        Number(list[17]) || 0
      ];
      
      // Match Angular's case string extraction exactly
      data.push({
        case: line[1], // Keep original case string from CSV
        effections
      });
    } catch (e) {
      console.error('Error parsing CSV line:', e);
    }
  }
  
  return data;
}

function getEffection(data: CSVData | undefined, naikuHeniSokudo: number): number {
  if (!data?.effections) return 0;
  
  // Match Angular's effection value selection logic exactly
  if (naikuHeniSokudo < 1) {
    return data.effections[0] || 0; // Index 13 in CSV
  } else if (naikuHeniSokudo < 2) {
    return data.effections[1] || 0; // Index 14 in CSV
  } else if (naikuHeniSokudo < 3) {
    return data.effections[2] || 0; // Index 15 in CSV
  } else if (naikuHeniSokudo < 10) {
    return data.effections[3] || 0; // Index 16 in CSV
  } else {
    return data.effections[4] || 0; // Index 17 in CSV
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const tunnelKeizyo = Number(data.tunnelKeizyo);
    const henkeiMode = Number(data.henkeiMode);
    const invert = Number(data.invert);
    const fukukoMakiatsu = Number(data.fukukouMakiatsu);
    const jiyamaKyodo = Number(data.jiyamaKyodo);
    const naikuHeniSokudo = Number(data.naikuHeniSokudo);
    const uragomeChunyuko = Number(data.uragomeChunyuko);
    const lockBoltKou = Number(data.lockBoltKou);
    const lockBoltLength = Number(data.lockBoltLength);
    const downwardLockBoltKou = Number(data.downwardLockBoltKou);
    const downwardLockBoltLength = Number(data.downwardLockBoltLength);
    const uchimakiHokyo = Number(data.uchimakiHokyo);

    // Read and parse CSV data
    const csvPath = path.join(process.cwd(), 'public', 'data.csv');
    const csvData = await fs.promises.readFile(csvPath, 'utf-8');
    const parsedData = await parseCSVData(csvData);

    // Generate case strings following Angular's implementation
    function generateCaseStrings(flg: boolean = true): string[] {
      const result: string[] = [];
      
      function getTargetData(): number[] {
        let adjustedMakiatsu = fukukoMakiatsu;
        let adjustedKyodo = jiyamaKyodo;
        
        if (flg) {
          if (tunnelKeizyo < 3) { // 単線, 複線
            adjustedMakiatsu = adjustedMakiatsu < 45 ? 30 : 60;
            adjustedKyodo = adjustedKyodo < 5 ? 2 : 8;
          } else { // 新幹線
            adjustedMakiatsu = adjustedMakiatsu < 60 ? 50 : 70;
            adjustedKyodo = adjustedKyodo < 5 ? 2 : 8;
          }
        }
        
        const targetData: number[] = [];
        targetData.push(tunnelKeizyo);
        targetData.push(adjustedMakiatsu);
        targetData.push(invert);
        targetData.push(0); // haimenKudo is always 0
        targetData.push(henkeiMode);
        targetData.push(adjustedKyodo);
        targetData.push(uragomeChunyuko);
        targetData.push(lockBoltKou);
        targetData.push(uchimakiHokyo);
        targetData.push(downwardLockBoltKou);
        let finalLockBoltLength = lockBoltLength;
        if (finalLockBoltLength <= 0) {
          finalLockBoltLength = downwardLockBoltLength;
        }
        targetData.push(finalLockBoltLength);
        
        return targetData;
      }

      function caseString(numbers: number[]): string {
        let str: string = numbers[0].toString();
        for (let i = 1; i < numbers.length; i++) {
          str += '-' + numbers[i].toString();
        }
        return 'case' + str;
      }

      // index 0 - base case
      let numbers = getTargetData();
      result.push(caseString(numbers));

      // index 1 - no reinforcement case
      numbers = getTargetData();
      for (let i = 6; i < numbers.length; i++) {
        numbers[i] = 0;
      }
      result.push(caseString(numbers));

      // index 2 - reinforced case
      numbers = getTargetData();
      if (numbers[0] < 3) {
        numbers[1] = numbers[1] < 45 ? 30 : 60; // 単線, 複線
      } else {
        numbers[1] = numbers[1] < 60 ? 50 : 70; // 新幹線
      }
      numbers[5] = numbers[5] < 5 ? 2 : 8;
      result.push(caseString(numbers));

      // index 3-6 for interpolation
      // Lower bound makiatsu, lower bound kyodo
      numbers = getTargetData();
      numbers[1] = numbers[0] < 3 ? 30 : 50;
      numbers[5] = 2;
      result.push(caseString(numbers));

      // Upper bound makiatsu, lower bound kyodo
      numbers = getTargetData();
      numbers[1] = numbers[0] < 3 ? 60 : 70;
      numbers[5] = 2;
      result.push(caseString(numbers));

      // Lower bound makiatsu, upper bound kyodo
      numbers = getTargetData();
      numbers[1] = numbers[0] < 3 ? 30 : 50;
      numbers[5] = 8;
      result.push(caseString(numbers));

      // Upper bound makiatsu, upper bound kyodo
      numbers = getTargetData();
      numbers[1] = numbers[0] < 3 ? 60 : 70;
      numbers[5] = 8;
      result.push(caseString(numbers));

      return result;
    }

    // Debug input data
    console.log('Input Data:', {
      tunnelKeizyo,
      fukukoMakiatsu,
      invert,
      henkeiMode,
      jiyamaKyodo,
      naikuHeniSokudo,
      uragomeChunyuko,
      lockBoltKou,
      lockBoltLength,
      downwardLockBoltKou,
      downwardLockBoltLength,
      uchimakiHokyo
    });

    // Generate case strings and find matching cases
    // Try with both flg=true and flg=false to match Angular's behavior
    const caseStringsTrue = generateCaseStrings(true);
    const caseStringsFalse = generateCaseStrings(false);
    console.log('Generated Case Strings (flg=true):', {
      base: caseStringsTrue[0],
      noReinforcement: caseStringsTrue[1],
      reinforced: caseStringsTrue[2],
      interpolation: caseStringsTrue.slice(3)
    });
    console.log('Generated Case Strings (flg=false):', {
      base: caseStringsFalse[0],
      noReinforcement: caseStringsFalse[1],
      reinforced: caseStringsFalse[2],
      interpolation: caseStringsFalse.slice(3)
    });
    
    // Use flg=false for case string matching as that's what Angular uses
    const caseStrings = caseStringsFalse;
    console.log('Using case strings:', caseStrings);

    // Match Angular's findMatchingEffection logic exactly
    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      if (!row?.case) continue;

      // Try exact match first (index 0)
      if (caseStrings[0] === row.case) {
        const effection = getEffection(row, naikuHeniSokudo);
        console.log('Found exact match:', {
          case: row.case,
          effection
        });
        return NextResponse.json({ effection });
      }
    }

    // Initialize interpolation data structure
    let crrentData: number[][] = [[-1, -1], [-1, -1]];
    let counter = 0;

    // Find interpolation cases (indices 3-6)
    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      if (!row?.case) continue;

      if (caseStrings[3] === row.case) {
        crrentData[0][0] = getEffection(row, naikuHeniSokudo);
        counter++;
      }
      if (caseStrings[4] === row.case) {
        crrentData[1][0] = getEffection(row, naikuHeniSokudo);
        counter++;
      }
      if (caseStrings[5] === row.case) {
        crrentData[0][1] = getEffection(row, naikuHeniSokudo);
        counter++;
      }
      if (caseStrings[6] === row.case) {
        crrentData[1][1] = getEffection(row, naikuHeniSokudo);
        counter++;
      }
    }

    console.log('Interpolation matches:', {
      counter,
      data: crrentData
    });

    if (counter === 4) {
      // Calculate interpolated effection using Angular's exact formula
      const temp1 = (crrentData[1][0] - crrentData[0][0]) * fukukoMakiatsu / 30 + 2 * crrentData[0][0] - crrentData[1][0];
      const temp2 = (crrentData[1][1] - crrentData[0][1]) * fukukoMakiatsu / 30 + 2 * crrentData[0][1] - crrentData[1][1];
      const temp3 = (temp2 - temp1) * jiyamaKyodo / 6 + 4 * temp1 / 3 - temp2 / 3;

      // Round to one decimal place
      const effection = Math.round(temp3 * 10) / 10;
      console.log('Calculated interpolated effection:', {
        temp1,
        temp2,
        temp3,
        effection
      });
      return NextResponse.json({ effection });
    }

    console.error('No matching cases found');
    return NextResponse.json({ effection: 0 });

  } catch (error) {
    console.error('Error calculating effection:', error);
    return NextResponse.json({ error: 'Failed to calculate effection' }, { status: 500 });
  }
}
