import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-input-page',
  templateUrl: './input-page.component.html',
  styleUrls: ['./input-page.component.scss']
})

export class InputPageComponent implements OnInit {

  // トンネル形状
  tunnelKeizyoList = [
    { id: 1, title: '単線' },
    { id: 2, title: '複線' },
    { id: 3, title: '新幹線（在来工法）' },
  ];

  // 覆工巻厚
  tempFukukouMakiatsu: string;

  // インバートの有無
  invertList = [
    { id: 0, title: 'なし' },
    { id: 1, title: 'あり' }
  ];

  // 背面空洞の有無
  haimenKudoList = [
    { id: 0, title: 'なし' },
    { id: 1, title: 'あり' }
  ];

  // 変形モード
  henkeiMode4Flag: boolean; // 盤ぶくれモードかどうか
  henkeiModeStyle: string[];
  henkeiModeList = [
    { id: 1, title: '側壁全体押出し' },
    { id: 2, title: '側壁上部前傾' },
    { id: 3, title: '脚部押出し' },
    { id: 4, title: '盤ぶくれ' }
  ];

  // 地山強度
  tempJiyamaKyodo: string;

  // 内空変位速度
  tempNaikuHeniSokudo: string;
  
  // モニタリングデータ
  tempMonitoringData: string;

  // 裏込注入工
  uragomeChunyukoStyle: string[];
  uragomeChunyukoList = [
    { id: 0, title: 'なし' },
    { id: 1, title: 'あり' }
  ];

  // ロックボルト工
  lockBoltKouList = [
    { id: 0, title: 'なし' },
    { id: 4, title: '4本' },
    { id: 8, title: '8本' },
    { id: 12, title: '12本' },
  ];

  // ロックボルト長さ
  lockBoltLengthStyle: string[];
  lockBoltLengthList = [
    { id: 3, title: '3m' },
    { id: 6, title: '6m' },
    { id: 4, title: '4m' },
    { id: 8, title: '8m' },
  ];


  // （下向き）ロックボルト工
  downwardLockBoltEnable: boolean; 
  downwardLockBoltKouList = [
    { id: 0, title: 'なし' },
    { id: 4, title: '4本' },
    { id: 6, title: '6本' }
  ];

  // （下向き）ロックボルト長さ
  downwardLockBoltLengthStyle: string;
  downwardLockBoltLengthList = [
    { id: 4, title: '4m' },
    { id: 8, title: '8m' }
  ];

  // 内巻補強
  uchimakiHokyoList = [
    { id: 0, title: 'なし' },
    { id: 1, title: 'あり' }
  ];

  constructor(private http: HttpClient,
              private input: InputDataService) {
  }

  ngOnInit() {
    // 任意の数値を入力する項目は、temp 変数に格納する
    this.tempFukukouMakiatsu = this.input.Data.fukukouMakiatsu.toString();
    this.tempJiyamaKyodo = this.input.Data.jiyamaKyodo.toString();
    this.tempNaikuHeniSokudo = this.input.Data.naikuHeniSokudo.toString();
    this.tempMonitoringData = this.input.Data.MonitoringData;
    this.setEnable()
  }
  
  ngOnDestroy() {
    this.input.Data.MonitoringData = this.tempMonitoringData;
  }

  // 入力状況に合わせて有効無効を変える
  private setEnable(): void{
   
    // 新幹線（在来工法）
    if (this.input.Data.tunnelKeizyo === 3) {
      this.henkeiModeStyle = ['Enable', 'Enable', 'Enable', 'Enable'];
      if (this.input.Data.haimenKudo === 1) {
        if (this.input.Data.henkeiMode === 4)
          this.input.Data.henkeiMode = 1;
        this.henkeiModeStyle[3] = 'Disable';
      }
      if (this.input.Data.fukukouMakiatsu < 50) {
        this.tempFukukouMakiatsu = "50";
        this.setFukukouMakiatsu();
      }
    } else {
      // 新幹線（在来工法）ではない
      this.henkeiModeStyle = ['Enable', 'Enable', 'Enable', 'Disable'];
      if (this.input.Data.henkeiMode === 4)
        this.input.Data.henkeiMode = 1;
      this.downwardLockBoltEnable = false;
      this.input.Data.downwardLockBoltKou = 0;
      this.input.Data.downwardLockBoltLength = 0;
      if (this.input.Data.fukukouMakiatsu > 60) {
        this.tempFukukouMakiatsu = "60";
        this.setFukukouMakiatsu();
      }
    }

    // 盤ぶくれモード
    if (this.input.Data.henkeiMode === 4) {
      this.henkeiMode4Flag = true;
      this.downwardLockBoltEnable = true;
      this.input.Data.lockBoltKou = 0;
      this.input.Data.lockBoltLength = 0;
      this.input.Data.uchimakiHokyo = 0;
    } else {
      // 盤ぶくれモードではない
      this.henkeiMode4Flag = false;
      this.downwardLockBoltEnable = false;
      this.input.Data.downwardLockBoltKou = 0;
      this.input.Data.downwardLockBoltLength = 0;
    }

    // 背面空洞の有無 と  裏込注入工
    if (this.input.Data.haimenKudo === 0) {
      this.uragomeChunyukoStyle = ['Enable', 'Disable'];
      this.input.Data.uragomeChunyuko = 0;
    } else {
      this.uragomeChunyukoStyle = ['Disable', 'Enable'];
      this.input.Data.uragomeChunyuko = 1;
    }

    // ロックボルト長さ
    if (this.input.Data.lockBoltKou === 0) {
      this.lockBoltLengthStyle = ['Disable', 'Disable', 'Disable', 'Disable'];
      this.input.Data.lockBoltLength = 0;
    } else {
      switch (this.input.Data.tunnelKeizyo) {
        case 1: // 単線  3, 6m
          this.lockBoltLengthStyle = ['Enable', 'Enable', 'Disable', 'Disable'];
          if (this.input.Data.lockBoltLength !== 3 && this.input.Data.lockBoltLength !== 6 )
            this.input.Data.lockBoltLength = 3;
          break;
        case 2: // 複線 4, 8m
        case 3: // 新幹線（在来工法）4, 8m
          this.lockBoltLengthStyle = ['Disable', 'Disable', 'Enable', 'Enable'];
          if (this.input.Data.lockBoltLength !== 4 && this.input.Data.lockBoltLength !== 8)
            this.input.Data.lockBoltLength = 4;
          break;
      }
    }

    // （下向き）ロックボルト長さ
    if (this.input.Data.downwardLockBoltKou !== 0) {
      this.downwardLockBoltLengthStyle = 'Enable';
      if (this.input.Data.downwardLockBoltLength === 0)
        this.input.Data.downwardLockBoltLength = 4;
    } else {
      this.downwardLockBoltLengthStyle = 'Disable';
      this.input.Data.downwardLockBoltLength = 0;
    }

    // インバートありの場合は「脚部押出し」は選べないように
    if (this.input.Data.invert === 1) {
      this.henkeiModeStyle[2] = 'Disable';
      if (this.input.Data.henkeiMode === 3) {
        this.input.Data.henkeiMode = 1;
      }
    } else {
      this.henkeiModeStyle[2] = 'Enable';
    }

  }


  // 覆工巻厚
  setFukukouMakiatsu() {
    const value: number = Number(this.tempFukukouMakiatsu);
    //新幹線の場合は 50~70, それ以外は 30~60
    const min: number = (this.input.Data.tunnelKeizyo !== 3) ? 30 : 50; 
    const max: number = (this.input.Data.tunnelKeizyo !== 3) ? 60 : 70; 
    // 有効な入力の場合のみ値を更新する
    if (!Number.isNaN(value)) {
      if (value < min) {
        alert(min + "以上の数値を入力してください");
        this.input.Data.fukukouMakiatsu = min;
      } else if (max < value) {
        alert(max + "以下の数値を入力してください");
        this.input.Data.fukukouMakiatsu = max;
      } else {
        this.input.Data.fukukouMakiatsu = value;
      }
    }
    this.tempFukukouMakiatsu = this.input.Data.fukukouMakiatsu.toString();
  }


  // 地山強度
  setJiyamaKyodo() {
    const value: number = Number(this.tempJiyamaKyodo);
    // 有効な入力の場合のみ値を更新する
    if (!Number.isNaN(value)) {
      if (value < 2) {
        alert("2以上の数値を入力してください");
        this.input.Data.jiyamaKyodo = 2;
      } else if (8 < value) {
        alert("8以下の数値を入力してください");
        this.input.Data.jiyamaKyodo = 8;
      } else {
        this.input.Data.jiyamaKyodo = value;
      }
    }
    this.tempJiyamaKyodo = this.input.Data.jiyamaKyodo.toString();
  }

  // 内空変位速度
  setNaikuHeniSokudo() {
    const value: number = Number(this.tempNaikuHeniSokudo);
    // 有効な入力の場合のみ値を更新する
    if (!Number.isNaN(value)) {
      this.input.Data.naikuHeniSokudo = value;
    }
    this.tempNaikuHeniSokudo = this.input.Data.naikuHeniSokudo.toString();
  }


  // モニタリングデータの取得
  getMonitoringData(): void {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    this.http.get('http://iot2put.sakura.ne.jp/vel_now.txt', {
      headers: headers,
      responseType: 'text'
    })
      .subscribe({
        next: (response: string) => {
          // 通信成功時の処理（成功コールバック）
          this.tempMonitoringData = response;
          let MonitoringData: string[] = response.split(/\r\n|\r|\n/);
          let index: number = MonitoringData.length - 1;
          let GetNaikuHeniRow = MonitoringData[index];
          let tmp: string[] = GetNaikuHeniRow.split('：');
          let GetNaikuHeniSokudo = tmp[1];
          this.tempNaikuHeniSokudo = GetNaikuHeniSokudo;
          this.setNaikuHeniSokudo();
        },
        error: (error) => {
          // 通信失敗時の処理（失敗コールバック）
          this.tempMonitoringData = error.statusText;
        }
      });
  }

}
