import React from 'react';

const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-orange-50 p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="flex items-center justify-between animate-rise">
        <div className="flex items-center gap-3">
          <img src="/wc-logo.svg" alt="Wardens Connect" className="h-10 w-10" />
          <div>
            <h1 className="font-display text-2xl tracking-wide">Wardens Connect</h1>
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Private Network</p>
          </div>
        </div>
        <span className="brand-pill rounded-full px-3 py-1 text-xs uppercase tracking-widest">
          Invite Only
        </span>
      </header>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="brand-card rounded-3xl p-8 animate-rise">
          {children}
        </div>
        <div className="flex flex-col justify-between rounded-3xl bg-slate-900 p-8 text-white shadow-soft animate-rise delay-150">
          <div>
            <p className="text-sm uppercase tracking-widest text-orange-200">Punjab Traffic Wardens</p>
            <h2 className="mt-4 font-display text-3xl">Private Welfare & Communication Hub</h2>
            <p className="mt-4 text-sm text-orange-100/90">
              Verified wardens only. Secure messaging, welfare transparency, and official notices in
              one protected space. Urdu: ????? ????? ??? ????? ???????
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-xs">
            Support: IT HQ | Confidential System
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
