import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon: Icon, fullWidth = true, className = '', ...props }, ref) => {
    const baseClasses = "px-4 py-2.5 text-sm rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const stateClasses = error
      ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200 placeholder-red-400 dark:placeholder-red-500 focus:border-red-500 focus:ring-red-500/20 dark:focus:ring-red-500/30"
      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:ring-blue-500/30";

    const widthClass = fullWidth ? "w-full" : "";
    const iconPadding = Icon ? "pl-10" : "";

    return (
      <div className={`space-y-1.5 ${widthClass}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
          )}
          
          <input
            ref={ref}
            className={`${baseClasses} ${stateClasses} ${widthClass} ${iconPadding} ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id || 'input'}-error` : helperText ? `${props.id || 'input'}-helper` : undefined}
            {...props}
          />
        </div>

        {error && (
          <p
            id={`${props.id || 'input'}-error`}
            className="text-sm text-red-600 dark:text-red-400 flex items-center"
          >
            <span className="mr-1">⚠</span>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${props.id || 'input'}-helper`}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, fullWidth = true, className = '', rows = 4, ...props }, ref) => {
    const baseClasses = "px-4 py-2.5 text-sm rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const stateClasses = error
      ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200 placeholder-red-400 dark:placeholder-red-500 focus:border-red-500 focus:ring-red-500/20 dark:focus:ring-red-500/30"
      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:ring-blue-500/30";

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <div className={`space-y-1.5 ${widthClass}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          rows={rows}
          className={`${baseClasses} ${stateClasses} ${widthClass} resize-none ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id || 'textarea'}-error` : helperText ? `${props.id || 'textarea'}-helper` : undefined}
          {...props}
        />

        {error && (
          <p
            id={`${props.id || 'textarea'}-error`}
            className="text-sm text-red-600 dark:text-red-400 flex items-center"
          >
            <span className="mr-1">⚠</span>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${props.id || 'textarea'}-helper`}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
  fullWidth?: boolean;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, fullWidth = true, className = '', ...props }, ref) => {
    const baseClasses = "px-4 py-2.5 text-sm rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed appearance-none";
    
    const stateClasses = error
      ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200 placeholder-red-400 dark:placeholder-red-500 focus:border-red-500 focus:ring-red-500/20 dark:focus:ring-red-500/30"
      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:ring-blue-500/30";

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <div className={`space-y-1.5 ${widthClass}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            className={`${baseClasses} ${stateClasses} ${widthClass} pr-10 ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id || 'select'}-error` : helperText ? `${props.id || 'select'}-helper` : undefined}
            {...props}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
            </svg>
          </div>
        </div>

        {error && (
          <p
            id={`${props.id || 'select'}-error`}
            className="text-sm text-red-600 dark:text-red-400 flex items-center"
          >
            <span className="mr-1">⚠</span>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${props.id || 'select'}-helper`}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';