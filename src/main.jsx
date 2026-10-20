import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './store/AppStore.jsx';
import { JobsProvider } from './store/JobsStore.jsx';
// Self-hosted fonts: same origin as the app, so no extra connections before text can render.
import '@fontsource-variable/inter/wght.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './index.css';
import './pages.css';
import './market.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <JobsProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </JobsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
