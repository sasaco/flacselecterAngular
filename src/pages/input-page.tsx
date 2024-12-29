import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { InputData, InputDataService } from '../services/inputData';
import { setEnable } from '../utils/setEnable';
import '../styles/input-page.css';

export default function InputPage() {
  const router = useRouter();
  const inputService = new InputDataService();
  const [data, setData] = useState<InputData>(inputService.Data);

  const tunnelKeizyoList = [
    { id: 1, title: '単線' },
    { id: 2, title: '複線' },
    { id: 3, title: '新幹線（在来工法）' },
  ];

  const invertList = [
    { id: 0, title: 'なし' },
    { id: 1, title: 'あり' },
  ];

  const haimenKudoList = [
    { id: 0, title: 'なし' },
    { id: 1, title: 'あり' },
  ];

  const henkeiModeList = [
    { id: 1, title: '側壁全体押出し' },
    { id: 2, title: '側壁上部前傾' },
    { id: 3, title: '脚部押出し' },
    { id: 4, title: '盤ぶくれ' },
  ];

  const uragomeChunyukoList = [
    { id: 0, title: 'なし' },
    { id: 1, title: 'あり' },
  ];

  const lockBoltKouList = [
    { id: 0, title: 'なし' },
    { id: 4, title: '4本' },
    { id: 8, title: '8本' },
    { id: 12, title: '12本' },
  ];

  const downwardLockBoltKouList = [
    { id: 0, title: 'なし' },
    { id: 4, title: '4本' },
    { id: 6, title: '6本' },
  ];

  const uchimakiHokyoList = [
    { id: 0, title: 'なし' },
    { id: 1, title: 'あり' },
  ];

  const handleChange = (field: keyof InputData, value: number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    setEnable(data);
  }, [data]);

  return (
    <form className="page-container" onSubmit={async (e) => {
      e.preventDefault();
      inputService.Data = data;
      localStorage.setItem('inputData', JSON.stringify(data));
      await router.push('/output-page');
    }}>
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
      <div className="submit-container">
        <button type="submit" className="submit-button">計算する</button>
      </div>
    </form>
  );
}
