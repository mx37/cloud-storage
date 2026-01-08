# Installation & Usage Guide

## System Requirements

- Node.js 18 or higher
- NPM or Yarn
- S3-compatible storage bucket (Cloudflare R2, AWS S3, or similar)

## Installation

```bash
# Clone repository
git clone https://github.com/mx37/cloud-storage.git
cd cloud-storage

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3003`

## Initial Setup

### Step 1: Create Your Encryption Keys

1. Open `http://localhost:3003`
2. Click **"Create New Keys"**
3. The system will generate an Ed25519 keypair locally
4. You'll see:
   - **Public Key:** Safe to share (identifies your device)
   - **Private Key:** Keep this secret! (decrypts your files)
5. **Download Backup** (recommended):
   - Optionally encrypt backup with a password
   - Save the JSON file somewhere safe
   - You'll need this to access files on other devices
6. Click **"Continue"** to proceed

### Step 2: Configure Your Storage

1. Go to **Settings** (gear icon, top right)
2. Select your storage provider:
   - **Cloudflare R2** - Recommended (free tier available)
   - **AWS S3** - Standard AWS offering
   - **Custom** - Any S3-compatible endpoint

3. Enter your credentials:
   - **Endpoint URL:** (e.g., `https://xxx.r2.cloudflarecustomers.com`)
   - **Region:** (e.g., `auto` for R2, `us-east-1` for AWS)
   - **Bucket Name:** Your S3 bucket name
   - **Access Key ID:** From your provider
   - **Secret Access Key:** From your provider
   - **Account ID:** (optional, for R2)

4. Click **"Test Connection"** to verify
5. Save when ready

### Step 3: Start Using

You're all set! You can now:
- **Upload files** via drag-and-drop
- **Create folders** to organize files
- **Download files** (automatically decrypted)
- **Share files** with encrypted links
- **View preview** for images and documents

## Using on Multiple Devices

### On a New Device

1. Go to `http://localhost:3003`
2. Click **"Import Existing Keys"**
3. Click to select your key backup JSON file
4. If encrypted, enter your password
5. Click **"Import"**
6. You're logged in! Configure storage again in Settings
7. Your files are now accessible

### Key Backup Safety

**With Password Encryption:**
- Backup file is encrypted with AES-256-GCM
- Uses PBKDF2 with 100,000 iterations
- Safe to store in cloud or share via email
- Without password, backup is useless

**Plaintext Backup:**
- More convenient but less secure
- Keep in a safe location
- Don't share or upload to untrusted services

## Cloudflare R2 Setup (Recommended)

1. **Create Cloudflare Account** → https://dash.cloudflare.com
2. **Create R2 Bucket:**
   - Go to R2 in dashboard
   - Create new bucket (name it something like `cloud-storage`)
   - Block public access (keep private)
3. **Generate API Token:**
   - Go to R2 settings
   - Create API token with "Edit" permissions
   - Note the Endpoint URL (shown in bucket list)
4. **In Cloud Storage Settings:**
   ```
   Provider: Cloudflare R2
   Endpoint: https://[your-account-id].r2.cloudflarecustomers.com
   Region: auto
   Bucket: [bucket-name]
   Access Key: [from API token]
   Secret Key: [from API token]
   Account ID: [your-account-id]
   ```

## AWS S3 Setup

1. **Create AWS Account** → https://aws.amazon.com
2. **Create S3 Bucket:**
   - Go to S3 in AWS Console
   - Create bucket with default settings
   - Block public access
3. **Create IAM User:**
   - Go to IAM → Users
   - Create user with "programmatic access"
   - Attach policy: `AmazonS3FullAccess` (or custom with GetObject/PutObject)
   - Save Access Key ID and Secret Access Key
4. **In Cloud Storage Settings:**
   ```
   Provider: AWS S3
   Endpoint: https://s3.[region].amazonaws.com
   Region: us-east-1 (or your region)
   Bucket: [bucket-name]
   Access Key: [from IAM user]
   Secret Key: [from IAM user]
   ```

## Security Best Practices

### Keys
- ✅ Download and backup your keys regularly
- ✅ Use password encryption on backups
- ✅ Store backups in multiple safe locations
- ✅ Never share your private key
- ✅ Never upload private key to cloud without encryption

### Files
- ✅ All files encrypted locally before upload
- ✅ Storage provider never sees plaintext
- ✅ EXIF data automatically stripped from images
- ✅ Secure deletion possible by deleting from bucket

### Storage Credentials
- ✅ Created read-only tokens when possible
- ✅ Rotate credentials occasionally
- ✅ Don't share bucket access with untrusted parties
- ✅ Monitor bucket for unauthorized access

## Troubleshooting

### "Failed to connect to storage"
- Check endpoint URL is correct
- Verify credentials are valid
- Ensure bucket exists and is accessible
- Check network connection

### "Import failed - wrong password"
- Re-enter password carefully (case-sensitive)
- If forgotten, key backup is unrecoverable
- You'll need to generate new keys

### "Upload failed"
- Check storage connection (Settings → Test Connection)
- Ensure you have write permissions on bucket
- Check available storage space
- Verify browser localStorage isn't full

### Lost Your Keys?
- If you have a backup: Import it
- If no backup: Generate new keys and reconfigure storage
- Old encrypted files will be inaccessible without original keys
- This is by design (zero-knowledge architecture)

## Performance Tips

- Use Cloudflare R2 for fastest uploads
- Enable compression in browser if network is slow

## Advanced Usage

### Self-Hosted S3
```
Provider: Custom
Endpoint: https://s3.example.com
Bucket: your-bucket
Credentials: Your server's S3 credentials
```

## Support & Issues

- Report issues via GitHub Issues
- Check browser console for error messages

## License

GPL 3.0 - See LICENSE file for details
