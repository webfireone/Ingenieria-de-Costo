import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
const Modal = ({ title, isOpen, onClose, children }) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setVisible(true));
        }
        else {
            setVisible(false);
        }
    }, [isOpen]);
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape')
            onClose(); };
        if (isOpen)
            document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: `absolute inset-0 transition-all duration-500 ${visible ? 'bg-black/70 backdrop-blur-md opacity-100' : 'bg-black/0 backdrop-blur-0 opacity-0'}`, onClick: onClose }), _jsx("div", { className: `relative w-full max-w-lg max-h-[90vh] overflow-y-auto transition-all duration-400 border-gradient ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`, style: {
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }, children: _jsxs("div", { className: "bg-card/95 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between p-5 border-b border-border/30 bg-gradient-to-r from-primary/5 to-violet-500/5", children: [_jsx("h3", { className: "font-heading font-bold text-lg text-gradient", children: title }), _jsx("button", { onClick: onClose, className: "p-1.5 rounded-lg hover:bg-primary/10 transition-colors group", children: _jsx(X, { className: "w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" }) })] }), _jsx("div", { className: "p-6", children: children })] }) })] }));
};
export default Modal;
