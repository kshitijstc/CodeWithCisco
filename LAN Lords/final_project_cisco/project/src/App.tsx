import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { NetworkProvider } from './contexts/NetworkContext';
import { AlertProvider } from './contexts/AlertContext';
import { AIProvider } from './contexts/AIContext';

function App() {
  return (
    <NetworkProvider>
      <AlertProvider>
        <AIProvider>
          <div className="min-h-screen bg-gray-900 text-white">
            <Dashboard />
          </div>
        </AIProvider>
      </AlertProvider>
    </NetworkProvider>
  );
}

export default App;