## Description

A NestJS API for managing notes with Google OAuth authentication, JWT-based access, and MongoDB as the database.

## Features

- User authentication via **Google OAuth**
- JWT issuance after login
- Create, read, update, delete (CRUD) notes
- Notes are associated with users
- Notes can have **tags** and **categories**
- RBAC system for user-management
- E2E-tested endpoints
- MongoDB setup via Docker
- Swagger API documentation

## Tech Stack

- **Node.js** 
- **NestJS**
- **TypeScript**
- **MongoDB** (via Docker)

## Prerequisites

- Node.js (LTS)
- pnpm
- Docker & Docker Compose
- Google OAuth 2.0 credentials (Client ID & Client Secret)

## Getting Started

### Clone the repository


```bash
# https
$ git clone https://github.com/Julz-bit/note-taker.git
# ssh
$ git clone git@github.com:Julz-bit/note-taker.git

$ cd note-taker
```

## Project setup

```bash
$ pnpm install

$ cp .env.example .env
```

## Env
```bash
#APP
PORT=3001

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK=http://localhost:3000/auth/google/callback

# JWT
JWT_SECRET=your_jwt_secret

# MongoDB
MONGO_URI=mongodb://admin:password@localhost:27017/notetaker?authSource=admin
```


## Compile and run the project

```bash
# Start
$ pnpm dev
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

```

## Swagger API Documentation
```bash
 http://localhost:3001/api
```