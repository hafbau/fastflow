<!-- markdownlint-disable MD030 -->

<img width="100%" src="https://github.com/FastflowAI/Fastflow/blob/main/images/fastflow.png?raw=true"></a>

# Fastflow - 輕鬆構建 LLM 應用

[![Release Notes](https://img.shields.io/github/release/FastflowAI/Fastflow)](https://github.com/FastflowAI/Fastflow/releases)
[![Discord](https://img.shields.io/discord/1087698854775881778?label=Discord&logo=discord)](https://discord.gg/jbaHfsRVBW)
[![Twitter Follow](https://img.shields.io/twitter/follow/FastflowAI?style=social)](https://twitter.com/FastflowAI)
[![GitHub star chart](https://img.shields.io/github/stars/FastflowAI/Fastflow?style=social)](https://star-history.com/#FastflowAI/Fastflow)
[![GitHub fork](https://img.shields.io/github/forks/FastflowAI/Fastflow?style=social)](https://github.com/FastflowAI/Fastflow/fork)

[English](../README.md) | 繁體中文 | [簡體中文](./i18n/README-ZH.md) | [日本語](./i18n/README-JA.md) | [한국어](./i18n/README-KR.md)

<h3>拖放 UI 以構建自定義的 LLM 流程</h3>
<a href="https://github.com/FastflowAI/Fastflow">
<img width="100%" src="https://github.com/FastflowAI/Fastflow/blob/main/images/fastflow.gif?raw=true"></a>

## ⚡快速開始

下載並安裝 [NodeJS](https://nodejs.org/en/download) >= 18.15.0

1. 安裝 Fastflow
    ```bash
    npm install -g fastflow
    ```
2. 啟動 Fastflow

    ```bash
    npx fastflow start
    ```

    使用用戶名和密碼

    ```bash
    npx fastflow start --FASTFLOW_USERNAME=user --FASTFLOW_PASSWORD=1234
    ```

3. 打開 [http://localhost:3000](http://localhost:3000)

## 🐳 Docker

### Docker Compose

1. 克隆 Fastflow 項目
2. 進入項目根目錄的 `docker` 文件夾
3. 複製 `.env.example` 文件，粘貼到相同位置，並重命名為 `.env` 文件
4. `docker compose up -d`
5. 打開 [http://localhost:3000](http://localhost:3000)
6. 您可以通過 `docker compose stop` 停止容器

### Docker 映像

1. 本地構建映像：
    ```bash
    docker build --no-cache -t fastflow .
    ```
2. 運行映像：

    ```bash
    docker run -d --name fastflow -p 3000:3000 fastflow
    ```

3. 停止映像：
    ```bash
    docker stop fastflow
    ```

## 👨‍💻 開發者

Fastflow 在單個 mono 存儲庫中有 3 個不同的模塊。

-   `server`: 提供 API 邏輯的 Node 後端
-   `ui`: React 前端
-   `components`: 第三方節點集成
-   `api-documentation`: 從 express 自動生成的 swagger-ui API 文檔

### 先決條件

-   安裝 [PNPM](https://pnpm.io/installation)
    ```bash
    npm i -g pnpm
    ```

### 設置

1.  克隆存儲庫

    ```bash
    git clone https://github.com/FastflowAI/Fastflow.git
    ```

2.  進入存儲庫文件夾

    ```bash
    cd Fastflow
    ```

3.  安裝所有模塊的所有依賴項：

    ```bash
    pnpm install
    ```

4.  構建所有代碼：

    ```bash
    pnpm build
    ```

    <details>
    <summary>退出代碼 134（JavaScript 堆內存不足）</summary>  
      如果在運行上述 `build` 腳本時遇到此錯誤，請嘗試增加 Node.js 堆大小並重新運行腳本：

        export NODE_OPTIONS="--max-old-space-size=4096"
        pnpm build

    </details>

5.  啟動應用：

    ```bash
    pnpm start
    ```

    您現在可以訪問 [http://localhost:3000](http://localhost:3000)

6.  對於開發構建：

    -   在 `packages/ui` 中創建 `.env` 文件並指定 `VITE_PORT`（參考 `.env.example`）
    -   在 `packages/server` 中創建 `.env` 文件並指定 `PORT`（參考 `.env.example`）
    -   運行

        ```bash
        pnpm dev
        ```

    任何代碼更改都會自動重新加載應用程序 [http://localhost:8080](http://localhost:8080)

## 🔒 認證

要啟用應用級別的身份驗證，請在 `packages/server` 中的 `.env` 文件中添加 `FASTFLOW_USERNAME` 和 `FASTFLOW_PASSWORD`：

```
FASTFLOW_USERNAME=user
FASTFLOW_PASSWORD=1234
```

## 🌱 環境變量

Fastflow 支持不同的環境變量來配置您的實例。您可以在 `packages/server` 文件夾中的 `.env` 文件中指定以下變量。閱讀 [更多](https://github.com/FastflowAI/Fastflow/blob/main/CONTRIBUTING.md#-env-variables)

## 📖 文檔

[Fastflow 文檔](https://docs.getflowstack.ai/)

## 🌐 自我托管

在您現有的基礎設施中部署 Fastflow 自我托管，我們支持各種 [部署](https://docs.getflowstack.ai/configuration/deployment)

-   [AWS](https://docs.getflowstack.ai/configuration/deployment/aws)
-   [Azure](https://docs.getflowstack.ai/configuration/deployment/azure)
-   [Digital Ocean](https://docs.getflowstack.ai/configuration/deployment/digital-ocean)
-   [GCP](https://docs.getflowstack.ai/configuration/deployment/gcp)
-   [阿里雲](https://computenest.console.aliyun.com/service/instance/create/default?type=user&ServiceName=Flowise社区版)
-   <details>
      <summary>其他</summary>

    -   [Railway](https://docs.getflowstack.ai/configuration/deployment/railway)

        [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/pn4G8S?referralCode=WVNPD9)

    -   [Render](https://docs.getflowstack.ai/configuration/deployment/render)

        [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://docs.getflowstack.ai/configuration/deployment/render)

    -   [HuggingFace Spaces](https://docs.getflowstack.ai/deployment/hugging-face)

        <a href="https://huggingface.co/spaces/FastflowAI/Fastflow"><img src="https://huggingface.co/datasets/huggingface/badges/raw/main/open-in-hf-spaces-sm.svg" alt="HuggingFace Spaces"></a>

    -   [Elestio](https://elest.io/open-source/flowiseai)

        [![Deploy on Elestio](https://elest.io/images/logos/deploy-to-elestio-btn.png)](https://elest.io/open-source/flowiseai)

    -   [Sealos](https://cloud.sealos.io/?openapp=system-template%3FtemplateName%3Dflowise)

        [![](https://raw.githubusercontent.com/labring-actions/templates/main/Deploy-on-Sealos.svg)](https://cloud.sealos.io/?openapp=system-template%3FtemplateName%3Dflowise)

    -   [RepoCloud](https://repocloud.io/details/?app_id=29)

        [![Deploy on RepoCloud](https://d16t0pc4846x52.cloudfront.net/deploy.png)](https://repocloud.io/details/?app_id=29)

      </details>

## ☁️ Fastflow 雲

[開始使用 Fastflow 雲](https://getflowstack.ai/)

## 🙋 支持

隨時在 [討論](https://github.com/FastflowAI/Fastflow/discussions) 中提出任何問題、提出問題和請求新功能

## 🙌 貢獻

感謝這些出色的貢獻者

<a href="https://github.com/FastflowAI/Fastflow/graphs/contributors">
<img src="https://contrib.rocks/image?repo=FastflowAI/Fastflow" />
</a>

請參閱 [貢獻指南](CONTRIBUTING.md)。如果您有任何問題或問題，請通過 [Discord](https://discord.gg/jbaHfsRVBW) 與我們聯繫。
[![Star History Chart](https://api.star-history.com/svg?repos=FastflowAI/Fastflow&type=Timeline)](https://star-history.com/#FastflowAI/Fastflow&Date)

## 📄 許可證

此存儲庫中的源代碼根據 [Apache 許可證版本 2.0](LICENSE.md) 提供。
