# hiremind
AI-powered resume and cover letter generator with optional blockchain credential verification.

# HireMind 🚀  

HireMind is an AI-powered job application assistant.  
It helps job seekers instantly generate tailored resumes and cover letters with AI, while enabling optional blockchain credential verification for employers.  

## 🔹 Vision  
Make hiring smarter, faster, and more authentic by connecting talent to opportunity with speed and trust.  

## 🔹 Features  
- AI-tailored resumes in seconds  
- Personalized cover letters for any job  
- Optional blockchain verification of credentials  
- Simple, user-friendly interface  

## 🔹 Category  
AI / Robotics  


**## Step 1 — Hedera MVP Setup**

### Overview
This step covers Hedera testnet access, HCS and HTS basics, privacy best practices, and a minimal setup for credential badges.

### Tutorials Followed
- Hedera HCS Quickstart: [https://docs.hedera.com/hedera/sdks-and-apis/hcs](https://docs.hedera.com/hedera/sdks-and-apis/hcs)
- Hedera HTS NFT Tutorial: [https://docs.hedera.com/hedera/sdks-and-apis/hts](https://docs.hedera.com/hedera/sdks-and-apis/hts)
- Privacy & Security Best Practices: [https://docs.hedera.com/](https://docs.hedera.com/)

### Minimal Commands / Snippets

#### HCS Example
```javascript
const { Client, TopicCreateTransaction, TopicMessageSubmitTransaction } = require("@hashgraph/sdk");

// Connect to testnet
const client = Client.forTestnet();
client.setOperator(process.env.HEDERA_ACCOUNT_ID, process.env.HEDERA_PRIVATE_KEY);

// Create a topic
const topicTx = await new TopicCreateTransaction().execute(client);
const topicId = (await topicTx.getReceipt(client)).topicId;

// Submit a JSON message
const message = { proof: "example" };
const submitTx = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(JSON.stringify(message))
    .execute(client);


**HTS NFT Creation (Planned)**
{
  "badge_name": "HireMind Credential Badge",
  "description": "A non-transferable credential badge issued via Hedera Token Service (HTS). Each badge is soulbound to the recipient’s Hedera account.",
  "token_type": "NON_FUNGIBLE_UNIQUE",
  "supply_type": "FINITE",
  "max_supply": 1000,
  "transferability": "NON_TRANSFERABLE",
  "metadata_schema": {
    "cid": "bafybeigdyrzt4w5h7qexamplecid",
    "sha256": "d2d2d0b7f99a9f543examplehashaf9b3cfd118f40e6cd8f",
    "txId": "0.0.6880493@1758446099.809223042"
  },
  "keys": {
    "admin_key": "issuer-only",
    "supply_key": "issuer-only",
    "freeze_key": "none",
    "kyc_key": "none",
    "wipe_key": "none"
  },
  "use_case": "Credentialing and proof of achievement on Hedera. Each badge is linked to an HCS-anchored record for immutability."
}
......................................

**Notes / Best Practices**

Files stored off-chain (IPFS/Web3.Storage suggested)
Only sha256 hashes or CIDs anchored on HCS
No PII stored on-chain
Logs or audit trails: hash before anchoring
## 🔹 Hackathon Goal  
Build a working prototype that demonstrates how AI can simplify and improve the hiring process.  
