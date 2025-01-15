import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InputData } from './input-data';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class InputDataService {

  public Data = new InputData();

  private _data: any;

  constructor(
    private electronService: ElectronService,
    private http: HttpClient
  ) {
    this._data = new Array();
    
    if (this.electronService.isElectron) {
      // Only use ipcRenderer in electron environment
      const arg = this.electronService.ipcRenderer.sendSync('read-csv-file');
      if (arg) {
        console.log('CSV data loaded successfully');
        this.parseCSVData(arg);
      } else {
        console.error('No CSV data received in electron mode');
      }
    } else {
      // Browser environment - implement CSV loading fallback using HttpClient
      console.log('Running in browser mode - Loading CSV from assets');
      this.http.get('assets/data.csv', { responseType: 'text' })
        .subscribe({
          next: (text) => {
            if (!text) {
              throw new Error('Empty CSV data received');
            }
            console.log('CSV data loaded successfully');
            this.parseCSVData(text);
          },
          error: (error) => {
            console.error('Error loading CSV in browser mode:', error);
          }
        });
    }
  }

  private parseCSVData(arg: string): void {
    if (!arg) {
      console.error('Empty CSV text provided to parser');
      return;
    }
    console.log(arg);
    const tmp = arg.split("\n");
    let i: number = 0;
    for (i = 1; i < tmp.length; ++i) {
      try {
        const line = tmp[i].split(',');

        let list = []
        for (let j: number = 0; j < 2; ++j) {
          list.push(line[j]);
        }

        let col = line[1].split('-');
        for (let j: number = 0; j < 11; ++j) {
          const str: string = col[j].replace("case", "")
          list.push(str);
        }

        for (let j: number = 2; j < 7; ++j) {
          list.push(line[j]);
        }

        this._data.push(list);
      } catch (e) {
        console.log(e);
        console.log("-------");
        console.log(`i=${i}`);
        console.log(tmp[i]);
        console.log("-------");
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

  public getEffectionNum(): number {

    function getEffection(data: any, index: number, naikuHeniSokudo: number): number {
      let effection: number;
      const d = data[index];
      if (naikuHeniSokudo < 1) {
        effection = d[13];
      } else if (naikuHeniSokudo < 2) {
        effection = d[14];
      } else if (naikuHeniSokudo < 3) {
        effection = d[15];
      } else if (naikuHeniSokudo < 10) {
        effection = d[16];
      } else {
        effection = d[17];
      }
      return effection;
    }


    const CaseStrings: string[] = this.getCaseStrings(false);

    // 同じデータを探す
    let crrentData: number[][] = [[-1.0, -1.0], [-1.0, -1.0]];
    let counter: number = 0;

    for (let index = 0; index < this._data.length; index++) {
      const row = this._data[index];
      let crrent: string = row[1]; 

      // 内空変位速度
      const naikuHeniSokudo: number = this.Data.naikuHeniSokudo;

      if (CaseStrings[0] === crrent) {
        // 同じデータが見つかったら それを返す
        return getEffection(this._data, index, naikuHeniSokudo);
      }
      //任意の数値の 巻厚, 地盤強度 以外の入力が同じデータを探す
      if (CaseStrings[3] === crrent) {
        crrentData[0][0] = getEffection(this._data, index, naikuHeniSokudo);
        counter++;
      }
      if (CaseStrings[4] === crrent) {
        crrentData[1][0] = getEffection(this._data, index, naikuHeniSokudo);
        counter++;
      }
      if (CaseStrings[5] === crrent) {
        crrentData[0][1] = getEffection(this._data, index, naikuHeniSokudo);
        counter++;
      }
      if (CaseStrings[6] === crrent) {
        crrentData[1][1] = getEffection(this._data, index, naikuHeniSokudo);
        counter++;
      }
    }
    if (counter < 4) {
      return 0;
    }

    const temp1: number = (crrentData[1][0] - crrentData[0][0]) * this.Data.fukukouMakiatsu / 30 + 2 * crrentData[0][0] - crrentData[1][0];
    const temp2: number = (crrentData[1][1] - crrentData[0][1]) * this.Data.fukukouMakiatsu / 30 + 2 * crrentData[0][1] - crrentData[1][1];

    const temp3: number = (temp2 - temp1) * this.Data.jiyamaKyodo / 6 + 4 * temp1 / 3 - temp2 / 3;

    //少数1桁にラウンド
    return Math.round(temp3 * 10) / 10;

  }

  }
