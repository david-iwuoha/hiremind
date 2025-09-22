# HireMind 🚀  

HireMind is an AI-powered job application assistant.  
It helps job seekers instantly generate tailored resumes and cover letters with AI, while leveraging **Hedera** for optional blockchain credential verification, ensuring authenticity and trust for employers. 

---

## 🔹 Vision  
Make hiring smarter, faster, and more authentic by connecting talent to opportunity with speed and trust.  

---

## 🔹 Features  
- ✍️ AI-tailored resumes in seconds  
- 📨 Personalized cover letters for any job  
- 🔗 Optional blockchain verification of credentials  
- 🌐 Simple, user-friendly interface for candidates & recruiters  

---

## 🔹 Category  
AI / Robotics • DLT for operations  

---

## 🔹 Project Steps  

### **Step 1 — Hedera MVP Setup** ✅  
- Connected to Hedera Testnet.  
- Implemented basic HCS (Hedera Consensus Service) for proof anchoring.  
- Planned HTS-based **soulbound credential badge**.  
- Ensured privacy best practices (hashing only, no PII on-chain).  

🔗 Tutorials followed:  
- [HCS Quickstart](https://docs.hedera.com/hedera/sdks-and-apis/hcs)  
- [HTS NFT Tutorial](https://docs.hedera.com/hedera/sdks-and-apis/hts)  
- [Privacy & Security](https://docs.hedera.com/)  

#### HCS Example Code
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



**Step 2 — Frontend Integration ✅
**
Built simple web interface (public/index.html, public/style.css, public/script.js).

Users can upload PDFs and see JSON proof returned in browser.

Backend (server.js) processes PDF, computes hash, anchors on Hedera, and stamps file.

**Upload Form (index.html)**
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>HireMind - Upload Resume</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>📄 HireMind Resume Verification</h1>
  <form id="uploadForm">
    <input type="file" id="fileInput" name="resume" accept="application/pdf" required />
    <button type="submit">Upload & Verify</button>
  </form>
  <pre id="result"></pre>

  <script src="script.js"></script>
</body>
</html>

**Upload Logic (script.js)**
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files.length) return;

  const formData = new FormData();
  formData.append("resume", fileInput.files[0]);

  const res = await fetch("/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  document.getElementById("result").textContent = JSON.stringify(data, null, 2);
});

**Styling (style.css)**
body {
  font-family: Arial, sans-serif;
  margin: 2rem;
  background: #f9f9f9;
}

h1 {
  color: #333;
}

form {
  margin-bottom: 1rem;
}

button {
  padding: 0.5rem 1rem;
  background: #4caf50;
  border: none;
  color: white;
  cursor: pointer;
}

pre {
  background: #eee;
  padding: 1rem;
  border-radius: 5px;
}


**Step 3 — Verification Flow (Recruiter Page) ✅
**
Added recruiter portal (public/verify.html).

Recruiter uploads a candidate’s document → system computes SHA-256 → checks Hedera records.

Shows Verified ✅ or Not Verified ❌.
Recruiter Page (verify.html)

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>HireMind Recruiter Verification</title>
  <link rel="stylesheet" href="style.css"/>
</head>
<body>
  <h1>🔎 Recruiter Document Verification</h1>
  <form id="verifyForm">
    <input type="file" id="verifyInput" name="resume" accept="application/pdf" required />
    <button type="submit">Verify Document</button>
  </form>
  <pre id="verifyResult"></pre>

  <script>
    document.getElementById("verifyForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById("verifyInput");
      if (!fileInput.files.length) return;

      const formData = new FormData();
      formData.append("resume", fileInput.files[0]);

      const res = await fetch("/verify", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      document.getElementById("verifyResult").textContent = JSON.stringify(data, null, 2);
    });
  </script>
</body>
</html>

**How to Run Locally**
1.Clone repo & install dependencies:

git clone https://github.com/your-username/hiremind.git
cd hiremind
npm install

2. Add a .env file with:
HEDERA_ACCOUNT_ID=your-testnet-id
HEDERA_PRIVATE_KEY=your-private-key

3. Start the server:
node server.js

4. Open in browser:
. http://localhost:3000
 → Upload resumes
. http://localhost:3000/verify.html
 → Recruiter verification

**Notes / Best Practices**

Files stored off-chain (optionally IPFS/Web3.Storage later).
Only sha256 hashes anchored on HCS.
No personal data (PII) stored on-chain.
PDF stamping adds visible proof text + TxID.

## 🔹 Hackathon Goal

Build a working prototype that uses AI to simplify hiring and Hedera DLT to provide tamper-proof credential verification, demonstrating how trust and automation can speed and improve recruitment.


