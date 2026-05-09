import { jsx as _jsx } from "react/jsx-runtime";
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(_jsx(App, {}));
}
else {
    console.error("No se encontró el elemento root");
}
