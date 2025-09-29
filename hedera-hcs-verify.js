import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const topicId = "0.0.6880493"; // <-- your existing topicId
const MIRROR_NODE_URL = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`;

async function fetchMessages() {
  try {
    console.log(`🔎 Fetching messages for topic: ${topicId}\n`);

    const res = await fetch(MIRROR_NODE_URL);
    const data = await res.json();

    if (!data.messages || data.messages.length === 0) {
      console.log("⚠️ No messages found yet. Try submitting one first.");
      return;
    }

    data.messages.forEach((msg) => {
      const payload = Buffer.from(msg.message, "base64").toString("utf-8");
      console.log(`📩 Sequence: ${msg.sequence_number}`);
      console.log(`   Timestamp: ${msg.consensus_timestamp}`);
      console.log(`   Payload: ${payload}`);
      console.log("---------------------------");
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
  }
}

fetchMessages();
