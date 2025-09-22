"use client"

import { useState, useEffect } from 'react'

const ProductSelector = ({
    selectedProducts = [],
    selectedProductNames = [],
    onProductChange,
    placeholder = "Search and select products...",
    label = "Products"
}) => {
    const [products, setProducts] = useState([])
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [productSearchTerm, setProductSearchTerm] = useState('')
    const [showProductDropdown, setShowProductDropdown] = useState(false)

    // Fetch WooCommerce products
    useEffect(() => {
        if (productSearchTerm.length >= 2) {
            fetchProducts()
        } else {
            setProducts([])
        }
    }, [productSearchTerm])

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.product-dropdown-container')) {
                setShowProductDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchProducts = async () => {
        setLoadingProducts(true)
        try {
            const response = await fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'upspr_get_products',
                    search: productSearchTerm,
                    nonce: window.upspr_ajax.nonce
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setProducts(data.data)
                }
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoadingProducts(false)
        }
    }

    const handleProductSelect = (productId, productName) => {
        const currentProducts = selectedProducts || []
        const currentProductNames = selectedProductNames || []

        if (!currentProducts.includes(productId)) {
            const newProducts = [...currentProducts, productId]
            const newProductNames = [...currentProductNames, productName]

            onProductChange(newProducts, newProductNames)
        }

        setProductSearchTerm('')
        setShowProductDropdown(false)
    }

    const removeProductFromSelection = (productId) => {
        const currentProducts = selectedProducts || []
        const currentProductNames = selectedProductNames || []
        const index = currentProducts.indexOf(productId)

        if (index > -1) {
            const newProducts = [...currentProducts]
            const newProductNames = [...currentProductNames]
            newProducts.splice(index, 1)
            newProductNames.splice(index, 1)

            onProductChange(newProducts, newProductNames)
        }
    }

    const filteredProducts = products.filter(product =>
        !(selectedProducts || []).includes(product.id.toString())
    )

    return (
        <div className="relative product-dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            {/* Multiselect Input Container */}
            <div
                className="min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-text flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                onClick={() => {
                    const input = document.querySelector('.product-search-input');
                    if (input) input.focus();
                }}
            >
                {/* Selected Products as Tags */}
                {selectedProductNames && selectedProductNames.length > 0 && (
                    selectedProductNames.map((productName, index) => (
                        <span
                            key={selectedProducts[index]}
                            className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200"
                        >
                            {productName}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeProductFromSelection(selectedProducts[index]);
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
                    placeholder={selectedProductNames && selectedProductNames.length > 0 ? "" : placeholder}
                    value={productSearchTerm}
                    onChange={(e) => {
                        setProductSearchTerm(e.target.value)
                        setShowProductDropdown(true)
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    className="category-search-input product-search-input flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm placeholder-gray-400 focus:shadow-none"
                    style={{ boxShadow: 'none', border: 'none !important' }}
                />
            </div>

            {/* Dropdown List */}
            {showProductDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {productSearchTerm.length < 2 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Type at least 2 characters to search products</div>
                    ) : loadingProducts ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Searching products...</div>
                    ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <button
                                key={product.id}
                                type="button"
                                onClick={() => handleProductSelect(product.id.toString(), product.name)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                {product.name}
                            </button>
                        ))
                    ) : productSearchTerm ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No products found</div>
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">Start typing to search products</div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ProductSelector
