<!-- markdownlint-disable MD030 -->

<img width="100%" src="https://github.com/FastflowAI/Fastflow/blob/main/images/fastflow.png?raw=true"></a>

# Fastflow - LLM アプリを簡単に構築

[![Release Notes](https://img.shields.io/github/release/FastflowAI/Fastflow)](https://github.com/FastflowAI/Fastflow/releases)
[![Discord](https://img.shields.io/discord/1087698854775881778?label=Discord&logo=discord)](https://discord.gg/jbaHfsRVBW)
[![Twitter Follow](https://img.shields.io/twitter/follow/FastflowAI?style=social)](https://twitter.com/FastflowAI)
[![GitHub star chart](https://img.shields.io/github/stars/FastflowAI/Fastflow?style=social)](https://star-history.com/#FastflowAI/Fastflow)
[![GitHub fork](https://img.shields.io/github/forks/FastflowAI/Fastflow?style=social)](https://github.com/FastflowAI/Fastflow/fork)

[English](../README.md) | [繁體中文](./README-TW.md) | [簡體中文](./README-ZH.md) | 日本語 | [한국어](./README-KR.md)

<h3>ドラッグ＆ドロップでカスタマイズした LLM フローを構築できる UI</h3>
<a href="https://github.com/FastflowAI/Fastflow">
<img width="100%" src="https://github.com/FastflowAI/Fastflow/blob/main/images/fastflow.gif?raw=true"></a>

## ⚡ クイックスタート

[NodeJS](https://nodejs.org/en/download) >= 18.15.0 をダウンロードしてインストール

1. Fastflow のインストール
    ```bash
    npm install -g fastflow
    ```
2. Fastflow の実行

    ```bash
    npx fastflow start
    ```

    ユーザー名とパスワードを入力

    ```bash
    npx fastflow start --FASTFLOW_USERNAME=user --FASTFLOW_PASSWORD=1234
    ```

3. [http://localhost:3000](http://localhost:3000) を開く

## 🐳 Docker

### Docker Compose

1. プロジェクトのルートにある `docker` フォルダに移動する
2. `.env.example` ファイルをコピーして同じ場所に貼り付け、名前を `.env` に変更する
3. `docker compose up -d`
4. [http://localhost:3000](http://localhost:3000) を開く
5. コンテナを停止するには、`docker compose stop` を使用します

### Docker Image

1. ローカルにイメージを構築する:
    ```bash
    docker build --no-cache -t fastflow .
    ```
2. image を実行:

    ```bash
    docker run -d --name fastflow -p 3000:3000 fastflow
    ```

3. image を停止:
    ```bash
    docker stop fastflow
    ```

## 👨‍💻 開発者向け

Fastflow には、3 つの異なるモジュールが 1 つの mono リポジトリにあります。

-   `server`: API ロジックを提供する Node バックエンド
-   `ui`: React フロントエンド
-   `components`: サードパーティノードとの統合

### 必須条件

-   [PNPM](https://pnpm.io/installation) をインストール
    ```bash
    npm i -g pnpm
    ```

### セットアップ

1. リポジトリをクローン

    ```bash
    git clone https://github.com/FastflowAI/Fastflow.git
    ```

2. リポジトリフォルダに移動

    ```bash
    cd Fastflow
    ```

3. すべてのモジュールの依存関係をインストール:

    ```bash
    pnpm install
    ```

4. すべてのコードをビルド:

    ```bash
    pnpm build
    ```

5. アプリを起動:

    ```bash
    pnpm start
    ```

    [http://localhost:3000](http://localhost:3000) でアプリにアクセスできるようになりました

6. 開発用ビルド:

    - `.env` ファイルを作成し、`packages/ui` に `VITE_PORT` を指定する（`.env.example` を参照）
    - `.env` ファイルを作成し、`packages/server` に `PORT` を指定する（`.env.example` を参照）
    - 実行

        ```bash
        pnpm dev
        ```

    コードの変更は [http://localhost:8080](http://localhost:8080) に自動的にアプリをリロードします

## 🔒 認証

アプリレベルの認証を有効にするには、 `FASTFLOW_USERNAME` と `FASTFLOW_PASSWORD` を `packages/server` の `.env` ファイルに追加します:

```
FASTFLOW_USERNAME=user
FASTFLOW_PASSWORD=1234
```

## 🌱 環境変数

Fastflow は、インスタンスを設定するためのさまざまな環境変数をサポートしています。`packages/server` フォルダ内の `.env` ファイルで以下の変数を指定することができる。[続き](https://github.com/FastflowAI/Fastflow/blob/main/CONTRIBUTING.md#-env-variables)を読む

## 📖 ドキュメント

[Fastflow ドキュメント](https://docs.flowiseai.com/)

## 🌐 セルフホスト

お客様の既存インフラに Fastflow をセルフホストでデプロイ、様々な[デプロイ](https://docs.flowiseai.com/configuration/deployment)をサポートします

-   [AWS](https://docs.flowiseai.com/deployment/aws)
-   [Azure](https://docs.flowiseai.com/deployment/azure)
-   [Digital Ocean](https://docs.flowiseai.com/deployment/digital-ocean)
-   [GCP](https://docs.flowiseai.com/deployment/gcp)
-   <details>
      <summary>その他</summary>

    -   [Railway](https://docs.flowiseai.com/deployment/railway)

        [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/pn4G8S?referralCode=WVNPD9)

    -   [Render](https://docs.flowiseai.com/deployment/render)

        [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://docs.flowiseai.com/deployment/render)

    -   [Hugging Face Spaces](https://docs.flowiseai.com/deployment/hugging-face)

        <a href="https://huggingface.co/spaces/FastflowAI/Fastflow"><img src="https://huggingface.co/datasets/huggingface/badges/raw/main/open-in-hf-spaces-sm.svg" alt="Hugging Face Spaces"></a>

    -   [Elestio](https://elest.io/open-source/flowiseai)

        [![Deploy](https://pub-da36157c854648669813f3f76c526c2b.r2.dev/deploy-on-elestio-black.png)](https://elest.io/open-source/flowiseai)

    -   [Sealos](https://cloud.sealos.io/?openapp=system-template%3FtemplateName%3Dflowise)

        [![](https://raw.githubusercontent.com/labring-actions/templates/main/Deploy-on-Sealos.svg)](https://cloud.sealos.io/?openapp=system-template%3FtemplateName%3Dflowise)

    -   [RepoCloud](https://repocloud.io/details/?app_id=29)

        [![Deploy on RepoCloud](https://d16t0pc4846x52.cloudfront.net/deploy.png)](https://repocloud.io/details/?app_id=29)

      </details>

## ☁️ クラウドホスト

[Fastflow Cloud の使い方を始める](https://flowiseai.com/)

## 🙋 サポート

ご質問、問題提起、新機能のご要望は、[discussion](https://github.com/FastflowAI/Fastflow/discussions)までお気軽にどうぞ

## 🙌 コントリビュート

これらの素晴らしい貢献者に感謝します

<a href="https://github.com/FastflowAI/Fastflow/graphs/contributors">
<img src="https://contrib.rocks/image?repo=FastflowAI/Fastflow" />
</a>

[コントリビューティングガイド](CONTRIBUTING.md)を参照してください。質問や問題があれば、[Discord](https://discord.gg/jbaHfsRVBW) までご連絡ください。
[![Star History Chart](https://api.star-history.com/svg?repos=FastflowAI/Fastflow&type=Timeline)](https://star-history.com/#FastflowAI/Fastflow&Date)

## 📄 ライセンス

このリポジトリのソースコードは、[Apache License Version 2.0](LICENSE.md)の下で利用可能です。
