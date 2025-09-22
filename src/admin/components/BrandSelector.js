"use client"

import { useState, useEffect } from 'react'

const BrandSelector = ({
    selectedBrands = [],
    selectedBrandNames = [],
    onBrandChange,
    placeholder = "Search and select brands...",
    label = "Brands"
}) => {
    const [brands, setBrands] = useState([])
    const [loadingBrands, setLoadingBrands] = useState(false)
    const [brandSearchTerm, setBrandSearchTerm] = useState('')
    const [showBrandDropdown, setShowBrandDropdown] = useState(false)

    // Fetch WooCommerce brands
    useEffect(() => {
        fetchBrands()
    }, [])

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.brand-dropdown-container')) {
                setShowBrandDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchBrands = async () => {
        setLoadingBrands(true)
        try {
            const response = await fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'upspr_get_brands',
                    nonce: window.upspr_ajax.nonce
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setBrands(data.data)
                }
            }
        } catch (error) {
            console.error('Error fetching brands:', error)
        } finally {
            setLoadingBrands(false)
        }
    }

    const handleBrandSelect = (brandId, brandName) => {
        const currentBrands = selectedBrands || []
        const currentBrandNames = selectedBrandNames || []

        if (!currentBrands.includes(brandId)) {
            const newBrands = [...currentBrands, brandId]
            const newBrandNames = [...currentBrandNames, brandName]

            onBrandChange(newBrands, newBrandNames)
        }

        setBrandSearchTerm('')
        setShowBrandDropdown(false)
    }

    const removeBrandFromSelection = (brandId) => {
        const currentBrands = selectedBrands || []
        const currentBrandNames = selectedBrandNames || []
        const index = currentBrands.indexOf(brandId)

        if (index > -1) {
            const newBrands = [...currentBrands]
            const newBrandNames = [...currentBrandNames]
            newBrands.splice(index, 1)
            newBrandNames.splice(index, 1)

            onBrandChange(newBrands, newBrandNames)
        }
    }

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(brandSearchTerm.toLowerCase()) &&
        !(selectedBrands || []).includes(brand.id.toString())
    )

    return (
        <div className="relative brand-dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            {/* Multiselect Input Container */}
            <div
                className="min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-text flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                onClick={() => {
                    const input = document.querySelector('.brand-search-input');
                    if (input) input.focus();
                }}
            >
                {/* Selected Brands as Tags */}
                {selectedBrandNames && selectedBrandNames.length > 0 && (
                    selectedBrandNames.map((brandName, index) => (
                        <span
                            key={selectedBrands[index]}
                            className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200"
                        >
                            {brandName}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeBrandFromSelection(selectedBrands[index]);
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
                    placeholder={selectedBrandNames && selectedBrandNames.length > 0 ? "" : placeholder}
                    value={brandSearchTerm}
                    onChange={(e) => {
                        setBrandSearchTerm(e.target.value)
                        setShowBrandDropdown(true)
                    }}
                    onFocus={() => setShowBrandDropdown(true)}
                    className="category-search-input brand-search-input flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm placeholder-gray-400 focus:shadow-none"
                    style={{ boxShadow: 'none', border: 'none !important' }}
                />
            </div>

            {/* Dropdown List */}
            {showBrandDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {loadingBrands ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Loading brands...</div>
                    ) : filteredBrands.length > 0 ? (
                        filteredBrands.map((brand) => (
                            <button
                                key={brand.id}
                                type="button"
                                onClick={() => handleBrandSelect(brand.id.toString(), brand.name)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                {brand.name}
                                {brand.count > 0 && (
                                    <span className="text-gray-500 text-xs ml-1">({brand.count})</span>
                                )}
                            </button>
                        ))
                    ) : brandSearchTerm ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No brands found</div>
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">Start typing to search brands</div>
                    )}
                </div>
            )}
        </div>
    )
}

export default BrandSelector
