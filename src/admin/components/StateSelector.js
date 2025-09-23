"use client"

import { useState, useEffect } from 'react'

const StateSelector = ({
    selectedStates = [],
    selectedStateNames = [],
    selectedCountries = [],
    onStateChange,
    placeholder = "Search and select states/cities...",
    label = "States or Cities"
}) => {
    const [states, setStates] = useState([])
    const [loadingStates, setLoadingStates] = useState(false)
    const [stateSearchTerm, setStateSearchTerm] = useState('')
    const [showStateDropdown, setShowStateDropdown] = useState(false)

    // Generate unique ID for this instance
    const instanceId = useState(() => `state-selector-${Math.random().toString(36).substr(2, 9)}`)[0]

    // Fetch states when selected countries change
    useEffect(() => {
        if (selectedCountries && selectedCountries.length > 0) {
            fetchStates()
        } else {
            setStates([])
        }
    }, [selectedCountries])

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(`.state-dropdown-container-${instanceId}`)) {
                setShowStateDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [instanceId])

    const fetchStates = async () => {
        setLoadingStates(true)
        try {
            const response = await fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'upspr_get_states',
                    countries: selectedCountries.join(','),
                    nonce: window.upspr_ajax.nonce
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setStates(data.data || [])
                } else {
                    console.error('Failed to fetch states:', data.data)
                }
            }
        } catch (error) {
            console.error('Error fetching states:', error)
        } finally {
            setLoadingStates(false)
        }
    }

    const handleStateSelect = (stateCode, stateName) => {
        const currentStates = selectedStates || []
        const currentStateNames = selectedStateNames || []

        if (currentStates.includes(stateCode)) {
            return // Already selected
        }

        const newStates = [...currentStates, stateCode]
        const newStateNames = [...currentStateNames, stateName]

        onStateChange(newStates, newStateNames)
        setStateSearchTerm('')
        setShowStateDropdown(false)
    }

    const removeStateFromSelection = (stateCode) => {
        const currentStates = selectedStates || []
        const currentStateNames = selectedStateNames || []
        const index = currentStates.indexOf(stateCode)

        if (index > -1) {
            const newStates = [...currentStates]
            const newStateNames = [...currentStateNames]
            newStates.splice(index, 1)
            newStateNames.splice(index, 1)

            onStateChange(newStates, newStateNames)
        }
    }

    const filteredStates = states.filter(state =>
        state.name.toLowerCase().includes(stateSearchTerm.toLowerCase()) &&
        !(selectedStates || []).includes(state.code)
    )

    const isDisabled = !selectedCountries || selectedCountries.length === 0

    return (
        <div className={`relative state-dropdown-container state-dropdown-container-${instanceId}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            {/* Multiselect Input Container */}
            <div
                className={`min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-text flex flex-wrap items-center gap-2 ${isDisabled
                    ? 'bg-gray-50 cursor-not-allowed'
                    : 'focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500'
                    }`}
                onClick={() => {
                    if (!isDisabled) {
                        const input = document.querySelector(`#${instanceId}`);
                        if (input) input.focus();
                    }
                }}
            >
                {/* Selected States as Tags */}
                {selectedStateNames && selectedStateNames.length > 0 && (
                    selectedStateNames.map((stateName, index) => (
                        <span
                            key={selectedStates[index]}
                            className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800 border border-green-200"
                        >
                            {stateName}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeStateFromSelection(selectedStates[index]);
                                }}
                                className="ml-1 text-green-600 hover:text-green-800 focus:outline-none"
                            >
                                ×
                            </button>
                        </span>
                    ))
                )}

                {/* Search Input */}
                <input
                    id={instanceId}
                    type="text"
                    placeholder={
                        isDisabled
                            ? "Select countries first..."
                            : (selectedStateNames && selectedStateNames.length > 0 ? "" : placeholder)
                    }
                    value={stateSearchTerm}
                    onChange={(e) => {
                        if (!isDisabled) {
                            setStateSearchTerm(e.target.value)
                            setShowStateDropdown(true)
                        }
                    }}
                    onFocus={() => {
                        if (!isDisabled) {
                            setShowStateDropdown(true)
                        }
                    }}
                    disabled={isDisabled}
                    style={{
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                        backgroundColor: 'transparent'
                    }}
                    className={`flex-1 min-w-[120px] bg-transparent text-sm placeholder-gray-400 ${isDisabled ? 'cursor-not-allowed' : ''
                        }`}
                />
            </div>

            {/* Dropdown List */}
            {showStateDropdown && !isDisabled && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {loadingStates ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Loading states...</div>
                    ) : filteredStates.length > 0 ? (
                        filteredStates.map((state) => (
                            <button
                                key={state.code}
                                type="button"
                                onClick={() => handleStateSelect(state.code, state.name)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                {state.name}
                                <span className="text-gray-500 text-xs ml-1">({state.code})</span>
                            </button>
                        ))
                    ) : stateSearchTerm ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No states found</div>
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">Start typing to search states</div>
                    )}
                </div>
            )}

            {/* Helper text when disabled */}
            {isDisabled && (
                <p className="mt-1 text-xs text-gray-500">
                    Please select countries first to enable state/city selection
                </p>
            )}
        </div>
    )
}

export default StateSelector