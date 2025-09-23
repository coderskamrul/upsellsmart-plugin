import { useState } from 'react'

const useConfirmation = () => {
    const [confirmationState, setConfirmationState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'danger',
        onConfirm: () => { }
    })

    const showConfirmation = ({
        title = "Confirm Action",
        message = "Are you sure you want to proceed?",
        confirmText = "Confirm",
        cancelText = "Cancel",
        type = "danger",
        onConfirm = () => { }
    }) => {
        return new Promise((resolve) => {
            setConfirmationState({
                isOpen: true,
                title,
                message,
                confirmText,
                cancelText,
                type,
                onConfirm: () => {
                    onConfirm()
                    resolve(true)
                }
            })
        })
    }

    const hideConfirmation = () => {
        setConfirmationState(prev => ({
            ...prev,
            isOpen: false
        }))
    }

    // Convenience methods for different types of confirmations
    const confirmDelete = (itemName = "this item", onConfirm = () => { }) => {
        return showConfirmation({
            title: "Delete Confirmation",
            message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            type: "danger",
            onConfirm
        })
    }

    const confirmAction = (actionName = "this action", onConfirm = () => { }) => {
        return showConfirmation({
            title: "Confirm Action",
            message: `Are you sure you want to ${actionName}?`,
            confirmText: "Yes, proceed",
            cancelText: "Cancel",
            type: "warning",
            onConfirm
        })
    }

    const confirmSave = (onConfirm = () => { }) => {
        return showConfirmation({
            title: "Save Changes",
            message: "Are you sure you want to save these changes?",
            confirmText: "Save",
            cancelText: "Cancel",
            type: "success",
            onConfirm
        })
    }

    return {
        confirmationState,
        showConfirmation,
        hideConfirmation,
        confirmDelete,
        confirmAction,
        confirmSave
    }
}

export default useConfirmation