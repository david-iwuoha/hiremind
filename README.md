# Mariposa — Hedera Agentic Wallet, HCS Evaluation & Token Ops

Mariposa is an end‑to‑end, agentic wallet and evaluation platform built for the Hedera Hashgraph ecosystem. It combines:

- AI-driven agents with persistent memory for intent understanding
- Hedera Agent Kit for on-chain actions (HTS token ops, HCS topics, queries)
- A production-ready Node/Express backend and a Next.js frontend
- A structured evaluation pipeline over Hedera Consensus Service (HCS)

This README emphasizes Hedera capabilities to align with Hedera hackathon requirements.

## Architecture

![Mariposa Architecture](https://res.cloudinary.com/dhbol6euq/image/upload/v1754676846/Mariposa_wallet_3_cfhtbr.png)

Reference: https://res.cloudinary.com/dhbol6euq/image/upload/v1754676846/Mariposa_wallet_3_cfhtbr.png

## Why Hedera for Mariposa

- Low, predictable fees and carbon‑negative network for consumer-grade UX
- Fast finality for interactive agent flows and near‑real‑time evaluations
- HTS (Hedera Token Service) to mint and manage tokens directly via Agent tools
- HCS (Hedera Consensus Service) to orchestrate transparent, auditable evaluation workflows
- Mature SDKs and the Hedera Agent Kit for clean, composable tool integrations

## Monorepo Overview

text
mariposa/
├─ app/                     # Next.js app (UI)
├─ components/              # React components (dashboard, wallet, agents)
├─ Backend/                 # Node/Express API with Hedera integrations
│  ├─ controllers/          # Hedera + agent controllers
│  ├─ routes/               # REST API routes (incl. /hedera-tools/*)
│  ├─ services/             # Hedera Agent Kit service
│  ├─ models/               # Mongoose models (Agent, EvaluationTopic, ...)
│  └─ HEDERA_AGENT_KIT_README.md
├─ smart-contracts/         # Hardhat project (Sei EVM sample; optional)
└─ public/                  # Static assets


Core Hedera integration lives in:

- Backend/services/hederaAgentKitService.js — Toolkit wiring, HTS/HCS/Queries
- Backend/controllers/hederaAgentKitController.js — REST handlers
- Backend/routes/hederaAgentKit.js — Exposes /hedera-tools/* endpoints

## Quick Start

### Prerequisites

- Node.js ≥ 18, npm
- MongoDB instance
- Hedera testnet account (Account ID, Private Key, Public Key)

### 1) Backend setup

bash
cd Backend
npm install
cp config/env.example .env
# Edit .env with:
# HEDERA_ACCOUNT_ID=0.0.xxxxx
# HEDERA_PRIVATE_KEY=...
# HEDERA_PUBLIC_KEY=...
# HEDERA_NETWORK=testnet
# MONGODB_URI=mongodb://localhost:27017/mariposa
npm run dev
# API at http://localhost:5000
# Swagger (if enabled) at http://localhost:5000/api-docs


### 2) Frontend setup

bash
cd ..
npm install
npm run dev
# Next.js at http://localhost:3000


## Hedera Feature Highlights in Mariposa

- HTS Fungible Token creation via Agent tools
- HCS Topic creation and message submission for evaluations
- HBAR balance queries (agent and arbitrary account)
- Agent‑scoped credentials: each agent signs with its own Hedera keys

## Key REST Endpoints (Hedera)

Base path: /hedera-tools

- GET /tools?agentId=AGENT_ID — List available Hedera tools for the agent
- GET /client-info — Hedera client status
- GET /balance?accountId=0.0.xxx&agentId=AGENT_ID — Query HBAR balance
- GET /my-balance?agentId=AGENT_ID — Query agent’s own HBAR balance
- POST /create-token — Create HTS fungible token
  - Body: { name, symbol, decimals, initialSupply, agentId, treasuryAccount? }
- POST /create-topic — Create HCS topic
  - Body: { memo?, adminKey?, submitKey?, agentId }
- POST /submit-message — Submit message to HCS topic
  - Body: { topicId, message, agentId }
- POST /create-evaluation-topic — HCS topic for candidate evaluation (HCS‑11 memo style)
  - Body: { company, postId, candidateName, candidateId?, agentId }
- POST /submit-evaluation-message — HCS‑11 evaluation message
  - Body: { topicId, agentId, evaluation: { passed, score?, feedback?, interviewNotes? } }
- POST /send-validation-message — HCS‑11 validation message
  - Body: { topicId, agentId, evaluation: { passed, score?, feedback?, interviewNotes? } }
- GET /evaluation-topic/:topicId — Topic details and messages
- GET /evaluation-topics?company=...&postId=...&status=... — Filtered topics

Example: Create a token

bash
curl -X POST http://localhost:5000/hedera-tools/create-token \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mariposa Token",
    "symbol": "MARI",
    "decimals": 2,
    "initialSupply": 100000,
    "agentId": "<AGENT_DB_ID>",
    "treasuryAccount": "0.0.xxxxx"
  }'


## Frontend (Next.js) Highlights

- app/(authenticated)/dashboard — Main dashboard
- components/WalletDashboard.tsx, WalletPage.tsx, WalletPipelinePage.tsx — Wallet and pipeline UX
- components/MasterAgentChat.tsx — Agent chat with memory‑augmented reasoning

## Environment Variables (Backend)

Minimum required in Backend/.env:

bash
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=302e0201...
HEDERA_PUBLIC_KEY=302a3005...
HEDERA_NETWORK=testnet
MONGODB_URI=mongodb://localhost:27017/mariposa
WALLET_ENCRYPTION_KEY=change-me


Notes:

- Private keys may be stored encrypted at rest; the service transparently decrypts using WALLET_ENCRYPTION_KEY.
- Testnet by default; switch to mainnet by setting HEDERA_NETWORK=mainnet.

## Hackathon Story (What to Demo)

- Problem: Coordinating trustable candidate evaluations and tokenized incentives is hard across teams; actions must be auditable and inexpensive.
- Solution: Mariposa agents run decisioning, mint tokens, and immutably log evaluation messages on HCS; reviewers collaborate through agentic flows.
- Why Hedera: predictable low fees, fast finality, robust HCS/HTS tooling, great developer ergonomics via Hedera Agent Kit.
- Impact: Teams get an agentic “evaluation & wallet copilot” with verifiable on‑chain traces and programmable incentives.

## Security & Compliance

- Never commit secrets. Use environment variables.
- Private keys are not returned in API responses.
- Rate limiting, input validation, and auth middleware are in place and easily extended.

## Testing

Backend sample tests and scripts are included (see Backend/test-*.js). For Hedera tools:

bash
node Backend/test-hedera-agent-kit.js


## Deployment

- Backend: containerize Node/Express; provide .env at runtime; connect to managed MongoDB
- Frontend: build Next.js and deploy to your preferred platform
- Hedera: use testnet for staging; switch to mainnet with proper keys and budgets

## License

MIT

---

Architecture image source: [Mariposa Architecture (Cloudinary)](https://res.cloudinary.com/dhbol6euq/image/upload/v1754676846/Mariposa_wallet_3_cfhtbr.png)
