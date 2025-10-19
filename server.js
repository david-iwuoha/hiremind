// server.js (ESM-ready, for Render / Node "type": "module")

import express from "express";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
import { PDFDocument, rgb } from "pdf-lib";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import pdfParse from "pdf-parse-fixed";
import { Client, PrivateKey, TopicMessageSubmitTransaction } from "@hashgraph/sdk";

dotenv.config();

//CLOUDINARY IS FOR PDF STORAGE AFTER UPLOADING 
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
//END OF CLOUDINARY

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const stampsDir = __dirname; // stamping currently writes next to project root; change if you want a folder

// Mirror node (can be overridden via env)
const MIRROR_NODE = process.env.MIRROR_NODE || "https://testnet.mirrornode.hedera.com";

// Serve frontend static (adjust if your frontend lives in another folder)
app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.static(path.join(__dirname, "public"))); // optional fallback

// Hedera SDK setup
const accountId = process.env.ACCOUNT_ID;
const privateKeyEnv = process.env.PRIVATE_KEY;
if (!accountId || !privateKeyEnv) {
  throw new Error("Missing ACCOUNT_ID or PRIVATE_KEY in environment variables");
}

// Try a few ways to parse the private key so we accept common formats
let operatorPrivateKey;
try {
  // Preferred generic attempt (handles typical Hedera SDK strings)
  operatorPrivateKey = PrivateKey.fromString(privateKeyEnv);
} catch (err1) {
  try {
    // Try hex ECDSA without 0x
    const hex = privateKeyEnv.replace(/^0x/, "");
    operatorPrivateKey = PrivateKey.fromStringECDSA(hex);
  } catch (err2) {
    try {
      operatorPrivateKey = PrivateKey.fromStringED25519(privateKeyEnv);
    } catch (err3) {
      console.error("Private key parsing errors:", err1?.message, err2?.message, err3?.message);
      throw new Error("Unable to parse PRIVATE_KEY. Provide a valid Hedera private key string.");
    }
  }
}

const client = Client.forTestnet();
client.setOperator(accountId, operatorPrivateKey);

// Topic id (prefer env override)
const HEDERA_TOPIC_ID = process.env.TOPIC_ID || "0.0.6880493";

// Multer upload
const upload = multer({ dest: uploadsDir });

// Download endpoint for stamped PDFs
app.get("/download/:name", (req, res) => {
  const filePath = path.join(__dirname, req.params.name);
  if (!fs.existsSync(filePath)) return res.status(404).send("File not found");
  res.download(filePath, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).send("Download error");
    }
  });
});

// -------------------- /upload --------------------
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Read and hash file
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    const proof = {
      type: "hiremind-credential-proof",
      fileName: req.file.originalname,
      sha256: fileHash,
      uploadedAt: new Date().toISOString(),
      issuer: accountId,
    };

    // ---------------- Submit to Hedera Consensus Service ----------------
    const tx = await new TopicMessageSubmitTransaction()
      .setTopicId(HEDERA_TOPIC_ID)
      .setMessage(JSON.stringify(proof))
      .execute(client);

    const receipt = await tx.getReceipt(client);
    console.log("✅ Hedera confirmed:", receipt.status.toString());
    // --------------------------------------------------------------------

    // ---------------- Stamp the PDF ----------------
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const firstPage = pdfDoc.getPages()[0];

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
    const stampedName = `stamped_${req.file.originalname.replace(/\s+/g, "_")}`;
    const tempPath = path.join(uploadsDir, stampedName);
    fs.writeFileSync(tempPath, stampedPdfBytes);
    // ------------------------------------------------

    // ---------------- Upload to Cloudinary ----------------
    const uploadResult = await cloudinary.uploader.upload(tempPath, {
      resource_type: "raw", // for PDFs
      folder: "hiremind-stamped", // optional Cloudinary folder
      public_id: stampedName.replace(".pdf", ""),
    });

    // Delete local temp file after upload
    fs.unlinkSync(tempPath);
    fs.unlinkSync(req.file.path);
    // -------------------------------------------------------

    // ✅ Respond to frontend with everything needed
    res.json({
      success: true,
      proof,
      txId: tx.transactionId.toString(),
      consensusStatus: receipt.status.toString(),
      stampedFileUrl: uploadResult.secure_url, // direct Cloudinary URL
    });

  } catch (err) {
    console.error("❌ Error in /upload:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- /verify --------------------
// Accepts { txId: "0.0.123@456.789" } (string)
app.post("/verify", async (req, res) => {
  try {
    let { txId } = req.body || {};
    if (!txId || typeof txId !== "string") {
      return res.status(400).json({ valid: false, error: "txId (string) is required in request body" });
    }

    // Normalize txId for mirror node: 0.0.1@123.456 -> 0.0.1-123-456
    let formattedTxId = txId;
    if (txId.includes("@")) {
      const [accountPart, timePart] = txId.split("@");
      const [seconds, nanos = "0"] = timePart.split(".");
      formattedTxId = `${accountPart}-${seconds}-${nanos}`;
    }
    formattedTxId = encodeURIComponent(formattedTxId);

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

    const tx = txData.transactions[0];
    const topicId = tx.entity_id || tx.entityId || tx.topic_id || tx.topicId;
    const txConsensusTs = tx.consensus_timestamp || tx.consensusTimestamp || tx.valid_start_timestamp;

    if (!topicId) {
      return res.status(400).json({ valid: false, error: "No topicId (entity_id) found for this transaction", tx });
    }

    // Fetch recent messages for the topic
    const topicUrl = `${MIRROR_NODE}/api/v1/topics/${topicId}/messages?order=desc&limit=200`;
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

    // Find message by consensus timestamp or by looking for txId inside JSON message
    let foundMsg = topicData.messages.find((m) => m.consensus_timestamp === txConsensusTs);
    if (!foundMsg) {
      for (const m of topicData.messages) {
        try {
          const decoded = Buffer.from(m.message, "base64").toString("utf8");
          const parsed = JSON.parse(decoded);
          if (parsed.txId && parsed.txId === txId) { foundMsg = m; break; }
          if (parsed.tx && parsed.tx === txId) { foundMsg = m; break; }
          if (parsed.sha256 && parsed.sha256.length > 0 && txId.includes(parsed.sha256)) { foundMsg = m; break; } // optional heuristic
        } catch (e) { /* ignore parse errors */ }
      }
    }

    if (!foundMsg) {
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

    // decode and parse proof
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

// -------------------- AI resume parse (simple) --------------------
app.post("/parse-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No resume uploaded" });

    const fileBuffer = fs.readFileSync(req.file.path);
    let textContent = "";

    if (req.file.mimetype === "application/pdf") {
      const data = await pdfParse(fileBuffer);
      textContent = data.text || "";
    } else {
      textContent = fs.readFileSync(req.file.path, "utf8");
    }

    const skills = [];
    const skillKeywords = [
      "Accounting", "Finance", "Auditing", "Taxation", "Excel", "Banking",
      "Compliance", "Financial Reporting", "Budgeting", "Risk Management",
      "JavaScript", "Python", "SQL", "React", "Marketing", "Sales"
    ];

    skillKeywords.forEach(skill => {
      if (textContent.toLowerCase().includes(skill.toLowerCase())) skills.push(skill);
    });

    let suggestedRole = "General Candidate";
    if (skills.includes("Accounting") || skills.includes("Auditing")) suggestedRole = "Accountant";
    else if (skills.includes("Banking") || skills.includes("Compliance")) suggestedRole = "Banking Analyst";
    else if (skills.includes("Finance") || skills.includes("Risk Management")) suggestedRole = "Financial Analyst";
    else if (skills.includes("JavaScript") || skills.includes("React")) suggestedRole = "Frontend Developer";
    else if (skills.includes("Python") || skills.includes("SQL")) suggestedRole = "Data Analyst";

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
