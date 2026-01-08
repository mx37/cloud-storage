# Cloud Storage - Project Structure

## 📂 Project Layout

```
cloud-storage/
├─ README.md                          # Start here! Project overview
├─ LICENSE                            # GPL-3.0
├─ .gitignore                         # Git ignore rules
│
├─ /docs/                             # 📚 Full Documentation
│  ├─ STRUCTURE.md                    # This file - code navigation
│  ├─ FEATURES.md                     # Features & tech stack
│  ├─ USAGE.md                        # Installation & troubleshooting
│  └─ PROJECT_STRUCTURE.md            # Detailed code organization
│
├─ /src/                              # 💻 Application Code
│  ├─ /app/                           # Next.js routes & pages
│  │  ├─ page.tsx                     # Root page
│  │  ├─ layout.tsx                   # Root layout
│  │  ├─ globals.css                  # Global styles
│  │  ├─ /login/page.tsx              # Login & key management
│  │  ├─ /files/page.tsx              # Main file manager
│  │  └─ /share/page.tsx              # Public share page
│  │
│  ├─ /components/                    # React components
│  │  ├─ FileManager.tsx              # Main UI
│  │  ├─ FileUpload.tsx               # Upload with encryption
│  │  ├─ ManifestUnlock.tsx           # Auto manifest decryption
│  │  ├─ MarkdownEditor.tsx           # Notes editor
│  │  ├─ StorageSettings.tsx          # S3/R2 config modal
│  │  └─ /ui/                         # Base UI components
│  │
│  ├─ /lib/                           # Core libraries
│  │  ├─ crypto.ts                    # Ed25519 & HKDF derivation
│  │  ├─ e2ee.ts                      # AES-256-GCM file encryption
│  │  ├─ manifest.ts                  # Encrypted metadata storage
│  │  ├─ notes.ts                     # Encrypted notes system
│  │  ├─ storage-client.ts            # S3/R2 upload & download
│  │  ├─ settings.ts                  # Storage configuration
│  │  ├─ types.ts                     # TypeScript definitions
│  │  ├─ utils.ts                     # Helper functions
│  │  └─ drag.ts                      # Drag & drop utilities
│  │
│  └─ /contexts/                      # React contexts
│     └─ AuthContext.tsx              # Global auth state
│
└─ [Config Files]
   ├─ package.json                    # Dependencies
   ├─ package-lock.json               # Lock file (tracked)
   ├─ tsconfig.json                   # TypeScript config
   ├─ next.config.ts                  # Next.js config
   ├─ tailwind.config.ts              # Tailwind CSS setup
   └─ postcss.config.js               # PostCSS config
```

---

## 🎯 What To Edit By Feature

### 🔒 Encryption & Security
```
/src/lib/crypto.ts          - Ed25519 keypair, HKDF derivation
/src/lib/e2ee.ts           - AES-256-GCM file encryption
/src/lib/manifest.ts       - Encrypted file metadata
```

### 🎨 User Interface & Styling
```
/src/components/FileManager.tsx    - Main UI
/src/app/login/page.tsx            - Login & key import/export
/src/components/StorageSettings.tsx - Config modal
/src/app/globals.css               - Global styles
```

### ☁️ File Storage & Uploads
```
/src/lib/storage-client.ts         - S3/R2 client (upload/download)
/src/components/FileUpload.tsx     - Upload handler
/src/components/StorageSettings.tsx - Storage provider config
```

### 📝 Notes & Markdown
```
/src/lib/notes.ts                  - Notes encryption & retrieval
/src/components/MarkdownEditor.tsx - Notes editor with preview
/src/app/files/page.tsx            - Notes integration
```

### 🔑 Authentication
```
/src/contexts/AuthContext.tsx      - Auth state management
/src/app/login/page.tsx            - Login flow
/src/lib/crypto.ts                 - Key generation
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **README.md** | Project overview & quick start |
| **STRUCTURE.md** | This file - quick navigation |
| **FEATURES.md** | Features, tech stack, capabilities |
| **USAGE.md** | How to install & configure |
| **PROJECT_STRUCTURE.md** | Detailed breakdown of all files |

---

## 🚀 Getting Started

### Development Setup
```bash
npm install
npm run dev
# Open http://localhost:3003
```

### Build & Deploy
```bash
npm run build
npm run start
```

See [USAGE.md](./USAGE.md) for full deployment instructions.

---

## 📖 Learning Path

For people who want to understand and modify the code:

1. **Start here:** [README.md](../README.md) - What is this?
2. **Understand features:** [FEATURES.md](./FEATURES.md) - What does it do?
3. **Code organization:** [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Where is everything?
4. **Make changes:** Find your feature in the sections above ↑

---

## 💡 Common Tasks

### "I want to understand the encryption"
1. Study [/src/lib/crypto.ts](./src/lib/crypto.ts)
2. Study [/src/lib/e2ee.ts](./src/lib/e2ee.ts)
3. Study [/src/lib/manifest.ts](./src/lib/manifest.ts)

### "I want to change the UI"
1. Start with [/src/components/FileManager.tsx](./src/components/FileManager.tsx)
2. Check styles in [/src/app/globals.css](./src/app/globals.css)
3. UI components are in [/src/components/ui/](./src/components/ui/)

---

## 🔧 Troubleshooting

**Build errors?**
- Clear cache: `rm -rf .next node_modules`
- Reinstall: `npm install`
- Build: `npm run build`

**TypeScript errors?**
- Check file imports are correct
- Ensure all types are imported from `lib/types.ts`
- Run `npm run build` to see full errors

**Encryption issues?**
- Check browser console (F12) for error messages
- Review [/src/lib/crypto.ts](./src/lib/crypto.ts) logic
