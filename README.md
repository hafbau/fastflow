<!-- markdownlint-disable MD030 -->

<img width="100%" src="https://github.com/FastflowAI/Fastflow/blob/main/images/fastflow.png?raw=true"></a>

# Fastflow - Build LLM Apps Easily

[![Release Notes](https://img.shields.io/github/release/FastflowAI/Fastflow)](https://github.com/FastflowAI/Fastflow/releases)
[![Discord](https://img.shields.io/discord/1087698854775881778?label=Discord&logo=discord)](https://discord.gg/jbaHfsRVBW)
[![Twitter Follow](https://img.shields.io/twitter/follow/FastflowAI?style=social)](https://twitter.com/FastflowAI)
[![GitHub star chart](https://img.shields.io/github/stars/FastflowAI/Fastflow?style=social)](https://star-history.com/#FastflowAI/Fastflow)
[![GitHub fork](https://img.shields.io/github/forks/FastflowAI/Fastflow?style=social)](https://github.com/FastflowAI/Fastflow/fork)

English | [繁體中文](./i18n/README-TW.md) | [简体中文](./i18n/README-ZH.md) | [日本語](./i18n/README-JA.md) | [한국어](./i18n/README-KR.md)

<h3>Drag & drop UI to build your customized LLM flow</h3>
<a href="https://github.com/FastflowAI/Fastflow">
<img width="100%" src="https://github.com/FastflowAI/Fastflow/blob/main/images/fastflow.gif?raw=true"></a>

## ⚡Quick Start

Download and Install [NodeJS](https://nodejs.org/en/download) >= 18.15.0

1. Install Fastflow
    ```bash
    npm install -g fastflow
    ```
2. Start Fastflow

    ```bash
    npx fastflow start
    ```

    With username & password

    ```bash
    npx fastflow start --FASTFLOW_USERNAME=user --FASTFLOW_PASSWORD=1234
    ```

3. Open [http://localhost:3000](http://localhost:3000)

## 🐳 Docker

### Docker Compose

1. Clone the Fastflow project
2. Go to `docker` folder at the root of the project
3. Copy `.env.example` file, paste it into the same location, and rename to `.env` file
4. `docker compose up -d`
5. Open [http://localhost:3000](http://localhost:3000)
6. You can bring the containers down by `docker compose stop`

### Docker Image

1. Build the image locally:
    ```bash
    docker build --no-cache -t fastflow .
    ```
2. Run image:

    ```bash
    docker run -d --name fastflow -p 3000:3000 fastflow
    ```

3. Stop image:
    ```bash
    docker stop fastflow
    ```

## 👨‍💻 Developers

Fastflow has 3 different modules in a single mono repository.

-   `server`: Node backend to serve API logics
-   `ui`: React frontend
-   `components`: Third-party nodes integrations
-   `api-documentation`: Auto-generated swagger-ui API docs from express

### Prerequisite

-   Install [PNPM](https://pnpm.io/installation)
    ```bash
    npm i -g pnpm
    ```

### Setup

1.  Clone the repository

    ```bash
    git clone https://github.com/FastflowAI/Fastflow.git
    ```

2.  Go into repository folder

    ```bash
    cd Fastflow
    ```

3.  Install all dependencies of all modules:

    ```bash
    pnpm install
    ```

4.  Build all the code:

    ```bash
    pnpm build
    ```

    <details>
    <summary>Exit code 134 (JavaScript heap out of memory)</summary>  
      If you get this error when running the above `build` script, try increasing the Node.js heap size and run the script again:

        export NODE_OPTIONS="--max-old-space-size=4096"
        pnpm build

    </details>

5.  Start the app:

    ```bash
    pnpm start
    ```

    You can now access the app on [http://localhost:3000](http://localhost:3000)

6.  For development build:

    -   Create `.env` file and specify the `VITE_PORT` (refer to `.env.example`) in `packages/ui`
    -   Create `.env` file and specify the `PORT` (refer to `.env.example`) in `packages/server`
    -   Run

        ```bash
        pnpm dev
        ```

    Any code changes will reload the app automatically on [http://localhost:8080](http://localhost:8080)

## 🔒 Authentication

To enable app level authentication, add `FASTFLOW_USERNAME` and `FASTFLOW_PASSWORD` to the `.env` file in `packages/server`:

```
FASTFLOW_USERNAME=user
FASTFLOW_PASSWORD=1234
```

## 🌱 Env Variables

Fastflow support different environment variables to configure your instance. You can specify the following variables in the `.env` file inside `packages/server` folder. Read [more](https://github.com/FastflowAI/Fastflow/blob/main/CONTRIBUTING.md#-env-variables)

## 📖 Documentation

[Fastflow Docs](https://docs.fastflow.ai/)

## 🌐 Self Host

Deploy Fastflow self-hosted in your existing infrastructure, we support various [deployments](https://docs.fastflow.ai/configuration/deployment)

-   [AWS](https://docs.fastflow.ai/configuration/deployment/aws)
-   [Azure](https://docs.fastflow.ai/configuration/deployment/azure)
-   [Digital Ocean](https://docs.fastflow.ai/configuration/deployment/digital-ocean)
-   [GCP](https://docs.fastflow.ai/configuration/deployment/gcp)
-   [Alibaba Cloud](https://computenest.console.aliyun.com/service/instance/create/default?type=user&ServiceName=Fastflow社区版)
-   <details>
      <summary>Others</summary>

    -   [Railway](https://docs.fastflow.ai/configuration/deployment/railway)

        [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/pn4G8S?referralCode=WVNPD9)

    -   [Render](https://docs.fastflow.ai/configuration/deployment/render)

        [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://docs.fastflow.ai/configuration/deployment/render)

    -   [HuggingFace Spaces](https://docs.fastflow.ai/deployment/hugging-face)

        <a href="https://huggingface.co/spaces/FastflowAI/Fastflow"><img src="https://huggingface.co/datasets/huggingface/badges/raw/main/open-in-hf-spaces-sm.svg" alt="HuggingFace Spaces"></a>

    -   [Elestio](https://elest.io/open-source/fastflowai)

        [![Deploy on Elestio](https://elest.io/images/logos/deploy-to-elestio-btn.png)](https://elest.io/open-source/fastflowai)

    -   [Sealos](https://cloud.sealos.io/?openapp=system-template%3FtemplateName%3Dfastflow)

        [![](https://raw.githubusercontent.com/labring-actions/templates/main/Deploy-on-Sealos.svg)](https://cloud.sealos.io/?openapp=system-template%3FtemplateName%3Dfastflow)

    -   [RepoCloud](https://repocloud.io/details/?app_id=29)

        [![Deploy on RepoCloud](https://d16t0pc4846x52.cloudfront.net/deploy.png)](https://repocloud.io/details/?app_id=29)

      </details>

## ☁️ Fastflow Cloud

[Get Started with Fastflow Cloud](https://fastflow.ai/)

## 🙋 Support

Feel free to ask any questions, raise problems, and request new features in [discussion](https://github.com/FastflowAI/Fastflow/discussions)

## 🙌 Contributing

Thanks go to these awesome contributors

<a href="https://github.com/FastflowAI/Fastflow/graphs/contributors">
<img src="https://contrib.rocks/image?repo=FastflowAI/Fastflow" />
</a>

See [contributing guide](CONTRIBUTING.md). Reach out to us at [Discord](https://discord.gg/jbaHfsRVBW) if you have any questions or issues.
[![Star History Chart](https://api.star-history.com/svg?repos=FastflowAI/Fastflow&type=Timeline)](https://star-history.com/#FastflowAI/Fastflow&Date)

## 📄 License

Source code in this repository is made available under the [Apache License Version 2.0](LICENSE.md).
