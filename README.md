# 仕様

## Case番号について

| Case番号について |   単複  | 巻厚 | インバート | 背面空洞 |    変形モード    | 地山強度 | 裏込注入 | ロックボルト |   内巻 | 下向きロックボルト | ロックボルト長 |
|     ---         |   ---  |  --- |    ---    |    ---  |        ---       |    ---  |   ---   |     ---     |   ---  |        ---       |      ---      |
| Case            | 単線：1 | 30cm | なし：0   | なし：0  | 側壁全体押出し：1 | 1MPa    | なし：0  | なし：0     | なし：0 | なし：0          | なし：0        |
|                 | 複線：2 | 45cm | あり：1   | あり：1  | 側壁前傾：2      | 4MPa    | あり：1  | 4本         | あり：1 | あり：1          | 4m            |
|                 |新幹線：3| 60cm |           |         | 側壁脚部押出し：3 | 10MPa   |         | 6本         |         |                 | 8m            |
|                 |        |      |           |         |                 |         |          | 8本         |         |                 |                |
| index           | 0      | 1    | 2         | 3       | 4               | 5       | 6        | 7          | 8        | 9               | 10             |


# プログラムのセットアップ方法

```bash
npm install
```

# プログラムの起動方法

## Electron をデバッグ

### 1. Angularを起動
```bash
npm run start
```
http://localhost:4200 で待機します。

### 2. Electronを起動
**F5** から
`.vscode\launch.json` の
**Debug with Electron** を実行


## Angular をデバッグ

### 1. Angularを起動
```bash
npm run start:web
```
http://localhost:4200 で待機します。

### 2. ブラウザを起動
**F5** から
`.vscode\launch.json` の
**Debug with Chrome** を実行


## Electronアプリを実行（デバッグ無し）
```bash
npm run start
```

## Electronアプリのインストーラーを作成
```bash
npm run build
```
`./release` フォルダに出力されます。


## Webアプリをビルド
```bash
npm run build:web
```
`./dist` フォルダに出力されます。