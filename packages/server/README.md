<!-- markdownlint-disable MD030 -->

# Fastflow - Low-Code LLM apps builder

English | [中文](./README-ZH.md)

![Fastflow](https://github.com/FastflowAI/Fastflow/blob/main/images/fastflow.gif?raw=true)

Drag & drop UI to build your customized LLM flow

## ⚡Quick Start

1. Install Fastflow
    ```bash
    npm install -g fastflow
    ```
2. Start Fastflow

    ```bash
    npx fastflow start
    ```

3. Open [http://localhost:3000](http://localhost:3000)

## 🔒 Authentication

To enable app level authentication, add `FASTFLOW_USERNAME` and `FASTFLOW_PASSWORD` to the `.env` file:

```
FASTFLOW_USERNAME=user
FASTFLOW_PASSWORD=1234
```

## 🌱 Env Variables

Fastflow support different environment variables to configure your instance. You can specify the following variables in the `.env` file inside `packages/server` folder. Read [more](https://github.com/FastflowAI/Fastflow/blob/main/CONTRIBUTING.md#-env-variables)

You can also specify the env variables when using `npx`. For example:

```
npx fastflow start --PORT=3000 --DEBUG=true
```

## 📖 Tests

We use [Cypress](https://github.com/cypress-io) for our e2e testing. If you want to run the test suite in dev mode please follow this guide:

```sh
cd Fastflow/packages/server
pnpm install
./node_modules/.bin/cypress install
pnpm build
#Only for writting new tests on local dev -> pnpm run cypress:open
pnpm run e2e
```

## 📖 Documentation

[Fastflow Docs](https://docs.flowiseai.com/)

## 🌐 Self Host

-   [AWS](https://docs.flowiseai.com/deployment/aws)
-   [Azure](https://docs.flowiseai.com/deployment/azure)
-   [Digital Ocean](https://docs.flowiseai.com/deployment/digital-ocean)
-   [GCP](https://docs.flowiseai.com/deployment/gcp)
-   <details>
      <summary>Others</summary>

    -   [Railway](https://docs.flowiseai.com/deployment/railway)

        [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/pn4G8S?referralCode=WVNPD9)

    -   [Render](https://docs.flowiseai.com/deployment/render)

        [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://docs.flowiseai.com/deployment/render)

    -   [HuggingFace Spaces](https://docs.flowiseai.com/deployment/hugging-face)

        <a href="https://huggingface.co/spaces/FastflowAI/Fastflow"><img src="https://huggingface.co/datasets/huggingface/badges/raw/main/open-in-hf-spaces-sm.svg" alt="HuggingFace Spaces"></a>

    -   [Elestio](https://elest.io/open-source/flowiseai)

        [![Deploy on Elestio](https://elest.io/images/logos/deploy-to-elestio-btn.png)](https://elest.io/open-source/flowiseai)

    -   [Sealos](https://cloud.sealos.io/?openapp=system-template%3FtemplateName%3Dflowise)

        [![](https://raw.githubusercontent.com/labring-actions/templates/main/Deploy-on-Sealos.svg)](https://cloud.sealos.io/?openapp=system-template%3FtemplateName%3Dflowise)

    -   [RepoCloud](https://repocloud.io/details/?app_id=29)

        [![Deploy on RepoCloud](https://d16t0pc4846x52.cloudfront.net/deploy.png)](https://repocloud.io/details/?app_id=29)

      </details>

## ☁️ Fastflow Cloud

[Get Started with Fastflow Cloud](https://flowiseai.com/)

## 🙋 Support

Feel free to ask any questions, raise problems, and request new features in [discussion](https://github.com/FastflowAI/Fastflow/discussions)

## 🙌 Contributing

See [contributing guide](https://github.com/FastflowAI/Fastflow/blob/master/CONTRIBUTING.md). Reach out to us at [Discord](https://discord.gg/jbaHfsRVBW) if you have any questions or issues.

## 📄 License

Source code in this repository is made available under the [Apache License Version 2.0](https://github.com/FastflowAI/Fastflow/blob/master/LICENSE.md).
