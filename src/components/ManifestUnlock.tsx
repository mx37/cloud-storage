"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, KeyRound } from "lucide-react";
import { 
  manifestExists, 
  initializeManifest, 
  unlockManifest 
} from "@/lib/manifest";
import { StorageConfig } from "@/lib/settings";
import { useAuth } from "@/contexts/AuthContext";

interface ManifestUnlockProps {
  config: StorageConfig;
  onUnlocked: () => void;
}

export function ManifestUnlock({ config, onUnlocked }: ManifestUnlockProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manifestExists_, setManifestExists] = useState(false);

  // Check if manifest exists on mount
  useEffect(() => {
    checkManifest();
  }, []);

  async function checkManifest() {
    setIsLoading(true);
    setError(null);
    try {
      const exists = await manifestExists(config);
      setManifestExists(exists);
      
      // If manifest exists, try to auto-unlock
      if (exists) {
        await attemptUnlock();
      }
    } catch (err) {
      console.error("Failed to check manifest:", err);
      setManifestExists(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function attemptUnlock() {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    try {
      const keyData = localStorage.getItem(`key_pair_${user.id}`);
      if (!keyData) {
        setError("Private key not found");
        return;
      }

      const { privateKey } = JSON.parse(keyData);
      await unlockManifest(config, privateKey);
      onUnlocked();
    } catch (err) {
      console.error("Unlock error:", err);
      setError("Manifest keys don't match. You may have configured a different storage.");
    }
  }

  async function handleInitialize() {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const keyData = localStorage.getItem(`key_pair_${user.id}`);
      if (!keyData) {
        setError("Private key not found");
        setIsLoading(false);
        return;
      }

      const { privateKey } = JSON.parse(keyData);
      await initializeManifest(config, privateKey);
      onUnlocked();
    } catch (err) {
      console.error("Initialize error:", err);
      setError("Failed to initialize encrypted storage");
      setIsLoading(false);
    }
  }

  // Case 1: Manifest not initialized - show init button
  if (!manifestExists_ && !error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Initialize Encryption</h2>
            <p className="text-sm text-slate-400">
              Set up encrypted storage for your files and notes
            </p>
          </div>

          <Button
            onClick={handleInitialize}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              "Initializing..."
            ) : (
              <>
                <KeyRound className="h-4 w-4 mr-2" />
                Click to initialize
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Case 2: Manifest exists but keys don't match
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-950/30 border border-red-600/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Storage Mismatch</h2>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Success - don't render anything visible
  return null;
}
