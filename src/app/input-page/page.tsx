'use client';

import { useEffect, useState } from 'react';
import { useInputData } from '@/context/InputDataContext';
import type { InputData, InputDataContextType } from '@/context/InputDataContext';
import Link from 'next/link';
import styles from './page.module.css';
import type { FocusEvent, ChangeEvent, FormEvent } from 'react';
import type { JSX } from 'react';
import type { Dispatch, SetStateAction } from 'react';

interface FormOption {
  id: number;
  title: string;
}

export default function InputPage(): JSX.Element {
  const { data, setData } = useInputData() as InputDataContextType;
  
  // Form state
  const [tempFukukouMakiatsu, setTempFukukouMakiatsu] = useState(data.fukukouMakiatsu.toString());
  const [tempJiyamaKyodo, setTempJiyamaKyodo] = useState(data.jiyamaKyodo.toString());
  const [tempNaikuHeniSokudo, setTempNaikuHeniSokudo] = useState(data.naikuHeniSokudo.toString());
  const [tempMonitoringData, setTempMonitoringData] = useState(data.MonitoringData);

  // Initialize form state on mount and when specific data fields change
  useEffect(() => {
    const {
      tunnelKeizyo,
      haimenKudo,
      henkeiMode,
      fukukouMakiatsu,
      lockBoltKou,
      uragomeChunyuko
    } = data;
    
    setEnable();
  }, [
    data.tunnelKeizyo,
    data.haimenKudo,
    data.henkeiMode,
    data.fukukouMakiatsu,
    data.lockBoltKou,
    data.uragomeChunyuko
  ]);
  
  // UI state
  const [henkeiMode4Flag, setHenkeiMode4Flag] = useState(false);
  const [henkeiModeStyle, setHenkeiModeStyle] = useState<string[]>(['Enable', 'Enable', 'Enable', 'Disable']);
  const [uragomeChunyukoStyle, setUragomeChunyukoStyle] = useState<string[]>(['Enable', 'Disable']);
  const [lockBoltLengthStyle, setLockBoltLengthStyle] = useState<string[]>(['Disable', 'Disable', 'Disable', 'Disable']);
  const [downwardLockBoltEnable, setDownwardLockBoltEnable] = useState(false);
  const [downwardLockBoltLengthStyle, setDownwardLockBoltLengthStyle] = useState<string>('Disable');

  // Form options
  const tunnelKeizyoList: FormOption[] = [
    { id: 1, title: '単線' },
    { id: 2, title: '複線' },
    { id: 3, title: '新幹線（在来工法）' },
  ];

  const invertList: FormOption[] = [
    { id: 0, title: 'なし' },
    { id: 1, title: 'あり' }
  ];

  const haimenKudoList: FormOption[] = [
    { id: 0, title: 'なし' },
    { id: 1, title: 'あり' }
  ];

  const henkeiModeList: FormOption[] = [
    { id: 1, title: '側壁全体押出し' },
    { id: 2, title: '側壁上部前傾' },
    { id: 3, title: '脚部押出し' },
    { id: 4, title: '盤ぶくれ' }
  ];

  const uragomeChunyukoList: FormOption[] = [
    { id: 0, title: 'なし' },
    { id: 1, title: 'あり' }
  ];

  const lockBoltKouList: FormOption[] = [
    { id: 0, title: 'なし' },
    { id: 4, title: '4本' },
    { id: 8, title: '8本' },
    { id: 12, title: '12本' },
  ];

  const lockBoltLengthList: FormOption[] = [
    { id: 3, title: '3m' },
    { id: 6, title: '6m' },
    { id: 4, title: '4m' },
    { id: 8, title: '8m' },
  ];

  const downwardLockBoltKouList: FormOption[] = [
    { id: 0, title: 'なし' },
    { id: 4, title: '4本' },
    { id: 6, title: '6本' }
  ];

  const downwardLockBoltLengthList: FormOption[] = [
    { id: 4, title: '4m' },
    { id: 8, title: '8m' }
  ];

  const uchimakiHokyoList: FormOption[] = [
    { id: 0, title: 'なし' },
    { id: 1, title: 'あり' }
  ];

  // Form validation and state management
  const setEnable = () => {
    let newData = { ...data };
    let newHenkeiModeStyle = ['Enable', 'Enable', 'Enable', 'Enable'];
    let newUragomeChunyukoStyle = ['Enable', 'Disable'];
    let newLockBoltLengthStyle = ['Disable', 'Disable', 'Disable', 'Disable'];
    let newDownwardLockBoltEnable = false;
    let newHenkeiMode4Flag = false;
    let newTempFukukouMakiatsu = tempFukukouMakiatsu;


    // 新幹線（在来工法）
    if (data.tunnelKeizyo === 3) {
      if (data.haimenKudo === 1) {
        if (data.henkeiMode === 4) {
          newData.henkeiMode = 1;
        }
        newHenkeiModeStyle[3] = 'Disable';
      }
      if (data.fukukouMakiatsu < 50) {
        newTempFukukouMakiatsu = "50";
        newData.fukukouMakiatsu = 50;
      }
    } else {
      // 新幹線（在来工法）ではない
      newHenkeiModeStyle = ['Enable', 'Enable', 'Enable', 'Disable'];
      if (data.henkeiMode === 4) {
        newData.henkeiMode = 1;
      }
      newData.downwardLockBoltKou = 0;
      newData.downwardLockBoltLength = 0;
      if (data.fukukouMakiatsu > 60) {
        newTempFukukouMakiatsu = "60";
        newData.fukukouMakiatsu = 60;
      }
    }

    // 盤ぶくれモード
    if (data.henkeiMode === 4) {
      newHenkeiMode4Flag = true;
      newDownwardLockBoltEnable = true;
      newData.lockBoltKou = 0;
      newData.lockBoltLength = 0;
      newData.uchimakiHokyo = 0;
    } else {
      newData.downwardLockBoltKou = 0;
      newData.downwardLockBoltLength = 0;
    }

    // 背面空洞の有無 と 裏込注入工
    if (data.haimenKudo === 0) {
      newUragomeChunyukoStyle = ['Enable', 'Disable'];
      newData.uragomeChunyuko = 0;
    } else {
      newUragomeChunyukoStyle = ['Disable', 'Enable'];
      newData.uragomeChunyuko = 1;
    }

    // ロックボルト長さ
    if (data.lockBoltKou === 0) {
      newData.lockBoltLength = 0;
    } else {
      switch (data.tunnelKeizyo) {
        case 1: // 単線 3, 6m
          newLockBoltLengthStyle = ['Enable', 'Enable', 'Disable', 'Disable'];
          if (data.lockBoltLength !== 3 && data.lockBoltLength !== 6) {
            newData.lockBoltLength = 3;
          }
          break;
        case 2: // 複線 4, 8m
        case 3: // 新幹線（在来工法）4, 8m
          newLockBoltLengthStyle = ['Disable', 'Disable', 'Enable', 'Enable'];
          if (data.lockBoltLength !== 4 && data.lockBoltLength !== 8) {
            newData.lockBoltLength = 4;
          }
          break;
      }
    }

    // Batch update all state
    setData(newData);
    setHenkeiModeStyle(newHenkeiModeStyle);
    setUragomeChunyukoStyle(newUragomeChunyukoStyle);
    setLockBoltLengthStyle(newLockBoltLengthStyle);
    setDownwardLockBoltEnable(newDownwardLockBoltEnable);
    setHenkeiMode4Flag(newHenkeiMode4Flag);
    if (newTempFukukouMakiatsu !== tempFukukouMakiatsu) {
      setTempFukukouMakiatsu(newTempFukukouMakiatsu);
      setFukukouMakiatsu(newTempFukukouMakiatsu);
    }

    // （下向き）ロックボルト長さ
    if (data.downwardLockBoltKou !== 0) {
      setDownwardLockBoltLengthStyle('Enable');
      if (data.downwardLockBoltLength === 0) {
        setData((prev: InputData) => ({ ...prev, downwardLockBoltLength: 4 } as InputData));
      }
    } else {
      setDownwardLockBoltLengthStyle('Disable');
      setData((prev: InputData) => ({ ...prev, downwardLockBoltLength: 0 } as InputData));
    }

    // インバートありの場合は「脚部押出し」は選べないように
    if (data.invert === 1) {
      setHenkeiModeStyle(prev => {
        const newStyle = [...prev];
        newStyle[2] = 'Disable';
        return newStyle;
      });
      if (data.henkeiMode === 3) {
        setData((prev: InputData) => ({ ...prev, henkeiMode: 1 } as InputData));
      }
    } else {
      setHenkeiModeStyle(prev => {
        const newStyle = [...prev];
        newStyle[2] = 'Enable';
        return newStyle;
      });
    }
  };

  const setFukukouMakiatsu = (value: string): void => {
    const numValue = Number(value);
    const min = data.tunnelKeizyo !== 3 ? 30 : 50;
    const max = data.tunnelKeizyo !== 3 ? 60 : 70;

    if (!Number.isNaN(numValue)) {
      if (numValue < min) {
        alert(`${min}以上の数値を入力してください`);
        setData((prev: InputData) => ({ ...prev, fukukouMakiatsu: min }));
      } else if (max < numValue) {
        alert(`${max}以下の数値を入力してください`);
        setData((prev: InputData) => ({ ...prev, fukukouMakiatsu: max }));
      } else {
        setData((prev: InputData) => ({ ...prev, fukukouMakiatsu: numValue }));
      }
    }
    setTempFukukouMakiatsu(data.fukukouMakiatsu.toString());
  };

  const setJiyamaKyodo = (value: string): void => {
    const numValue = Number(value);
    if (!Number.isNaN(numValue)) {
      if (numValue < 2) {
        alert("2以上の数値を入力してください");
        setData((prev: InputData) => ({ ...prev, jiyamaKyodo: 2 }));
      } else if (8 < numValue) {
        alert("8以下の数値を入力してください");
        setData((prev: InputData) => ({ ...prev, jiyamaKyodo: 8 }));
      } else {
        setData((prev: InputData) => ({ ...prev, jiyamaKyodo: numValue }));
      }
    }
    setTempJiyamaKyodo(data.jiyamaKyodo.toString());
  };

  const setNaikuHeniSokudo = (value: string): void => {
    const numValue = Number(value);
    if (!Number.isNaN(numValue)) {
      setData((prev: InputData) => ({ ...prev, naikuHeniSokudo: numValue }));
    }
    setTempNaikuHeniSokudo(data.naikuHeniSokudo.toString());
  };

  const getMonitoringData = async (): Promise<void> => {
    try {
      const response = await fetch('http://iot2put.sakura.ne.jp/vel_now.txt');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      setTempMonitoringData(text);
      
      const monitoringData = text.split(/\r\n|\r|\n/);
      const index = monitoringData.length - 1;
      const getNaikuHeniRow = monitoringData[index];
      const tmp = getNaikuHeniRow.split('：');
      const getNaikuHeniSokudo = tmp[1];
      
      setTempNaikuHeniSokudo(getNaikuHeniSokudo);
      setNaikuHeniSokudo(getNaikuHeniSokudo);
    } catch (error) {
      setTempMonitoringData((error as Error).message);
    }
  };

  useEffect(() => {
    setEnable();
  }, [data.tunnelKeizyo, data.haimenKudo, data.henkeiMode, data.invert, 
      data.lockBoltKou, data.lockBoltLength, data.downwardLockBoltKou]);

  return (
    <div>
      {/* 構造条件 */}
      <div className={styles.container}>
        <div className={styles.sectionTitle}>
          <h2 className={styles.sectionHeading}>構造条件</h2>
          <div className={styles.divider}></div>
        </div>
      </div>

      <div className={`${styles.container} ${styles.conditions}`}>
        <div className={styles.liner}>
          <fieldset>
            <legend>トンネル形状</legend>
            {tunnelKeizyoList.map((x, i) => (
              <div key={x.id}>
                <label>
                  <input
                    type="radio"
                    name="tunnelKeizyo"
                    id={`tunnelKeizyo${i}`}
                    value={x.id}
                    checked={data.tunnelKeizyo === x.id}
                    onChange={() => {
                      setData({ ...data, tunnelKeizyo: x.id } as InputData);
                      setEnable();
                    }}
                  />
                  {x.title}
                </label>
              </div>
            ))}
          </fieldset>

          <fieldset>
            <legend>覆工巻厚</legend>
            <div id="textbox">
              <input
                type="number"
                value={tempFukukouMakiatsu}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTempFukukouMakiatsu(e.target.value)}
                onBlur={(e: FocusEvent<HTMLInputElement>) => setFukukouMakiatsu(e.target.value)}
                style={{ width: '65px', textAlign: 'center' }}
                min="30"
                max="70"
              />
              cm
            </div>
          </fieldset>

          <fieldset>
            <legend>インバートの有無</legend>
            {invertList.map((x, i) => (
              <div key={x.id}>
                <label>
                  <input
                    type="radio"
                    name="invert"
                    id={`invert${i}`}
                    value={x.id}
                    checked={data.invert === x.id}
                    onChange={() => {
                      setData({ ...data, invert: x.id } as InputData);
                      setEnable();
                    }}
                  />
                  {x.title}
                </label>
              </div>
            ))}
          </fieldset>
        </div>
      </div>

      {/* 調査・計測結果の条件 */}
      <div className={styles.container}>
        <div className={styles.sectionTitle}>
          <h2 className={styles.sectionHeading}>調査・計測結果の条件</h2>
          <div className={styles.divider}></div>
        </div>
      </div>

      <div className={`${styles.container} ${styles.conditions}`}>
        <div className={styles.liner}>
          <fieldset>
            <legend>背面空洞の有無</legend>
            {haimenKudoList.map((x, i) => (
              <div key={x.id}>
                <label>
                  <input
                    type="radio"
                    name="haimenKudo"
                    id={`haimenKudo${i}`}
                    value={x.id}
                    checked={data.haimenKudo === x.id}
                    onChange={() => {
                      setData({ ...data, haimenKudo: x.id } as InputData);
                      setEnable();
                    }}
                  />
                  {x.title}
                </label>
              </div>
            ))}
          </fieldset>

          <fieldset>
            <legend>変形モード</legend>
            {henkeiModeList.map((x, i) => (
              <div key={x.id} className={henkeiModeStyle[i] === 'Enable' ? styles.enabled : styles.disabled}>
                <label>
                  <input
                    type="radio"
                    name="henkeiMode"
                    id={`henkeiMode${i}`}
                    value={x.id}
                    checked={data.henkeiMode === x.id}
                    disabled={henkeiModeStyle[i] !== 'Enable'}
                    onChange={() => {
                      setData({ ...data, henkeiMode: x.id } as InputData);
                      setEnable();
                    }}
                  />
                  {x.title}
                </label>
              </div>
            ))}
          </fieldset>

          <fieldset>
            <legend>地山強度</legend>
            <input
              type="number"
              value={tempJiyamaKyodo}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTempJiyamaKyodo(e.target.value)}
              onBlur={(e: FocusEvent<HTMLInputElement>) => setJiyamaKyodo(e.target.value)}
              style={{ width: '65px', textAlign: 'center' }}
              min="2"
              max="8"
            />
            MPa
          </fieldset>

          <fieldset>
            <legend>内空変位速度, 盤ぶくれ速度</legend>
            <div>
              <input
                type="number"
                value={tempNaikuHeniSokudo}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTempNaikuHeniSokudo(e.target.value)}
                onBlur={(e: FocusEvent<HTMLInputElement>) => setNaikuHeniSokudo(e.target.value)}
                style={{ width: '65px', textAlign: 'center' }}
              />
              <span>mm/年</span>
              <button 
                type="button" 
                onClick={getMonitoringData}
                className={styles.button}
              >
                モニタリングデータ取得
              </button>
              {tempMonitoringData && (
                <div className={styles.monitoringData}>
                  <pre className={styles.monitoringPre}>{tempMonitoringData}</pre>
                </div>
              )}
            </div>
          </fieldset>
        </div>
      </div>

      {/* 対策工の条件 */}
      <div className={styles.container}>
        <div className={styles.sectionTitle}>
          <h2 className={styles.sectionHeading}>対策工の条件</h2>
          <div className={styles.divider}></div>
        </div>
      </div>

      <div className={`${styles.container} ${styles.conditions}`}>
        <div className={styles.liner}>
          <fieldset>
            <legend>裏込注入工</legend>
            {uragomeChunyukoList.map((x, i) => (
              <div key={x.id} className={uragomeChunyukoStyle[i] === 'Enable' ? styles.enabled : styles.disabled}>
                <label>
                  <input
                    type="radio"
                    name="uragomeChunyuko"
                    id={`uragomeChunyuko${i}`}
                    value={x.id}
                    checked={data.uragomeChunyuko === x.id}
                    disabled={uragomeChunyukoStyle[i] !== 'Enable'}
                    onChange={() => {
                      setData({ ...data, uragomeChunyuko: x.id });
                      setEnable();
                    }}
                  />
                  {x.title}
                </label>
              </div>
            ))}
          </fieldset>

          <fieldset>
            <legend>ロックボルト工</legend>
            {!henkeiMode4Flag ? (
              <div className={styles.lockbolt}>
                <div>
                  {lockBoltKouList.map((x, i) => (
                    <div key={x.id}>
                      <label>
                        <input
                          type="radio"
                          name="lockBoltKou"
                          id={`lockBoltKou${i}`}
                          value={x.id}
                          checked={data.lockBoltKou === x.id}
                          onChange={() => {
                            setData({ ...data, lockBoltKou: x.id });
                            setEnable();
                          }}
                        />
                        {x.title}
                      </label>
                    </div>
                  ))}
                </div>
                <div className={styles['margin-left']}>
                  {lockBoltLengthList.map((x, i) => (
                    <div key={x.id} className={lockBoltLengthStyle[i] === 'Enable' ? styles.enabled : styles.disabled}>
                      <label>
                        <input
                          type="radio"
                          name="lockBoltLength"
                          id={`lockBoltLength${i}`}
                          value={x.id}
                          checked={data.lockBoltLength === x.id}
                          disabled={lockBoltLengthStyle[i] !== 'Enable'}
                          onChange={() => {
                            setData({ ...data, lockBoltLength: x.id });
                            setEnable();
                          }}
                        />
                        {x.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>選択できません</p>
            )}
          </fieldset>

          <fieldset>
            <legend>ロックボルト工（下向き）</legend>
            {downwardLockBoltEnable ? (
              <div className={styles.lockbolt}>
                <div>
                  {downwardLockBoltKouList.map((x, i) => (
                    <div key={x.id}>
                      <label>
                        <input
                          type="radio"
                          name="downwardLockBoltKou"
                          id={`downwardLockBoltKou${i}`}
                          value={x.id}
                          checked={data.downwardLockBoltKou === x.id}
                          onChange={() => {
                            setData({ ...data, downwardLockBoltKou: x.id });
                            setEnable();
                          }}
                        />
                        {x.title}
                      </label>
                    </div>
                  ))}
                </div>
                <div className={`${styles['margin-left']} ${downwardLockBoltLengthStyle === 'Enable' ? styles.enabled : styles.disabled}`}>
                  {downwardLockBoltLengthList.map((x, i) => (
                    <div key={x.id}>
                      <label>
                        <input
                          type="radio"
                          name="downwardLockBoltLength"
                          id={`downwardLockBoltLength${i}`}
                          value={x.id}
                          checked={data.downwardLockBoltLength === x.id}
                          disabled={downwardLockBoltLengthStyle !== 'Enable'}
                          onChange={() => {
                            setData({ ...data, downwardLockBoltLength: x.id });
                          }}
                        />
                        {x.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>選択できません</p>
            )}
          </fieldset>


          <fieldset>
            <legend>内巻補強</legend>
            {!henkeiMode4Flag ? (
              <>
                {uchimakiHokyoList.map((x, i) => (
                  <div key={x.id}>
                    <label>
                      <input
                        type="radio"
                        name="uchimakiHokyo"
                        id={`uchimakiHokyo${i}`}
                        value={x.id}
                        checked={data.uchimakiHokyo === x.id}
                        onChange={() => {
                          setData({ ...data, uchimakiHokyo: x.id } as InputData);
                          setEnable();
                        }}
                      />
                      {x.title}
                    </label>
                  </div>
                ))}
              </>
            ) : (
              <p>選択できません</p>
            )}
          </fieldset>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.buttonContainer}>
          <Link href="/output-page" className={styles.calculateButton}>
            計算する
          </Link>
        </div>
      </div>
    </div>
  );
}
