require("dotenv").config();
const { Client, AccountBalanceQuery } = require("@hashgraph/sdk");

async function main() {
  // Load keys from .env
  const myAccountId = process.env.ACCOUNT_ID;
  const myPrivateKey = process.env.PRIVATE_KEY;

  if (!myAccountId || !myPrivateKey) {
    throw new Error("Environment variables ACCOUNT_ID and PRIVATE_KEY must be set in .env file");
  }

  // Create Hedera client
  const client = Client.forTestnet();
  client.setOperator(myAccountId, myPrivateKey);

  // Check balance
  const balance = await new AccountBalanceQuery()
    .setAccountId(myAccountId)
    .execute(client);

  console.log(`The account balance for ${myAccountId} is: ${balance.hbars.toString()}`);
}

main().catch(err => {
  console.error(err);
});
