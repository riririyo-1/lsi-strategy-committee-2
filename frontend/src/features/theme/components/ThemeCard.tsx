"use client";

import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface ThemeCardProps {
  variant?: 'base' | 'elevated' | 'popup';
  className?: string;
  children: React.ReactNode;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({
  variant = 'base',
  className = '',
  children,
  ...props
}) => {
  const { classes } = useTheme();
  
  const variantClass = classes.card[variant];
  const combinedClassName = `${variantClass} ${className}`.trim();
  
  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};