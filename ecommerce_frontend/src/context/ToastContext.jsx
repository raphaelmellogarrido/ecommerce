import { createContext, useState, useContext, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Função para adicionar um toast (tipo pode ser 'success', 'error' ou 'info')
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now(); // ID único baseado no tempo
    setToasts((prev) => [...prev, { id, message, type }]);

    // Remove o toast automaticamente após 3 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Contentor flutuante onde os toasts vão aparecer na interface */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
