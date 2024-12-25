import { Injectable } from '@angular/core';
import { InputData } from './imput-data';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class InputDataService {

  public Data: InputData = {
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
  }

  private data: any;

  private dataLoaded: Promise<void>;

  constructor(private electronService: ElectronService) {
    this.data = new Array();
    
    if (this.electronService.isElectron()) {
      // Only use ipcRenderer in electron environment
      const arg = this.electronService.electron.ipcRenderer.sendSync('read-csv-file');
      if (arg) {
        this.dataLoaded = Promise.resolve(this.parseCSVData(arg));
      } else {
        console.error('No CSV data received in electron mode');
        this.dataLoaded = Promise.reject('No CSV data received in electron mode');
      }
    } else {
      // Browser environment - implement CSV loading fallback
      console.log('Running in browser mode - Loading CSV from assets');
      this.dataLoaded = fetch('./assets/data.csv')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(text => {
          if (!text) {
            throw new Error('Empty CSV data received');
          }
          console.log('CSV data loaded successfully');
          this.parseCSVData(text);
        })
        .catch(error => {
          console.error('Error loading CSV in browser mode:', error);
          throw error;
        });
    }
  }

  private parseCSVData(csvText: string): void {
    if (!csvText) {
      console.error('Empty CSV text provided to parser');
      return;
    }

    // Split lines and filter out empty or whitespace-only lines
    const tmp = csvText.split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Skip header row (i=1)
    for (let i = 1; i < tmp.length; ++i) {
      try {
        const line = tmp[i].split(',');
        
        // Validate minimum required columns
        if (line.length < 7) {  // We need at least 7 columns for valid data
          console.warn('Skipping malformed CSV line (insufficient columns):', tmp[i]);
          continue;
        }

        // Validate case string format in second column
        if (!line[1] || !line[1].includes('-')) {
          console.warn('Skipping malformed CSV line (invalid case string format):', tmp[i]);
          continue;
        }

        let list = [];
        // First two columns (case number and case string)
        for (let j = 0; j < 2; ++j) {
          list.push(line[j]);
        }

        // Parse case string components
        const col = line[1].split('-');
        if (col.length < 11) {
          console.warn('Skipping malformed CSV line (invalid case string components):', tmp[i]);
          continue;
        }

        // Extract numeric values from case string
        for (let j = 0; j < 11; ++j) {
          const str: string = col[j].replace("case", "");
          list.push(str);
        }

        // Add remaining columns (effection values)
        for (let j = 2; j < 7; ++j) {
          list.push(line[j]);
        }

        this.data.push(list);
      } catch (e) {
        console.error('Error parsing CSV line:', tmp[i], e);
      }
    }
  }

  private getTargetData(flg:boolean): number[] {

    let makiatsu: number = this.Data.fukukouMakiatsu;
    let kyodo: number = this.Data.jiyamaKyodo;
    if (flg === true) {
      // 覆工巻厚 と 地山強度 の中間値を入力されたとき
      if (this.Data.tunnelKeizyo < 3) { // 単線, 複線
        makiatsu = (makiatsu < 45) ? 30 : 60;
        kyodo = (kyodo < 5) ? 2 : 8;
      } else { // 新幹線 
        makiatsu = (makiatsu < 60) ? 50 : 70;
        kyodo = (kyodo < 5) ? 2 : 8;
      }
    }

    const targetData: number[] = new Array();

    targetData.push(this.Data.tunnelKeizyo);
    targetData.push(makiatsu);
    targetData.push(this.Data.invert);
    targetData.push(this.Data.haimenKudo);
    targetData.push(this.Data.henkeiMode);
    targetData.push(kyodo);
    targetData.push(this.Data.uragomeChunyuko);
    targetData.push(this.Data.lockBoltKou);
    targetData.push(this.Data.uchimakiHokyo);
    targetData.push(this.Data.downwardLockBoltKou);
    // ロックボルト長さは lockBoltLength と downwardLockBoltLength のどちらか
    let lockBoltLength: number = this.Data.lockBoltLength;
    if (lockBoltLength <= 0 ) {
      lockBoltLength = this.Data.downwardLockBoltLength;
    }
    targetData.push(lockBoltLength);

    return targetData;
  }

  public getCaseStrings(flg:boolean = true): string[] {
    console.log('getCaseStrings called with inputs:', {
      tunnelKeizyo: this.Data.tunnelKeizyo,
      fukukouMakiatsu: this.Data.fukukouMakiatsu,
      jiyamaKyodo: this.Data.jiyamaKyodo,
      naikuHeniSokudo: this.Data.naikuHeniSokudo,
      invert: this.Data.invert,
      haimenKudo: this.Data.haimenKudo,
      henkeiMode: this.Data.henkeiMode,
      uragomeChunyuko: this.Data.uragomeChunyuko,
      lockBoltKou: this.Data.lockBoltKou,
      lockBoltLength: this.Data.lockBoltLength
    });

    const result: string[] = new Array();

    function caseString(numbers: number[]): string {
      let str: string = numbers[0].toString();
      for (let i = 1; i < numbers.length; i++) {
        str += '-' + numbers[i].toString();
      }
      return 'case' + str;
    }

    let numbers: number[] = this.getTargetData(flg);

    // index 0
    result.push(caseString(numbers));

    // index 1 補強しなかった場合のファイル名
    numbers = this.getTargetData(flg);
    for (let i: number = 6; i < numbers.length; i++) {
      numbers[i] = 0;
    }
    result.push(caseString(numbers));

    // index 2 補強後 のファイル名
    numbers = this.getTargetData(flg);
    if (numbers[0] < 3) {
      numbers[1] = (numbers[1] < 45) ? 30 : 60; // 単線, 複線
    } else {
      numbers[1] = (numbers[1] < 60) ? 50 : 70; // 新幹線
    }
    numbers[5] = (numbers[5] < 5) ? 2 : 8;
    result.push(caseString(numbers));

    // index 3 下限値, 下限値
    numbers = this.getTargetData(flg);
    numbers[1] = (numbers[0] < 3) ? 30 : 50;
    numbers[5] = 2;
    result.push(caseString(numbers));

    // index 4 上限値, 下限値
    numbers = this.getTargetData(flg);
    numbers[1] = (numbers[0] < 3) ? 60 : 70;
    numbers[5] = 2;
    result.push(caseString(numbers));

    // index 5 下限値, 上限値
    numbers = this.getTargetData(flg);
    numbers[1] = (numbers[0] < 3) ? 30 : 50;
    numbers[5] = 8;
    result.push(caseString(numbers));

    // index 6 上限値, 上限値
    numbers = this.getTargetData(flg);
    numbers[1] = (numbers[0] < 3) ? 60 : 70;
    numbers[5] = 8;
    result.push(caseString(numbers));

    console.log('Generated case strings:', result);
    return result;
  }

  private getEffection(data: any, index: number, naikuHeniSokudo: number): number {
    if (!data || !data[index]) {
      console.error('Invalid data or index in getEffection');
      return 0;
    }
    const d = data[index];
    // CSV columns: [caseNum, caseString, speed1, speed2, speed3, speed10, speedOver10]
    if (naikuHeniSokudo < 1) {
      return parseFloat(d[2]) || 0;  // Column for speed < 1
    } else if (naikuHeniSokudo < 2) {
      return parseFloat(d[3]) || 0;  // Column for 1 ≤ speed < 2
    } else if (naikuHeniSokudo < 3) {
      return parseFloat(d[4]) || 0;  // Column for 2 ≤ speed < 3
    } else if (naikuHeniSokudo < 10) {
      return parseFloat(d[5]) || 0;  // Column for 3 ≤ speed < 10
    } else {
      return parseFloat(d[6]) || 0;  // Column for speed ≥ 10
    }
  }

  private findMatchingEffection(): number {
    if (!this.data || !Array.isArray(this.data)) {
      console.error('Data is not properly initialized');
      return 0;
    }

    const caseStrings = this.getCaseStrings(false);
    if (!caseStrings) {
      console.error('Failed to get case strings');
      return 0;
    }
    console.log('Finding matching effection for case strings:', caseStrings);

    // 同じデータを探す
    let crrentData: number[][] = [[-1.0, -1.0], [-1.0, -1.0]];
    let counter = 0;
    const naikuHeniSokudo = this.Data?.naikuHeniSokudo || 0;
    console.log('Current parameters:', {
      fukukouMakiatsu: this.Data?.fukukouMakiatsu,
      jiyamaKyodo: this.Data?.jiyamaKyodo,
      naikuHeniSokudo
    });

    for (let index = 0; index < this.data.length; index++) {
      const row = this.data[index];
      if (!row || !row[1]) continue;
      
      const crrent = row[1];

      if (caseStrings[0] === crrent) {
        // 同じデータが見つかったら それを返す
        console.log('Found exact match with case string:', crrent);
        const effection = this.getEffection(this.data, index, naikuHeniSokudo);
        console.log('Returning exact match effection:', effection);
        return effection;
      }

      //任意の数値の 巻厚, 地盤強度 以外の入力が同じデータを探す
      if (caseStrings[3] === crrent) {
        crrentData[0][0] = this.getEffection(this.data, index, naikuHeniSokudo);
        counter++;
      }
      if (caseStrings[4] === crrent) {
        crrentData[1][0] = this.getEffection(this.data, index, naikuHeniSokudo);
        counter++;
      }
      if (caseStrings[5] === crrent) {
        crrentData[0][1] = this.getEffection(this.data, index, naikuHeniSokudo);
        counter++;
      }
      if (caseStrings[6] === crrent) {
        crrentData[1][1] = this.getEffection(this.data, index, naikuHeniSokudo);
        counter++;
      }
    }

    if (counter < 4) {
      console.log('Insufficient matching cases found, counter:', counter);
      return 0;
    }

    console.log('Interpolating with values:', {
      crrentData,
      fukukouMakiatsu: this.Data?.fukukouMakiatsu,
      jiyamaKyodo: this.Data?.jiyamaKyodo
    });


    const temp1 = (crrentData[1][0] - crrentData[0][0]) * (this.Data?.fukukouMakiatsu || 0) / 30 + 2 * crrentData[0][0] - crrentData[1][0];
    const temp2 = (crrentData[1][1] - crrentData[0][1]) * (this.Data?.fukukouMakiatsu || 0) / 30 + 2 * crrentData[0][1] - crrentData[1][1];
    const temp3 = (temp2 - temp1) * (this.Data?.jiyamaKyodo || 0) / 6 + 4 * temp1 / 3 - temp2 / 3;

    console.log('Interpolation calculations:', { temp1, temp2, temp3 });
    //少数1桁にラウンド
    const result = Math.round(temp3 * 10) / 10;
    console.log('Final interpolated result:', result);
    return result;
  }

  public async getEffectionNum(): Promise<number> {
    try {
      await this.dataLoaded;
      return this.findMatchingEffection();
    } catch (error) {
      console.error('Error getting effection number:', error);
      return 0;
    }
  }

  }
