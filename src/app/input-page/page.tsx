'use client';

import React, { useState, useEffect } from 'react';
import { useInputData } from '../../context/InputDataContext';
import styles from './page.module.css';

// Constants for form options
const tunnelKeizyoList = [
  { id: 1, title: '単線' },
  { id: 2, title: '複線' },
  { id: 3, title: '新幹線（在来工法）' },
];

const invertList = [
  { id: 0, title: 'なし' },
  { id: 1, title: 'あり' }
];

const haimenKudoList = [
  { id: 0, title: 'なし' },
  { id: 1, title: 'あり' }
];

const henkeiModeList = [
  { id: 1, title: '側壁全体押出し' },
  { id: 2, title: '側壁上部前傾' },
  { id: 3, title: '脚部押出し' },
  { id: 4, title: '盤ぶくれ' }
];

const uragomeChunyukoList = [
  { id: 0, title: 'なし' },
  { id: 1, title: 'あり' }
];

const lockBoltKouList = [
  { id: 0, title: 'なし' },
  { id: 4, title: '4本' },
  { id: 8, title: '8本' },
  { id: 12, title: '12本' },
];

const lockBoltLengthList = [
  { id: 3, title: '3m' },
  { id: 6, title: '6m' },
  { id: 4, title: '4m' },
  { id: 8, title: '8m' },
];

const downwardLockBoltKouList = [
  { id: 0, title: 'なし' },
  { id: 4, title: '4本' },
  { id: 6, title: '6本' }
];

const downwardLockBoltLengthList = [
  { id: 4, title: '4m' },
  { id: 8, title: '8m' }
];

const uchimakiHokyoList = [
  { id: 0, title: 'なし' },
  { id: 1, title: 'あり' }
];

export default function InputPage() {
  const { data, setData } = useInputData();
  // Form state management
  const [tempFukukouMakiatsu, setTempFukukouMakiatsu] = useState(data.fukukouMakiatsu.toString());
  const [tempJiyamaKyodo, setTempJiyamaKyodo] = useState(data.jiyamaKyodo.toString());
  const [tempNaikuHeniSokudo, setTempNaikuHeniSokudo] = useState(data.naikuHeniSokudo.toString());
  const [tempMonitoringData, setTempMonitoringData] = useState(data.MonitoringData || '');
  
  // UI state
  const [henkeiMode4Flag, setHenkeiMode4Flag] = useState(false);
  const [henkeiModeStyle, setHenkeiModeStyle] = useState<string[]>(['Enable', 'Enable', 'Enable', 'Disable']);
  const [uragomeChunyukoStyle, setUragomeChunyukoStyle] = useState<string[]>(['Enable', 'Disable']);
  const [lockBoltLengthStyle, setLockBoltLengthStyle] = useState<string[]>(['Enable', 'Enable', 'Disable', 'Disable']);
  const [downwardLockBoltEnable, setDownwardLockBoltEnable] = useState(false);
  const [downwardLockBoltLengthStyle, setDownwardLockBoltLengthStyle] = useState('Disable');

  // Form field update handlers

  // Form field update handlers
  const handleFukukouMakiatsuChange = (inputValue: string) => {
    const value = Number(inputValue);
    if (isNaN(value)) return;

    let finalValue = value;
    if (data.tunnelKeizyo === 3) {
      if (value < 50) finalValue = 50;
      if (value > 70) finalValue = 70;
    } else {
      if (value < 30) finalValue = 30;
      if (value > 60) finalValue = 60;
    }
    
    setTempFukukouMakiatsu(finalValue.toString());
    setData(prev => ({ ...prev, fukukouMakiatsu: finalValue }));
  };

  const handleJiyamaKyodoChange = (inputValue: string) => {
    const value = Number(inputValue);
    if (isNaN(value)) return;

    let finalValue = value;
    if (value < 2) finalValue = 2;
    if (value > 8) finalValue = 8;
    
    setTempJiyamaKyodo(finalValue.toString());
    setData(prev => ({ ...prev, jiyamaKyodo: finalValue }));
  };

  const handleNaikuHeniSokudoChange = (inputValue: string) => {
    const value = Number(inputValue);
    if (isNaN(value)) return;
    
    setTempNaikuHeniSokudo(value.toString());
    setData(prev => ({ ...prev, naikuHeniSokudo: value }));
  };

  const getMonitoringData = () => {
    // TODO: Implement monitoring data retrieval
    setTempMonitoringData('モニタリングデータ取得中...');
  };

  // Port of Angular's setEnable function
  const setEnable = () => {
    // 新幹線（在来工法）
    if (data.tunnelKeizyo === 3) {
      setHenkeiModeStyle(['Enable', 'Enable', 'Enable', 'Enable']);
      if (data.haimenKudo === 1) {
        if (data.henkeiMode === 4) {
          setData({ ...data, henkeiMode: 1 });
        }
        setHenkeiModeStyle(prev => {
          const newStyle = [...prev];
          newStyle[3] = 'Disable';
          return newStyle;
        });
      }
      const currentFukukouMakiatsu = Number(tempFukukouMakiatsu);
      if (currentFukukouMakiatsu < 50) {
        handleFukukouMakiatsuChange("50");
      }
    } else {
      // 新幹線（在来工法）ではない
      setHenkeiModeStyle(['Enable', 'Enable', 'Enable', 'Disable']);
      if (data.henkeiMode === 4) {
        setData({ ...data, henkeiMode: 1 });
      }
      setDownwardLockBoltEnable(false);
      setData(prev => ({
        ...prev,
        downwardLockBoltKou: 0,
        downwardLockBoltLength: 0
      }));
      const currentFukukouMakiatsu = Number(tempFukukouMakiatsu);
      if (currentFukukouMakiatsu > 60) {
        handleFukukouMakiatsuChange("60");
      }
    }

    // 盤ぶくれモード
    if (data.henkeiMode === 4) {
      setHenkeiMode4Flag(true);
      setDownwardLockBoltEnable(true);
      setData(prev => ({
        ...prev,
        lockBoltKou: 0,
        lockBoltLength: 0,
        uchimakiHokyo: 0
      }));
    } else {
      setHenkeiMode4Flag(false);
      setDownwardLockBoltEnable(false);
      setData(prev => ({
        ...prev,
        downwardLockBoltKou: 0,
        downwardLockBoltLength: 0
      }));
    }

    // 背面空洞の有無 と 裏込注入工
    if (data.haimenKudo === 0) {
      setUragomeChunyukoStyle(['Enable', 'Disable']);
      setData(prev => ({ ...prev, uragomeChunyuko: 0 }));
    } else {
      setUragomeChunyukoStyle(['Disable', 'Enable']);
      setData(prev => ({ ...prev, uragomeChunyuko: 1 }));
    }

    // ロックボルト長さ
    if (data.lockBoltKou === 0) {
      setLockBoltLengthStyle(['Disable', 'Disable', 'Disable', 'Disable']);
      setData(prev => ({ ...prev, lockBoltLength: 0 }));
    } else {
      switch (data.tunnelKeizyo) {
        case 1: // 単線 3, 6m
          setLockBoltLengthStyle(['Enable', 'Enable', 'Disable', 'Disable']);
          if (data.lockBoltLength !== 3 && data.lockBoltLength !== 6) {
            setData(prev => ({ ...prev, lockBoltLength: 3 }));
          }
          break;
        case 2: // 複線 4, 8m
        case 3: // 新幹線（在来工法）4, 8m
          setLockBoltLengthStyle(['Disable', 'Disable', 'Enable', 'Enable']);
          if (data.lockBoltLength !== 4 && data.lockBoltLength !== 8) {
            setData(prev => ({ ...prev, lockBoltLength: 4 }));
          }
          break;
      }
    }

    // （下向き）ロックボルト長さ
    if (data.downwardLockBoltKou !== 0) {
      setDownwardLockBoltLengthStyle('Enable');
      if (data.downwardLockBoltLength === 0) {
        setData(prev => ({ ...prev, downwardLockBoltLength: 4 }));
      }
    } else {
      setDownwardLockBoltLengthStyle('Disable');
      setData(prev => ({ ...prev, downwardLockBoltLength: 0 }));
    }
  };

  // Form field update handlers


  // Effect to update form state when data changes
  useEffect(() => {
    // Update temp values from data
    setTempFukukouMakiatsu(data.fukukouMakiatsu.toString());
    setTempJiyamaKyodo(data.jiyamaKyodo.toString());
    setTempNaikuHeniSokudo(data.naikuHeniSokudo.toString());
    setTempMonitoringData(data.MonitoringData);
    
    // Update enabled/disabled states
    setEnable();
  }, [data, setEnable]);

  return (
    <div>
      <div className={styles.container}>
        <div className={styles['section-title']}>
          <h2 className={styles['section-title']}>構造条件</h2>
          <div className={styles.divider}></div>
          <div className={styles.divider}></div>
        </div>
      </div>

      <div className={`${styles.container} ${styles.conditions}`}>
        <div className={styles.liner}>
          <fieldset className={styles.formFieldset}>
            <legend className={styles.formLegend}>トンネル形状</legend>
            {tunnelKeizyoList.map((x, i) => (
              <div key={x.id} className={styles.Enable}>
                <label className={styles.formLabel}>
                  <input
                    className={styles.formRadio}
                    type="radio"
                    name="tunnelKeizyo"
                    checked={data.tunnelKeizyo === x.id}
                    onChange={() => {
                      setData(prev => ({ ...prev, tunnelKeizyo: x.id }));
                      setEnable();
                    }}
                  />
                  {x.title}
                </label>
              </div>
            ))}
          </fieldset>

          <fieldset className={styles.formFieldset}>
            <legend className={styles.formLegend}>覆工巻厚</legend>
            <div className={styles.textbox}>
              <input
                className={styles.formNumber}
                type="number"
                name="fukukouMakiatsu"
                value={tempFukukouMakiatsu}
                onChange={(e) => {
                  setTempFukukouMakiatsu(e.target.value);
                  handleFukukouMakiatsuChange(e.target.value);
                }}
                style={{ width: '65px', textAlign: 'center' }}
                min={30}
                max={70}
              />
              cm
            </div>
          </fieldset>

          <fieldset className={styles.formFieldset}>
            <legend className={styles.formLegend}>インバートの有無</legend>
            {invertList.map((x, i) => (
              <div key={x.id} className={styles.Enable}>
                <label className={styles.formLabel}>
                  <input
                    className={styles.formRadio}
                    type="radio"
                    name="invert"
                    checked={data.invert === x.id}
                    onChange={() => {
                      setData(prev => ({ ...prev, invert: x.id }));
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

      <div className={styles.container}>
        <div className={styles['section-title']}>
          <h2 className={styles['section-title']}>調査・計測結果の条件</h2>
          <div className={styles.divider}></div>
          <div className={styles.divider}></div>
        </div>
      </div>

      <div className={`${styles.container} ${styles.conditions}`}>
        <div className={styles.liner}>
          <fieldset className={styles.formFieldset}>
            <legend className={styles.formLegend}>背面空洞の有無</legend>
            {haimenKudoList.map((x, i) => (
              <div key={x.id} className={styles.Enable}>
                <label className={styles.formLabel}>
                  <input
                    className={styles.formRadio}
                    type="radio"
                    name="haimenKudo"
                    checked={data.haimenKudo === x.id}
                    onChange={() => {
                      setData(prev => ({ ...prev, haimenKudo: x.id }));
                      setEnable();
                    }}
                  />
                  {x.title}
                </label>
              </div>
            ))}
          </fieldset>

          <fieldset className={styles.formFieldset}>
            <legend className={styles.formLegend}>変形モード</legend>
            {henkeiModeList.map((x, i) => (
              <div key={x.id} id={henkeiModeStyle[i]}>
                <label className={styles.formLabel}>
                  <input
                    className={styles.formRadio}
                    type="radio"
                    name="henkeiMode"
                    checked={data.henkeiMode === x.id}
                    disabled={henkeiModeStyle[i] !== 'Enable'}
                    onChange={() => {
                      setData(prev => ({ ...prev, henkeiMode: x.id }));
                      setEnable();
                    }}
                  />
                  {x.title}
                </label>
              </div>
            ))}
          </fieldset>

          <fieldset className={styles.formFieldset}>
            <legend className={styles.formLegend}>地山強度</legend>
            <input
              className={styles.formNumber}
              type="number"
              value={tempJiyamaKyodo}
              onChange={(e) => {
                setTempJiyamaKyodo(e.target.value);
                handleJiyamaKyodoChange(e.target.value);
              }}
              style={{ width: '65px', textAlign: 'center' }}
              min={2}
              max={8}
            />
            MPa
          </fieldset>

          <fieldset className={styles.formFieldset}>
            <legend className={styles.formLegend}>内空変位速度, 盤ぶくれ速度</legend>
            <input
              className={styles.formNumber}
              type="number"
              value={tempNaikuHeniSokudo}
              onChange={(e) => {
                setTempNaikuHeniSokudo(e.target.value);
                handleNaikuHeniSokudoChange(e.target.value);
              }}
              style={{ width: '65px', textAlign: 'center' }}
            />
            mm/年
            <button className={styles.button} onClick={getMonitoringData}>モニタリングデータ取得</button>
            <div>
              <pre className={styles.pre}>{tempMonitoringData}</pre>
            </div>
          </fieldset>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles['section-title']}>
          <h2 className={styles['section-title']}>対策工の条件</h2>
          <div className={styles.divider}></div>
          <div className={styles.divider}></div>
        </div>
      </div>

      <div className={`${styles.container} ${styles.conditions}`}>
        <div className={styles.liner}>
          <fieldset className={styles.formFieldset}>
            <legend className={styles.formLegend}>裏込注入工</legend>
            {uragomeChunyukoList.map((x, i) => (
              <div key={x.id} className={uragomeChunyukoStyle[i] === 'Enable' ? styles.Enable : styles.Disable}>
                <label className={styles.formLabel}>
                  <input
                    className={styles.formRadio}
                    type="radio"
                    name="uragomeChunyuko"
                    checked={data.uragomeChunyuko === x.id}
                    disabled={uragomeChunyukoStyle[i] !== 'Enable'}
                    onChange={() => {
                      setData(prev => ({ ...prev, uragomeChunyuko: x.id }));
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
              <div className={styles.liner}>
                <div>
                  {lockBoltKouList.map((x, i) => (
                    <div key={x.id}>
                      <label>
                        <input
                          type="radio"
                          name="lockBoltKou"
                          checked={data.lockBoltKou === x.id}
                          onChange={() => {
                            setData(prev => ({ ...prev, lockBoltKou: x.id }));
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
                    <div key={x.id} className={lockBoltLengthStyle[i] === 'Enable' ? styles.Enable : styles.Disable}>
                      <label>
                        <input
                          type="radio"
                          name="lockBoltLength"
                          checked={data.lockBoltLength === x.id}
                          disabled={lockBoltLengthStyle[i] !== 'Enable'}
                          onChange={() => {
                            setData(prev => ({ ...prev, lockBoltLength: x.id }));
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
              <div className={styles.liner}>
                <div>
                  {downwardLockBoltKouList.map((x, i) => (
                    <div key={x.id}>
                      <label>
                        <input
                          type="radio"
                          name="downwardLockBoltKou"
                          checked={data.downwardLockBoltKou === x.id}
                          onChange={() => {
                            setData(prev => ({ ...prev, downwardLockBoltKou: x.id }));
                            setEnable();
                          }}
                        />
                        {x.title}
                      </label>
                    </div>
                  ))}
                </div>
                <div className={`${styles['margin-left']} ${downwardLockBoltLengthStyle === 'Enable' ? styles.Enable : styles.Disable}`}>
                  {downwardLockBoltLengthList.map((x, i) => (
                    <div key={x.id}>
                      <label>
                        <input
                          type="radio"
                          name="downwardLockBoltLength"
                          checked={data.downwardLockBoltLength === x.id}
                          disabled={downwardLockBoltLengthStyle !== 'Enable'}
                          onChange={() => {
                            setData(prev => ({ ...prev, downwardLockBoltLength: x.id }));
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
            {!henkeiMode4Flag && (
              uchimakiHokyoList.map((x, i) => (
                <div key={x.id}>
                  <label>
                    <input
                      type="radio"
                      name="uchimakiHokyo"
                      checked={data.uchimakiHokyo === x.id}
                      onChange={() => {
                        setData(prev => ({ ...prev, uchimakiHokyo: x.id }));
                      }}
                    />
                    {x.title}
                  </label>
                </div>
              ))
            )}
            {henkeiMode4Flag && <p>選択できません</p>}
          </fieldset>

          <fieldset>
            <legend>ロックボルト工</legend>
            {!henkeiMode4Flag ? (
              <div className={styles.liner}>
                <div>
                  {lockBoltKouList.map((x, i) => (
                    <div key={x.id}>
                      <label>
                        <input
                          type="radio"
                          name="lockBoltKou"
                          checked={data.lockBoltKou === x.id}
                          onChange={() => {
                            setData(prev => ({ ...prev, lockBoltKou: x.id }));
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
                    <div key={x.id} className={lockBoltLengthStyle[i] === 'Enable' ? styles.Enable : styles.Disable}>
                      <label>
                        <input
                          type="radio"
                          name="lockBoltLength"
                          checked={data.lockBoltLength === x.id}
                          onChange={() => setData(prev => ({ ...prev, lockBoltLength: x.id }))}
                          disabled={lockBoltLengthStyle[i] !== 'Enable'}
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
              <div className={styles.liner}>
                <div>
                  {downwardLockBoltKouList.map((x, i) => (
                    <div key={x.id}>
                      <label>
                        <input
                          type="radio"
                          name="downwardLockBoltKou"
                          checked={data.downwardLockBoltKou === x.id}
                          onChange={() => {
                            setData(prev => ({ ...prev, downwardLockBoltKou: x.id }));
                            setEnable();
                          }}
                        />
                        {x.title}
                      </label>
                    </div>
                  ))}
                </div>
                <div className={`${styles['margin-left']} ${downwardLockBoltLengthStyle === 'Enable' ? styles.Enable : styles.Disable}`}>
                  {downwardLockBoltLengthList.map((x, i) => (
                    <div key={x.id}>
                      <label>
                        <input
                          type="radio"
                          name="downwardLockBoltLength"
                          checked={data.downwardLockBoltLength === x.id}
                          onChange={() => setData(prev => ({ ...prev, downwardLockBoltLength: x.id }))}
                          disabled={downwardLockBoltLengthStyle !== 'Enable'}
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
                  <div key={x.id} className={styles.Enable}>
                    <label>
                      <input
                        type="radio"
                        name="uchimakiHokyo"
                        checked={data.uchimakiHokyo === x.id}
                        onChange={() => {
                          setData(prev => ({ ...prev, uchimakiHokyo: x.id }));
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
    </div>
  );
}
