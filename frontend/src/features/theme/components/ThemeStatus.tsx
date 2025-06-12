"use client";

import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface ThemeStatusProps {
  variant: 'active' | 'inactive' | 'pending' | 'error';
  className?: string;
  children: React.ReactNode;
}

export const ThemeStatus: React.FC<ThemeStatusProps> = ({
  variant,
  className = '',
  children,
  ...props
}) => {
  const { classes } = useTheme();
  
  const variantClass = classes.status[variant];
  const combinedClassName = `${variantClass} ${className}`.trim();
  
  return (
    <span className={combinedClassName} {...props}>
      {children}
    </span>
  );
};