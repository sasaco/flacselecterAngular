'use client';

import React, { useContext } from 'react';
import { InputDataContext } from '../../context/InputDataContext';
import styles from './page.module.css';

export default function OutputPage() {
  const context = useContext(InputDataContext);
  if (!context) {
    throw new Error('OutputPage must be used within an InputDataProvider');
  }
  const { data } = context;

  // Port of getinputString1
  const getInputString1 = () => {
    let str = '';
    str += `トンネル形状：${data.tunnelKeizyo === 1 ? '単線' : data.tunnelKeizyo === 2 ? '複線' : '新幹線（在来工法）'}\n`;
    str += `覆工巻厚：${data.fukukouMakiatsu}cm\n`;
    str += `インバートの有無：${data.invert === 0 ? 'なし' : 'あり'}\n`;
    str += `背面空洞の有無：${data.haimenKudo === 0 ? 'なし' : 'あり'}\n`;
    return str;
  };

  // Port of getinputString2
  const getInputString2 = () => {
    let str = '';
    str += `変形モード：${
      data.henkeiMode === 1 ? '全周' :
      data.henkeiMode === 2 ? '天端沈下' :
      data.henkeiMode === 3 ? '水平' :
      '盤ぶくれ'
    }\n`;
    str += `地山強度：${data.jiyamaKyodo}MPa\n`;
    str += `内空変位速度：${data.naikuHeniSokudo}mm/年\n`;
    return str;
  };

  // Port of getinputString3
  const getInputString3 = () => {
    let str = '';
    str += `裏込注入工：${data.uragomeChunyuko === 0 ? 'なし' : 'あり'}\n`;
    str += `ロックボルト工：${data.lockBoltKou === 0 ? 'なし' : 'あり'}\n`;
    if (data.lockBoltKou !== 0) {
      str += `　長さ：${data.lockBoltLength}m\n`;
    }
    str += `内巻補強：${data.uchimakiHokyo === 0 ? 'なし' : 'あり'}\n`;
    if (data.henkeiMode === 4) {
      str += `下向きロックボルト工：${data.downwardLockBoltKou === 0 ? 'なし' : 'あり'}\n`;
      if (data.downwardLockBoltKou !== 0) {
        str += `　長さ：${data.downwardLockBoltLength}m\n`;
      }
    }
    return str;
  };

  // Port of getimgString
  const getImgString = () => {
    let str = '';
    if (data.tunnelKeizyo === 1) {
      str += '単線';
    } else if (data.tunnelKeizyo === 2) {
      str += '複線';
    } else {
      str += '新幹線';
    }


    if (data.henkeiMode === 1) {
      str += '_全周';
    } else if (data.henkeiMode === 2) {
      str += '_天端沈下';
    } else if (data.henkeiMode === 3) {
      str += '_水平';
    } else {
      str += '_盤ぶくれ';
    }

    if (data.invert === 1) {
      str += '_インバートあり';
    } else {
      str += '_インバートなし';
    }

    return str;
  };

  // Port of getDisplacement
  const [effection, setEffection] = React.useState(0);
  const [calculatedDisplacement, setCalculatedDisplacement] = React.useState(data.naikuHeniSokudo);

  React.useEffect(() => {
    // Simulating the Angular service's getEffectionNum
    const getEffectionNum = async () => {
      // This would normally come from a service
      return 30; // Example value, should match your service logic
    };

    getEffectionNum().then(value => {
      setEffection(value);
      const a = data.naikuHeniSokudo;
      const b = value;
      const c = a * (1 - (b / 100));
      // Round to 1 decimal place as in Angular
      const result = Math.round(c * 10) / 10;
      setCalculatedDisplacement(result);
    }).catch(error => {
      console.error('Error getting effection number:', error);
      setEffection(0);
      setCalculatedDisplacement(data.naikuHeniSokudo);
    });
  }, [data.naikuHeniSokudo]);

  // Port of getalertString
  const getAlertString = () => {
    let makiatsu = data.fukukouMakiatsu;
    let kyodo = data.jiyamaKyodo;
    if (data.tunnelKeizyo < 3) { // 単線, 複線
      if ((makiatsu === 30 || makiatsu === 60) && (kyodo === 2 || kyodo === 8)) {
        return null;
      }
      makiatsu = makiatsu < 45 ? 30 : 60;
    } else { // 新幹線   
      if ((makiatsu === 50 || makiatsu === 70) && (kyodo === 2 || kyodo === 8)) {
        return null;
      }
      makiatsu = makiatsu < 60 ? 50 : 70;
    }
    kyodo = kyodo < 5 ? 2 : 8;
    return '※この画像は覆工巻厚を' + makiatsu + '、地山強度を' + kyodo + 'とした場合のものです。';
  };

  const imgStrings = React.useMemo(() => {
    const CaseStrings = [
      '', // Index 0 not used
      `${getImgString()}_なし`,
      `${getImgString()}_あり`
    ];
    return {
      img0: `/img/${CaseStrings[1]}.png`,
      img1: `/img/${CaseStrings[2]}.png`
    };
  }, [data.tunnelKeizyo, data.henkeiMode, data.invert]);
  const alertString = getAlertString();

  return (
    <div className={styles.container}>
      <div className={styles.result}>
        <div className={styles['conditions-summary']}>
          <div className={styles.line}>
            <div className={styles['condition-name']}>構造条件</div>:
            <div className={styles.content}>{getInputString1()}</div>
          </div>
          <div className={styles.line}>
            <div className={styles['condition-name']}>調査・計測結果</div>:
            <div className={styles.content}>{getInputString2()}</div>
          </div>
          <div className={styles.line}>
            <div className={styles['condition-name']}>対策工条件</div>:
            <div className={styles.content}>{getInputString3()}</div>
          </div>
        </div>

        <div className={styles['result-numbers']}>
          <div>
            <div>対策後の予測内空変位速度</div>
            <div className={styles.number}>
              <span className={styles['number-box']}>{calculatedDisplacement.toFixed(1)}</span>
              mm/年
            </div>
          </div>
          <div>
            <div>変位抑制効果</div>
            <div className={styles.number}>
              <span className={styles['number-box']}>
                {data.naikuHeniSokudo < 10 ? '小' : data.naikuHeniSokudo < 30 ? '中' : '大'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.images}>
          <div>
            <div>【対策工なし】</div>
            <img src={imgStrings.img0} alt="対策工なし" />
          </div>
          <div>
            <div>【対策工あり】</div>
            <img src={imgStrings.img1} alt="対策工あり" />
          </div>
        </div>

        {alertString && (
          <div className={styles.alert}>
            <div>{alertString}</div>
          </div>
        )}
      </div>
    </div>
  );
}
