# Serverless API

[![Build Status](https://travis-ci.org/brokalys/sls-api.svg?branch=master)](https://travis-ci.org/brokalys/sls-api)
[![codecov](https://codecov.io/gh/brokalys/sls-api/branch/master/graph/badge.svg)](https://codecov.io/gh/brokalys/sls-api)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## Requirements

- Node
- Yarn

## Installation

```sh
yarn install
```

## Development

Start a local development server.

```sh
yarn start
```

## Deployment

Deployment is taken care by travis. If, for some odd reason, it's required to deploy manually, it can be achieved by running the following command.

```sh
serverless create_domain # do this only for initial deployment
yarn deploy
```
