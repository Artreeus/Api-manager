'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Shield } from 'lucide-react';

interface MasterPasswordDialogProps {
  isOpen: boolean;
  onPasswordSubmit: (password: string) => void;
  onClose: () => void;
  error?: string;
}

export function MasterPasswordDialog({
  isOpen,
  onPasswordSubmit,
  onClose,
  error,
}: MasterPasswordDialogProps) {
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onPasswordSubmit(password);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <DialogTitle>Master Password Required</DialogTitle>
          </div>
          <DialogDescription>
            Enter your master password to decrypt and view your API keys.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="masterPassword">Master Password</Label>
            <Input
              id="masterPassword"
              type="password"
              placeholder="Enter your master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!password.trim()}>
              <Lock className="mr-2 h-4 w-4" />
              Unlock
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}