import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';
import { fromEventPattern } from 'rxjs';

@Component({
  selector: 'app-output-page',
  templateUrl: './output-page.component.html',
  styleUrls: ['./output-page.component.scss']
})
  
export class OutputPageComponent implements OnInit {
  
  inputString1: string;
  inputString2: string;
  inputString3: string;
  imgString1: string;
  imgString0: string;
  alertString: string;

  csvfrm: string;
  effection: number;
  displacement: number;

  constructor(private input: InputDataService) {}

  ngOnInit() {
    this.inputString1 = this.input.Data.fukukouMakiatsu.toString();
    // 
    this.inputString1 = this.getinputString1();
    this.inputString2 = this.getinputString2();
    this.inputString3 = this.getinputString3();

    // 画像ファイル名
    const img: string[] = this.getimgString();
    this.imgString1 = img[1];
    this.imgString0 = img[0];

    this.alertString = this.getalertString();
    this.input.getEffectionNum().then(value => {
      this.effection = value;
      this.displacement = this.getDisplacement();
    }).catch(error => {
      console.error('Error getting effection number:', error);
      this.effection = 0;
      this.displacement = this.input.Data.naikuHeniSokudo;
    });
  }

  getinputString1(): string{
    let result: string;
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

  getinputString2(): string {
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

  getinputString3(): string {
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

  getimgString(): string[]{
    const CaseStrings: string[] = this.input.getCaseStrings();
    // 補強しなかった場合のファイル名
    let imgString0: string = './assets/img/' + CaseStrings[1] + '.png';
    // 補強後 のファイル名
    let imgString1: string = './assets/img/' + CaseStrings[2] + '.png';
    return [imgString0, imgString1];
  }

  getDisplacement() {
    const a: number = this.input.Data.naikuHeniSokudo;
    const b: number = this.effection;
    const c: number = a * (1 - (b / 100));

    // 少数1 桁にラウンド
    const result: number = Math.round(c * 10)/10;
    return result;
  }

  getalertString(): string{
    let makiatsu: number = this.input.Data.fukukouMakiatsu;
    let kyodo: number = this.input.Data.jiyamaKyodo;
    if (this.input.Data.tunnelKeizyo < 3) { // 単線, 複線
      if ((makiatsu == 30 || makiatsu == 60) && (kyodo == 2 || kyodo == 8)) {
        return null;
      }
      makiatsu = makiatsu < 45 ? 30 : 60;
    } else { // 新幹線   
      if ((makiatsu == 50 || makiatsu == 70) && (kyodo == 2 || kyodo == 8)) {
        return null;
      }
      makiatsu = makiatsu < 60 ? 50 : 70;
    }
    kyodo = kyodo < 5 ? 2 : 8;
    return '※この画像は覆工巻厚を' + makiatsu + '、地山強度を' + kyodo + 'とした場合のものです。';
  }

}
