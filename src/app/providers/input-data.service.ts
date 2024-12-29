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
        try {
          this.parseCSVData(arg);
          this.dataLoaded = Promise.resolve();
        } catch (error) {
          console.error('Error parsing CSV data in electron mode:', error);
          this.dataLoaded = Promise.reject(error);
        }
      } else {
        console.error('No CSV data received in electron mode');
        this.dataLoaded = Promise.reject(new Error('No CSV data received in electron mode'));
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
          if (!text || text.trim().length === 0) {
            throw new Error('Empty CSV data received');
          }
          console.log('CSV data loaded successfully');
          this.parseCSVData(text);
        })
        .catch(error => {
          console.error('Error loading CSV in browser mode:', error);
          this.data = [];
          throw error;
        });
    }
  }

  private parseCSVData(csvText: string): void {
    if (!csvText || typeof csvText !== 'string') {
      console.error('Invalid CSV text provided to parser');
      this.data = [];
      return;
    }

    const lines = csvText.split("\n").filter(line => line.trim().length > 0);
    if (lines.length < 2) { // At least header + one data row
      console.error('CSV file has insufficient data');
      this.data = [];
      return;
    }

    // Skip header row and process data rows
    for (let i = 1; i < lines.length; ++i) {
      try {
        const line = lines[i].split(',');
        if (line.length < 7) { // Verify minimum required columns
          console.warn(`Skipping invalid line ${i + 1}: insufficient columns`);
          continue;
        }


        let list = [];
        // First two columns
        for (let j = 0; j < 2; ++j) {
          list.push(line[j] || ''); // Use empty string if column is undefined
        }

        // Parse case data
        const caseData = (line[1] || '').split('-');
        if (caseData.length < 11) {
          console.warn(`Skipping invalid line ${i + 1}: insufficient case data columns`);
          continue;
        }

        // Process case numbers
        for (let j = 0; j < 11; ++j) {
          const str: string = (caseData[j] || '').replace("case", "");
          list.push(str);
        }

        // Remaining columns
        for (let j = 2; j < 7; ++j) {
          list.push(line[j] || '0'); // Use '0' as default for missing numeric values
        }

        this.data.push(list);
      } catch (e) {
        console.error(`Error parsing CSV line ${i + 1}:`, e);
      }
    }

    if (this.data.length === 0) {
      console.warn('No valid data rows were parsed from CSV');
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

    return result;
  }

  private getEffection(data: any, index: number, naikuHeniSokudo: number): number {
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

    // 同じデータを探す
    let crrentData: number[][] = [[-1.0, -1.0], [-1.0, -1.0]];
    let counter = 0;
    const naikuHeniSokudo = this.Data?.naikuHeniSokudo || 0;

    for (let index = 0; index < this.data.length; index++) {
      const row = this.data[index];
      if (!row || !row[1]) continue;
      
      const crrent = row[1];

      if (caseStrings[0] === crrent) {
        // 同じデータが見つかったら それを返す
        return this.getEffection(this.data, index, naikuHeniSokudo);
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
      return 0;
    }

    const temp1 = (crrentData[1][0] - crrentData[0][0]) * (this.Data?.fukukouMakiatsu || 0) / 30 + 2 * crrentData[0][0] - crrentData[1][0];
    const temp2 = (crrentData[1][1] - crrentData[0][1]) * (this.Data?.fukukouMakiatsu || 0) / 30 + 2 * crrentData[0][1] - crrentData[1][1];
    const temp3 = (temp2 - temp1) * (this.Data?.jiyamaKyodo || 0) / 6 + 4 * temp1 / 3 - temp2 / 3;

    //少数1桁にラウンド
    return Math.round(temp3 * 10) / 10;
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
