const {
  Client,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
  const accountId = process.env.ACCOUNT_ID;
  const privateKey = process.env.PRIVATE_KEY;

  if (!accountId || !privateKey) {
    throw new Error("Missing ACCOUNT_ID or PRIVATE_KEY in .env");
  }

  const client = Client.forTestnet();
  client.setOperator(accountId, PrivateKey.fromString(privateKey));

  // Create a new topic
  const topicTx = await new TopicCreateTransaction().execute(client);
  const topicReceipt = await topicTx.getReceipt(client);
  const topicId = topicReceipt.topicId.toString();
  console.log("✅ Topic created with ID:", topicId);

  // Submit a message
  const messageTx = await new TopicMessageSubmitTransaction({
    topicId: topicId,
    message: JSON.stringify({ proof: "HireMind test message" }),
  }).execute(client);

  const messageReceipt = await messageTx.getReceipt(client);
  console.log("✅ Message submitted, status:", messageReceipt.status.toString());
}

// 👉 Make sure this is OUTSIDE of the function
main().catch((err) => {
  console.error("Error:", err);
});
