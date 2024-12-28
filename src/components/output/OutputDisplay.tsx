'use client';

import { useInputDataStore } from '@/services/inputData';
import React, { useEffect, useState } from 'react';

export default function OutputDisplay() {
  const { data } = useInputDataStore();
  const [imgString, setImgString] = useState('');
  const [displacement, setDisplacement] = useState(0);
  const [alertString, setAlertString] = useState('');

  useEffect(() => {
    // Calculate values based on input data
    calculateResults();
  }, [data]);

  const calculateResults = () => {
    // Implement calculation logic similar to Angular component
    const imgStr = getImgString();
    const disp = getDisplacement();
    const alert = getAlertString();

    setImgString(imgStr);
    setDisplacement(disp);
    setAlertString(alert);
  };

  const getImgString = () => {
    const { tunnelKeizyo, henkeiMode } = data;
    let baseStr = '';

    switch (tunnelKeizyo) {
      case 1:
        baseStr = '単線トンネル';
        break;
      case 2:
        baseStr = '複線トンネル';
        break;
      case 3:
        baseStr = '新幹線トンネル';
        break;
      default:
        baseStr = '単線トンネル';
    }

    switch (henkeiMode) {
      case 1:
        return `${baseStr}・側壁全体押出し`;
      case 2:
        return `${baseStr}・側壁上部前傾`;
      case 3:
        return `${baseStr}・脚部押出し`;
      case 4:
        return `${baseStr}・盤ぶくれ`;
      default:
        return baseStr;
    }
  };

  const getDisplacement = () => {
    // Implement displacement calculation logic
    const { naikuHeniSokudo } = data;
    return naikuHeniSokudo * 1.5; // Simplified calculation for example
  };

  const getAlertString = () => {
    const { jiyamaKyodo } = data;
    if (jiyamaKyodo < 1.0) {
      return '要注意';
    } else if (jiyamaKyodo < 2.0) {
      return '注意';
    }
    return '正常';
  };

  return (
    <div className="container">
      <div className="section-title">
        <h2>解析結果</h2>
        <div className="divider" />
      </div>

      <div className="results">
        <div className="result-section">
          <h3>トンネル変状の種類</h3>
          <p>{imgString}</p>
        </div>

        <div className="result-section">
          <h3>予測される変位量</h3>
          <p>{displacement.toFixed(1)} mm/年</p>
        </div>

        <div className="result-section">
          <h3>状態評価</h3>
          <p className={`alert-status ${alertString}`}>{alertString}</p>
        </div>
      </div>
    </div>
  );
}
