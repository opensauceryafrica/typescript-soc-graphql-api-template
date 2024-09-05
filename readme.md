# bysect

Wallet as a Service infrastructure for cryptocurrencies.

## Architecture

Bysect is built with Typescript as a single module with concern separation. No microservice BS!

Who needs a queue when you can just `import`? Should we need a queue? Then it definitely won't be for cross service communication.

Known services in this design are:

- [X] auth - authentication, users, kyc, etc
- [X] chain - wallet, cryptocurrency, blockchain, data, automation etc
- [X] event - txs, confirmations, validations, etc
- [X] connect - third party communication
- [X] signal - events, alerts, broadcasts, emails, sms, in-app, push, etc

## Spinning up

All you need is to add the requried environment variables into an `.env` file and execute `yarn dev`.

## Resources on gql

- [intro to graphql with typescript and apollo server](https://www.apollographql.com/tutorials/intro-typescript/01-course-overview-and-setup)
- [federation with typescript and apollo server](https://www.apollographql.com/tutorials/federation-typescript/01-course-overview-and-setup)
