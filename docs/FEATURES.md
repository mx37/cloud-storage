# Cloud Storage - Secure, End-to-End Encrypted File Storage & Notes

A lightweight, end-to-end encrypted cloud storage system. Everything is encrypted locally with keys that never leave your device.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-GPL%203.0-blue)

## ✨ Features

- **Client-Side Encryption** - AES-256-GCM encryption, keys never transmitted
- **Local Key Generation** - Ed25519 keypairs generated and stored locally
- **Zero-Knowledge Storage** - Storage provider can't see your files or encryption keys
- **Bring Your Own Storage** - Direct uploads to Cloudflare R2 or AWS S3
- **Key Management** - Generate, backup, and restore encryption keys as JSON files
- **Optional Key Encryption** - Protect key backups with passwords (AES-256-GCM + PBKDF2)
- **Folder Organization** - Drag-and-drop file management with local state
- **Privacy Protection** - Automatic EXIF stripping from images

## 🏗️ Architecture

### Local Key Generation & Storage
- Keys are generated locally in your browser (Ed25519 keypairs)
- Private key stays in browser localStorage
- Optional password-protected backups
- No central service required

### Direct S3/R2 Connection  
- Browser uploads encrypted files directly to your storage bucket
- Presigned URLs for secure uploads
- Complete independence from auth infrastructure

### Workflow
1. **Generate Keys** → Create keypair locally
2. **Backup Keys** → Optional: encrypt and download JSON file
3. **Configure Storage** → Add S3/R2 bucket credentials
4. **Encrypt & Upload** → Files encrypted locally, sent to your bucket
5. **Restore on New Device** → Import key backup + configure storage

### Initial Setup

1. **Create Your Keys**
   - Click "Create New Keys" on login page
   - Save your Public Key (for reference)
   - Save your Private Key (keep it secret!)
   - Download encrypted backup (recommended)

2. **Configure Storage**
   - Go to **Settings** (gear icon)
   - Select provider: **Cloudflare R2**, **AWS S3**, or **Custom**
   - Enter credentials:
     - Endpoint URL
     - Bucket name
     - Access Key ID & Secret
   - Test connection ✓

3. **Start Using**
   - Drag & drop files to encrypt and upload
   - Files are encrypted before leaving your device
   - Only encrypted data reaches your storage provider

### Accessing on Another Device

1. On login page, click "Import Existing Keys"
2. Upload your key backup file (`.json`)
3. Enter password if key backup was encrypted
4. Add your storage credentials again
5. Ready to go!

### Cloudflare R2 Setup

2. Generate API token with S3 permissions
3. In R2 bucket settings, go to **CORS** and add:

```json
[
  {
    "AllowedOrigins": ["https://your-app.com", "http://localhost:3003"],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["*"],
    "MaxAgeSeconds": 86400
  }
]
```

4. Use `https://<account-id>.r2.cloudflarestorage.com` as endpoint

## 📁 What's Inside

| Folder | Purpose |
|--------|---------|
| `/src/app/` | Pages: login, files manager, share page |
| `/src/lib/e2ee.ts` | AES-256-GCM encryption engine |
| `/src/lib/manifest.ts` | Encrypted file metadata (HKDF key derivation) |
| `/src/lib/notes.ts` | Encrypted markdown notes system |
| `/src/lib/storage-client.ts` | S3/R2 upload/download |
| `/src/lib/crypto.ts` | Ed25519 auth signatures |
| `/src/components/` | UI components (React) |

## 🔐 How It Works

```
Your Device                    Your S3/R2 Bucket
    │                                 │
    ├─ Encrypt file                   │
    ├─ Upload encrypted ──────────────┤
    ├─ Store key in manifest          │
    │                                 │
    └──────────────────────────────────┘
       All keys stay on your device
       Only encrypted data in bucket
```

**Key Points:**
- Master key: derived from your Ed25519 private key, never stored
- File keys: encrypted in manifest on your bucket
- No central server: direct connection to your storage provider

## 📦 Tech Stack

- **Next.js 16** - App Router, Server Components
- **React 19** - Client components
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **AWS SDK v3** - S3/R2 client
- **@noble/ed25519** - Auth signatures
- **Web Crypto API** - Browser encryption

## 📤 Sharing Files

Share with password-protected links:

```
https://your-app.com/share?s=<encrypted_file>
https://your-app.com/share?note=<encrypted_note>
```

Recipients enter the share password to decrypt. The URL contains only the encrypted bundle + presigned download link.

## 📜 License

GNU General Public License v3.0 - See [LICENSE](LICENSE) for details.

---

**⚠️ Security Note:** This software encrypts in your browser. Always verify the code. If you lose your password, your files cannot be recovered.
