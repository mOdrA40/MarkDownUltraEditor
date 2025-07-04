/**
 * Individual template card component
 */

import { ArrowRight, Clock, Eye, Tag } from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { CategoryIcons, TemplateCardProps } from '@/types/templates';
import {
  categoryIcons,
  getThemeAwareCardClasses,
  getThemeAwareDifficultyClasses,
  getTruncatedTags,
} from '@/utils/templateUtils';

/**
 * Individual template card dengan grid/list view support
 */
export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  viewMode,
  isMobile,
  isTablet,
  onPreview,
  onSelect,
}) => {
  const CategoryIcon = categoryIcons[template.category as keyof CategoryIcons];
  const cardClasses = getThemeAwareCardClasses(viewMode);
  const { visibleTags, remainingCount, hasMore } = getTruncatedTags(template.tags, 3);

  const handlePreview = () => onPreview(template);
  const handleSelect = () => onSelect(template);

  return (
    <Card className={`template-card ${cardClasses}`}>
      {viewMode === 'grid' ? (
        <CardContent className="p-4">
          {/* Header dengan icon dan difficulty */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <span className="text-lg">{template.icon}</span>
              </div>
              <CategoryIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <Badge className={getThemeAwareDifficultyClasses(template.difficulty)}>
              {template.difficulty}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
            {template.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>

          {/* Meta info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{template.estimatedTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Tag className="h-3 w-3" />
              <span>{template.tags.length} tags</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {visibleTags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {hasMore && (
              <Badge variant="outline" className="text-xs">
                +{remainingCount}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button size="sm" onClick={handlePreview} variant="outline" className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={handleSelect}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              Use
            </Button>
          </div>
        </CardContent>
      ) : (
        <CardContent className={`w-full ${isMobile ? 'p-4' : 'flex items-center p-4'}`}>
          {isMobile ? (
            // Mobile List Layout - Vertical Stack
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex-shrink-0">
                  <span className="text-lg">{template.icon}</span>
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="mb-2">
                    <h3 className="font-semibold text-base leading-tight mb-1 pr-2">
                      {template.name}
                    </h3>
                    <Badge
                      className={`inline-block ${getThemeAwareDifficultyClasses(template.difficulty)}`}
                    >
                      {template.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <CategoryIcon className="h-3 w-3" />
                  <span className="capitalize">{template.category}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{template.estimatedTime}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" onClick={handlePreview} variant="outline" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  onClick={handleSelect}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Use
                </Button>
              </div>
            </div>
          ) : isTablet ? (
            // Tablet List Layout - Vertical Stack (like mobile)
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex-shrink-0">
                  <span className="text-lg">{template.icon}</span>
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="mb-2">
                    <h3 className="font-semibold text-lg leading-tight mb-1 pr-2">
                      {template.name}
                    </h3>
                    <Badge
                      className={`inline-block ${getThemeAwareDifficultyClasses(template.difficulty)}`}
                    >
                      {template.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <CategoryIcon className="h-3 w-3" />
                  <span className="capitalize">{template.category}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{template.estimatedTime}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" onClick={handlePreview} variant="outline" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  onClick={handleSelect}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Use Template
                </Button>
              </div>
            </div>
          ) : (
            // Desktop List Layout - Horizontal
            <div className="flex items-start space-x-4 flex-1">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex-shrink-0">
                <span className="text-lg">{template.icon}</span>
              </div>

              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="font-semibold text-lg truncate mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                  <Badge
                    className={`flex-shrink-0 ${getThemeAwareDifficultyClasses(template.difficulty)}`}
                  >
                    {template.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <CategoryIcon className="h-3 w-3" />
                    <span className="capitalize">{template.category}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{template.estimatedTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={handlePreview}
                  variant="outline"
                  className="min-w-[80px]"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  onClick={handleSelect}
                  className="min-w-[80px] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Use
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
