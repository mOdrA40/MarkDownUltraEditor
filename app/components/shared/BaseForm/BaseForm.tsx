/**
 * @fileoverview Base Form Component - Reusable form wrapper
 * @author Axel Modra
 */

import type React from 'react';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { BaseButton, ButtonGroup } from '../BaseButton';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  validation?: (value: string) => string | null;
  options?: { value: string; label: string }[]; // For select/radio
  rows?: number; // For textarea
  className?: string;
}

export interface BaseFormProps {
  /** Form fields configuration */
  fields: FormField[];
  /** Initial form values */
  initialValues?: Record<string, string | boolean>;
  /** Form submission handler */
  onSubmit: (values: Record<string, string | boolean>) => Promise<void> | void;
  /** Form cancellation handler */
  onCancel?: () => void;
  /** Submit button text */
  submitText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Whether form is in loading state */
  isLoading?: boolean;
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show cancel button */
  showCancelButton?: boolean;
  /** Custom validation for entire form */
  validateForm?: (values: Record<string, string | boolean>) => Record<string, string> | null;
}

/**
 * Base Form Component
 * Provides consistent form behavior and styling
 */
export const BaseForm: React.FC<BaseFormProps> = ({
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isLoading = false,
  title,
  description,
  className,
  showCancelButton = true,
  validateForm,
}) => {
  const [values, setValues] = useState<Record<string, string | boolean>>(() => {
    const defaultValues: Record<string, string | boolean> = {};
    fields.forEach((field) => {
      defaultValues[field.name] =
        initialValues[field.name] ?? (field.type === 'checkbox' ? false : '');
    });
    return defaultValues;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Handle field value change
  const handleChange = useCallback(
    (name: string, value: string | boolean) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    },
    [errors]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (name: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Validate field on blur
      const field = fields.find((f) => f.name === name);
      if (field?.validation) {
        const error = field.validation(String(values[name] || ''));
        if (error) {
          setErrors((prev) => ({ ...prev, [name]: error }));
        }
      }
    },
    [fields, values]
  );

  // Validate all fields
  const validateAllFields = useCallback(() => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = values[field.name];

      // Required field validation
      if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }

      // Custom field validation
      if (field.validation && typeof value === 'string') {
        const error = field.validation(value);
        if (error) {
          newErrors[field.name] = error;
        }
      }
    });

    // Form-level validation
    if (validateForm) {
      const formErrors = validateForm(values);
      if (formErrors) {
        Object.assign(newErrors, formErrors);
      }
    }

    return newErrors;
  }, [fields, values, validateForm]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validateAllFields();
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length === 0) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }
    },
    [validateAllFields, onSubmit, values]
  );

  // Render form field
  const renderField = (field: FormField) => {
    const value = values[field.name];
    const error = errors[field.name];
    const isTouched = touched[field.name];

    const fieldProps = {
      id: field.name,
      name: field.name,
      placeholder: field.placeholder,
      required: field.required,
      className: cn(
        'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        error && isTouched && 'border-destructive',
        field.className
      ),
      onBlur: () => handleBlur(field.name),
    };

    let fieldElement: React.ReactNode;

    switch (field.type) {
      case 'textarea':
        fieldElement = (
          <textarea
            {...fieldProps}
            rows={field.rows || 3}
            value={String(value || '')}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );
        break;

      case 'select':
        fieldElement = (
          <select
            {...fieldProps}
            value={String(value || '')}
            onChange={(e) => handleChange(field.name, e.target.value)}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        break;

      case 'checkbox':
        fieldElement = (
          <input
            {...fieldProps}
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
              field.className
            )}
            checked={Boolean(value)}
            onChange={(e) => handleChange(field.name, e.target.checked)}
          />
        );
        break;

      default:
        fieldElement = (
          <input
            {...fieldProps}
            type={field.type}
            value={String(value || '')}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );
    }

    return (
      <div key={field.name} className="space-y-2">
        <label
          htmlFor={field.name}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </label>
        {fieldElement}
        {error && isTouched && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {title && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

      <div className="space-y-4">{fields.map(renderField)}</div>

      <ButtonGroup className="justify-end">
        {showCancelButton && onCancel && (
          <BaseButton type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </BaseButton>
        )}
        <BaseButton type="submit" isLoading={isLoading} loadingText="Submitting...">
          {submitText}
        </BaseButton>
      </ButtonGroup>
    </form>
  );
};
