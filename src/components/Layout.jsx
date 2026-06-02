import React, { useState } from 'react';
import Titlebar from './Titlebar';
import Sidebar from './Sidebar';

export default function Layout({ children, currentView, setCurrentView }) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Titlebar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        <main className="flex-1 relative overflow-y-auto custom-scrollbar bg-[var(--bg-base)]">
          {children}
        </main>
      </div>
    </div>
  );
}
