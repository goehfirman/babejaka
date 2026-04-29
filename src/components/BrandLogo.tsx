"use client";
import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  stacked?: boolean;
  showIcon?: boolean;
  centered?: boolean;
}

export default function BrandLogo({ 
  size = 'md', 
  className = "", 
  stacked = false, 
  showIcon = false,
  centered = false
}: BrandLogoProps) {
  // Mapping sizes to specific Tailwind classes and styles
  const sizes = {
    sm: { 
      text: 'text-xl md:text-2xl', 
      gap: 'gap-2' 
    },
    md: { 
      text: 'text-2xl md:text-3xl', 
      gap: 'gap-3' 
    },
    lg: { 
      text: 'text-7xl md:text-[10rem]', 
      gap: 'gap-4 md:gap-10' 
    }
  };

  const currentSize = sizes[size];

  return (
    <div className={`relative flex flex-col ${centered ? 'items-center' : 'items-start'} group select-none outline-none border-none ${className} ${showIcon ? 'pt-5' : ''}`}>
      {showIcon && (
        <span className="absolute 
          left-1/2 -translate-x-1/2 top-0 
          text-primary 
          text-2xl 
          transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) 
          group-hover:top-[68%] group-hover:-translate-y-1/2 group-hover:left-[51.5%]
          material-symbols-rounded"
        >
          menu_book
        </span>
      )}
      
      {/* Solid Block Typography */}
      <div 
        className={`${currentSize.text} font-black tracking-wide flex ${stacked ? 'flex-col -space-y-[0.1em]' : 'items-baseline'} leading-none`}
        style={{ fontFamily: "'Changa One', sans-serif" }}
      >
        <span className="text-primary transition-transform duration-300 group-hover:-translate-x-1">BABE</span>
        
        {/* Dynamic Space for Icon in Navbar */}
        {showIcon && !stacked && (
          <div className="w-0 group-hover:w-8 transition-all duration-500 ease-in-out" />
        )}
        
        <span className={`text-secondary transition-transform duration-300 group-hover:translate-x-1 ${stacked ? '' : (showIcon ? '' : 'ml-1')}`}>JAKA</span>
      </div>
    </div>
  );
}
