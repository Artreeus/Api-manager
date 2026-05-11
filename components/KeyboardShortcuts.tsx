'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

interface KeyboardShortcutsProps {
  onAddKey: () => void;
  onSearch: () => void;
  onToggleVault: () => void;
}

export function KeyboardShortcuts({ onAddKey, onSearch, onToggleVault }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Cmd/Ctrl + K for search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onSearch();
        return;
      }

      // Cmd/Ctrl + N for new key
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        onAddKey();
        return;
      }

      // Cmd/Ctrl + L for lock/unlock vault
      if ((event.metaKey || event.ctrlKey) && event.key === 'l') {
        event.preventDefault();
        onToggleVault();
        return;
      }

      // ? for help
      if (event.key === '?' && !event.shiftKey) {
        event.preventDefault();
        toast.info('Keyboard Shortcuts: ⌘K (Search), ⌘N (New Key), ⌘L (Toggle Vault)');
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onAddKey, onSearch, onToggleVault]);

  return null;
}