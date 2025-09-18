import React from 'react';
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, hint, name, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label 
            htmlFor={name} 
            className="block text-sm font-medium text-foreground/90 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            id={name}
            name={name}
            className={cn(
              "modern-input",
              "w-full h-11 rounded-lg border px-4 py-3 text-sm",
              "bg-background/60 backdrop-blur-sm border-border/60",
              "transition-all duration-200 ease-out",
              "placeholder:text-muted-foreground/60",
              "hover:border-border focus:border-ring focus:ring-2 focus:ring-ring/20 focus:bg-background/80",
              error && "border-destructive focus:border-destructive focus:ring-destructive/20",
              className
            )}
            ref={ref}
            {...props}
          />
          {error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <svg className="h-4 w-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-destructive font-medium flex items-center gap-1 mt-1.5">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-muted-foreground/70 mt-1.5">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
