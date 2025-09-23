import { createContext, useContext } from 'react'
import toast from 'react-hot-toast'

const ToastContext = createContext()

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export const ToastProvider = ({ children }) => {
    const showSuccess = (message) => {
        toast.success(message, {
            duration: 4000,
            position: 'top-right',
            style: {
                background: '#10B981',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#10B981',
            },
        })
    }

    const showError = (message) => {
        toast.error(message, {
            duration: 5000,
            position: 'top-right',
            style: {
                background: '#EF4444',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#EF4444',
            },
        })
    }

    const showWarning = (message) => {
        toast(message, {
            duration: 4000,
            position: 'top-right',
            icon: '⚠️',
            style: {
                background: '#F59E0B',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
        })
    }

    const showInfo = (message) => {
        toast(message, {
            duration: 4000,
            position: 'top-right',
            icon: 'ℹ️',
            style: {
                background: '#3B82F6',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
        })
    }

    const value = {
        showSuccess,
        showError,
        showWarning,
        showInfo,
    }

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    )
}