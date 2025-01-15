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
          const str = line[j].trim();
          list.push(Number(str));
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
        makiatsu = [30, 45, 60].reduce((prev, curr) => {
          return Math.abs(curr - makiatsu) < Math.abs(prev - makiatsu) ? curr : prev
        }) // 30, 45, 60 の中で一番近い値を選択
      } else { // 新幹線 
        makiatsu = [30, 50, 70].reduce((prev, curr) => {
          return Math.abs(curr - makiatsu) < Math.abs(prev - makiatsu) ? curr : prev
        }) // 30, 50, 70 の中で一番近い値を選択
      }
      kyodo = [1, 4, 10].reduce((prev, curr) => {
        return Math.abs(curr - kyodo) < Math.abs(prev - kyodo) ? curr : prev
      }) // 1, 4, 10 の中で一番近い値を選択
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

    // index 0 入力された値
    const numbers0: number[] = this.getTargetData(flg);
    result.push(caseString(numbers0));

    const list1 = (numbers0[0] < 3) ? [30, 45, 60] : [30, 50, 70];
    const list5 = [1, 4, 10];

    // index 1 補強しなかった場合のファイル名
    const numbers1 = numbers0.slice(); // 配列のコピー
    for (let i: number = 6; i < numbers1.length; i++) {
      numbers1[i] = 0;
    }
    result.push(caseString(numbers1));

    // index 2 補強後 のファイル名
    result.push(caseString(numbers0));

    // 画像を取得する場合はここまで
    if(flg === true) return result;

    // ↓ 変位制御効果の計算する場合
    // 下限値
    function lower_value(list: number[], target: number): number {
      for (let i = 1; i < list.length; i++) {
        const a = list[i - 1];
        const b = list[i];
        if (a <= target && target <= b) {
          return a;
        }
      }
      return list[0];
    }
    // 上限値
    function upper_value(list: number[], target: number): number {
      for (let i = 1; i < list.length; i++) {
        const a = list[i - 1];
        const b = list[i];
        if (a <= target && target <= b) {
          return b;
        }
      }
      return list[list.length - 1];
    }

    // index 3 下限値, 下限値
    const numbers3 = numbers0.slice(); // 配列のコピー
    numbers3[1] = lower_value(list1, numbers3[1]);
    numbers3[5] = lower_value(list5, numbers3[5]);
    result.push(caseString(numbers3));

    // index 4 上限値, 下限値
    const numbers4 = numbers0.slice(); // 配列のコピー
    numbers4[1] = upper_value(list1, numbers4[1]);
    numbers4[5] = numbers3[5];
    result.push(caseString(numbers4));

    // index 5 下限値, 上限値
    const numbers5 = numbers0.slice(); // 配列のコピー
    numbers5[1] = numbers3[1];
    numbers5[5] = upper_value(list5, numbers5[5]);
    result.push(caseString(numbers5));

    // index 6 上限値, 上限値
    const numbers6 = numbers0.slice(); // 配列のコピー
    numbers6[1] = numbers4[1];
    numbers6[5] = numbers5[5];
    result.push(caseString(numbers6));

    return result;
  }

  // 変位抑制効果の計算
  public getEffectionNum(): number {

    function getEffection(d: number[], naikuHeniSokudo: number): number {
      let effection: number;
      if (naikuHeniSokudo < 1) {
        effection = d[13];  // 効果u＜1
      } else if (naikuHeniSokudo < 2) {
        effection = d[14];  // 効果1≦u＜2
      } else if (naikuHeniSokudo < 3) {
        effection = d[15];  // 効果2≦u＜3
      } else if (naikuHeniSokudo < 10) {
        effection = d[16];  // 効果3≦u＜10
      } else {
        effection = d[17];  // 効果u＞10
      }
      return effection;
    }

    let cs: string[] = this.getCaseStrings(false);
    cs = cs.map(element => element + '.png');

    // 同じデータを探す
    const cs0: number[] = this._data.find((row: any) => row[1] === cs[0]) || null;
    if (cs0 != null) {
      // 同じデータが見つかったら それを返す
      return getEffection(cs0, this.Data.naikuHeniSokudo);
    }

    //  任意の数値の 巻厚, 地盤強度 以外の入力が同じデータを探す
    let result: number = 0;
    try {
      const tmp = cs.map(element => element.split('-'));
      const ml: number = Number(tmp[3][1]);  // 巻厚 下限値
      const mu: number = Number(tmp[6][1]);  // 巻厚 上限値
      const jl: number = Number(tmp[3][5]);  // 地盤強度 下限値
      const ju: number = Number(tmp[6][5]);  // 地盤強度 上限値

      // index 3 下限値, 下限値
      const cs3: number[]= this._data.find((row: any) => row[1] === cs[3]) || null;
      if (cs3 == null)  {
        throw new Error(`巻厚=${ml}(下限値), 地盤強度=${jl}(下限値) のデータが見つかりません${cs[3]}`);
      }
      const ll: number = getEffection(cs3, this.Data.naikuHeniSokudo);

      // index 4 上限値, 下限値
      const cs4: number[]= this._data.find((row: any) => row[1] === cs[4]) || null;
      if (cs4 == null)  {
        throw new Error(`巻厚=${mu}(上限値), 地盤強度=${jl}(下限値) のデータが見つかりません\n${cs[4]}`);
      }
      const ul: number = getEffection(cs4, this.Data.naikuHeniSokudo);

      // index 5 下限値, 上限値
      const cs5: number[]= this._data.find((row: any) => row[1] === cs[5]) || null;
      if (cs5 == null)  {
        throw new Error(`巻厚=${ml}(下限値), 地盤強度=${ju}(上限値) のデータが見つかりません\n${cs[5]}`);
      }
      const lu: number = getEffection(cs5, this.Data.naikuHeniSokudo);

      // index 6 上限値, 上限値
      const cs6: number[]= this._data.find((row: any) => row[1] === cs[6]) || null;
      if (cs6 == null)  {
        throw new Error(`巻厚=${mu}(上限値), 地盤強度=${ju}(上限値) のデータが見つかりません\n${cs[6]}`);
      }
      const uu: number = getEffection(cs6, this.Data.naikuHeniSokudo);

      /**
       * 線形補間を行う関数
       * @param x0 - 最初の点の x 座標
       * @param y0 - 最初の点の y 座標
       * @param x1 - 2番目の点の x 座標
       * @param y1 - 2番目の点の y 座標
       * @param x - 補間する x の値
       * @returns 補間された y の値
       */
      function linear(x0: number, y0: number, x1: number, y1: number, x: number): number {
        if (x0 === x1) {
          throw new Error('x0 と x1 は異なる値でなければなりません');
        }
        return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
      }
      // 巻厚の線形補間（地盤強度=下限値）
      const t1: number = linear(ml, ll, mu, ul, this.Data.fukukouMakiatsu);
      // 巻厚の線形補間（地盤強度=上限値）
      const t2: number = linear(ml, lu, mu, uu, this.Data.fukukouMakiatsu);
      // 地盤強度 の線形補間
      result = linear(jl, t1, ju, t2, this.Data.jiyamaKyodo);
    } catch (e: any) {
      alert(e.message);
      return 0;
    }
    //少数1桁にラウンド
    return Math.round(result * 10) / 10;

  }

  }
