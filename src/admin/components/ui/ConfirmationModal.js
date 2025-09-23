import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmButtonClass = "bg-red-600 hover:bg-red-700 text-white",
    icon = <AlertTriangle className="h-6 w-6 text-red-600" />,
    type = "danger" // danger, warning, info, success
}) => {
    if (!isOpen) return null

    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    const getIconByType = (type) => {
        switch (type) {
            case 'danger':
                return <AlertTriangle className="h-6 w-6 text-red-600" />
            case 'warning':
                return <AlertTriangle className="h-6 w-6 text-yellow-600" />
            case 'info':
                return (
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            case 'success':
                return (
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                )
            default:
                return <AlertTriangle className="h-6 w-6 text-red-600" />
        }
    }

    const getConfirmButtonClass = (type) => {
        switch (type) {
            case 'danger':
                return "bg-red-600 hover:bg-red-700 text-white"
            case 'warning':
                return "bg-yellow-600 hover:bg-yellow-700 text-white"
            case 'info':
                return "bg-blue-600 hover:bg-blue-700 text-white"
            case 'success':
                return "bg-green-600 hover:bg-green-700 text-white"
            default:
                return "bg-red-600 hover:bg-red-700 text-white"
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {icon || getIconByType(type)}
                            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Message */}
                    <div className="mb-6">
                        <p className="text-gray-600 leading-relaxed">{message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${confirmButtonClass || getConfirmButtonClass(type)}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal