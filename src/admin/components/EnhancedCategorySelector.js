"use client"

import { useState, useEffect } from 'react'
import filterDataMiddleware from '../middleware/FilterDataMiddleware'

/**
 * Enhanced Category Selector with middleware integration
 * This is an example of how to use the middleware with selector components
 */
const EnhancedCategorySelector = ({
    selectedCategories = [],
    selectedCategoryNames = [],
    onCategoryChange,
    placeholder = "Search and select categories...",
    label = "Categories",
    // New prop to initialize from IDs only
    initialCategoryIds = []
}) => {
    const [categories, setCategories] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(false)
    const [categorySearchTerm, setCategorySearchTerm] = useState('')
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
    const [isResolvingNames, setIsResolvingNames] = useState(false)

    // Generate unique ID for this instance
    const instanceId = useState(() => `enhanced-category-selector-${Math.random().toString(36).substr(2, 9)}`)[0]

    // Resolve names from IDs when initialCategoryIds is provided
    useEffect(() => {
        const resolveInitialNames = async () => {
            if (initialCategoryIds && initialCategoryIds.length > 0 && selectedCategoryNames.length === 0) {
                setIsResolvingNames(true)
                try {
                    console.log("Resolving category names for IDs:", initialCategoryIds)
                    const names = await filterDataMiddleware.getCategoryNames(initialCategoryIds)
                    console.log("Resolved category names:", names)
                    
                    // Update parent component with resolved names
                    onCategoryChange(initialCategoryIds, names)
                } catch (error) {
                    console.error("Error resolving category names:", error)
                } finally {
                    setIsResolvingNames(false)
                }
            }
        }

        resolveInitialNames()
    }, [initialCategoryIds, selectedCategoryNames.length, onCategoryChange])

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
            // Use middleware to fetch categories (with caching)
            const categoryData = await filterDataMiddleware.fetchCategories()
            setCategories(categoryData)
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
                {isResolvingNames && (
                    <span className="ml-2 text-xs text-blue-600">(Resolving names...)</span>
                )}
            </label>

            {/* Multiselect Input Container */}
            <div
                className="min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-text flex flex-wrap items-center gap-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500"
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
                    disabled={isResolvingNames}
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

            {/* Debug info (only in development) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 text-xs text-gray-500">
                    <div>Selected IDs: [{selectedCategories.join(', ')}]</div>
                    <div>Selected Names: [{selectedCategoryNames.join(', ')}]</div>
                    {initialCategoryIds.length > 0 && (
                        <div>Initial IDs: [{initialCategoryIds.join(', ')}]</div>
                    )}
                </div>
            )}
        </div>
    )
}

export default EnhancedCategorySelector
