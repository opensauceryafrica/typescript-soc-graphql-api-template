
# bysect 

Wallet as a Service infrastructure for cryptocurrencies.

## Architecture

Bysect is built with Typescript but uses Golang's idea of a multi-module workspaces setup and implements a service oriented approach for resource sharing and service distribution - `one codebase, multiple servers`.

Who needs a queue when you can just `tsc`? Should we need a queue? Then it definitely won't be for cross service communication.

Known services in this design are:

- [X] auth - authentication, users, kyc, etc
- [X] chain - wallet, cryptocurrency, blockchain, data, automation etc
- [X] event - txs, confirmations, validations, etc
- [X] connect - third party communication
- [X] signal - events, alerts, broadcasts, emails, sms, in-app, push, etc

## Spinning up

For each service, all you need is to add the requried environment variables into an `.env` file and execute `yarn dev`.

You can also execute a specific service (module) from within the main workspace using `make -B <service-name>`. For example `make -B auth` will execute the auth service.

## Resources on gql

- [intro to graphql with typescript and apollo server](https://www.apollographql.com/tutorials/intro-typescript/01-course-overview-and-setup)
- [federation with typescript and apollo server](https://www.apollographql.com/tutorials/federation-typescript/01-course-overview-and-setup)
