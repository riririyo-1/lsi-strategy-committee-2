"use client";

import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface ThemeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default';
  hasError?: boolean;
}

export const ThemeInput: React.FC<ThemeInputProps> = ({
  variant = 'default',
  hasError = false,
  className = '',
  ...props
}) => {
  const { classes } = useTheme();
  
  const baseClass = classes.form.input;
  const errorClass = hasError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
  const combinedClassName = `${baseClass} ${errorClass} ${className}`.trim();
  
  return (
    <input className={combinedClassName} {...props} />
  );
};