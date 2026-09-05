import React from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { App } from './src/App';
import { AuthProvider } from './src/components/AuthProvider';
import './src/index.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
        <Analytics />
      </AuthProvider>
    </React.StrictMode>
  );
}
