import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { X } from 'lucide-react';
const Modal = ({ title, isOpen, onClose, children }) => {
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape')
            onClose(); };
        if (isOpen)
            document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm", onClick: onClose }), _jsxs("div", { className: "relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-border", children: [_jsx("h3", { className: "text-lg font-bold", children: title }), _jsx("button", { onClick: onClose, className: "p-1 rounded-lg hover:bg-primary/10 transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "p-6", children: children })] })] }));
};
export default Modal;
