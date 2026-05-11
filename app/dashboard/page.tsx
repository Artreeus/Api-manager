'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, Filter, Shield, LogOut, Key, Settings, Sparkles, Zap, Globe, BarChart3, Activity, Brain } from 'lucide-react';
import { ThreeBackground } from '@/components/ThreeBackground';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { MasterPasswordDialog } from '@/components/MasterPasswordDialog';
import { AddKeyDialog } from '@/components/AddKeyDialog';
import { ApiKeyCard } from '@/components/ApiKeyCard';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { BulkActions } from '@/components/BulkActions';
import { RecentActivity } from '@/components/RecentActivity';
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

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<ApiKey[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showMasterPasswordDialog, setShowMasterPasswordDialog] = useState(false);
  const [showAddKeyDialog, setShowAddKeyDialog] = useState(false);
  const [masterPasswordError, setMasterPasswordError] = useState('');
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    fetchApiKeys();
  }, [session, status, router]);

  useEffect(() => {
    filterKeys();
  }, [apiKeys, searchQuery, selectedProvider, selectedEnvironment, selectedTag]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      if (response.ok) {
        const keys = await response.json();
        setApiKeys(keys);
      } else {
        toast.error('Failed to fetch API keys');
      }
    } catch (error) {
      toast.error('Failed to fetch API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const filterKeys = () => {
    let filtered = apiKeys;

    if (searchQuery) {
      filtered = filtered.filter(key =>
        key.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedProvider !== 'all') {
      filtered = filtered.filter(key => key.provider === selectedProvider);
    }

    if (selectedEnvironment !== 'all') {
      filtered = filtered.filter(key => key.environment === selectedEnvironment);
    }

    if (selectedTag !== 'all') {
      filtered = filtered.filter(key => key.tags.includes(selectedTag));
    }

    setFilteredKeys(filtered);
  };

  const handleMasterPasswordSubmit = (password: string) => {
    if (password.length < 4) {
      setMasterPasswordError('Master password must be at least 4 characters');
      return;
    }
    
    setMasterPassword(password);
    setIsUnlocked(true);
    setShowMasterPasswordDialog(false);
    setMasterPasswordError('');
    toast.success('🔓 Vault unlocked successfully');
  };

  const handleAddKey = () => {
    if (!isUnlocked) {
      setShowMasterPasswordDialog(true);
      return;
    }
    setEditingKey(null);
    setShowAddKeyDialog(true);
  };

  const handleEditKey = (key: ApiKey) => {
    if (!isUnlocked) {
      setShowMasterPasswordDialog(true);
      return;
    }
    setEditingKey(key);
    setShowAddKeyDialog(true);
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('🗑️ API key deleted successfully');
        fetchApiKeys();
        setSelectedKeys(selectedKeys.filter(id => id !== keyId));
      } else {
        toast.error('Failed to delete API key');
      }
    } catch (error) {
      toast.error('Failed to delete API key');
    }
  };

  const handleUnlockVault = () => {
    setShowMasterPasswordDialog(true);
  };

  const handleLockVault = () => {
    setIsUnlocked(false);
    setMasterPassword('');
    setSelectedKeys([]);
    toast.success('🔒 Vault locked successfully');
  };

  const handleToggleVault = () => {
    if (isUnlocked) {
      handleLockVault();
    } else {
      handleUnlockVault();
    }
  };

  const handleSearchFocus = () => {
    searchInputRef.current?.focus();
  };

  const handleKeySelection = (keyId: string, selected: boolean) => {
    if (selected) {
      setSelectedKeys([...selectedKeys, keyId]);
    } else {
      setSelectedKeys(selectedKeys.filter(id => id !== keyId));
    }
  };

  const getAllTags = () => {
    const allTags = apiKeys.flatMap(key => key.tags);
    return Array.from(new Set(allTags));
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-6"
          >
            <Shield className="h-16 w-16 text-blue-400 mx-auto" />
          </motion.div>
          <p className="text-gray-300 text-lg">Initializing secure vault...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <ThreeBackground variant="solar-system" intensity={0.8} />
      <KeyboardShortcuts
        onAddKey={handleAddKey}
        onSearch={handleSearchFocus}
        onToggleVault={handleToggleVault}
      />

      {/* Header */}
      <motion.header 
        className="backdrop-blur-xl border-b border-white/10 relative z-10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <Shield className="h-10 w-10 text-blue-400" />
                <motion.div
                  className="absolute inset-0 bg-blue-400 rounded-full opacity-20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SecureKeys
              </h1>
            </motion.div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">
                {session?.user?.email}
              </span>
              
              <Link href="/analytics">
                <AnimatedButton variant="cyber" size="sm">
                  <BarChart3 className="h-4 w-4" />
                </AnimatedButton>
              </Link>

              <Link href="/health">
                <AnimatedButton variant="solar" size="sm">
                  <Activity className="h-4 w-4" />
                </AnimatedButton>
              </Link>
              
              <Link href="/settings">
                <AnimatedButton variant="cosmic" size="sm">
                  <Settings className="h-4 w-4" />
                </AnimatedButton>
              </Link>
              
              {isUnlocked ? (
                <AnimatedButton
                  variant="premium"
                  size="sm"
                  onClick={handleLockVault}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Lock Vault
                </AnimatedButton>
              ) : (
                <AnimatedButton
                  variant="glow"
                  size="sm"
                  onClick={handleUnlockVault}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Unlock Vault
                </AnimatedButton>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {[
                {
                  icon: Key,
                  value: apiKeys.length,
                  label: 'Total Keys',
                  variant: 'cyber' as const
                },
                {
                  icon: Shield,
                  value: isUnlocked ? 'Unlocked' : 'Locked',
                  label: 'Vault Status',
                  variant: isUnlocked ? 'solar' as const : 'premium' as const
                },
                {
                  icon: Filter,
                  value: filteredKeys.length,
                  label: 'Filtered Keys',
                  variant: 'cosmic' as const
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <GlassCard variant={stat.variant} hover className="p-6">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <stat.icon className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-gray-300">{stat.label}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>

            {/* Controls */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search keys, notes, or tags... (⌘K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-xl"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger className="w-[130px] bg-white/10 border-white/20 text-white backdrop-blur-xl">
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20 text-white">
                    <SelectItem value="all">All Providers</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="aws">AWS</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                  <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white backdrop-blur-xl">
                    <SelectValue placeholder="Environment" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20 text-white">
                    <SelectItem value="all">All Environments</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
                
                {getAllTags().length > 0 && (
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="w-[120px] bg-white/10 border-white/20 text-white backdrop-blur-xl">
                      <SelectValue placeholder="Tags" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20 text-white">
                      <SelectItem value="all">All Tags</SelectItem>
                      {getAllTags().map(tag => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <AnimatedButton variant="solar" onClick={handleAddKey}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Key
                </AnimatedButton>
              </div>
            </motion.div>

            {/* Bulk Actions */}
            {filteredKeys.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <BulkActions
                  selectedKeys={selectedKeys}
                  allKeys={filteredKeys}
                  onSelectionChange={setSelectedKeys}
                  onKeysDeleted={fetchApiKeys}
                />
              </motion.div>
            )}

            {/* API Keys Grid */}
            <AnimatePresence>
              {filteredKeys.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                >
                  <GlassCard variant="cosmic" className="text-center py-16">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Key className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {apiKeys.length === 0 ? 'No API Keys Yet' : 'No Keys Found'}
                    </h3>
                    <p className="text-gray-300 mb-8 max-w-md mx-auto">
                      {apiKeys.length === 0 
                        ? 'Add your first API key to get started with secure key management.'
                        : 'Try adjusting your search or filter criteria.'
                      }
                    </p>
                    {apiKeys.length === 0 && (
                      <AnimatedButton variant="solar" onClick={handleAddKey}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Add Your First Key
                      </AnimatedButton>
                    )}
                  </GlassCard>
                </motion.div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  {filteredKeys.map((key, index) => (
                    <motion.div
                      key={key._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="relative"
                    >
                      {selectedKeys.length > 0 && (
                        <div className="absolute top-4 left-4 z-10">
                          <Checkbox
                            checked={selectedKeys.includes(key._id)}
                            onCheckedChange={(checked) => handleKeySelection(key._id, checked as boolean)}
                            className="bg-white/20 border-white/40"
                          />
                        </div>
                      )}
                      <ApiKeyCard
                        apiKey={key}
                        masterPassword={masterPassword}
                        onEdit={handleEditKey}
                        onDelete={handleDeleteKey}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <RecentActivity userId={session?.user?.id || ''} />
            
            <GlassCard variant="solar" className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <AnimatedButton
                  variant="cosmic"
                  className="w-full justify-start"
                  onClick={handleAddKey}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Key
                </AnimatedButton>
                <Link href="/analytics">
                  <AnimatedButton
                    variant="cyber"
                    className="w-full justify-start"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </AnimatedButton>
                </Link>
                <Link href="/health">
                  <AnimatedButton
                    variant="solar"
                    className="w-full justify-start"
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    Health Check
                  </AnimatedButton>
                </Link>
                <Link href="/settings">
                  <AnimatedButton
                    variant="default"
                    className="w-full justify-start"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </AnimatedButton>
                </Link>
              </div>
            </GlassCard>

            <GlassCard variant="cosmic" className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-cyan-400" />
                AI Insights
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Get intelligent recommendations for your API key management.
              </p>
              <Link href="/analytics?tab=ai-insights">
                <AnimatedButton variant="cosmic" className="w-full">
                  <Brain className="mr-2 h-4 w-4" />
                  View Insights
                </AnimatedButton>
              </Link>
            </GlassCard>
          </motion.div>
        </div>
      </main>

      {/* Dialogs */}
      <MasterPasswordDialog
        isOpen={showMasterPasswordDialog}
        onPasswordSubmit={handleMasterPasswordSubmit}
        onClose={() => {
          setShowMasterPasswordDialog(false);
          setMasterPasswordError('');
        }}
        error={masterPasswordError}
      />

      <AddKeyDialog
        isOpen={showAddKeyDialog}
        onClose={() => {
          setShowAddKeyDialog(false);
          setEditingKey(null);
        }}
        onKeyAdded={fetchApiKeys}
        masterPassword={masterPassword}
        editingKey={editingKey}
      />
    </div>
  );
}