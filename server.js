const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const dotenv = require("dotenv");
const { PDFDocument, rgb } = require("pdf-lib");
const path = require("path");

const app = express(); //  you must create the app before using it
app.use(express.json());
const cors = require("cors");
app.use(cors());


const MIRROR_NODE = "https://testnet.mirrornode.hedera.com";

// Serve static files from "frontend" folder
app.use(express.static(path.join(__dirname, "frontend")));




const {
  Client,
  PrivateKey,
  TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");

dotenv.config();

// Hedera credentials
const accountId = process.env.ACCOUNT_ID;
const privateKey = process.env.PRIVATE_KEY;

if (!accountId || !privateKey) {
  throw new Error("Missing ACCOUNT_ID or PRIVATE_KEY in .env");
}

const client = Client.forTestnet();
client.setOperator(accountId, PrivateKey.fromStringECDSA(privateKey));
 

// allow download of stamped PDF
app.get("/download/:name", (req, res) => {
  const filePath = path.join(__dirname, req.params.name);
  res.download(filePath, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(404).send("File not found");
    }
  });
});

const upload = multer({ dest: "uploads/" });

// Example: use your real topicId created in day 2
const topicId = "0.0.6880493";

// Upload + seal route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // 1. Read file + hash it
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    // 2. Build proof object
    const proof = {
      type: "hiremind-credential-proof",
      fileName: req.file.originalname,
      sha256: fileHash,
      uploadedAt: new Date().toISOString(),
      issuer: process.env.ACCOUNT_ID,
    };

    // 3. Send to Hedera Consensus Service
    const { Client, TopicMessageSubmitTransaction } = require("@hashgraph/sdk");
    const client = Client.forTestnet();
    client.setOperator(process.env.ACCOUNT_ID, process.env.PRIVATE_KEY);

    // NOTE: replace with your existing topicId or create one earlier
    const topicId = process.env.TOPIC_ID;

    const tx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(JSON.stringify(proof))
      .execute(client);

    const receipt = await tx.getReceipt(client);

    // 4. Stamp PDF with ✅ + TxID
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    firstPage.drawText("Verified by HireMind", {
      x: 50,
      y: 50,
      size: 14,
      color: rgb(0, 0.6, 0),
    });

    firstPage.drawText(`TxID: ${tx.transactionId.toString()}`, {
      x: 50,
      y: 30,
      size: 10,
      color: rgb(0, 0, 0),
    });

    const stampedPdfBytes = await pdfDoc.save();
    const stampedPath = `stamped_${req.file.originalname}`;
    fs.writeFileSync(stampedPath, stampedPdfBytes);

    // 5. Respond
    res.json({
      success: true,
      proof,
      txId: tx.transactionId.toString(),
      consensusStatus: receipt.status.toString(),
      stampedFile: stampedPath,
    });
  } catch (err) {
    console.error("❌ Error in /upload:", err);
    res.status(500).json({ error: err.message });
  }
});

// Verify by topicId + sequenceNumber
// TxID-only verification: accept { txId } (string) in JSON body
app.post("/verify", async (req, res) => {
  try {
    let { txId } = req.body;
    if (!txId || typeof txId !== "string") {
      return res.status(400).json({ valid: false, error: "txId (string) is required in request body" });
    }

    // -- 1) convert txId to mirror-node transaction format if needed
    // e.g. 0.0.6871751@1758626830.419285569 -> 0.0.6871751-1758626830-419285569
    let formattedTxId = txId;
    if (txId.includes("@")) {
      const [accountPart, timePart] = txId.split("@");
      const [seconds, nanos = "0"] = timePart.split(".");
      formattedTxId = `${accountPart}-${seconds}-${nanos}`;
    }
    formattedTxId = encodeURIComponent(formattedTxId);

    // -- 2) fetch the transaction from mirror node
    const txUrl = `${MIRROR_NODE}/api/v1/transactions/${formattedTxId}`;
    console.log("🔎 Querying transaction:", txUrl);
    const txResp = await fetch(txUrl);
    if (!txResp.ok) {
      const text = await txResp.text().catch(() => "");
      return res.status(txResp.status).json({ valid: false, error: "Mirror node transaction query failed", details: text });
    }
    const txData = await txResp.json();
    if (!txData.transactions || txData.transactions.length === 0) {
      return res.status(404).json({ valid: false, error: "Transaction not found on mirror node" });
    }

    // transaction metadata
    const tx = txData.transactions[0];
    const topicId = tx.entity_id || tx.entityId || tx.topic_id || tx.entityId;
    const txConsensusTs = tx.consensus_timestamp || tx.consensusTimestamp || tx.valid_start_timestamp;

    if (!topicId) {
      return res.status(400).json({ valid: false, error: "No topicId (entity_id) found for this transaction" });
    }

    // -- 3) fetch recent messages for the topic and find the message matching this tx's consensus timestamp
    // fetch a chunk of recent messages (adjust limit if you expect many)
    const topicUrl = `${MIRROR_NODE}/api/v1/topics/${topicId}/messages?order=desc&limit=100`;
    console.log("🔎 Fetching topic messages:", topicUrl);
    const topicResp = await fetch(topicUrl);
    if (!topicResp.ok) {
      const t = await topicResp.text().catch(() => "");
      return res.status(topicResp.status).json({ valid: false, error: "Mirror node topic query failed", details: t });
    }
    const topicData = await topicResp.json();
    if (!topicData.messages || topicData.messages.length === 0) {
      return res.status(404).json({ valid: false, error: "No messages found for topic", topicId });
    }

    // find message whose consensus_timestamp matches the transaction's consensus timestamp
    let foundMsg = topicData.messages.find((m) => m.consensus_timestamp === txConsensusTs);

    // fallback: if not found, try to find message whose decoded proof contains the txId (someproofs store txId)
    if (!foundMsg) {
      for (const m of topicData.messages) {
        try {
          const decoded = Buffer.from(m.message, "base64").toString("utf8");
          const parsed = JSON.parse(decoded);
          if (parsed.txId && parsed.txId === txId) {
            foundMsg = m;
            break;
          }
          // some proofs store original tx string under different key
          if (parsed.tx && parsed.tx === txId) {
            foundMsg = m;
            break;
          }
        } catch (e) {
          // ignore invalid json
        }
      }
    }

    if (!foundMsg) {
      // not found — return helpful diagnostics
      const sample = topicData.messages.slice(0, 5).map((m) => ({
        sequence: m.sequence_number,
        consensus_timestamp: m.consensus_timestamp,
      }));
      return res.status(404).json({
        valid: false,
        error: "Matching topic message not found for this transaction",
        tx: { topicId, txConsensusTs, txId },
        sampleMessages: sample,
      });
    }

    // -- 4) decode found message and parse proof JSON
    let decoded;
    try {
      decoded = Buffer.from(foundMsg.message, "base64").toString("utf8");
    } catch (e) {
      return res.status(500).json({ valid: false, error: "Failed to decode message base64", details: e.message });
    }

    let proof;
    try {
      proof = JSON.parse(decoded);
    } catch (e) {
      return res.status(500).json({ valid: false, error: "Failed to parse proof JSON", decoded });
    }

    // Success: return the proof and basic metadata
    return res.json({
      valid: true,
      message: "Proof found",
      proof,
      txId,
      topicId,
      sequenceNumber: foundMsg.sequence_number,
      consensusTimestamp: foundMsg.consensus_timestamp,
    });
  } catch (err) {
    console.error("Verify (txid-only) error:", err);
    return res.status(500).json({ valid: false, error: "Verification failed", details: err.message });
  }
});


 
 
const pdfParse = require("pdf-parse");
 

 

app.use(express.static(path.join(__dirname, "public"))); // serve frontend files

/// ------------------- AI Resume Parsing -------------------
 

app.post("/parse-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No resume uploaded" });
    }

    let textContent = "";

    if (req.file.mimetype === "application/pdf") {
      const pdfBuffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(pdfBuffer);
      textContent = data.text;
    } else {
      textContent = fs.readFileSync(req.file.path, "utf8");
    }

    // Simple keyword extraction
    const skills = [];
    const skillKeywords = [
      "Accounting", "Finance", "Auditing", "Taxation", "Excel", "Banking",
      "Compliance", "Financial Reporting", "Budgeting", "Risk Management",
      "JavaScript", "Python", "SQL", "React", "Marketing", "Sales"
    ];

    skillKeywords.forEach(skill => {
      if (textContent.toLowerCase().includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    });

    // Match to roles
    let suggestedRole = "General Candidate";
    if (skills.includes("Accounting") || skills.includes("Auditing")) {
      suggestedRole = "Accountant";
    } else if (skills.includes("Banking") || skills.includes("Compliance")) {
      suggestedRole = "Banking Analyst";
    } else if (skills.includes("Finance") || skills.includes("Risk Management")) {
      suggestedRole = "Financial Analyst";
    } else if (skills.includes("JavaScript") || skills.includes("React")) {
      suggestedRole = "Frontend Developer";
    } else if (skills.includes("Python") || skills.includes("SQL")) {
      suggestedRole = "Data Analyst";
    }

    res.json({ skills, suggestedRole });

  } catch (err) {
    console.error("AI Parse error:", err);
    res.status(500).json({ error: "Failed to parse resume", details: err.message });
  }
});



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 HireMind backend running on port ${PORT}`);
});


