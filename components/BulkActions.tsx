'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Tag, Download } from 'lucide-react';
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

interface BulkActionsProps {
  selectedKeys: string[];
  allKeys: ApiKey[];
  onSelectionChange: (selectedIds: string[]) => void;
  onKeysDeleted: () => void;
}

export function BulkActions({ selectedKeys, allKeys, onSelectionChange, onKeysDeleted }: BulkActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(allKeys.map(key => key._id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedKeys.length} API keys?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const deletePromises = selectedKeys.map(keyId =>
        fetch(`/api/keys/${keyId}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      toast.success(`Successfully deleted ${selectedKeys.length} API keys`);
      onSelectionChange([]);
      onKeysDeleted();
    } catch (error) {
      toast.error('Failed to delete some API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkExport = () => {
    const selectedKeysData = allKeys.filter(key => selectedKeys.includes(key._id));
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      keys: selectedKeysData.map(key => ({
        label: key.label,
        encryptedKey: key.encryptedKey,
        notes: key.notes,
        tags: key.tags,
        provider: key.provider,
        environment: key.environment,
        createdAt: key.createdAt,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securekeys-selected-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${selectedKeys.length} API keys`);
  };

  if (allKeys.length === 0) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={selectedKeys.length === allKeys.length}
          onCheckedChange={handleSelectAll}
        />
        <span className="text-sm font-medium">
          {selectedKeys.length > 0 
            ? `${selectedKeys.length} selected`
            : 'Select all'
          }
        </span>
      </div>

      {selectedKeys.length > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Selected
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={handleBulkDelete}
                disabled={isLoading}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}