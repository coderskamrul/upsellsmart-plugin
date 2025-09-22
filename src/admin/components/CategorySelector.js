"use client"

import { useState, useEffect } from 'react'

const CategorySelector = ({
    selectedCategories = [],
    selectedCategoryNames = [],
    onCategoryChange,
    placeholder = "Search and select categories...",
    label = "Categories"
}) => {
    const [categories, setCategories] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(false)
    const [categorySearchTerm, setCategorySearchTerm] = useState('')
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

    // Generate unique ID for this instance
    const instanceId = useState(() => `category-selector-${Math.random().toString(36).substr(2, 9)}`)[0]

    // Fetch WooCommerce categories
    useEffect(() => {
        fetchCategories()
    }, [])

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(`.category-dropdown-container-${instanceId}`)) {
                setShowCategoryDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [instanceId])

    const fetchCategories = async () => {
        setLoadingCategories(true)
        try {
            const response = await fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'upspr_get_categories',
                    nonce: window.upspr_ajax.nonce
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setCategories(data.data)
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setLoadingCategories(false)
        }
    }

    const handleCategorySelect = (categoryId, categoryName) => {
        const currentCategories = selectedCategories || []
        const currentCategoryNames = selectedCategoryNames || []

        if (!currentCategories.includes(categoryId)) {
            const newCategories = [...currentCategories, categoryId]
            const newCategoryNames = [...currentCategoryNames, categoryName]

            onCategoryChange(newCategories, newCategoryNames)
        }

        setCategorySearchTerm('')
        setShowCategoryDropdown(false)
    }

    const removeCategoryFromSelection = (categoryId) => {
        const currentCategories = selectedCategories || []
        const currentCategoryNames = selectedCategoryNames || []
        const index = currentCategories.indexOf(categoryId)

        if (index > -1) {
            const newCategories = [...currentCategories]
            const newCategoryNames = [...currentCategoryNames]
            newCategories.splice(index, 1)
            newCategoryNames.splice(index, 1)

            onCategoryChange(newCategories, newCategoryNames)
        }
    }

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) &&
        !(selectedCategories || []).includes(category.id.toString())
    )

    return (
        <div className={`relative category-dropdown-container category-dropdown-container-${instanceId}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            {/* Multiselect Input Container */}
            <div
                className="min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-text flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                onClick={() => {
                    const input = document.querySelector(`#${instanceId}`);
                    if (input) input.focus();
                }}
            >
                {/* Selected Categories as Tags */}
                {selectedCategoryNames && selectedCategoryNames.length > 0 && (
                    selectedCategoryNames.map((categoryName, index) => (
                        <span
                            key={selectedCategories[index]}
                            className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200"
                        >
                            {categoryName}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeCategoryFromSelection(selectedCategories[index]);
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
                    id={instanceId}
                    type="text"
                    placeholder={selectedCategoryNames && selectedCategoryNames.length > 0 ? "" : placeholder}
                    value={categorySearchTerm}
                    onChange={(e) => {
                        setCategorySearchTerm(e.target.value)
                        setShowCategoryDropdown(true)
                    }}
                    onFocus={() => setShowCategoryDropdown(true)}
                    className="upspr-category-search-input flex-1 min-w-[120px] bg-transparent text-sm placeholder-gray-400"
                />
            </div>

            {/* Dropdown List */}
            {showCategoryDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {loadingCategories ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Loading categories...</div>
                    ) : filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => handleCategorySelect(category.id.toString(), category.name)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                {category.name}
                                {category.count > 0 && (
                                    <span className="text-gray-500 text-xs ml-1">({category.count})</span>
                                )}
                            </button>
                        ))
                    ) : categorySearchTerm ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No categories found</div>
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">Start typing to search categories</div>
                    )}
                </div>
            )}
        </div>
    )
}

export default CategorySelector
