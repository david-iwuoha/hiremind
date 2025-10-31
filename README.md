# HireMind — Transforming Recruitment with Blockchain + AI

HireMind is a Hedera-backed career trust platform. We notarize and issue verifiable credential badges (hashed documents/NFTs) for instant, secure verification of skills/certificates, ensuring complete trust and security for employers. It combines:

- DLT-powered verification: Immutable, tamper-proof records on Hedera for all credentials
- Credential issuance and tracking: Users receive verifiable badges/NFTs for certificates and documents.
- Seamless integration: Node/Express backend with a Next.js frontend for smooth user experience.
- Efficient verification pipeline: Structured document validation using Hedera Consensus Service (HCS) for real-time trust verification.
#
- CERTIFICATION LINK: (https://certs.hashgraphdev.com/3cbbb831-567e-4ccb-bf0e-a6915d026b60.pdf)
- PITCH DECK (POWERPOINT SLIDES): https://docs.google.com/presentation/d/1Ye1ku2LU-1cT-TK8eA3HLFBWVZeKhTQN/edit?usp=sharing&ouid=114570248067449337802&rtpof=true&sd=true
#

This README emphasizes Hedera capabilities to align with Hedera hackathon requirements.

## Architecture

![HireMind Architecture](https://res.cloudinary.com/denaqakxw/image/upload/v1761322052/HireMind_Architecture_ltw64n.png)

Reference: https://res.cloudinary.com/denaqakxw/image/upload/v1761322052/HireMind_Architecture_ltw64n.png

## Why Hedera for HireMind

- Immutable records – Documents can’t be altered.
- Fast verification – Checks happen instantly.
- Low cost – Transactions are inexpensive.
- Secure – Data is well-protected.
- Scalable – Handles growth easily.

## Monorepo Overview

text
HireMind/
├─ backend/               # Express backend with server.js and environment config
│  ├─ server.js
│  ├─ node_modules/
│  ├─ package.json
│  ├─ package-lock.json
│  └─ .env
├─ docs/                  # Documentation for the project
├─ files/                 # Uploaded files or storage folder
├─ frontend/              # Frontend code: HTML, CSS, JS
├─ logs/                  # Application logs
├─ node_modules/
├─ plans/                 # Project plans or roadmap files
├─ upload/                # Temporary uploads or upload handler scripts
├─ .gitignore
├─ hedera-hcs-test.js     # Scripts for testing Hedera HCS
├─ hedera-hcs-verify.js   # Scripts for verifying Hedera HCS messages
├─ package.json
├─ package-lock.json
├─ README.md              # Project overview and instructions
└─ testHedera.js          # Additional Hedera testing scripts



Core Hedera integration lives in:

- backend/server.js — Main backend server where Hedera services are initialized
- hedera-hcs-test.js — Scripts for testing Hedera HCS messaging
- hedera-hcs-verify.js — Scripts for verifying Hedera HCS messages
- testHedera.js — Additional Hedera testing scripts

## Quick Start

### Prerequisites

- Node.js ≥ 18, npm
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
npm run dev
# API at http://localhost:5000
# Swagger (if enabled) at http://localhost:5000/api-docs


### 2) Frontend setup

bash
cd ..
npm install
npm run dev
# Next.js at http://localhost:3000


## Hedera Feature Highlights in HireMind

- HCS topic creation and message submission — used for testing and verification workflows
- HBAR balance queries — check balances for the agent or any account
- Agent-scoped credentials — each agent signs with its own Hedera keys
- Integration in server.js, testHedera.js, hedera-hcs-test.js, and hedera-hcs-verify.js — all core Hedera operations live here

## Key REST Endpoints (Hedera)

Base path: /hedera-tools

- GET /client-info — Check Hedera client status
- GET /my-balance?agentId=AGENT_ID — Query agent’s own HBAR balance
- POST /create-topic — Create HCS topic
  - Body: { memo?, agentId }
- POST /submit-message — Submit message to HCS topic
  - Body: { topicId, message, agentId }
- POST /verify-message — Verify a message on HCS topic
  - Body: { topicId, messageId,}


Example: Create an HCS topic

bash
curl -X POST http://localhost:5000/hedera-tools/create-topic \
  -H "Content-Type: application/json" \
  -d '{
    "memo": "Candidate Evaluation Topic",
    "agentId": "<AGENT_DB_ID>"
  }'

## Frontend Highlights

- frontend/ — Main frontend folder containing HTML, CSS, and JS files
- frontend/dashboard.html — Main dashboard page
- frontend/js/ — JavaScript logic for dashboard interactions, uploads, and Hedera integration
- frontend/css/ — Styles for dashboard and other pages

## Environment Variables (Backend)

Minimum required in Backend/.env:

bash
ACCOUNT_ID=0.0.6871751
PRIVATE_KEY=3030020100300706052b8104000a0422042055fff94cdd2ddbe570c187c754b84c9a75ed43ea28c4a6ff570bef53fb5aa326
CLOUDINARY_CLOUD_NAME=denaqakxw
CLOUDINARY_API_KEY=925397867295392
CLOUDINARY_API_SECRET=poLQ7xKc9XRtOFwF5pA-JsNzkHs




Notes:

- Private keys — Store your Hedera account private keys here. They can be encrypted at rest; the service uses WALLET_ENCRYPTION_KEY to decrypt them automatically.
- Testnet by default; switch to mainnet by setting HEDERA_NETWORK=mainnet.
- Other credentials — Include HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY for your agent account.

## Hackathon Story (What to Demo)

- Problem: Coordinating verifiable candidate evaluations is difficult; actions must be auditable and tamper-proof.
- Solution: HireMind agents run decisioning, log evaluation messages immutably on HCS, and enable reviewers to collaborate securely.
- Why Hedera: Fast finality, low predictable fees, secure HCS messaging, and easy developer integration via Hedera SDK.
- Impact: Teams get an “evaluation copilot” with verifiable on-chain records and streamlined credential verification.

## Security & Compliance

- Keep secrets safe — Never commit .env or private keys to version control; use environment variables.
- Private keys protected — Hedera private keys are never exposed in API responses.
- Secure endpoints — Rate limiting, input validation, and authentication middleware are implemented and can be extended as needed.

## Testing

- Backend tests — Sample tests and scripts are included (see testHedera.js, hedera-hcs-test.js, hedera-hcs-verify.js).
bash
node Backend/test-hedera-agent-kit.js
- Hedera tools — Scripts demonstrate creating HCS topics, submitting messages, verifying messages, and querying HBAR balances.
- Running tests — Execute via Node.js:

## Deployment

- Backend: Run the Node/Express server. Provide a .env file at runtime with Hedera credentials and network configuration.
- Frontend: Serve the HTML/CSS/JS files from any static hosting platform (e.g., Vercel, Netlify, or a simple web server).
- Hedera: Use testnet for staging. Switch to mainnet by updating the .env with the correct account ID, private key, and HEDERA_NETWORK=mainnet.

## License

MIT

---

Architecture image source: [HireMind Architecture (Cloudinary)](https://res.cloudinary.com/denaqakxw/image/upload/v1761322052/HireMind_Architecture_ltw64n.png)
