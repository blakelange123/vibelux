import React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
  children: React.ReactNode;
}

export function Alert({ 
  children, 
  variant = 'default', 
  className = '', 
  ...props 
}: AlertProps) {
  const variants = {
    default: 'bg-background text-foreground border-gray-200',
    destructive: 'border-destructive/50 text-destructive dark:border-destructive bg-destructive/10'
  };

  const variantClass = variants[variant] || variants.default;

  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg border p-4 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ 
  children, 
  className = '', 
  ...props 
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h5>
  );
}

export function AlertDescription({ 
  children, 
  className = '', 
  ...props 
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  );
}