import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AudioProvider } from './context/AudioContext';
import { StatusBar } from '@capacitor/status-bar';

// Hide the Android status bar automatically on launch
try {
  StatusBar.hide();
} catch (e) {
  console.log('Status bar plugin not available in browser mode.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AudioProvider>
      <App />
    </AudioProvider>
  </StrictMode>,
);