'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Shield, User, Download, Upload, Trash2, Key, ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [exportData, setExportData] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [autoLock, setAutoLock] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/keys/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/keys/export');
      if (response.ok) {
        const data = await response.json();
        setExportData(data);
        
        // Download the file
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `securekeys-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Keys exported successfully');
      } else {
        toast.error('Failed to export keys');
      }
    } catch (error) {
      toast.error('Failed to export keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (overwrite = false) => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    setIsLoading(true);
    try {
      const fileContent = await importFile.text();
      const importData = JSON.parse(fileContent);
      
      if (!importData.keys || !Array.isArray(importData.keys)) {
        toast.error('Invalid import file format');
        return;
      }

      const response = await fetch('/api/keys/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keys: importData.keys,
          overwrite,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        if (result.errors.length > 0) {
          console.warn('Import warnings:', result.errors);
        }
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to import keys');
      }
    } catch (error) {
      toast.error('Failed to parse import file');
    } finally {
      setIsLoading(false);
      setImportFile(null);
    }
  };

  const handleDeleteAllKeys = async () => {
    if (!confirm('Are you sure you want to delete ALL your API keys? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      // We'll need to implement this endpoint
      const response = await fetch('/api/keys/bulk-delete', {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('All keys deleted successfully');
        fetchStats();
      } else {
        toast.error('Failed to delete keys');
      }
    } catch (error) {
      toast.error('Failed to delete keys');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Shield className="h-12 w-12 text-blue-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold">Settings</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {session?.user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Manage your account details and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={session?.user?.email || ''}
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Email address cannot be changed at this time.
                  </p>
                </div>
                
                {stats && (
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{stats.totalKeys}</p>
                      <p className="text-sm text-muted-foreground">Total API Keys</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {stats.providerStats?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Providers</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure security options for your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-lock vault</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically lock your vault after 15 minutes of inactivity
                    </p>
                  </div>
                  <Switch
                    checked={autoLock}
                    onCheckedChange={setAutoLock}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Change Master Password</h4>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Changing your master password will require you to re-encrypt all your API keys.
                      This feature is coming soon.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Data
                </CardTitle>
                <CardDescription>
                  Download your encrypted API keys as a backup.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExport} disabled={isLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  {isLoading ? 'Exporting...' : 'Export All Keys'}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Your keys will be exported in encrypted format. Keep this file secure.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import Data
                </CardTitle>
                <CardDescription>
                  Import API keys from a previously exported file.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="import-file">Select Import File</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleImport(false)}
                    disabled={!importFile || isLoading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import (Skip Duplicates)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleImport(true)}
                    disabled={!importFile || isLoading}
                  >
                    Import (Overwrite Duplicates)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that will permanently delete your data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAllKeys}
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All API Keys
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  This action cannot be undone. All your API keys will be permanently deleted.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>
                  Customize how your data is displayed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show sensitive data by default</Label>
                    <p className="text-sm text-muted-foreground">
                      Reveal API keys without clicking the eye icon
                    </p>
                  </div>
                  <Switch
                    checked={showSensitiveData}
                    onCheckedChange={setShowSensitiveData}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}