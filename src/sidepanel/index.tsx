import React from 'react';
import ReactDOM from 'react-dom/client';
import SidePanel from './SidePanel';
import '../index.css';
import 'sonner/dist/styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <SidePanel />
    </React.StrictMode>
);
