'use client';

import { useInputDataStore } from '@/services/inputData';
import { useState } from 'react';

interface RadioOption {
  value: number;
  label: string;
}

export default function InputForm() {
  const { data, setData } = useInputDataStore();
  
  const tunnelOptions: RadioOption[] = [
    { value: 1, label: '単線' },
    { value: 2, label: '複線' },
    { value: 3, label: '新幹線' }
  ];

  const henkeiModeOptions: RadioOption[] = [
    { value: 1, label: '側壁全体押出し' },
    { value: 2, label: '側壁上部前傾' },
    { value: 3, label: '脚部押出し' },
    { value: 4, label: '盤ぶくれ' }
  ];

  const handleRadioChange = (field: keyof typeof data) => (value: number) => {
    setData({ [field]: value });
  };

  const handleNumberChange = (field: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setData({ [field]: value });
    }
  };

  const handleToggle = (field: keyof typeof data) => () => {
    setData({ [field]: data[field] === 0 ? 1 : 0 });
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
                    checked={data.tunnelKeizyo === option.value}
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
                value={data.fukukouMakiatsu}
                onChange={handleNumberChange('fukukouMakiatsu')}
                min="0"
                step="1"
              />
            </div>

            <div className="toggle">
              <label>
                <input
                  type="checkbox"
                  checked={data.invert === 1}
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
                  checked={data.haimenKudo === 1}
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
                    checked={data.henkeiMode === option.value}
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
                value={data.jiyamaKyodo}
                onChange={handleNumberChange('jiyamaKyodo')}
                min="0"
                step="0.1"
              />
            </div>

            <div className="number-input">
              <label>内空変位速度 (mm/年)</label>
              <input
                type="number"
                value={data.naikuHeniSokudo}
                onChange={handleNumberChange('naikuHeniSokudo')}
                min="0"
                step="0.1"
              />
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
