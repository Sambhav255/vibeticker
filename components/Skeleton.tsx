import React from 'react';

export const SkeletonCard: React.FC = () => (
  <section className="border border-zinc-900 bg-[rgba(12,12,12,0.95)] px-6 py-5 rounded-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div className="space-y-3">
      <div className="h-3 w-24 bg-zinc-800/80 rounded animate-pulse" />
      <div className="flex items-baseline gap-3">
        <div className="h-8 w-20 bg-zinc-800/80 rounded animate-pulse" />
        <div className="h-4 w-32 bg-zinc-800/60 rounded animate-pulse" />
      </div>
      <div className="flex gap-6 mt-3">
        <div className="space-y-1">
          <div className="h-2.5 w-12 bg-zinc-800/60 rounded animate-pulse" />
          <div className="h-5 w-16 bg-zinc-800/80 rounded animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="h-2.5 w-16 bg-zinc-800/60 rounded animate-pulse" />
          <div className="h-5 w-12 bg-zinc-800/80 rounded animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="h-2.5 w-14 bg-zinc-800/60 rounded animate-pulse" />
          <div className="h-5 w-16 bg-zinc-800/80 rounded animate-pulse" />
        </div>
      </div>
    </div>
    <div className="space-y-2 max-w-md">
      <div className="h-3 w-full bg-zinc-800/60 rounded animate-pulse" />
      <div className="h-3 w-[80%] bg-zinc-800/50 rounded animate-pulse" />
      <div className="h-3 w-[70%] bg-zinc-800/50 rounded animate-pulse" />
    </div>
  </section>
);

export const SkeletonChart: React.FC = () => (
  <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 h-[400px] flex flex-col">
    <div className="flex justify-between items-center mb-6">
      <div className="space-y-2">
        <div className="h-5 w-48 bg-zinc-700/60 rounded animate-pulse" />
        <div className="h-3 w-36 bg-zinc-800/60 rounded animate-pulse" />
      </div>
    </div>
    <div className="flex-grow w-full bg-zinc-800/40 rounded animate-pulse" />
  </div>
);

export const SkeletonGauge: React.FC = () => (
  <div className="border border-zinc-900 bg-[rgba(12,12,12,0.95)] rounded-2xl p-6 h-[400px] flex flex-col items-center justify-center">
    <div className="h-24 w-24 rounded-full bg-zinc-800/80 animate-pulse mb-4" />
    <div className="h-5 w-20 bg-zinc-800/60 rounded animate-pulse" />
    <div className="h-4 w-16 bg-zinc-800/50 rounded animate-pulse mt-2" />
  </div>
);

export const SkeletonNews: React.FC = () => (
  <div className="border border-zinc-900 bg-[rgba(10,10,10,0.95)] px-5 py-5 rounded-sm">
    <div className="h-4 w-24 bg-zinc-800/60 rounded animate-pulse mb-4" />
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-sm bg-zinc-900/40 border border-zinc-900 space-y-2">
          <div className="h-3 w-full bg-zinc-800/60 rounded animate-pulse" />
          <div className="h-3 w-[75%] bg-zinc-800/50 rounded animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonOverview: React.FC = () => (
  <div className="space-y-8 fade-in-slow">
    <SkeletonCard />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SkeletonChart />
      </div>
      <div className="lg:col-span-1">
        <SkeletonGauge />
      </div>
      <div className="lg:col-span-3">
        <SkeletonNews />
      </div>
    </div>
  </div>
);
