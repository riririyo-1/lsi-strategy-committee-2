"use client";

import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface ThemeAlertProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  className?: string;
  children: React.ReactNode;
}

export const ThemeAlert: React.FC<ThemeAlertProps> = ({
  variant,
  className = '',
  children,
  ...props
}) => {
  const { classes } = useTheme();
  
  const variantClass = classes.alert[variant];
  const combinedClassName = `${variantClass} ${className}`.trim();
  
  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};