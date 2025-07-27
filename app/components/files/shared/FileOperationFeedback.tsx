import { AlertCircle, CheckCircle, Loader2, RefreshCw, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/core/useToast';
import type { FileOperationError } from '@/utils/fileOperationErrors';
import { ErrorSeverity, getErrorSeverity } from '@/utils/fileOperationErrors';

export interface FileOperationLoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  operation?: string;
}

interface FileOperationLoaderProps {
  state: FileOperationLoadingState;
  className?: string;
}

export const FileOperationLoader: React.FC<FileOperationLoaderProps> = ({
  state,
  className = '',
}) => {
  if (!state.isLoading) return null;

  return (
    <div className={`flex items-center space-x-3 p-4 bg-muted/50 rounded-lg ${className}`}>
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{state.operation || 'Processing...'}</span>
          {state.progress !== undefined && (
            <span className="text-xs text-muted-foreground">{Math.round(state.progress)}%</span>
          )}
        </div>

        {state.progress !== undefined && <Progress value={state.progress} className="h-2" />}

        {state.message && <p className="text-xs text-muted-foreground">{state.message}</p>}
      </div>
    </div>
  );
};

interface FileOperationErrorProps {
  error: FileOperationError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const FileOperationErrorDisplay: React.FC<FileOperationErrorProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
}) => {
  const severity = getErrorSeverity(error.code);

  const borderColor =
    severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH
      ? 'border-red-200'
      : 'border-yellow-200';
  const bgColor =
    severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH
      ? 'bg-red-50'
      : 'bg-yellow-50';
  const textColor =
    severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH
      ? 'text-red-800'
      : 'text-yellow-800';

  return (
    <Card className={`${borderColor} ${bgColor} ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center justify-between ${textColor}`}>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>Operation Failed</span>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss} className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className={textColor}>{error.userMessage}</CardDescription>

        {error.retryable && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Try Again</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

interface FileOperationSuccessProps {
  message: string;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
  className?: string;
}

export const FileOperationSuccess: React.FC<FileOperationSuccessProps> = ({
  message,
  onDismiss,
  autoHide = true,
  autoHideDelay = 3000,
  className = '',
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onDismiss]);

  if (!visible) return null;

  return (
    <Card className={`border-green-200 bg-green-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-green-800">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Success</span>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setVisible(false);
                onDismiss();
              }}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-green-700">{message}</CardDescription>
      </CardContent>
    </Card>
  );
};

export const showFileOperationToast = {
  success: (message: string) => {
    toast({
      title: 'Success',
      description: message,
      variant: 'default',
    });
  },

  error: (error: FileOperationError) => {
    const severity = getErrorSeverity(error.code);

    toast({
      title: 'Operation Failed',
      description: error.userMessage,
      variant:
        severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH
          ? 'destructive'
          : 'default',
    });
  },

  loading: (message: string) => {
    toast({
      title: 'Processing',
      description: message,
      variant: 'default',
    });
  },
};

export const useFileOperationFeedback = () => {
  const [loadingState, setLoadingState] = useState<FileOperationLoadingState>({
    isLoading: false,
  });
  const [error, setError] = useState<FileOperationError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const startLoading = (operation?: string, message?: string) => {
    setLoadingState({
      isLoading: true,
      operation,
      message,
      progress: 0,
    });
    setError(null);
    setSuccess(null);
  };

  const updateProgress = (progress: number, message?: string) => {
    setLoadingState((prev) => ({
      ...prev,
      progress,
      message: message || prev.message,
    }));
  };

  const stopLoading = () => {
    setLoadingState({ isLoading: false });
  };

  const showError = (error: FileOperationError) => {
    setError(error);
    setLoadingState({ isLoading: false });
    showFileOperationToast.error(error);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setLoadingState({ isLoading: false });
    showFileOperationToast.success(message);
  };

  const clearFeedback = () => {
    setError(null);
    setSuccess(null);
    setLoadingState({ isLoading: false });
  };

  return {
    loadingState,
    error,
    success,
    startLoading,
    updateProgress,
    stopLoading,
    showError,
    showSuccess,
    clearFeedback,
  };
};
