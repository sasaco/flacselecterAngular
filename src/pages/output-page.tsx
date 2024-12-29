import React, { useEffect, useState } from 'react';
import { InputData, InputDataService } from '../services/inputData';
import '../styles/output-page.css';

export default function OutputPage() {
  const [inputString1, setInputString1] = useState<string>('');
  const [inputString2, setInputString2] = useState<string>('');
  const [inputString3, setInputString3] = useState<string>('');
  const [imgString1, setImgString1] = useState<string>('');
  const [imgString0, setImgString0] = useState<string>('');
  const [alertString, setAlertString] = useState<string>('');
  const [effection, setEffection] = useState<number>(0);
  const [displacement, setDisplacement] = useState<number>(0);

  const input = new InputDataService();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('inputData');
      if (savedData) {
        input.Data = JSON.parse(savedData);
      }
    }
  }, []);

  const getinputString1 = (): string => {
    let result: string;
    switch (input.Data.tunnelKeizyo) {
      case 1:
        result = "単線";
        break;
      case 2:
        result = "複線";
        break;
      case 3:
        result = "新幹線";
        break;
      default:
        result = "";
    }
    result += "・巻厚 ";
    result += input.Data.fukukouMakiatsu.toString();
    result += "cm・";
    result += (input.Data.invert === 1) ? "インバートなし" : "インバートあり";
    return result;
  };

  const getinputString2 = (): string => {
    let result: string = (input.Data.haimenKudo === 1) ? "背面空洞なし" : "背面空洞あり";
    result += "・";
    switch (input.Data.henkeiMode) {
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
    result += input.Data.jiyamaKyodo.toString();
    result += "MPa";
    result += "・内空変位速度 ";
    result += input.Data.naikuHeniSokudo.toString();
    result += "mm / 年";
    return result;
  };

  const getinputString3 = (): string => {
    let result: string = "";

    if (input.Data.uragomeChunyuko === 1) {
      result += "裏込注入なし";
    } else {
      result += "裏込注入あり";
    }
    result += "・";
    if (input.Data.lockBoltKou === 1) {
      result += "ロックボルトなし";
    } else {
      result += "ロックボルト ";
      result += input.Data.lockBoltKou.toString();
      result += "本-";
      result += input.Data.lockBoltLength.toString();
      result += "m";
    }    
    result += "・";
    if (input.Data.uchimakiHokyo === 1) {
      result += "内巻なし";
    } else {
      result += "内巻あり";
    }
    if (input.Data.downwardLockBoltKou !== 1) {
      result += "・";
      result += "下向きロックボルト ";
      result += input.Data.downwardLockBoltKou.toString();
      result += "本-";
      result += input.Data.downwardLockBoltLength.toString();
      result += "m";
    }    
    return result;
  };

  // Removed getimgString as we're using input.getCaseStrings directly

  const getDisplacement = (effectionValue: number): number => {
    const a: number = input.Data.naikuHeniSokudo;
    const b: number = effectionValue;
    const c: number = a * (1 - (b / 100));
    // 少数1 桁にラウンド
    return Math.round(c * 10) / 10;
  };

  const getalertString = (): string => {
    let makiatsu: number = input.Data.fukukouMakiatsu;
    let kyodo: number = input.Data.jiyamaKyodo;
    if (input.Data.tunnelKeizyo < 3) { // 単線, 複線
      if ((makiatsu === 30 || makiatsu === 60) && (kyodo === 2 || kyodo === 8)) {
        return '';
      }
      makiatsu = makiatsu < 45 ? 30 : 60;
    } else { // 新幹線   
      if ((makiatsu === 50 || makiatsu === 70) && (kyodo === 2 || kyodo === 8)) {
        return '';
      }
      makiatsu = makiatsu < 60 ? 50 : 70;
    }
    kyodo = kyodo < 5 ? 2 : 8;
    return '※この画像は覆工巻厚を' + makiatsu + '、地山強度を' + kyodo + 'とした場合のものです。';
  };

  useEffect(() => {
    setInputString1(getinputString1());
    setInputString2(getinputString2());
    setInputString3(getinputString3());

    const imgs = input.getCaseStrings(true);
    console.log('Generated image case strings:', imgs);
    // Use index 1 for no countermeasures and index 2 for with countermeasures
    setImgString0(imgs[1]);
    setImgString1(imgs[2]);

    setAlertString(getalertString());

    input.getEffectionNum()
      .then(value => {
        setEffection(value);
        setDisplacement(getDisplacement(value));
      })
      .catch(error => {
        console.error('Error getting effection number:', error);
        setEffection(0);
        setDisplacement(input.Data.naikuHeniSokudo);
      });
  }, []);

  return (
    <div>
      <div className="container">
        <div className="result">
          <div className="conditions-summary">
            <div className="line">
              <div className="condition-name">構造条件</div>:
              <div className="content">{inputString1}</div>
            </div>
            <div className="line">
              <div className="condition-name">調査・計測結果</div>:
              <div className="content">{inputString2}</div>
            </div>
            <div className="line">
              <div className="condition-name">対策工条件</div>:
              <div className="content">{inputString3}</div>
            </div>
          </div>

          <div className="result-numbers">
            <div>
              <div>対策後の予測内空変位速度</div>
              <div className="number">
                <span className="number-box">{displacement}</span>
                mm/年
              </div>
            </div>
            <div>
              <div>変位抑制効果</div>
              <div className="number">
                <span className="number-box">{effection}</span>％
              </div>
            </div>
          </div>

          <div className="images">
            <div>
              <div>【対策工なし】</div>
              {imgString0 && (
                <img 
                  id="outputimage" 
                  src={`/assets/img/${imgString0}.png`} 
                  alt="対策工なし"
                  style={{ maxWidth: '100%' }}
                  onError={(e) => {
                    console.error('Image load error:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>

            <div>
              <div>【対策工あり】</div>
              {imgString1 && (
                <img 
                  id="outputimage" 
                  src={`/assets/img/${imgString1}.png`} 
                  alt="対策工あり"
                  style={{ maxWidth: '100%' }}
                  onError={(e) => {
                    console.error('Image load error:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>
          {alertString && (
            <div className="alert">
              <div>{alertString}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
