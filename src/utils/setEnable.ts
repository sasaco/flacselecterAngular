import { InputData } from '../services/inputData';

interface EnableState {
  henkeiModeStyle: string[];
  henkeiMode4Flag: boolean;
  downwardLockBoltEnable: boolean;
  uragomeChunyukoStyle: string[];
  lockBoltLengthStyle: string[];
  downwardLockBoltLengthStyle: string;
  tempFukukouMakiatsu?: string;
}

export function setEnable(data: InputData): EnableState {
  const state: EnableState = {
    henkeiModeStyle: ['Enable', 'Enable', 'Enable', 'Enable'],
    henkeiMode4Flag: false,
    downwardLockBoltEnable: false,
    uragomeChunyukoStyle: ['Enable', 'Disable'],
    lockBoltLengthStyle: ['Disable', 'Disable', 'Disable', 'Disable'],
    downwardLockBoltLengthStyle: 'Disable',
  };

  // 新幹線（在来工法）
  if (data.tunnelKeizyo === 3) {
    if (data.haimenKudo === 1) {
      if (data.henkeiMode === 4) {
        data.henkeiMode = 1;
      }
      state.henkeiModeStyle[3] = 'Disable';
    }
    if (data.fukukouMakiatsu < 50) {
      state.tempFukukouMakiatsu = "50";
    }
  } else {
    // 新幹線（在来工法）ではない
    state.henkeiModeStyle = ['Enable', 'Enable', 'Enable', 'Disable'];
    if (data.henkeiMode === 4) {
      data.henkeiMode = 1;
    }
    state.downwardLockBoltEnable = false;
    data.downwardLockBoltKou = 0;
    data.downwardLockBoltLength = 0;
    if (data.fukukouMakiatsu > 60) {
      state.tempFukukouMakiatsu = "60";
    }
  }

  // 盤ぶくれモード
  if (data.henkeiMode === 4) {
    state.henkeiMode4Flag = true;
    state.downwardLockBoltEnable = true;
    data.lockBoltKou = 0;
    data.lockBoltLength = 0;
    data.uchimakiHokyo = 0;
  } else {
    state.henkeiMode4Flag = false;
    state.downwardLockBoltEnable = false;
    data.downwardLockBoltKou = 0;
    data.downwardLockBoltLength = 0;
  }

  // 背面空洞の有無 と 裏込注入工
  if (data.haimenKudo === 0) {
    state.uragomeChunyukoStyle = ['Enable', 'Disable'];
    data.uragomeChunyuko = 0;
  } else {
    state.uragomeChunyukoStyle = ['Disable', 'Enable'];
    data.uragomeChunyuko = 1;
  }

  // ロックボルト長さ
  if (data.lockBoltKou === 0) {
    state.lockBoltLengthStyle = ['Disable', 'Disable', 'Disable', 'Disable'];
    data.lockBoltLength = 0;
  } else {
    switch (data.tunnelKeizyo) {
      case 1: // 単線 3, 6m
        state.lockBoltLengthStyle = ['Enable', 'Enable', 'Disable', 'Disable'];
        if (data.lockBoltLength !== 3 && data.lockBoltLength !== 6) {
          data.lockBoltLength = 3;
        }
        break;
      case 2: // 複線 4, 8m
      case 3: // 新幹線（在来工法）4, 8m
        state.lockBoltLengthStyle = ['Disable', 'Disable', 'Enable', 'Enable'];
        if (data.lockBoltLength !== 4 && data.lockBoltLength !== 8) {
          data.lockBoltLength = 4;
        }
        break;
    }
  }

  // （下向き）ロックボルト長さ
  if (data.downwardLockBoltKou !== 0) {
    state.downwardLockBoltLengthStyle = 'Enable';
    if (data.downwardLockBoltLength === 0) {
      data.downwardLockBoltLength = 4;
    }
  } else {
    state.downwardLockBoltLengthStyle = 'Disable';
    data.downwardLockBoltLength = 0;
  }

  return state;
}
