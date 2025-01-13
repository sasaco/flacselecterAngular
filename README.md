## Electron のメインプロセスをデバッグ

### 1. Angularを起動
```bash
npm run start:web
```
http://localhost:4200 で待機します。

### 2. Electronを起動
**F5** から
`.vscode\launch.json` の
**Debug with Electron** を実行


## Angular のレンダープロセスをデバッグ

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