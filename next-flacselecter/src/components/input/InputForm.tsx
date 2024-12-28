'use client';

import { useInputDataStore } from '../../services/inputData';
import { useState } from 'react';

interface RadioOption {
  value: number;
  label: string;
}

export default function InputForm() {
  const { inputData, setInputData } = useInputDataStore();
  
  // 構造条件
  const tunnelOptions: RadioOption[] = [
    { value: 1, label: '単線' },
    { value: 2, label: '複線' },
    { value: 3, label: '新幹線' }
  ];

  // 調査・計測結果
  const henkeiModeOptions: RadioOption[] = [
    { value: 1, label: '側壁全体押出し' },
    { value: 2, label: '側壁上部前傾' },
    { value: 3, label: '脚部押出し' },
    { value: 4, label: '盤ぶくれ' }
  ];

  // 対策工の条件
  const uragomeChunyukoOptions: RadioOption[] = [
    { value: 1, label: '無し' },
    { value: 2, label: '有り' }
  ];

  const lockBoltKouOptions: RadioOption[] = [
    { value: 1, label: '無し' },
    { value: 2, label: '打設' }
  ];

  const lockBoltLengthOptions: RadioOption[] = [
    { value: 1, label: '3m' },
    { value: 2, label: '4m' },
    { value: 3, label: '6m' }
  ];

  const downwardLockBoltKouOptions: RadioOption[] = [
    { value: 1, label: '無し' },
    { value: 2, label: '打設' }
  ];

  const downwardLockBoltLengthOptions: RadioOption[] = [
    { value: 1, label: '3m' },
    { value: 2, label: '4m' },
    { value: 3, label: '6m' }
  ];

  const uchimakiHokyoOptions: RadioOption[] = [
    { value: 1, label: '無し' },
    { value: 2, label: '有り' }
  ];

  const handleRadioChange = (field: keyof typeof inputData) => (value: number) => {
    setInputData({ [field]: value });
  };

  const handleNumberChange = (field: keyof typeof inputData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      let clampedValue = value;
      if (field === 'fukukouMakiatsu') {
        clampedValue = Math.min(Math.max(value, 30), 70);
      } else if (field === 'jiyamaKyodo') {
        clampedValue = Math.min(Math.max(value, 2), 8);
      }
      setInputData({ [field]: clampedValue });
    }
  };

  const handleMonitoringData = async () => {
    // TODO: Implement actual monitoring data retrieval
    const mockData = `モニタリングデータ
計測日: 2024/01/01
変位量: ${inputData.naikuHeniSokudo.toFixed(1)}mm/年
状態: 安定`;
    setInputData({ monitoringData: mockData });
  };

  const handleToggle = (field: keyof typeof inputData) => () => {
    setInputData({ [field]: inputData[field] === 0 ? 1 : 0 });
  };

  return (
    <div className="container">
      <div className="section-title">
        <h2>条件の設定</h2>
        <div className="divider" />
      </div>

      <div className="conditions">
        <div className="liner">
          <fieldset>
            <legend>構造条件</legend>
            <div className="radio-group">
              {tunnelOptions.map((option) => (
                <label key={option.value} className="radio-label">
                  <input
                    type="radio"
                    name="tunnelKeizyo"
                    value={option.value}
                    checked={inputData.tunnelKeizyo === option.value}
                    onChange={() => handleRadioChange('tunnelKeizyo')(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>

            <div className="number-input">
              <label>覆工巻厚 (cm)</label>
              <input
                type="number"
                value={inputData.fukukouMakiatsu}
                onChange={handleNumberChange('fukukouMakiatsu')}
                min="30"
                max="70"
                step="1"
                style={{ width: '65px', textAlign: 'center' }}
              />
            </div>

            <div className="toggle">
              <label>
                <input
                  type="checkbox"
                  checked={inputData.invert === 1}
                  onChange={handleToggle('invert')}
                />
                インバート
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>調査・計測結果</legend>
            <div className="toggle">
              <label>
                <input
                  type="checkbox"
                  checked={inputData.haimenKudo === 1}
                  onChange={handleToggle('haimenKudo')}
                />
                背面空洞
              </label>
            </div>

            <div className="radio-group">
              {henkeiModeOptions.map((option) => (
                <label key={option.value} className="radio-label">
                  <input
                    type="radio"
                    name="henkeiMode"
                    value={option.value}
                    checked={inputData.henkeiMode === option.value}
                    onChange={() => handleRadioChange('henkeiMode')(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>

            <div className="number-input">
              <label>地山強度 (MPa)</label>
              <input
                type="number"
                value={inputData.jiyamaKyodo}
                onChange={handleNumberChange('jiyamaKyodo')}
                min="2"
                max="8"
                step="0.1"
                style={{ width: '65px', textAlign: 'center' }}
              />
            </div>

            <div className="number-input">
              <label>内空変位速度 (mm/年)</label>
              <input
                type="number"
                value={inputData.naikuHeniSokudo}
                onChange={handleNumberChange('naikuHeniSokudo')}
                min="0"
                step="0.1"
                style={{ width: '65px', textAlign: 'center' }}
              />
              <button 
                onClick={() => handleMonitoringData()}
                style={{ marginLeft: '10px' }}
              >
                モニタリングデータ取得
              </button>
              <div>
                <pre>{inputData.monitoringData}</pre>
              </div>
            </div>
          </fieldset>

          <div className="section-title">
            <h2>対策工の条件</h2>
            <div className="divider" />
          </div>

          <fieldset>
            <legend>裏込注入工</legend>
            <div className="radio-group">
              {uragomeChunyukoOptions.map((option) => (
                <label key={option.value} className="radio-label">
                  <input
                    type="radio"
                    name="uragomeChunyuko"
                    value={option.value}
                    checked={inputData.uragomeChunyuko === option.value}
                    onChange={() => handleRadioChange('uragomeChunyuko')(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>ロックボルト工</legend>
            {inputData.henkeiMode !== 4 ? (
              <div className="liner">
                <div>
                  {lockBoltKouOptions.map((option) => (
                    <label key={option.value} className="radio-label">
                      <input
                        type="radio"
                        name="lockBoltKou"
                        value={option.value}
                        checked={inputData.lockBoltKou === option.value}
                        onChange={() => handleRadioChange('lockBoltKou')(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                <div className="margin-left">
                  {lockBoltLengthOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`radio-label ${inputData.lockBoltKou !== 2 ? 'disabled' : ''}`}
                    >
                      <input
                        type="radio"
                        name="lockBoltLength"
                        value={option.value}
                        checked={inputData.lockBoltLength === option.value}
                        disabled={inputData.lockBoltKou !== 2}
                        onChange={() => handleRadioChange('lockBoltLength')(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <p>選択できません</p>
            )}
          </fieldset>

          <fieldset>
            <legend>ロックボルト工（下向き）</legend>
            {inputData.invert === 1 ? (
              <div className="liner">
                <div>
                  {downwardLockBoltKouOptions.map((option) => (
                    <label key={option.value} className="radio-label">
                      <input
                        type="radio"
                        name="downwardLockBoltKou"
                        value={option.value}
                        checked={inputData.downwardLockBoltKou === option.value}
                        onChange={() => handleRadioChange('downwardLockBoltKou')(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                <div className="margin-left">
                  {downwardLockBoltLengthOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`radio-label ${inputData.downwardLockBoltKou !== 2 ? 'disabled' : ''}`}
                    >
                      <input
                        type="radio"
                        name="downwardLockBoltLength"
                        value={option.value}
                        checked={inputData.downwardLockBoltLength === option.value}
                        disabled={inputData.downwardLockBoltKou !== 2}
                        onChange={() => handleRadioChange('downwardLockBoltLength')(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <p>選択できません</p>
            )}
          </fieldset>

          <fieldset>
            <legend>内巻補強</legend>
            {inputData.henkeiMode !== 4 ? (
              <div className="radio-group">
                {uchimakiHokyoOptions.map((option) => (
                  <label key={option.value} className="radio-label">
                    <input
                      type="radio"
                      name="uchimakiHokyo"
                      value={option.value}
                      checked={inputData.uchimakiHokyo === option.value}
                      onChange={() => handleRadioChange('uchimakiHokyo')(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            ) : (
              <p>選択できません</p>
            )}
          </fieldset>
        </div>
      </div>
    </div>
  );
}
