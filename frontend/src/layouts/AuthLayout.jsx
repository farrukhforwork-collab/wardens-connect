import React from 'react';

const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-[#fdfbd4] px-6 py-10">
    <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col justify-center gap-6">
        <div className="flex items-center gap-3">
          <img src="/wc-logo.svg" alt="Wardens Connect" className="h-12 w-12" />
          <div>
            <h1 className="font-display text-3xl tracking-wide text-slate-900">Wardens Connect</h1>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Private Network</p>
          </div>
        </div>
        <h2 className="text-3xl font-semibold text-slate-900">
          Connect, coordinate, and protect each other.
        </h2>
        <p className="max-w-lg text-sm text-slate-600">
          Verified Traffic Wardens only. Secure communication, welfare transparency, and official
          notices in one trusted system.
        </p>
        <div className="flex items-center gap-3">
          <span className="brand-pill rounded-full px-3 py-1 text-xs uppercase tracking-widest">
            Invite Only
          </span>
          <span className="text-xs text-slate-500">Punjab Traffic Wardens</span>
        </div>
      </div>
      <div className="brand-card rounded-3xl p-8 shadow-soft">
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
