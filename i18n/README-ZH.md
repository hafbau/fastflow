<!-- markdownlint-disable MD030 -->

<img width="100%" src="https://github.com/FastflowAI/Fastflow/blob/main/images/fastflow.png?raw=true"></a>

# Fastflow - 轻松构建 LLM 应用程序

[![发布说明](https://img.shields.io/github/release/FastflowAI/Fastflow)](https://github.com/FastflowAI/Fastflow/releases)
[![Discord](https://img.shields.io/discord/1087698854775881778?label=Discord&logo=discord)](https://discord.gg/jbaHfsRVBW)
[![Twitter关注](https://img.shields.io/twitter/follow/FastflowAI?style=social)](https://twitter.com/FastflowAI)
[![GitHub星图](https://img.shields.io/github/stars/FastflowAI/Fastflow?style=social)](https://star-history.com/#FastflowAI/Fastflow)
[![GitHub分支](https://img.shields.io/github/forks/FastflowAI/Fastflow?style=social)](https://github.com/FastflowAI/Fastflow/fork)

[English](../README.md) | 簡體中文 | [日本語](./README-JA.md) | [한국어](./README-KR.md)

<h3>拖放界面构建定制化的LLM流程</h3>
<a href="https://github.com/FastflowAI/Fastflow">
<img width="100%" src="https://github.com/FastflowAI/Fastflow/blob/main/images/fastflow.gif?raw=true"></a>

## ⚡ 快速入门

下载并安装 [NodeJS](https://nodejs.org/en/download) >= 18.15.0

1. 安装 Fastflow
    ```bash
    npm install -g fastflow
    ```
2. 启动 Fastflow

    ```bash
    npx fastflow start
    ```

    使用用户名和密码

    ```bash
    npx fastflow start --FASTFLOW_USERNAME=user --FASTFLOW_PASSWORD=1234
    ```

3. 打开 [http://localhost:3000](http://localhost:3000)

## 🐳 Docker

### Docker Compose

1. 进入项目根目录下的 `docker` 文件夹
2. 创建 `.env` 文件并指定 `PORT`（参考 `.env.example`）
3. 运行 `docker compose up -d`
4. 打开 [http://localhost:3000](http://localhost:3000)
5. 可以通过 `docker compose stop` 停止容器

### Docker 镜像

1. 本地构建镜像：
    ```bash
    docker build --no-cache -t fastflow .
    ```
2. 运行镜像：

    ```bash
    docker run -d --name fastflow -p 3000:3000 fastflow
    ```

3. 停止镜像：
    ```bash
    docker stop fastflow
    ```

## 👨‍💻 开发者

Fastflow 在一个单一的代码库中有 3 个不同的模块。

-   `server`：用于提供 API 逻辑的 Node 后端
-   `ui`：React 前端
-   `components`：第三方节点集成

### 先决条件

-   安装 [PNPM](https://pnpm.io/installation)
    ```bash
    npm i -g pnpm
    ```

### 设置

1. 克隆仓库

    ```bash
    git clone https://github.com/FastflowAI/Fastflow.git
    ```

2. 进入仓库文件夹

    ```bash
    cd Fastflow
    ```

3. 安装所有模块的依赖：

    ```bash
    pnpm install
    ```

4. 构建所有代码：

    ```bash
    pnpm build
    ```

5. 启动应用：

    ```bash
    pnpm start
    ```

    现在可以在 [http://localhost:3000](http://localhost:3000) 访问应用

6. 用于开发构建：

    - 在 `packages/ui` 中创建 `.env` 文件并指定 `VITE_PORT`（参考 `.env.example`）
    - 在 `packages/server` 中创建 `.env` 文件并指定 `PORT`（参考 `.env.example`）
    - 运行

        ```bash
        pnpm dev
        ```

    任何代码更改都会自动重新加载应用程序，访问 [http://localhost:8080](http://localhost:8080)

## 🔒 认证

要启用应用程序级身份验证，在 `packages/server` 的 `.env` 文件中添加 `FASTFLOW_USERNAME` 和 `FASTFLOW_PASSWORD`：

```
FASTFLOW_USERNAME=user
FASTFLOW_PASSWORD=1234
```

## 🌱 环境变量

Fastflow 支持不同的环境变量来配置您的实例。您可以在 `packages/server` 文件夹中的 `.env` 文件中指定以下变量。了解更多信息，请阅读[文档](https://github.com/FastflowAI/Fastflow/blob/main/CONTRIBUTING.md#-env-variables)

## 📖 文档

[Fastflow 文档](https://docs.getflowstack.ai/)

## 🌐 自托管

在您现有的基础设施中部署自托管的 Fastflow，我们支持各种[部署](https://docs.getflowstack.ai/configuration/deployment)

-   [AWS](https://docs.getflowstack.ai/deployment/aws)
-   [Azure](https://docs.getflowstack.ai/deployment/azure)
-   [Digital Ocean](https://docs.getflowstack.ai/deployment/digital-ocean)
-   [GCP](https://docs.getflowstack.ai/deployment/gcp)
-   <details>
      <summary>其他</summary>

    -   [Railway](https://docs.getflowstack.ai/deployment/railway)

        [![在 Railway 上部署](https://railway.app/button.svg)](https://railway.app/template/pn4G8S?referralCode=WVNPD9)

    -   [Render](https://docs.getflowstack.ai/deployment/render)

        [![部署到 Render](https://render.com/images/deploy-to-render-button.svg)](https://docs.getflowstack.ai/deployment/render)

    -   [HuggingFace Spaces](https://docs.getflowstack.ai/deployment/hugging-face)

        <a href="https://huggingface.co/spaces/FastflowAI/Fastflow"><img src="https://huggingface.co/datasets/huggingface/badges/raw/main/open-in-hf-spaces-sm.svg" alt="HuggingFace Spaces"></a>

    -   [Elestio](https://elest.io/open-source/flowiseai)

        [![Deploy](https://pub-da36157c854648669813f3f76c526c2b.r2.dev/deploy-on-elestio-black.png)](https://elest.io/open-source/flowiseai)

    -   [Sealos](https://cloud.sealos.io/?openapp=system-template%3FtemplateName%3Dflowise)

        [![部署到 Sealos](https://raw.githubusercontent.com/labring-actions/templates/main/Deploy-on-Sealos.svg)](https://cloud.sealos.io/?openapp=system-template%3FtemplateName%3Dflowise)

    -   [RepoCloud](https://repocloud.io/details/?app_id=29)

        [![部署到 RepoCloud](https://d16t0pc4846x52.cloudfront.net/deploy.png)](https://repocloud.io/details/?app_id=29)

      </details>

## ☁️ 云托管

[开始使用云托管](https://getflowstack.ai/)

## 🙋 支持

在[讨论区](https://github.com/FastflowAI/Fastflow/discussions)中随时提问、提出问题和请求新功能

## 🙌 贡献

感谢这些了不起的贡献者

<a href="https://github.com/FastflowAI/Fastflow/graphs/contributors">
<img src="https://contrib.rocks/image?repo=FastflowAI/Fastflow" />
</a>

参见[贡献指南](CONTRIBUTING.md)。如果您有任何问题或问题，请在[Discord](https://discord.gg/jbaHfsRVBW)上与我们联系。

## 📄 许可证

此代码库中的源代码在[Apache License Version 2.0 许可证](LICENSE.md)下提供。
