import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ⚡ No StrictMode in production for max performance (causes double renders in dev)
const root = createRoot(document.getElementById('root'));
root.render(<App />);
