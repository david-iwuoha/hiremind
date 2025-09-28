HireMind

AI-Powered Recruitment with Blockchain Trust
HireMind is a demo recruitment platform that integrates AI resume parsing (demo simulation) and Hedera Blockchain for credential verification. The platform is designed to showcase how blockchain and AI can improve trust, transparency, and efficiency in the hiring process.

⚠️ Note: This is a hackathon/demo build. Some functionalities (e.g., AI parsing, external job APIs) are simulated for demonstration purposes.

🚀 Features
Candidate Side

Upload & Verify Credentials

Upload PDF credentials.

Anchors a proof on Hedera Hashgraph.

Displays TxID, Proof Hash, Consensus Status.

Copy buttons for IDs and downloadable sealed PDF.

Modern upload design with loading spinner and success animation.

Suggested Jobs

Carousel of 7 curated job cards.

Each card includes job title, company, description, and an Apply Now button linking to real external sites (e.g., Jobberman, LinkedIn, Indeed).

Includes images of Black professionals in different fields to highlight diversity.

Applications Tracker

Table to track applied jobs and statuses (Pending, Interview, Hired, Rejected).

Search bar with smooth transition highlight (#00a0fc).

Resume Upload

Upload or replace resume (demo).

Preview box showing filename and simple visualization.

Reset button to remove and re-upload.

AI Resume Parser (Demo)

Extracts structured data from uploaded resume.

Shows fields like Name, Skills, Experience, Education.

Includes disclaimer (for demo use only).

Recruiter Side

Dashboard

Stats sections with smooth scrolling transitions.

Credential verification by TxID.

Secure candidate overview.

Common

Responsive Design (All devices)

CSS Burger Menu with smooth slide transitions.

Back to Dashboard button transitions smoothly.

Unified Base Color (#00a0fc) with complementary accent colors.

Footer: “Built on Hedera” with official SVG logo.

🛠️ Tech Stack

Frontend: HTML5, CSS3, JavaScript (Vanilla)

Blockchain: Hedera Hashgraph (demo anchoring via backend API)

Design: Custom CSS with base + complementary colors, SVG icons, responsive flex/grid layouts.

📂 File Structure
HireMind/
│── index.html              # Landing Page
│── login.html              # Login page with toggle to Register
│── register.html           # Registration page
│── dashboard.html          # Candidate Dashboard
│── recruiter.html          # Recruiter Dashboard
│── upload.html             # Upload & Verify Credentials
│── jobs.html               # Suggested Jobs section
│── applications.html       # Applications Tracker
│── resume.html             # Resume Upload & Preview
│── ai.html                 # AI Resume Parser (demo)
│
│── css/
│   ├── style.css           # Base styling
│   ├── upload.css          # Upload page styling
│   ├── jobs.css            # Suggested Jobs carousel styling
│   ├── applications.css    # Applications tracker styling
│   ├── resume.css          # Resume upload styling
│   ├── ai.css              # AI parser demo styling
│
│── js/
│   ├── app.js              # Upload form logic
│   ├── jobs.js             # Job carousel functionality
│   ├── applications.js     # Table search & status logic
│   ├── resume.js           # Resume upload/preview logic
│   ├── ai.js               # AI parser demo logic
│
│── assets/
│   ├── images/             # Job cards demo images
│   ├── icons/              # SVG icons
│
│── README.md

⚙️ Setup

Clone the repository:

git clone https://github.com/yourusername/hiremind.git
cd hiremind


Run with a local server (e.g., VS Code Live Server).

Ensure backend /upload endpoint is running for credential verification.

🧪 Demo Notes

Credential Verification works with mock backend responses but follows real Hedera integration flow.

AI Resume Parser is simulated; panelists will see structured resume data extraction as proof of concept.

Suggested Jobs link to real job platforms (Jobberman, Indeed, LinkedIn).

Resume Upload doesn’t store user data; resumes reset after refresh.

🌱 Future Improvements

Integrate real Hedera SDK for credential anchoring.

Use an actual NLP model for resume parsing.

Add job scraping API for real-time curated jobs.

Candidate/Recruiter chat system.

OAuth login & user sessions.
