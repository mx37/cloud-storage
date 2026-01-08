# Cloud Storage

**End-to-end encrypted cloud storage with direct S3/R2 uploads**

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-GPL%203.0-blue)

## 🔒 What Is This?

A privacy-first cloud storage system where:
- **All encryption happens in your browser** - Files encrypted before upload
- **Keys never leave your device** - Private keys stored locally only
- **Direct uploads to your storage** - Cloudflare R2, AWS S3, or compatible
- **Zero-knowledge architecture** - Encryption keys are yours alone

You control everything: your keys, your storage, your data.

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/mx37/cloud-storage.git
cd cloud-storage
npm install

# Start development server
npm run dev
```

Open `http://localhost:3003`

## 📚 Documentation

Full documentation is in the [`/docs`](./docs) folder:

- **[FEATURES.md](./docs/FEATURES.md)** - Features, architecture, tech stack
- **[USAGE.md](./docs/USAGE.md)** - Installation, setup, troubleshooting  
- **[PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)** - Code organization guide

### Configuration & Build

```
Root Files
├── tsconfig.json       # TypeScript config
├── tailwind.config.ts  # Tailwind CSS setup
├── postcss.config.js   # PostCSS config
├── next.config.ts      # Next.js config
├── package.json        # Dependencies
└── .gitignore          # Git ignore rules
```

### Documentation

```
/docs
├── README.md           # Full feature & setup guide
├── USAGE.md            # Installation & troubleshooting
├── FEATURES.md         # Features & tech stack
└── PROJECT_STRUCTURE.md # Code organization breakdown
```

## 🔑 Key Features

- **Client-Side Encryption** - AES-256-GCM with local key generation
- **Folder Organization** - Drag-and-drop file management
- **Notes System** - Encrypted markdown notes with tags
- **File Sharing** - Password-protected share links
- **Multiple Devices** - Import keys to access files anywhere
- **Direct Upload** - Browser → Your S3/R2 bucket (no proxy)
- **Zero-Knowledge** - Provider can't see your data or keys

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **UI:** Tailwind CSS 4, Lucide icons
- **Encryption:** Web Crypto API, @noble/ed25519
- **Storage:** AWS SDK v3 (S3/R2 compatible)
- **Styling:** Tailwind with custom components

## 📖 Getting Started

### For Users
👉 Start with **[USAGE.md](./docs/USAGE.md)** for setup & troubleshooting

### For Developers
1. Read **[PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)** for technical overview
2. Look at `/src/lib/e2ee.ts` for encryption implementation
3. Check `/src/components/FileManager.tsx` for main UI logic

## 🔐 Security Notes

- **Browser-based encryption** - Always verify the code
- **Key management** - Losing your password = losing access
- **Zero-knowledge** - We literally cannot help recover lost keys
- **Best practices** - See [USAGE.md#security-best-practices](./docs/USAGE.md#security-best-practices)

## 📄 License

GNU General Public License v3.0 - See [LICENSE](./LICENSE)

---

**Built with ❤️ for privacy. No telemetry. No tracking.**

Questions? Check [USAGE.md](./docs/USAGE.md) → Troubleshooting section
