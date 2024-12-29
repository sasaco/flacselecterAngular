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
      if (line.length < 2) continue;
      
      const caseStr = line[1];
      const effections = line.slice(2, 7).map(Number);
      
      data.push({
        case: caseStr,
        effections
      });
    } catch (e) {
      console.error('Error parsing CSV line:', e);
    }
  }
  
  return data;
}

function getEffection(data: CSVData, naikuHeniSokudo: number): number {
  if (!data?.effections) return 0;
  
  if (naikuHeniSokudo < 1) {
    return data.effections[0] || 0;
  } else if (naikuHeniSokudo < 2) {
    return data.effections[1] || 0;
  } else if (naikuHeniSokudo < 3) {
    return data.effections[2] || 0;
  } else if (naikuHeniSokudo < 10) {
    return data.effections[3] || 0;
  } else {
    return data.effections[4] || 0;
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

    // Generate case string for lookup
    const caseParams = [
      tunnelKeizyo,
      fukukoMakiatsu,
      invert,
      0, // Fixed parameter order to match Angular implementation
      henkeiMode,
      jiyamaKyodo,
      0, // haimenKudo
      uragomeChunyuko,
      lockBoltKou,
      lockBoltLength || downwardLockBoltLength,
      uchimakiHokyo
    ];
    const caseString = 'case' + caseParams.join('-');

    // Find matching case in CSV data
    const matchingCase = parsedData.find(d => d.case === caseString);
    if (!matchingCase) {
      console.error('No matching case found:', caseString);
      return NextResponse.json({ effection: 0 });
    }

    const effection = getEffection(matchingCase, naikuHeniSokudo);
    return NextResponse.json({ effection });

  } catch (error) {
    console.error('Error calculating effection:', error);
    return NextResponse.json({ error: 'Failed to calculate effection' }, { status: 500 });
  }
}
