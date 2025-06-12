"use client";

import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface ThemeTextProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  variant?: 'primary' | 'secondary' | 'muted' | 'accent' | 'destructive' | 'success' | 'warning';
  size?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption';
  className?: string;
  children: React.ReactNode;
}

export const ThemeText: React.FC<ThemeTextProps> = ({
  as: Component = 'p',
  variant = 'primary',
  size,
  className = '',
  children,
  ...props
}) => {
  const { classes } = useTheme();
  
  // サイズが指定されている場合はheadingクラスを使用
  const sizeClass = size ? classes.heading[size] : '';
  const variantClass = variant ? classes.text[variant] : '';
  
  // サイズが指定されている場合はそちらを優先
  const textClass = sizeClass || variantClass;
  const combinedClassName = `${textClass} ${className}`.trim();
  
  return (
    <Component className={combinedClassName} {...props}>
      {children}
    </Component>
  );
};