<!-- markdownlint-disable MD030 -->

# Contributing to Fastflow

English | [中文](./i18n/CONTRIBUTING-ZH.md)

We appreciate any form of contributions.

## ⭐ Star

Star and share the [Github Repo](https://github.com/FastflowAI/Fastflow).

## 🙋 Q&A

Search up for any questions in [Q&A section](https://github.com/FastflowAI/Fastflow/discussions/categories/q-a), if you can't find one, don't hesitate to create one. It might helps others that have similar question.

## 🙌 Share Chatflow

Yes! Sharing how you use Fastflow is a way of contribution. Export your chatflow as JSON, attach a screenshot and share it in [Show and Tell section](https://github.com/FastflowAI/Fastflow/discussions/categories/show-and-tell).

## 💡 Ideas

Ideas are welcome such as new feature, apps integration, and blockchain networks. Submit in [Ideas section](https://github.com/FastflowAI/Fastflow/discussions/categories/ideas).

## 🐞 Report Bugs

Found an issue? [Report it](https://github.com/FastflowAI/Fastflow/issues/new/choose).

## 👨‍💻 Contribute to Code

Not sure what to contribute? Some ideas:

-   Create new components from `packages/components`
-   Update existing components such as extending functionality, fixing bugs
-   Add new chatflow ideas

### Developers

Fastflow has 3 different modules in a single mono repository.

-   `server`: Node backend to serve API logics
-   `ui`: React frontend
-   `components`: Third-party nodes integrations

#### Prerequisite

-   Install [PNPM](https://pnpm.io/installation). The project is configured to use pnpm v9.
    ```bash
    npm i -g pnpm
    ```

#### Step by step

1. Fork the official [Fastflow Github Repository](https://github.com/FastflowAI/Fastflow).

2. Clone your forked repository.

3. Create a new branch, see [guide](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-and-deleting-branches-within-your-repository). Naming conventions:

    - For feature branch: `feature/<Your New Feature>`
    - For bug fix branch: `bugfix/<Your New Bugfix>`.

4. Switch to the newly created branch.

5. Go into repository folder

    ```bash
    cd Fastflow
    ```

6. Install all dependencies of all modules:

    ```bash
    pnpm install
    ```

7. Build all the code:

    ```bash
    pnpm build
    ```

8. Start the app on [http://localhost:3000](http://localhost:3000)

    ```bash
    pnpm start
    ```

9. For development:

    - Create `.env` file and specify the `VITE_PORT` (refer to `.env.example`) in `packages/ui`
    - Create `.env` file and specify the `PORT` (refer to `.env.example`) in `packages/server`
    - Run

    ```bash
    pnpm dev
    ```

    Any changes made in `packages/ui` or `packages/server` will be reflected on [http://localhost:8080](http://localhost:8080)

    For changes made in `packages/components`, run `pnpm build` again to pickup the changes.

10. After making all the changes, run

    ```bash
    pnpm build
    ```

    and

    ```bash
    pnpm start
    ```

    to make sure everything works fine in production.

11. Commit code and submit Pull Request from forked branch pointing to [Fastflow master](https://github.com/FastflowAI/Fastflow/tree/master).

## 🌱 Env Variables

Fastflow support different environment variables to configure your instance. You can specify the following variables in the `.env` file inside `packages/server` folder. Read [more](https://docs.flowiseai.com/environment-variables)

| Variable                     | Description                                                                      | Type                                             | Default                             |
| ---------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------- |
| PORT                         | The HTTP port Fastflow runs on                                                    | Number                                           | 3000                                |
| CORS_ORIGINS                 | The allowed origins for all cross-origin HTTP calls                              | String                                           |                                     |
| IFRAME_ORIGINS               | The allowed origins for iframe src embedding                                     | String                                           |                                     |
| FASTFLOW_USERNAME             | Username to login                                                                | String                                           |                                     |
| FASTFLOW_PASSWORD             | Password to login                                                                | String                                           |                                     |
| FASTFLOW_FILE_SIZE_LIMIT      | Upload File Size Limit                                                           | String                                           | 50mb                                |
| DEBUG                        | Print logs from components                                                       | Boolean                                          |                                     |
| LOG_PATH                     | Location where log files are stored                                              | String                                           | `your-path/Fastflow/logs`            |
| LOG_LEVEL                    | Different levels of logs                                                         | Enum String: `error`, `info`, `verbose`, `debug` | `info`                              |
| LOG_JSON_SPACES              | Spaces to beautify JSON logs                                                     |                                                  | 2                                   |
| APIKEY_STORAGE_TYPE          | To store api keys on a JSON file or database. Default is `json`                  | Enum String: `json`, `db`                        | `json`                              |
| APIKEY_PATH                  | Location where api keys are saved when `APIKEY_STORAGE_TYPE` is `json`           | String                                           | `your-path/Fastflow/packages/server` |
| TOOL_FUNCTION_BUILTIN_DEP    | NodeJS built-in modules to be used for Tool Function                             | String                                           |                                     |
| TOOL_FUNCTION_EXTERNAL_DEP   | External modules to be used for Tool Function                                    | String                                           |                                     |
| DATABASE_TYPE                | Type of database to store the fastflow data                                       | Enum String: `sqlite`, `mysql`, `postgres`       | `sqlite`                            |
| DATABASE_PATH                | Location where database is saved (When DATABASE_TYPE is sqlite)                  | String                                           | `your-home-dir/.fastflow`            |
| DATABASE_HOST                | Host URL or IP address (When DATABASE_TYPE is not sqlite)                        | String                                           |                                     |
| DATABASE_PORT                | Database port (When DATABASE_TYPE is not sqlite)                                 | String                                           |                                     |
| DATABASE_USER                | Database username (When DATABASE_TYPE is not sqlite)                             | String                                           |                                     |
| DATABASE_PASSWORD            | Database password (When DATABASE_TYPE is not sqlite)                             | String                                           |                                     |
| DATABASE_NAME                | Database name (When DATABASE_TYPE is not sqlite)                                 | String                                           |                                     |
| DATABASE_SSL_KEY_BASE64      | Database SSL client cert in base64 (takes priority over DATABASE_SSL)            | Boolean                                          | false                               |
| DATABASE_SSL                 | Database connection overssl (When DATABASE_TYPE is postgre)                      | Boolean                                          | false                               |
| SECRETKEY_PATH               | Location where encryption key (used to encrypt/decrypt credentials) is saved     | String                                           | `your-path/Fastflow/packages/server` |
| FASTFLOW_SECRETKEY_OVERWRITE  | Encryption key to be used instead of the key stored in SECRETKEY_PATH            | String                                           |                                     |
| DISABLE_FASTFLOW_TELEMETRY    | Turn off telemetry                                                               | Boolean                                          |                                     |
| MODEL_LIST_CONFIG_JSON       | File path to load list of models from your local config file                     | String                                           | `/your_model_list_config_file_path` |
| STORAGE_TYPE                 | Type of storage for uploaded files. default is `local`                           | Enum String: `s3`, `local`                       | `local`                             |
| BLOB_STORAGE_PATH            | Local folder path where uploaded files are stored when `STORAGE_TYPE` is `local` | String                                           | `your-home-dir/.fastflow/storage`    |
| S3_STORAGE_BUCKET_NAME       | Bucket name to hold the uploaded files when `STORAGE_TYPE` is `s3`               | String                                           |                                     |
| S3_STORAGE_ACCESS_KEY_ID     | AWS Access Key                                                                   | String                                           |                                     |
| S3_STORAGE_SECRET_ACCESS_KEY | AWS Secret Key                                                                   | String                                           |                                     |
| S3_STORAGE_REGION            | Region for S3 bucket                                                             | String                                           |                                     |
| S3_ENDPOINT_URL              | Custom Endpoint for S3                                                           | String                                           |                                     |
| S3_FORCE_PATH_STYLE          | Set this to true to force the request to use path-style addressing               | Boolean                                          | false                               |
| SHOW_COMMUNITY_NODES         | Show nodes created by community                                                  | Boolean                                          |                                     |
| DISABLED_NODES               | Hide nodes from UI (comma separated list of node names)                          | String                                           |                                     |

You can also specify the env variables when using `npx`. For example:

```
npx fastflow start --PORT=3000 --DEBUG=true
```

## 📖 Contribute to Docs

[Fastflow Docs](https://github.com/FastflowAI/FlowiseDocs)

## 🏷️ Pull Request process

A member of the FastflowAI team will automatically be notified/assigned when you open a pull request. You can also reach out to us on [Discord](https://discord.gg/jbaHfsRVBW).

## 📜 Code of Conduct

This project and everyone participating in it are governed by the Code of Conduct which can be found in the [file](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to hello@flowiseai.com.
