
# 🚀 BoostIQ — Turn Knowledge into Memory

BoostIQ is an AI-powered memory tool that transforms how you study and retain information. Using cognitive science principles like spaced repetition, retrieval practice, and dual-coding — combined with the intelligence of Gemini AI — BoostIQ helps learners truly remember what matters.


## 🌟 Why BoostIQ?

Most learning tools stop at helping you understand. BoostIQ goes further — it helps you **remember**. With just one click, you can turn any content into an AI-crafted **Snapshot**, including:

- ✍️ A question and answer for recall
- 📚 A short summary
- 🤔 A creative analogy
- 😂 A fun, personalized mnemonic (SnapGiggle™)
- 🔊 An audio version to learn by listening


## 🌐 Live Demo

> [Launch BoostIQ in your browser](https://boostiq.vercel.app)  
> 



## 🛠️ Tech Stack

| Frontend | Backend | AI | Styling |
|----------|---------|----|---------|
| React (TypeScript) | Firebase (Firestore) | Google Gemini Pro | TailwindCSS + shadcn/ui |
| Vite | Firestore Rules & Auth | Gemini Prompt Chaining | Theme Toggle (Dark/Light) |


## 🧠 Features

- **AI Snapshot Generator** – Turn input text into memory-enhancing study cards
- **Spaced Repetition Engine** – Optimize reviews using SM-2-inspired algorithm
- **SnapGiggle™** – Fun & personalized mnemonics based on your interests
- **Audio Learning** – Listen to your Snapshots for dual-mode memory
- **Dark/Light Mode** – Toggle themes for better accessibility
- **Instant Review & Rating** – Rate difficulty and reinforce what you forget


## 🧪 Getting Started Locally

> Requires: `Node.js` & `npm`

### Clone the Repo

git clone https://github.com/your-username/boostiq.git
cd boostiq

### Install Dependencies
npm install

### Start Development Server
npm run dev

> The app will be running at `http://localhost:5173`


## 🔐 Environment Setup

To use Gemini API and Firebase, create a `.env` file at the project root:
env
- VITE_GEMINI_API_KEY=go_create_ur_own_key
- VITE_FIREBASE_API_KEY=your_firebase_key
- VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
- VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
- VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
- VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
- VITE_FIREBASE_APP_ID=your_firebase_app_id

> You can set these up in your Firebase project settings.

## 🙋‍♀️ Contribution

Contributions are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 👥 Team

Built with passion by:

- 🧠 **Emrash** — Developer & Visionary
- 🤖 **ChatGPT** — Used ChatGPT for idea perfection, debugging and development accerelation


## 📄 License

MIT License. Feel free to fork, remix, and build on BoostIQ.


> BoostIQ — Because learning isn't about cramming, it's about **remembering**.