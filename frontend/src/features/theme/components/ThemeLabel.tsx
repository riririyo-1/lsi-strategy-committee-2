"use client";

import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface ThemeLabelProps {
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const ThemeLabel: React.FC<ThemeLabelProps> = ({
  htmlFor,
  required = false,
  className = '',
  children,
  ...props
}) => {
  const { classes } = useTheme();
  
  const combinedClassName = `${classes.form.label} ${className}`.trim();
  
  return (
    <label htmlFor={htmlFor} className={combinedClassName} {...props}>
      {children}
      {required && <span className={classes.text.destructive}> *</span>}
    </label>
  );
};