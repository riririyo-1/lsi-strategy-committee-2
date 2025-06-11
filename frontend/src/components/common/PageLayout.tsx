"use client";

import React from "react";
import PageWithBackground from "./PageWithBackground";

interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  showActionBar?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  actions,
  children,
  showActionBar = false
}) => {
  return (
    <PageWithBackground>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-white text-shadow">
          {title}
        </h1>
        {description && (
          <p className="text-xl mb-8 mx-auto max-w-4xl text-white">
            {description}
          </p>
        )}
      </div>
      
      {showActionBar && actions && (
        <div className="flex flex-col sm:flex-row justify-between mb-8 gap-4">
          {actions}
        </div>
      )}
      
      {children}
    </PageWithBackground>
  );
};