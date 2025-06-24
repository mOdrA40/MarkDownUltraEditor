/**
 * Main KeyboardShortcuts Component
 * Menampilkan dialog dengan semua keyboard shortcuts yang tersedia
 */

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { 
  Keyboard, 
  Search, 
  Monitor, 
  Smartphone,
  X,
  Filter
} from "lucide-react";

// Import components
import { ShortcutCategory } from './components/ShortcutCategory';

// Import types and constants
import { KeyboardShortcutsProps } from './types/shortcutTypes';
import { getShortcutsForPlatform } from './constants/shortcuts';

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onClose,
  showMacKeys,
  visibleCategories
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'windows' | 'mac' | 'auto'>('auto');
  
  // Deteksi platform otomatis
  const isMac = useMemo(() => {
    if (typeof window !== 'undefined') {
      return /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
    }
    return false;
  }, []);

  // Tentukan apakah menggunakan Mac keys
  const shouldShowMacKeys = useMemo(() => {
    if (showMacKeys !== undefined) return showMacKeys;
    if (selectedPlatform === 'mac') return true;
    if (selectedPlatform === 'windows') return false;
    return isMac; // auto detection
  }, [showMacKeys, selectedPlatform, isMac]);

  // Gabungkan default shortcuts dengan custom shortcuts
  const allShortcuts = useMemo(() => {
    return getShortcutsForPlatform(shouldShowMacKeys ? 'mac' : 'windows');
  }, [shouldShowMacKeys]);

  // Filter shortcuts berdasarkan search dan visible categories
  const filteredShortcuts = useMemo(() => {
    let filtered = allShortcuts;

    // Filter berdasarkan visible categories
    if (visibleCategories && visibleCategories.length > 0) {
      filtered = filtered.filter(cat => visibleCategories.includes(cat.category));
    }

    // Filter berdasarkan search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.map(category => ({
        ...category,
        items: category.items.filter(item => 
          item.description.toLowerCase().includes(term) ||
          item.keys.some(key => key.toLowerCase().includes(term))
        )
      })).filter(category => category.items.length > 0);
    }

    return filtered.sort((a, b) => (a.order || 999) - (b.order || 999));
  }, [allShortcuts, searchTerm, visibleCategories]);

  // Statistik shortcuts
  const stats = useMemo(() => {
    const totalShortcuts = allShortcuts.reduce((sum, cat) => sum + cat.items.length, 0);
    const filteredCount = filteredShortcuts.reduce((sum, cat) => sum + cat.items.length, 0);
    const categoriesCount = filteredShortcuts.length;
    
    return {
      total: totalShortcuts,
      filtered: filteredCount,
      categories: categoriesCount
    };
  }, [allShortcuts, filteredShortcuts]);

  /**
   * Handle clear search
   */
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  /**
   * Handle platform change
   */
  const handlePlatformChange = (platform: 'windows' | 'mac' | 'auto') => {
    setSelectedPlatform(platform);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 p-6 pb-4">
          <DialogTitle className="flex items-center justify-between pr-8">
            <div className="flex items-center">
              <Keyboard className="h-5 w-5 mr-2" />
              Keyboard Shortcuts
              <Badge variant="secondary" className="ml-2 text-xs">
                {stats.filtered} shortcuts
              </Badge>
            </div>
            
            {/* Platform Selector */}
            <div className="flex items-center space-x-1">
              <Button
                variant={selectedPlatform === 'auto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePlatformChange('auto')}
                className="h-7 text-xs"
              >
                Auto
              </Button>
              <Button
                variant={selectedPlatform === 'windows' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePlatformChange('windows')}
                className="h-7 text-xs"
              >
                <Monitor className="h-3 w-3 mr-1" />
                Windows
              </Button>
              <Button
                variant={selectedPlatform === 'mac' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePlatformChange('mac')}
                className="h-7 text-xs"
              >
                <Smartphone className="h-3 w-3 mr-1" />
                macOS
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="flex items-center space-x-2 flex-shrink-0 px-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari shortcuts atau deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {/* Results Info */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>
              {stats.categories} kategori, {stats.filtered} shortcuts
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden px-6">
          {filteredShortcuts.length === 0 ? (
            // Empty State
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Tidak ada shortcuts ditemukan
                </h3>
                <p className="text-muted-foreground mb-4">
                  Coba sesuaikan pencarian Anda atau hapus filter.
                </p>
                <Button onClick={handleClearSearch} variant="outline">
                  Hapus Pencarian
                </Button>
              </div>
            </div>
          ) : (
            // Shortcuts List
            <div className="overflow-y-auto space-y-6 pr-2 max-h-full">
              {filteredShortcuts.map((category, index) => (
                <ShortcutCategory
                  key={category.category}
                  category={category}
                  showMacKeys={shouldShowMacKeys}
                  index={index}
                  totalCategories={filteredShortcuts.length}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t flex-shrink-0 px-6 pb-6">
          <div className="flex items-center space-x-4">
            <span>
              Platform: {shouldShowMacKeys ? 'macOS' : 'Windows/Linux'}
            </span>
            {selectedPlatform === 'auto' && (
              <Badge variant="outline" className="text-xs">
                Auto-detected
              </Badge>
            )}
          </div>

          <p>
            {shouldShowMacKeys
              ? 'Gunakan ⌘ (Cmd) sebagai pengganti Ctrl'
              : 'Pada Mac, gunakan ⌘ (Cmd) sebagai pengganti Ctrl'
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
