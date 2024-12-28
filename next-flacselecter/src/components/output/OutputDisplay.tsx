'use client';

import { useInputDataStore } from '@/services/inputData';
import React, { useEffect, useState } from 'react';

export default function OutputDisplay() {
  const { inputData } = useInputDataStore();
  const [imgString0, setImgString0] = useState('');
  const [imgString1, setImgString1] = useState('');
  const [displacement, setDisplacement] = useState(0);
  const [effection, setEffection] = useState(0);
  const [alertString, setAlertString] = useState<string | null>('');
  const [inputString1, setInputString1] = useState('');
  const [inputString2, setInputString2] = useState('');
  const [inputString3, setInputString3] = useState('');

  useEffect(() => {
    calculateResults();
  }, [inputData]);

  const calculateResults = () => {
    const str1 = getStructureConditionString();
    const str2 = getSurveyResultString();
    const str3 = getCountermeasureString();
    
    const [img0, img1] = getImages();
    const eff = getEffection();
    const disp = getDisplacement();
    const alert = getAlertString();

    setInputString1(str1);
    setInputString2(str2);
    setInputString3(str3);
    setImgString0(img0);
    setImgString1(img1);
    setDisplacement(disp);
    setEffection(eff);
    setAlertString(alert);
  };

  const getStructureConditionString = () => {
    const tunnelType = getTunnelTypeString(inputData.tunnelKeizyo);
    const thickness = `覆工巻厚: ${inputData.fukukouMakiatsu}cm`;
    const invert = inputData.invert === 1 ? 'インバートあり' : 'インバートなし';
    return `${tunnelType}, ${thickness}, ${invert}`;
  };

  const getSurveyResultString = () => {
    const cavity = inputData.haimenKudo === 1 ? '背面空洞あり' : '背面空洞なし';
    const deformationMode = getDeformationModeString(inputData.henkeiMode);
    const strength = `地山強度: ${inputData.jiyamaKyodo}MPa`;
    const displacement = `内空変位速度: ${inputData.naikuHeniSokudo}mm/年`;
    return `${cavity}, ${deformationMode}, ${strength}, ${displacement}`;
  };

  const getCountermeasureString = () => {
    const measures = [];
    if (inputData.uragomeChunyuko === 2) measures.push('裏込注入工');
    if (inputData.lockBoltKou === 2) {
      const length = getLockBoltLengthString(inputData.lockBoltLength);
      measures.push(`ロックボルト工(${length})`);
    }
    if (inputData.downwardLockBoltKou === 2) {
      const length = getLockBoltLengthString(inputData.downwardLockBoltLength);
      measures.push(`下向きロックボルト工(${length})`);
    }
    if (inputData.uchimakiHokyo === 2) measures.push('内巻補強工');
    return measures.length > 0 ? measures.join(', ') : 'なし';
  };

  const getTunnelTypeString = (type: number) => {
    switch (type) {
      case 1: return '単線トンネル';
      case 2: return '複線トンネル';
      case 3: return '新幹線トンネル';
      default: return '単線トンネル';
    }
  };

  const getDeformationModeString = (mode: number) => {
    switch (mode) {
      case 1: return '側壁全体押出し';
      case 2: return '側壁上部前傾';
      case 3: return '脚部押出し';
      case 4: return '盤ぶくれ';
      default: return '側壁全体押出し';
    }
  };

  const getLockBoltLengthString = (length: number) => {
    switch (length) {
      case 1: return '3m';
      case 2: return '4m';
      case 3: return '6m';
      default: return '3m';
    }
  };

  const getImages = () => {
    const tunnelType = getTunnelTypeString(inputData.tunnelKeizyo);
    const deformationMode = getDeformationModeString(inputData.henkeiMode);
    // TODO: Replace with actual image paths based on tunnel type and deformation mode
    const basePath = '/images/tunnels';
    const beforeImg = `${basePath}/${inputData.tunnelKeizyo}_${inputData.henkeiMode}_before.png`;
    const afterImg = `${basePath}/${inputData.tunnelKeizyo}_${inputData.henkeiMode}_after.png`;
    return [beforeImg, afterImg];
  };

  const getEffection = () => {
    // Calculate effection based on countermeasures
    // TODO: Implement actual effection calculation from service
    const baseEffection = 40; // Example: 40% reduction
    return baseEffection;
  };

  const getDisplacement = () => {
    const originalValue = inputData.naikuHeniSokudo;
    const effectionValue = getEffection();
    const value = originalValue * (1 - (effectionValue / 100));
    
    // Round to 1 decimal place
    return Math.round(value * 10) / 10;
  };

  const getAlertString = () => {
    const makiatsu = inputData.fukukouMakiatsu;
    const kyodo = inputData.jiyamaKyodo;
    
    // Check if we need to show an alert based on tunnel type
    if (inputData.tunnelKeizyo < 3) { // 単線, 複線
      if ((makiatsu === 30 || makiatsu === 60) && (kyodo === 2 || kyodo === 8)) {
        return null;
      }
      const adjustedMakiatsu = makiatsu < 45 ? 30 : 60;
      const adjustedKyodo = kyodo < 5 ? 2 : 8;
      return `※この画像は覆工巻厚を${adjustedMakiatsu}、地山強度を${adjustedKyodo}とした場合のものです。`;
    } else { // 新幹線
      if ((makiatsu === 50 || makiatsu === 70) && (kyodo === 2 || kyodo === 8)) {
        return null;
      }
      const adjustedMakiatsu = makiatsu < 60 ? 50 : 70;
      const adjustedKyodo = kyodo < 5 ? 2 : 8;
      return `※この画像は覆工巻厚を${adjustedMakiatsu}、地山強度を${adjustedKyodo}とした場合のものです。`;
    }
  };

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
                <span className="number-box">{displacement.toFixed(1)}</span>
                mm/年
              </div>
            </div>
            <div>
              <div>変位抑制効果</div>
              <div className="number">
                <span className="number-box">{effection.toFixed(1)}</span>％
              </div>
            </div>
          </div>

          <div className="images">
            <div>
              <h3>【対策工なし】</h3>
              <img id="outputimage" src={imgString0} alt="対策工なし" />
            </div>

            <div>
              <h3>【対策工あり】</h3>
              <img id="outputimage" src={imgString1} alt="対策工あり" />
            </div>
          </div>
          
          {alertString && (
            <div className={`alert ${alertString.split(':')[0]}`}>
              <div>{alertString}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
