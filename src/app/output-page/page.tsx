'use client';

import { useEffect, useState } from 'react';
import { useInputData } from '@/context/InputDataContext';
import type { InputData, InputDataContextType } from '@/context/InputDataContext';
import styles from './page.module.css';
import type { ReactElement } from 'react';

export default function OutputPage(): ReactElement {
  const { data } = useInputData() as InputDataContextType;
  const [inputString1, setInputString1] = useState<string>('');
  const [inputString2, setInputString2] = useState<string>('');
  const [inputString3, setInputString3] = useState<string>('');
  const [imgString0, setImgString0] = useState<string | undefined>('');
  const [imgString1, setImgString1] = useState<string | undefined>('');
  const [displacement, setDisplacement] = useState<number>(0);
  const [effection, setEffection] = useState<number>(0);
  const [alertString, setAlertString] = useState<string>('');

  const getInputString1 = (): string => {
    let result = '';
    switch (data.tunnelKeizyo) {
      case 1:
        result = '単線';
        break;
      case 2:
        result = '複線';
        break;
      case 3:
        result = '新幹線';
        break;
    }
    result += '・巻厚 ';
    result += data.fukukouMakiatsu.toString();
    result += 'cm・';
    result += data.invert === 0 ? 'インバートなし' : 'インバートあり';
    return result;
  };

  const getInputString2 = (): string => {
    let result = data.haimenKudo === 0 ? '背面空洞なし' : '背面空洞あり';
    result += '・';
    switch (data.henkeiMode) {
      case 1:
        result += '側壁全体押出し';
        break;
      case 2:
        result += '側壁上部前傾';
        break;
      case 3:
        result += '脚部押出し';
        break;
      case 4:
        result += '盤ぶくれ';
        break;
    }
    result += '・地山強度 ';
    result += data.jiyamaKyodo.toString();
    result += 'MPa';
    result += '・内空変位速度 ';
    result += data.naikuHeniSokudo.toString();
    result += 'mm / 年';
    return result;
  };

  const getInputString3 = (): string => {
    let result = '';
    if (data.uragomeChunyuko === 0) {
      result += '裏込注入なし';
    } else {
      result += '裏込注入あり';
    }
    result += '・';
    if (data.lockBoltKou === 0) {
      result += 'ロックボルトなし';
    } else {
      result += 'ロックボルト ';
      result += data.lockBoltKou.toString();
      result += '本-';
      result += data.lockBoltLength.toString();
      result += 'm';
    }
    result += '・';
    if (data.uchimakiHokyo === 0) {
      result += '内巻なし';
    } else {
      result += '内巻あり';
    }
    if (data.downwardLockBoltKou !== 0) {
      result += '・';
      result += '下向きロックボルト ';
      result += data.downwardLockBoltKou.toString();
      result += '本-';
      result += data.downwardLockBoltLength.toString();
      result += 'm';
    }
    return result;
  };

  const getImgString = (): [string | undefined, string | undefined] => {
    const getCaseStrings = (): string[] => {
      const tunnelType = data.tunnelKeizyo;
      const henkeiMode = data.henkeiMode;
      const invert = data.invert;
      const makiatsu = data.fukukouMakiatsu;
      const kyodo = data.jiyamaKyodo;
      const haimenKudo = data.haimenKudo;
      
      // Generate case string based on input conditions
      // Match Angular case string format exactly
      const baseCase = `case${tunnelType}-${makiatsu}-${invert}-0-${henkeiMode}-${kyodo}-${haimenKudo}-0-0-0-0`;
      const reinforcedCase = `case${tunnelType}-${makiatsu}-${invert}-0-${henkeiMode}-${kyodo}-${haimenKudo}-${data.uragomeChunyuko}-${data.lockBoltKou}-${data.lockBoltLength}-${data.uchimakiHokyo}`;
      if (data.downwardLockBoltKou !== 0) {
        return [baseCase, `${reinforcedCase}-${data.downwardLockBoltKou}-${data.downwardLockBoltLength}`];
      }
      return [baseCase, reinforcedCase];
    };

    const caseStrings = getCaseStrings();
    // Return undefined if strings are empty or undefined
    return [
      caseStrings[0] ? `/images/${caseStrings[0]}.png` : undefined,
      caseStrings[1] ? `/images/${caseStrings[1]}.png` : undefined
    ];
  };

  const getDisplacement = (effectionValue: number): number => {
    const a = data.naikuHeniSokudo;
    const b = effectionValue;
    const c = a * (1 - (b / 100));
    return Math.round(c * 10) / 10;
  };

  const getAlertString = (): string => {
    let makiatsu = data.fukukouMakiatsu;
    let kyodo = data.jiyamaKyodo;
    if (data.tunnelKeizyo < 3) { // 単線, 複線
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
    return `※この画像は覆工巻厚を${makiatsu}、地山強度を${kyodo}とした場合のものです。`;
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Update display strings when data changes
  useEffect(() => {
    setInputString1(getInputString1());
    setInputString2(getInputString2());
    setInputString3(getInputString3());
    const [img0, img1] = getImgString();
    setImgString0(img0);
    setImgString1(img1);
    setAlertString(getAlertString());
  }, [data]);

  // Handle effection calculation separately to avoid race conditions
  useEffect(() => {
    let isMounted = true;
    const getEffectionNum = async (): Promise<number> => {
      if (isLoading) return 0;
      setIsLoading(true);
      try {
        const response = await fetch('/api/calculate-effection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to calculate effection');
        const result = await response.json();
        return result.effection;
      } catch (error) {
        console.error('Error calculating effection:', error);
        return 0;
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getEffectionNum().then(effectionValue => {
      if (isMounted) {
        setEffection(effectionValue);
        setDisplacement(getDisplacement(effectionValue));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [data.tunnelKeizyo, data.fukukouMakiatsu, data.jiyamaKyodo, data.naikuHeniSokudo]);

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.result}>
          <div className={styles['conditions-summary']}>
            <div className={styles.line}>
              <div className={styles['condition-name']}>構造条件</div>:
              <div className={styles.content}>{inputString1}</div>
            </div>
            <div className={styles.line}>
              <div className={styles['condition-name']}>調査・計測結果</div>:
              <div className={styles.content}>{inputString2}</div>
            </div>
            <div className={styles.line}>
              <div className={styles['condition-name']}>対策工条件</div>:
              <div className={styles.content}>{inputString3}</div>
            </div>
          </div>

          <div className={styles['result-numbers']}>
            <div>
              <div>対策後の予測内空変位速度</div>
              <div className={styles.number}>
                <span className={styles['number-box']}>{displacement}</span>
                mm/年
              </div>
            </div>
            <div>
              <div>変位抑制効果</div>
              <div className={styles.number}>
                <span className={styles['number-box']}>{effection}</span>％
              </div>
            </div>
          </div>

          <div className={styles.images}>
            <div>
              <div>【対策工なし】</div>
              {imgString0 && <img id="outputimage" src={imgString0} alt="対策工なし" />}
            </div>
            <div>
              <div>【対策工あり】</div>
              {imgString1 && <img id="outputimage" src={imgString1} alt="対策工あり" />}
            </div>
          </div>

          {alertString && (
            <div className={styles.alert}>
              <div>{alertString}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
