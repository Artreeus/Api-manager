'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Copy, Eye, EyeOff, MoreHorizontal, Edit, Trash2, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { EncryptionService } from '@/lib/encryption';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

interface ApiKeyCardProps {
  apiKey: ApiKey;
  masterPassword: string;
  onEdit: (apiKey: ApiKey) => void;
  onDelete: (id: string) => void;
}

export function ApiKeyCard({ apiKey, masterPassword, onEdit, onDelete }: ApiKeyCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [decryptedKey, setDecryptedKey] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const toggleReveal = async () => {
    if (!isRevealed && !decryptedKey) {
      setIsDecrypting(true);
      try {
        const key = EncryptionService.decrypt(apiKey.encryptedKey, masterPassword);
        setDecryptedKey(key);
        setIsRevealed(true);
        
        // Update last accessed
        await fetch(`/api/keys/${apiKey._id}`, {
          method: 'PATCH',
        });
      } catch (error) {
        toast.error('Failed to decrypt API key');
      } finally {
        setIsDecrypting(false);
      }
    } else {
      setIsRevealed(!isRevealed);
    }
  };

  const copyToClipboard = async () => {
    if (!decryptedKey) {
      try {
        const key = EncryptionService.decrypt(apiKey.encryptedKey, masterPassword);
        await navigator.clipboard.writeText(key);
        toast.success('✨ API key copied to clipboard');
      } catch (error) {
        toast.error('Failed to decrypt and copy API key');
      }
    } else {
      await navigator.clipboard.writeText(decryptedKey);
      toast.success('✨ API key copied to clipboard');
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'stripe':
        return '💳';
      case 'aws':
        return '☁️';
      case 'google':
        return '🔍';
      case 'github':
        return '🐙';
      case 'openai':
        return '🤖';
      default:
        return '🔑';
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'production':
        return 'from-red-500 to-orange-500';
      case 'staging':
        return 'from-yellow-500 to-amber-500';
      case 'development':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const displayKey = () => {
    if (isDecrypting) return '••••••••••••••••';
    if (!isRevealed || !decryptedKey) {
      return EncryptionService.maskApiKey('sk_live_1234567890abcdef');
    }
    return decryptedKey;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard variant="premium" hover className="p-6 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.span 
              className="text-2xl"
              whileHover={{ scale: 1.2, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {getProviderIcon(apiKey.provider)}
            </motion.span>
            <div>
              <h3 className="text-lg font-bold text-white">{apiKey.label}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs bg-gradient-to-r ${getEnvironmentColor(apiKey.environment)} text-white border-0`}>
                  {apiKey.environment}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize text-gray-300 border-gray-600">
                  {apiKey.provider}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <AnimatedButton variant="cyber" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </AnimatedButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-white/20 text-white">
              <DropdownMenuItem onClick={() => onEdit(apiKey)} className="hover:bg-white/10">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(apiKey._id)}
                className="text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">API Key</span>
              <div className="flex gap-1">
                <AnimatedButton
                  variant="cyber"
                  size="sm"
                  onClick={toggleReveal}
                  disabled={isDecrypting}
                >
                  {isRevealed ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </AnimatedButton>
                <AnimatedButton
                  variant="glow"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </AnimatedButton>
              </div>
            </div>
            <div className="font-mono text-sm bg-black/30 p-3 rounded-lg border border-white/10 text-gray-300">
              {displayKey()}
            </div>
          </div>
          
          {apiKey.notes && (
            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-300">Notes</span>
              <p className="text-sm text-gray-400">{apiKey.notes}</p>
            </div>
          )}
          
          {apiKey.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-300">Tags</span>
              <div className="flex flex-wrap gap-1">
                {apiKey.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-white/10 text-gray-300 border-white/20">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 pt-2 border-t border-white/10">
            Created: {format(new Date(apiKey.createdAt), 'MMM d, yyyy')}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}