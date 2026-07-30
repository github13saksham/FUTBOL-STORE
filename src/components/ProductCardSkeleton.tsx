import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-luxury-dark rounded-2xl md:rounded-3xl flex flex-col justify-between shadow-sm relative overflow-hidden transform-gpu animate-pulse border border-white/5">
      <div className="relative w-full aspect-[4/5] bg-neutral-800" />
      <div className="p-3 md:p-5 md:pt-4 space-y-2">
        <div className="h-4 bg-neutral-800 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-neutral-800 rounded w-1/2"></div>
        <div className="flex justify-between items-end pb-1 pt-2">
          <div className="h-5 bg-neutral-800 rounded w-1/3"></div>
          <div className="h-3 bg-neutral-800 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
}
