'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'saffron' | 'green' | 'red' | 'amber' | 'gray';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'blue', size = 'sm' }) => {
  const variantStyles = {
    blue: 'bg-govBlue-50 text-govBlue border-govBlue/30',
    saffron: 'bg-saffron-50 text-saffron-dark border-saffron/30',
    green: 'bg-govSuccess-50 text-govSuccess-dark border-govSuccess/30',
    red: 'bg-govError-50 text-govError-dark border-govError/30',
    amber: 'bg-amber-50 text-amber-800 border-amber-300',
    gray: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span className={`inline-flex items-center rounded border ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
};
