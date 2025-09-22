"use client"

import { useState, useEffect } from 'react'

const AttributeSelector = ({
    selectedAttributes = [],
    selectedAttributeNames = [],
    onAttributeChange,
    placeholder = "Search and select attributes...",
    label = "Attributes"
}) => {
    const [attributes, setAttributes] = useState([])
    const [loadingAttributes, setLoadingAttributes] = useState(false)
    const [attributeSearchTerm, setAttributeSearchTerm] = useState('')
    const [showAttributeDropdown, setShowAttributeDropdown] = useState(false)

    // Fetch WooCommerce attributes
    useEffect(() => {
        fetchAttributes()
    }, [])

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.attribute-dropdown-container')) {
                setShowAttributeDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchAttributes = async () => {
        setLoadingAttributes(true)
        try {
            const response = await fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'upspr_get_attributes',
                    nonce: window.upspr_ajax.nonce
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setAttributes(data.data)
                }
            }
        } catch (error) {
            console.error('Error fetching attributes:', error)
        } finally {
            setLoadingAttributes(false)
        }
    }

    const handleAttributeSelect = (attributeId, attributeName) => {
        const currentAttributes = selectedAttributes || []
        const currentAttributeNames = selectedAttributeNames || []

        if (!currentAttributes.includes(attributeId)) {
            const newAttributes = [...currentAttributes, attributeId]
            const newAttributeNames = [...currentAttributeNames, attributeName]

            onAttributeChange(newAttributes, newAttributeNames)
        }

        setAttributeSearchTerm('')
        setShowAttributeDropdown(false)
    }

    const removeAttributeFromSelection = (attributeId) => {
        const currentAttributes = selectedAttributes || []
        const currentAttributeNames = selectedAttributeNames || []
        const index = currentAttributes.indexOf(attributeId)

        if (index > -1) {
            const newAttributes = [...currentAttributes]
            const newAttributeNames = [...currentAttributeNames]
            newAttributes.splice(index, 1)
            newAttributeNames.splice(index, 1)

            onAttributeChange(newAttributes, newAttributeNames)
        }
    }

    const filteredAttributes = attributes.filter(attribute =>
        attribute.name.toLowerCase().includes(attributeSearchTerm.toLowerCase()) &&
        !(selectedAttributes || []).includes(attribute.id.toString())
    )

    return (
        <div className="relative attribute-dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            {/* Multiselect Input Container */}
            <div
                className="min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-text flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                onClick={() => {
                    const input = document.querySelector('.attribute-search-input');
                    if (input) input.focus();
                }}
            >
                {/* Selected Attributes as Tags */}
                {selectedAttributeNames && selectedAttributeNames.length > 0 && (
                    selectedAttributeNames.map((attributeName, index) => (
                        <span
                            key={selectedAttributes[index]}
                            className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200"
                        >
                            {attributeName}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeAttributeFromSelection(selectedAttributes[index]);
                                }}
                                className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                ×
                            </button>
                        </span>
                    ))
                )}

                {/* Search Input */}
                <input
                    type="text"
                    placeholder={selectedAttributeNames && selectedAttributeNames.length > 0 ? "" : placeholder}
                    value={attributeSearchTerm}
                    onChange={(e) => {
                        setAttributeSearchTerm(e.target.value)
                        setShowAttributeDropdown(true)
                    }}
                    onFocus={() => setShowAttributeDropdown(true)}
                    className="category-search-input attribute-search-input flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm placeholder-gray-400 focus:shadow-none"
                    style={{ boxShadow: 'none', border: 'none !important' }}
                />
            </div>

            {/* Dropdown List */}
            {showAttributeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {loadingAttributes ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Loading attributes...</div>
                    ) : filteredAttributes.length > 0 ? (
                        filteredAttributes.map((attribute) => (
                            <button
                                key={attribute.id}
                                type="button"
                                onClick={() => handleAttributeSelect(attribute.id.toString(), attribute.name)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                {attribute.name}
                                {attribute.terms && attribute.terms.length > 0 && (
                                    <span className="text-gray-500 text-xs ml-1">({attribute.terms.length} terms)</span>
                                )}
                            </button>
                        ))
                    ) : attributeSearchTerm ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No attributes found</div>
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">Start typing to search attributes</div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AttributeSelector
