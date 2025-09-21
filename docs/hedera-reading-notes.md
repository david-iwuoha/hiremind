# Hedera Reading Notes — Step 1

## Step 1.1 — Testnet Access
- Create testnet account, store ACCOUNT_ID and PRIVATE_KEY in .env (do not commit)

## Step 1.2 — SDK Setup
- Installed Node.js SDK: npm install @hashgraph/sdk
- Chose JavaScript SDK for local scripting

## Step 1.3 — HCS Basics
- TopicCreateTransaction & TopicMessageSubmitTransaction
- Submit a JSON proof message
- Save topicId & txId in repo notes

## Step 1.4 — Mirror Node Queries
- Fetch messages from mirror node
- Verify JSON payload, timestamp, and sequence number

## Step 1.5 — HTS NFT Badges
- Plan non-transferable NFT badges
- Metadata: cid, sha256, txId
- Keys: adminKey, freezeKey, KYC

## Step 1.6 — Quickstart Examples
- Clone repo: examples/hedera-quickstart
- Run with testnet keys
- Verify end-to-end transactions

## Step 1.7 — Security & Privacy
- Never store PII on-chain
- Anchor only hashes or CIDs on HCS
- Use IPFS/Web3.Storage for off-chain files

## Links
- HCS Docs: https://docs.hedera.com/hedera/sdks-and-apis/hcs
- HTS Docs: https://docs.hedera.com/hedera/sdks-and-apis/hts
- Privacy/Best Practices: https://docs.hedera.com/

