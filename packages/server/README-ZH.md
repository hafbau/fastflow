<!-- markdownlint-disable MD030 -->

# Fastflow - 低代码 LLM 应用程序构建器

[English](./README.md) | 中文

![Fastflow](https://github.com/FastflowAI/Fastflow/blob/main/images/fastflow.gif?raw=true)

拖放界面来构建自定义的 LLM 流程

## ⚡ 快速入门

1. 安装 Fastflow
    ```bash
    npm install -g fastflow
    ```
2. 启动 Fastflow

    ```bash
    npx fastflow start
    ```

3. 打开[http://localhost:3000](http://localhost:3000)

## 🔒 身份验证

要启用应用级身份验证，请将`FASTFLOW_USERNAME`和`FASTFLOW_PASSWORD`添加到`.env`文件中：

```
FASTFLOW_USERNAME=user
FASTFLOW_PASSWORD=1234
```

## 🌱 环境变量

Fastflow 支持不同的环境变量来配置您的实例。您可以在`packages/server`文件夹中的`.env`文件中指定以下变量。阅读[更多](https://docs.getflowstack.ai/environment-variables)

您还可以在使用`npx`时指定环境变量。例如：

```
npx fastflow start --PORT=3000 --DEBUG=true
```

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

在[讨论区](https://github.com/FastflowAI/Fastflow/discussions)中随时提出任何问题、报告问题和请求新功能。

## 🙌 贡献

请参阅[贡献指南](https://github.com/FastflowAI/Fastflow/blob/master/CONTRIBUTING.md)。如果您有任何问题或问题，请在[Discord](https://discord.gg/jbaHfsRVBW)上与我们联系。

## 📄 许可证

本仓库中的源代码在[Apache License Version 2.0 许可证](https://github.com/FastflowAI/Fastflow/blob/master/LICENSE.md)下提供。
