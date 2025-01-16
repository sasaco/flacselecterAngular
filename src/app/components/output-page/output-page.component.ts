import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-output-page',
    templateUrl: './output-page.component.html',
    standalone: true,
    imports: [CommonModule]
})
export class OutputPageComponent implements OnInit {
  
  public inputString1: string | null = null;
  public inputString2: string | null = null;
  public inputString3: string | null = null;
  public imgString1: string | null = null;
  public imgString0: string | null = null;
  public alertString: string | null = null;

  public csvfrm: string | null = null;
  public effection: number = 0;     // 変位抑制効果
  public displacement: number = 0;  // 対策後の予測内空変位速度

  constructor(private input: InputDataService) {}

  ngOnInit() {
    this.inputString1 = this.input.Data.fukukouMakiatsu.toString();
    // 
    this.inputString1 = this.getinputString1();
    this.inputString2 = this.getinputString2();
    this.inputString3 = this.getinputString3();

    // 画像ファイル名
    this.setimgString();

    this.effection = this.input.getEffectionNum();  // 変位抑制効果
    this.displacement = this.getDisplacement(); // 対策後の予測内空変位速度
  }

  // 構造条件の文字列
  private getinputString1(): string{
    let result: string = "";
    switch (this.input.Data.tunnelKeizyo) {
      case 1:
        result = "単線";
        break;
      case 2:
        result = "複線";
        break;
      case 3:
        result = "新幹線";
        break;
    }
    result += "・巻厚 ";
    result += this.input.Data.fukukouMakiatsu.toString();
    result += "cm・";
    result += (this.input.Data.invert == 0) ? "インバートなし" : "インバートあり";
    return result;
  }

  // 調査・計測結果の文字列
  private getinputString2(): string {
    let result: string = (this.input.Data.haimenKudo == 0) ? "背面空洞なし" : "背面空洞あり";
    result += "・";
    switch (this.input.Data.henkeiMode) {
      case 1:
        result += "側壁全体押出し";
        break;
      case 2:
        result += "側壁上部前傾";
        break;
      case 3:
        result += "脚部押出し";
        break;
      case 4:
        result += "盤ぶくれ";
        break;
    }
    result += "・地山強度 ";
    result += this.input.Data.jiyamaKyodo.toString();
    result += "MPa";
    result += "・内空変位速度 ";
    result += this.input.Data.naikuHeniSokudo.toString();
    result += "mm / 年";

    return result;
  }

  // 対策工条件の文字列
  private getinputString3(): string {
    let result: string = "";

    if (this.input.Data.uragomeChunyuko == 0) {
      result += "裏込注入なし";
    } else {
      result += "裏込注入あり";
    }
    result += "・";
    if (this.input.Data.lockBoltKou === 0) {
      result += "ロックボルトなし";
    }else{
      result += "ロックボルト ";
      result += this.input.Data.lockBoltKou.toString();
      result += "本-";
      result += this.input.Data.lockBoltLength.toString();
      result += "m";
    }    
    result += "・";
    if (this.input.Data.uchimakiHokyo == 0) {
      result += "内巻なし";
    } else {
      result += "内巻あり";
    }
    if (this.input.Data.downwardLockBoltKou !== 0) {
      result += "・";
      result += "下向きロックボルト ";
      result += this.input.Data.downwardLockBoltKou.toString();
      result += "本-";
      result += this.input.Data.downwardLockBoltLength.toString();
      result += "m";
    }    

    return result;
  }

  private setimgString(): void{
    const CaseStrings: string[] = this.input.getCaseStrings();
    // 補強しなかった場合のファイル名
    this.imgString0 = './assets/img/' + CaseStrings[1] + '.png';
    // 補強後 のファイル名
    this.imgString1 = './assets/img/' + CaseStrings[2] + '.png';

    // 画像のアラート文言
    this.alertString = null;
    const tmp = this.imgString1?.split('-');
    let makiatsu: number = (tmp && tmp.length > 2) ? Number(tmp[1]) : this.input.Data.fukukouMakiatsu;
    let kyodo: number = (tmp && tmp.length > 2) ? Number(tmp[5]) : this.input.Data.jiyamaKyodo;

    if(makiatsu !== this.input.Data.fukukouMakiatsu || kyodo !== this.input.Data.jiyamaKyodo){
      this.alertString = '※この画像は覆工巻厚を' + makiatsu + '、地山強度を' + kyodo + 'とした場合のものです。';
    }

  }

  // 対策後の予測内空変位速度
  private getDisplacement() {
    const a: number = this.input.Data.naikuHeniSokudo;
    const b: number = this.effection; // 変位抑制効果
    const c: number = a * (1 - (b / 100));

    // 少数1 桁にラウンド
    const result: number = Math.round(c * 10)/10;
    return result;
  }


}
