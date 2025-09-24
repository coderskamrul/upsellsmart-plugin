"use client"

/**
 * FilterDataMiddleware - Handles ID to name mapping for filter components
 * This middleware resolves IDs to their corresponding names for display purposes
 * and handles the conversion between saved data and component-ready data
 */

class FilterDataMiddleware {
    constructor() {
        this.cache = {
            categories: new Map(),
            tags: new Map(),
            brands: new Map(),
            attributes: new Map(),
            products: new Map()
        }
        this.cacheExpiry = {
            categories: null,
            tags: null,
            brands: null,
            attributes: null,
            products: null
        }
        this.CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
    }

    /**
     * Check if cache is valid for a given type
     */
    isCacheValid(type) {
        const expiry = this.cacheExpiry[type]
        return expiry && Date.now() < expiry
    }

    /**
     * Set cache expiry for a given type
     */
    setCacheExpiry(type) {
        this.cacheExpiry[type] = Date.now() + this.CACHE_DURATION
    }

    /**
     * Fetch categories from WordPress
     */
    async fetchCategories() {
        if (this.isCacheValid('categories') && this.cache.categories.size > 0) {
            return Array.from(this.cache.categories.values())
        }

        try {
            const response = await fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'upspr_get_categories',
                    nonce: window.upspr_ajax?.nonce || ''
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success && data.data) {
                    // Clear and populate cache
                    this.cache.categories.clear()
                    data.data.forEach(category => {
                        this.cache.categories.set(category.id.toString(), category)
                    })
                    this.setCacheExpiry('categories')
                    return data.data
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
        return []
    }

    /**
     * Fetch tags from WordPress
     */
    async fetchTags() {
        if (this.isCacheValid('tags') && this.cache.tags.size > 0) {
            return Array.from(this.cache.tags.values())
        }

        try {
            const response = await fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'upspr_get_tags',
                    nonce: window.upspr_ajax?.nonce || ''
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success && data.data) {
                    // Clear and populate cache
                    this.cache.tags.clear()
                    data.data.forEach(tag => {
                        this.cache.tags.set(tag.id.toString(), tag)
                    })
                    this.setCacheExpiry('tags')
                    return data.data
                }
            }
        } catch (error) {
            console.error('Error fetching tags:', error)
        }
        return []
    }

    /**
     * Fetch brands from WordPress
     */
    async fetchBrands() {
        if (this.isCacheValid('brands') && this.cache.brands.size > 0) {
            return Array.from(this.cache.brands.values())
        }

        try {
            const response = await fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'upspr_get_brands',
                    nonce: window.upspr_ajax?.nonce || ''
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success && data.data) {
                    // Clear and populate cache
                    this.cache.brands.clear()
                    data.data.forEach(brand => {
                        this.cache.brands.set(brand.id.toString(), brand)
                    })
                    this.setCacheExpiry('brands')
                    return data.data
                }
            }
        } catch (error) {
            console.error('Error fetching brands:', error)
        }
        return []
    }

    /**
     * Fetch attributes from WordPress
     */
    async fetchAttributes() {
        if (this.isCacheValid('attributes') && this.cache.attributes.size > 0) {
            return Array.from(this.cache.attributes.values())
        }

        try {
            const response = await fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'upspr_get_attributes',
                    nonce: window.upspr_ajax?.nonce || ''
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success && data.data) {
                    // Clear and populate cache
                    this.cache.attributes.clear()
                    data.data.forEach(attribute => {
                        this.cache.attributes.set(attribute.id.toString(), attribute)
                    })
                    this.setCacheExpiry('attributes')
                    return data.data
                }
            }
        } catch (error) {
            console.error('Error fetching attributes:', error)
        }
        return []
    }

    /**
     * Fetch products by IDs from WordPress
     */
    async fetchProductsByIds(productIds) {
        if (!productIds || productIds.length === 0) return []

        // Check cache first
        const cachedProducts = []
        const uncachedIds = []

        productIds.forEach(id => {
            const idStr = id.toString()
            if (this.cache.products.has(idStr)) {
                cachedProducts.push(this.cache.products.get(idStr))
            } else {
                uncachedIds.push(idStr)
            }
        })

        // If all products are cached, return them
        if (uncachedIds.length === 0) {
            return cachedProducts
        }

        try {
            const response = await fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'upspr_get_products_by_ids',
                    product_ids: uncachedIds.join(','),
                    nonce: window.upspr_ajax?.nonce || ''
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success && data.data) {
                    // Cache the fetched products
                    data.data.forEach(product => {
                        this.cache.products.set(product.id.toString(), product)
                    })

                    // Return combined cached and fetched products
                    return [...cachedProducts, ...data.data]
                }
            }
        } catch (error) {
            console.error('Error fetching products by IDs:', error)
        }
        return cachedProducts
    }

    /**
     * Get category names by IDs
     */
    async getCategoryNames(categoryIds) {
        if (!categoryIds || categoryIds.length === 0) return []

        await this.fetchCategories()
        return categoryIds.map(id => {
            const category = this.cache.categories.get(id.toString())
            return category ? category.name : `Category ${id}`
        })
    }

    /**
     * Get tag names by IDs
     */
    async getTagNames(tagIds) {
        if (!tagIds || tagIds.length === 0) return []

        await this.fetchTags()
        return tagIds.map(id => {
            const tag = this.cache.tags.get(id.toString())
            return tag ? tag.name : `Tag ${id}`
        })
    }

    /**
     * Get brand names by IDs
     */
    async getBrandNames(brandIds) {
        if (!brandIds || brandIds.length === 0) return []

        await this.fetchBrands()
        return brandIds.map(id => {
            const brand = this.cache.brands.get(id.toString())
            return brand ? brand.name : `Brand ${id}`
        })
    }

    /**
     * Get attribute names by IDs
     */
    async getAttributeNames(attributeIds) {
        if (!attributeIds || attributeIds.length === 0) return []

        await this.fetchAttributes()
        return attributeIds.map(id => {
            const attribute = this.cache.attributes.get(id.toString())
            return attribute ? attribute.name : `Attribute ${id}`
        })
    }

    /**
     * Get product names by IDs
     */
    async getProductNames(productIds) {
        if (!productIds || productIds.length === 0) return []

        const products = await this.fetchProductsByIds(productIds)
        return productIds.map(id => {
            const product = products.find(p => p.id.toString() === id.toString())
            return product ? product.name : `Product ${id}`
        })
    }

    /**
     * Process filter data from saved campaign and resolve names
     * This is the main method to use when loading saved campaign data
     */
    async processFilterData(filters) {
        if (!filters) return {}

        const processedData = { ...filters }

        try {
            // Process include categories
            if (filters.includeCategories && filters.includeCategories.length > 0) {
                processedData.includeCategoryNames = await this.getCategoryNames(filters.includeCategories)
            }

            // Process exclude categories
            if (filters.excludeCategories && filters.excludeCategories.length > 0) {
                processedData.excludeCategoryNames = await this.getCategoryNames(filters.excludeCategories)
            }

            // Process include tags
            if (filters.includeTags && filters.includeTags.length > 0) {
                processedData.includeTagNames = await this.getTagNames(filters.includeTags)
            }

            // Process brands
            if (filters.brands && filters.brands.length > 0) {
                processedData.brandNames = await this.getBrandNames(filters.brands)
            }

            // Process attributes
            if (filters.attributes && filters.attributes.length > 0) {
                processedData.attributeNames = await this.getAttributeNames(filters.attributes)
            }

            // Process exclude products
            if (filters.excludeProducts && filters.excludeProducts.length > 0) {
                processedData.excludeProductNames = await this.getProductNames(filters.excludeProducts)
            }

        } catch (error) {
            console.error('Error processing filter data:', error)
        }

        return processedData
    }

    /**
     * Process visibility data and resolve names for user roles, products, and categories
     */
    async processVisibilityData(visibility) {
        if (!visibility) return {}

        const processedData = { ...visibility }

        try {
            // Process required products in cart
            if (visibility.requiredProductsInCart && visibility.requiredProductsInCart.length > 0) {
                processedData.requiredProductsInCartNames = await this.getProductNames(visibility.requiredProductsInCart)
            }

            // Process required categories in cart
            if (visibility.requiredCategoriesInCart && visibility.requiredCategoriesInCart.length > 0) {
                processedData.requiredCategoriesInCartNames = await this.getCategoryNames(visibility.requiredCategoriesInCart)
            }

        } catch (error) {
            console.error('Error processing visibility data:', error)
        }

        return processedData
    }

    /**
     * Fetch countries from WordPress AJAX endpoint
     */
    async fetchCountries() {
        try {
            const response = await fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'upspr_get_countries',
                    nonce: window.upspr_ajax?.nonce || ''
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success && data.data) {
                    return data.data
                }
            }
        } catch (error) {
            console.error('Error fetching countries:', error)
        }
        return []
    }

    /**
     * Fetch states from WordPress AJAX endpoint
     */
    async fetchStates(countryCodes = []) {
        try {
            const response = await fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'upspr_get_states',
                    countries: countryCodes.join(','),
                    nonce: window.upspr_ajax?.nonce || ''
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success && data.data) {
                    return data.data
                }
            }
        } catch (error) {
            console.error('Error fetching states:', error)
        }
        return []
    }

    /**
     * Get country names by codes
     */
    async getCountryNames(countryCodes) {
        if (!countryCodes || countryCodes.length === 0) return []

        try {
            const countries = await this.fetchCountries()
            return countryCodes.map(code => {
                const country = countries.find(c => c.code === code)
                return country ? country.name : `Country ${code}`
            })
        } catch (error) {
            console.error('Error resolving country names:', error)
            return countryCodes.map(code => `Country ${code}`)
        }
    }

    /**
     * Get state names by codes
     */
    async getStateNames(stateCodes, countryCodes = []) {
        if (!stateCodes || stateCodes.length === 0) return []

        try {
            const states = await this.fetchStates(countryCodes)
            return stateCodes.map(code => {
                const state = states.find(s => s.code === code)
                return state ? state.name : `State ${code}`
            })
        } catch (error) {
            console.error('Error resolving state names:', error)
            return stateCodes.map(code => `State ${code}`)
        }
    }

    /**
     * Process personalization data and resolve names for countries and states
     */
    async processPersonalizationData(personalization) {
        if (!personalization) return {}

        const processedData = { ...personalization }

        try {
            // Process selected countries - resolve names from codes
            if (personalization.selectedCountries && personalization.selectedCountries.length > 0) {
                processedData.selectedCountryNames = await this.getCountryNames(personalization.selectedCountries)
            }

            // Process selected states - resolve names from codes
            if (personalization.selectedStates && personalization.selectedStates.length > 0) {
                processedData.selectedStateNames = await this.getStateNames(
                    personalization.selectedStates,
                    personalization.selectedCountries || []
                )
            }

        } catch (error) {
            console.error('Error processing personalization data:', error)
        }

        return processedData
    }

    /**
     * Clear all caches - useful for testing or when data might be stale
     */
    clearCache() {
        Object.keys(this.cache).forEach(key => {
            this.cache[key].clear()
            this.cacheExpiry[key] = null
        })
    }

    /**
     * Get cache statistics for debugging
     */
    getCacheStats() {
        return {
            categories: {
                count: this.cache.categories.size,
                valid: this.isCacheValid('categories')
            },
            tags: {
                count: this.cache.tags.size,
                valid: this.isCacheValid('tags')
            },
            brands: {
                count: this.cache.brands.size,
                valid: this.isCacheValid('brands')
            },
            attributes: {
                count: this.cache.attributes.size,
                valid: this.isCacheValid('attributes')
            },
            products: {
                count: this.cache.products.size,
                valid: this.isCacheValid('products')
            }
        }
    }
}

// Create a singleton instance
const filterDataMiddleware = new FilterDataMiddleware()

export default filterDataMiddleware
