"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, AlertCircle, Loader2, Copy, Check, Shield, Key, Lock, Cloud, Download, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  generateKeyPair,
  storeKeyPair,
  importKeyPair,
  exportKeyPair,
  downloadKeyPair,
} from "@/lib/crypto";

export default function LoginPage() {
  const [step, setStep] = useState<"initial" | "import-key" | "create-new" | "key-ready" | "password-setup">("initial");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"private" | "public" | null>(null);
  const [generatedKeyPair, setGeneratedKeyPair] = useState<{
    privateKey: string;
    publicKey: string;
  } | null>(null);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [filePassword, setFilePassword] = useState("");
  const [exportPassword, setExportPassword] = useState("");
  const [usePasswordForExport, setUsePasswordForExport] = useState(false);
  const router = useRouter();
  const { login: authLogin, user, isInitialized } = useAuth();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (user) {
      router.replace("/files");
    }
  }, [user, isInitialized, router]);

  const handleCreateNewKey = async () => {
    setError("");
    setIsLoading(true);

    try {
      const keyPair = await generateKeyPair();
      setGeneratedKeyPair(keyPair);
      setStep("key-ready");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate key pair"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadKey = async () => {
    if (!generatedKeyPair) return;

    try {
      const exportedKey = await exportKeyPair(
        generatedKeyPair.privateKey,
        generatedKeyPair.publicKey,
        usePasswordForExport ? exportPassword : undefined
      );
      downloadKeyPair(exportedKey, "cloud-keys-backup.json");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to export keys"
      );
    }
  };

  const handleImportKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!importedFile) {
        throw new Error("Please select a key file");
      }

      const fileContent = await importedFile.text();
      const keyPair = await importKeyPair(fileContent, filePassword || undefined);

      // Create a minimal user object
      const user = {
        id: keyPair.publicKey.slice(0, 16), // Use first 16 chars of public key as ID
        username: keyPair.publicKey.slice(0, 8), // Use first 8 chars as username
        publicKey: keyPair.publicKey,
      };

      // Store the key pair
      await storeKeyPair(user.id, keyPair.privateKey, keyPair.publicKey);

      // Login
      authLogin(user, keyPair.publicKey);
      setImportedFile(null);
      setFilePassword("");
      router.push("/files");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to import keys"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithGeneratedKey = async () => {
    if (!generatedKeyPair) return;

    setError("");
    setIsLoading(true);

    try {
      const user = {
        id: generatedKeyPair.publicKey.slice(0, 16),
        username: generatedKeyPair.publicKey.slice(0, 8),
        publicKey: generatedKeyPair.publicKey,
      };

      // Store the key pair
      await storeKeyPair(user.id, generatedKeyPair.privateKey, generatedKeyPair.publicKey);

      // Login
      authLogin(user, generatedKeyPair.publicKey);
      setGeneratedKeyPair(null);
      router.push("/files");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: "private" | "public") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // Key Ready Step - Show generated keys and download option
  if (step === "key-ready" && generatedKeyPair) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <h1 className="text-3xl font-bold text-white">Keys Generated!</h1>
            </div>
            <p className="text-slate-400">
              Save your keys securely before continuing
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-[#161616] border border-[#252525] rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <Label className="text-white font-semibold">Public Key</Label>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(generatedKeyPair.publicKey, "public")}
                  className="text-xs text-slate-400 hover:text-white hover:bg-[#252525]"
                >
                  {copied === "public" ? (
                    <>
                      <Check className="h-3 w-3 mr-1" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="font-mono text-xs bg-[#0f0f0f] p-4 rounded border border-[#252525] text-slate-300 break-all">
                {generatedKeyPair.publicKey}
              </div>
              <p className="text-xs text-slate-500 mt-2">✓ Safe to share publicly</p>
            </div>

            <div className="bg-[#161616] border border-red-900/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-red-400" />
                  <Label className="text-red-300 font-semibold">Private Key</Label>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(generatedKeyPair.privateKey, "private")}
                  className="text-xs text-slate-400 hover:text-white hover:bg-[#252525]"
                >
                  {copied === "private" ? (
                    <>
                      <Check className="h-3 w-3 mr-1" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="font-mono text-xs bg-[#0f0f0f] p-4 rounded border border-red-900/50 text-slate-300 break-all">
                {generatedKeyPair.privateKey}
              </div>
              <p className="text-xs text-red-400 mt-2">⚠️ NEVER share this key with anyone!</p>
            </div>

            <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-300 text-sm font-medium">Download Backup</p>
                  <p className="text-blue-400/70 text-xs mt-1">
                    Download your keys as a JSON file. You'll need this to import your account on other devices.
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="usePassword"
                        checked={usePasswordForExport}
                        onChange={(e) => setUsePasswordForExport(e.target.checked)}
                        className="w-4 h-4 rounded border-[#252525] bg-[#161616] text-blue-600"
                      />
                      <label htmlFor="usePassword" className="text-xs text-blue-300">
                        Encrypt backup with password (optional)
                      </label>
                    </div>
                    {usePasswordForExport && (
                      <Input
                        type="password"
                        value={exportPassword}
                        onChange={(e) => setExportPassword(e.target.value)}
                        placeholder="Password to encrypt backup..."
                        className="bg-[#0f0f0f] border-blue-900/50 text-white placeholder:text-slate-600 h-9 text-sm"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleDownloadKey}
              variant="outline"
              className="flex-1 border-[#252525] bg-[#161616] text-white hover:bg-[#1a1a1a] gap-2 h-12"
            >
              <Download className="h-4 w-4" />
              Download Backup
            </Button>
            <Button
              onClick={handleLoginWithGeneratedKey}
              className="flex-1 bg-white text-black hover:bg-slate-200 gap-2 h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Continuing...
                </>
              ) : (
                <>
                  Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Import Key Step
  if (step === "import-key") {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Upload className="h-8 w-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Import Keys</h1>
            </div>
            <p className="text-slate-400">
              Load your previously saved key backup file
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-950/30 border border-red-900/50 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleImportKey} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="keyFile" className="text-white">
                Key File (JSON)
              </Label>
              <div className="relative">
                <input
                  id="keyFile"
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("keyFile")?.click()}
                  className="w-full border-2 border-dashed border-[#252525] rounded-lg p-6 hover:border-slate-600 transition-colors text-center"
                >
                  <Cloud className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  {importedFile ? (
                    <>
                      <p className="text-white text-sm font-medium">{importedFile.name}</p>
                      <p className="text-xs text-slate-500 mt-1">Click to change</p>
                    </>
                  ) : (
                    <>
                      <p className="text-white text-sm font-medium">Click to select file</p>
                      <p className="text-xs text-slate-500 mt-1">or drag and drop</p>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-white">
                Password (if encrypted)
              </Label>
              <Input
                id="password"
                type="password"
                value={filePassword}
                onChange={(e) => setFilePassword(e.target.value)}
                placeholder="Leave empty if not encrypted"
                className="bg-[#161616] border-[#252525] text-white placeholder:text-slate-600 h-12"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-[#252525] bg-[#161616] text-slate-400 hover:bg-[#1a1a1a] hover:text-white h-12"
                onClick={() => {
                  setStep("initial");
                  setImportedFile(null);
                  setFilePassword("");
                  setError("");
                }}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-white text-black hover:bg-slate-200 gap-2 h-12"
                disabled={isLoading || !importedFile}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Importing...
                  </>
                ) : (
                  <>
                    Import <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Initial Step - Choose create or import
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Cloud className="h-10 w-10 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Cloud Storage</h1>
          </div>
          <p className="text-slate-400">
            Local, End-to-End Encrypted Cloud Storage
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-950/30 border border-red-900/50 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-4 mb-8">
          {/* Create New Keys */}
          <div
            onClick={() => {
              setStep("create-new");
              setError("");
              handleCreateNewKey();
            }}
            className="relative group cursor-pointer"
          >
            <div className="relative bg-[#161616] border border-[#252525] rounded-lg p-6 group-hover:border-blue-500/50 transition-colors">
              <div className="flex items-start gap-4">
          <div className="bg-blue-500/10 rounded-lg p-3">
            <Key className="h-6 w-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-semibold mb-1">Create New Keys</h2>
            <p className="text-sm text-slate-400">
              Generate a new cryptographic key pair and start using Cloud Storage
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-400">
              Get Started <ArrowRight className="h-3 w-3" />
            </div>
          </div>
              </div>
            </div>
          </div>

          {/* Import Existing Keys */}
          <div
            onClick={() => {
              setStep("import-key");
              setError("");
            }}
            className="relative group cursor-pointer"
          >
            <div className="relative bg-[#161616] border border-[#252525] rounded-lg p-6 group-hover:border-green-500/50 transition-colors">
              <div className="flex items-start gap-4">
          <div className="bg-green-500/10 rounded-lg p-3">
            <Upload className="h-6 w-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-semibold mb-1">Import Existing Keys</h2>
            <p className="text-sm text-slate-400">
              Load a previously saved key backup file from another device
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
              Import Keys <ArrowRight className="h-3 w-3" />
            </div>
          </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-900/30">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 text-sm font-medium">Local & Secure</p>
              <p className="text-blue-400/70 text-xs mt-1">
                Your keys never leave your device. All encryption happens locally. Your files are encrypted before being uploaded to your S3/R2 bucket.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
