'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { EncryptionService } from '@/lib/encryption';
import { toast } from 'sonner';

interface ApiKey {
  _id: string;
  label: string;
  encryptedKey: string;
  notes: string;
  tags: string[];
  provider: string;
  environment: string;
  createdAt: string;
  lastAccessed: string;
}

interface AddKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyAdded: () => void;
  masterPassword: string;
  editingKey?: ApiKey | null;
}

export function AddKeyDialog({
  isOpen,
  onClose,
  onKeyAdded,
  masterPassword,
  editingKey,
}: AddKeyDialogProps) {
  const [label, setLabel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [notes, setNotes] = useState('');
  const [provider, setProvider] = useState('other');
  const [environment, setEnvironment] = useState('production');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingKey && isOpen) {
      setLabel(editingKey.label);
      setNotes(editingKey.notes);
      setProvider(editingKey.provider);
      setEnvironment(editingKey.environment);
      setTags(editingKey.tags);
      
      // Decrypt the key for editing
      try {
        const decryptedKey = EncryptionService.decrypt(editingKey.encryptedKey, masterPassword);
        setApiKey(decryptedKey);
      } catch (error) {
        toast.error('Failed to decrypt API key for editing');
      }
    } else if (!editingKey && isOpen) {
      // Reset form for new key
      setLabel('');
      setApiKey('');
      setNotes('');
      setProvider('other');
      setEnvironment('production');
      setTags([]);
      setTagInput('');
    }
  }, [editingKey, isOpen, masterPassword]);

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const encryptedKey = EncryptionService.encrypt(apiKey, masterPassword);

      const payload = {
        label,
        encryptedKey,
        notes,
        tags,
        provider,
        environment,
      };

      const url = editingKey ? `/api/keys/${editingKey._id}` : '/api/keys';
      const method = editingKey ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingKey ? 'API key updated successfully' : 'API key added successfully');
        onKeyAdded();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save API key');
      }
    } catch (error) {
      toast.error('Failed to encrypt and save API key');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingKey ? 'Edit API Key' : 'Add New API Key'}
          </DialogTitle>
          <DialogDescription>
            {editingKey 
              ? 'Update your API key details.' 
              : 'Add a new API key to your secure vault.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label *</Label>
            <Input
              id="label"
              placeholder="e.g., Stripe Production API"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key *</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="aws">AWS</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-gray-500 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !label || !apiKey}>
              {isLoading ? 'Saving...' : editingKey ? 'Update Key' : 'Add Key'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}