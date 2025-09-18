## AWS Amplify React+Vite Starter Template

This repository provides a starter template for creating applications using React+Vite and AWS Amplify, emphasizing easy setup for authentication, API, and database capabilities.

## Overview

This template equips you with a foundational React application integrated with AWS Amplify, streamlined for scalability and performance. It is ideal for developers looking to jumpstart their project with pre-configured AWS services like Cognito, AppSync, and DynamoDB.

## Features

- **Authentication**: Setup with Amazon Cognito for secure user authentication.
- **API**: Ready-to-use GraphQL endpoint with AWS AppSync.
- **Database**: Real-time database powered by Amazon DynamoDB.

## Deploying to AWS

For detailed instructions on deploying your application, refer to the [deployment section](https://docs.amplify.aws/react/start/quickstart/#deploy-a-fullstack-app-to-aws) of our documentation.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

## Debugging (VS Code)

- Install dependencies and start debugging in Chrome with Vite and Amplify using the Run and Debug view: select `Debug: Vite + Amplify (Chrome)`.
- Alternatively, run servers manually:
	- Terminal 1: `npx ampx sandbox`
	- Terminal 2: `pnpm run dev`
	- Then launch `Debug: Chrome (Vite)` or `Debug: Edge (Vite)` from the Run and Debug view.
- Set breakpoints in `.ts`/`.tsx` files under `src/`; Vite provides source maps automatically in dev mode.
- To attach to a Node process (e.g., local Amplify functions), use `Attach: Node process` and pick the process.