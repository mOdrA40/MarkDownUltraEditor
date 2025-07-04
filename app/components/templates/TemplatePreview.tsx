/**
 * Template preview dialog component
 */

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import type { TemplatePreviewProps } from '@/types/templates';
import {
  getThemeAwareDifficultyClasses,
  formatCategoryName,
  formatDifficultyName,
} from '@/utils/templateUtils';

/**
 * Preview dialog untuk menampilkan detail template
 */
export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!template) return null;

  const handleSelect = () => {
    onSelect(template);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="document-templates-dialog w-[95vw] max-w-4xl h-[85vh] flex flex-col p-0 mx-auto">
        <DialogHeader className="p-3 sm:p-4 pb-2 flex-shrink-0 pr-12">
          <DialogTitle className="flex flex-col gap-3">
            {/* Template Info Row */}
            <div className="flex items-center">
              <span className="text-lg sm:text-2xl mr-2">{template.icon}</span>
              <span className="text-sm sm:text-base">{template.name}</span>
              <Badge
                className={`ml-2 text-xs ${getThemeAwareDifficultyClasses(template.difficulty)}`}
              >
                {formatDifficultyName(template.difficulty)}
              </Badge>
            </div>

            {/* Action Button Row */}
            <div className="flex justify-start">
              <Button
                onClick={handleSelect}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-xs sm:text-sm"
                size="sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Use This Template
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Template Info Sidebar */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-muted/20 p-2 sm:p-3 md:p-4 overflow-auto flex-shrink-0">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">Description</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">{template.description}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">Details</h4>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="capitalize">{formatCategoryName(template.category)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Difficulty:</span>
                    <span className="capitalize">{formatDifficultyName(template.difficulty)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{template.estimatedTime}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Template Content Preview */}
          <div className="template-preview-content flex-1 overflow-auto p-2 sm:p-3 md:p-4 min-h-0">
            <div className="prose prose-sm max-w-none dark:prose-invert h-full">
              <div className="h-full overflow-y-auto">
                <pre className="template-preview-content whitespace-pre-wrap text-xs sm:text-sm bg-muted/50 p-2 sm:p-3 md:p-4 rounded-lg border min-h-full">
                  {template.content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
