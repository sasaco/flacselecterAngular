import React, { useState, useEffect } from 'react';
import { InputData, InputDataService } from '../services/inputData';
import { setEnable } from '../utils/setEnable';
import '../styles/input-page.css';

export default function InputPage() {
  const [data, setData] = useState<InputData>({
    tunnelKeizyo: 1,
    fukukouMakiatsu: 30,
    invert: 1,
    haimenKudo: 1,
    henkeiMode: 1,
    jiyamaKyodo: 1.0,
    naikuHeniSokudo: 1.0,
    uragomeChunyuko: 1,
    lockBoltKou: 1,
    lockBoltLength: 3.0,
    downwardLockBoltKou: 1,
    downwardLockBoltLength: 3.0,
    uchimakiHokyo: 1,
  });

  const tunnelKeizyoList = [
    { id: 1, title: '馬蹄形' },
    { id: 2, title: '円形' },
  ];

  const invertList = [
    { id: 1, title: 'なし' },
    { id: 2, title: 'あり' },
  ];

  const haimenKudoList = [
    { id: 1, title: 'なし' },
    { id: 2, title: 'あり' },
  ];

  const henkeiModeList = [
    { id: 1, title: '天端沈下型' },
    { id: 2, title: '水平圧縮型' },
    { id: 3, title: '片押し型' },
    { id: 4, title: '底盤隆起型' },
  ];

  const uragomeChunyukoList = [
    { id: 1, title: 'なし' },
    { id: 2, title: 'あり' },
  ];

  const lockBoltKouList = [
    { id: 1, title: 'なし' },
    { id: 2, title: 'あり' },
  ];

  const downwardLockBoltKouList = [
    { id: 1, title: 'なし' },
    { id: 2, title: 'あり' },
  ];

  const uchimakiHokyoList = [
    { id: 1, title: 'なし' },
    { id: 2, title: 'あり' },
  ];

  const handleChange = (field: keyof InputData, value: number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    setEnable(data);
  }, [data]);

  return (
    <form className="page-container" onSubmit={(e) => e.preventDefault()}>
      <div className="container">
        <div className="section-title">
          <h2 className="section-title">構造条件</h2>
          <div className="divider"></div>
        </div>

        <fieldset>
          <div>
            <label>トンネル形状</label>
            {tunnelKeizyoList.map((x) => (
              <label key={x.id}>
                <input
                  type="radio"
                  checked={data.tunnelKeizyo === x.id}
                  onChange={() => handleChange('tunnelKeizyo', x.id)}
                />
                {x.title}
              </label>
            ))}
          </div>

          <div>
            <label>覆工巻厚 (cm)</label>
            <input
              type="number"
              value={data.fukukouMakiatsu}
              onChange={(e) => handleChange('fukukouMakiatsu', Number(e.target.value))}
            />
          </div>

          <div>
            <label>インバート</label>
            {invertList.map((x) => (
              <label key={x.id}>
                <input
                  type="radio"
                  checked={data.invert === x.id}
                  onChange={() => handleChange('invert', x.id)}
                />
                {x.title}
              </label>
            ))}
          </div>

          <div>
            <label>背面空洞</label>
            {haimenKudoList.map((x) => (
              <label key={x.id}>
                <input
                  type="radio"
                  checked={data.haimenKudo === x.id}
                  onChange={() => handleChange('haimenKudo', x.id)}
                />
                {x.title}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>調査・計測結果</legend>
          
          <div>
            <label>変形モード</label>
            {henkeiModeList.map((x) => (
              <label key={x.id}>
                <input
                  type="radio"
                  checked={data.henkeiMode === x.id}
                  onChange={() => handleChange('henkeiMode', x.id)}
                />
                {x.title}
              </label>
            ))}
          </div>

          <div>
            <label>地山強度 (MPa)</label>
            <input
              type="number"
              value={data.jiyamaKyodo}
              onChange={(e) => handleChange('jiyamaKyodo', Number(e.target.value))}
            />
          </div>

          <div>
            <label>内空変位速度 (mm/日)</label>
            <input
              type="number"
              value={data.naikuHeniSokudo}
              onChange={(e) => handleChange('naikuHeniSokudo', Number(e.target.value))}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>対策工の条件</legend>
          
          <div>
            <label>裏込注入工</label>
            {uragomeChunyukoList.map((x) => (
              <label key={x.id}>
                <input
                  type="radio"
                  checked={data.uragomeChunyuko === x.id}
                  onChange={() => handleChange('uragomeChunyuko', x.id)}
                />
                {x.title}
              </label>
            ))}
          </div>

          <div>
            <label>ロックボルト工</label>
            {lockBoltKouList.map((x) => (
              <label key={x.id}>
                <input
                  type="radio"
                  checked={data.lockBoltKou === x.id}
                  onChange={() => handleChange('lockBoltKou', x.id)}
                />
                {x.title}
              </label>
            ))}
          </div>

          <div>
            <label>ロックボルト長 (m)</label>
            <input
              type="number"
              value={data.lockBoltLength}
              onChange={(e) => handleChange('lockBoltLength', Number(e.target.value))}
            />
          </div>

          <div>
            <label>ロックボルト工（下向き）</label>
            {downwardLockBoltKouList.map((x) => (
              <label key={x.id}>
                <input
                  type="radio"
                  checked={data.downwardLockBoltKou === x.id}
                  onChange={() => handleChange('downwardLockBoltKou', x.id)}
                />
                {x.title}
              </label>
            ))}
          </div>

          <div>
            <label>ロックボルト長（下向き）(m)</label>
            <input
              type="number"
              value={data.downwardLockBoltLength}
              onChange={(e) => handleChange('downwardLockBoltLength', Number(e.target.value))}
            />
          </div>

          <div>
            <label>内巻補強</label>
            {uchimakiHokyoList.map((x) => (
              <label key={x.id}>
                <input
                  type="radio"
                  checked={data.uchimakiHokyo === x.id}
                  onChange={() => handleChange('uchimakiHokyo', x.id)}
                />
                {x.title}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </form>
  );
}
