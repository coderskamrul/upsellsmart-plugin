"use client"

import { useState, useEffect } from 'react'

const CountrySelector = ({
    selectedCountries = [],
    selectedCountryNames = [],
    onCountryChange,
    placeholder = "Search and select countries...",
    label = "Countries"
}) => {
    const [countries, setCountries] = useState([])
    const [loadingCountries, setLoadingCountries] = useState(false)
    const [countrySearchTerm, setCountrySearchTerm] = useState('')
    const [showCountryDropdown, setShowCountryDropdown] = useState(false)

    // Generate unique ID for this instance
    const instanceId = useState(() => `country-selector-${Math.random().toString(36).substr(2, 9)}`)[0]

    // Fetch WooCommerce countries
    useEffect(() => {
        console.log('CountrySelector mounted, fetching countries...') // Debug log
        fetchCountries()
    }, [])

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(`.country-dropdown-container-${instanceId}`)) {
                setShowCountryDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [instanceId])

    const fetchCountries = async () => {
        setLoadingCountries(true)
        console.log('Fetching countries...') // Debug log
        console.log('AJAX object:', window.upspr_ajax) // Debug log

        if (!window.upspr_ajax || !window.upspr_ajax.nonce) {
            console.error('AJAX object or nonce not available. Window object keys:', Object.keys(window))
            console.error('Please check if admin scripts are properly enqueued')

            // Show error in UI but still provide fallback for testing
            const fallbackCountries = [
                { code: 'US', name: 'United States' },
                { code: 'CA', name: 'Canada' },
                { code: 'GB', name: 'United Kingdom' },
                { code: 'AU', name: 'Australia' },
                { code: 'DE', name: 'Germany' },
                { code: 'FR', name: 'France' },
                { code: 'JP', name: 'Japan' },
                { code: 'IN', name: 'India' },
                { code: 'BR', name: 'Brazil' },
                { code: 'CN', name: 'China' }
            ]
            setCountries(fallbackCountries)
            setLoadingCountries(false)
            return
        }

        try {
            const response = await fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'upspr_get_countries',
                    nonce: window.upspr_ajax.nonce
                })
            })

            console.log('Response status:', response.status) // Debug log
            const responseText = await response.text()
            console.log('Raw response:', responseText) // Debug log

            if (response.ok) {
                try {
                    const data = JSON.parse(responseText)
                    console.log('Countries response:', data) // Debug log
                    if (data.success) {
                        setCountries(data.data || [])
                        console.log('Countries set from WooCommerce:', data.data.length, 'countries') // Debug log
                    } else {
                        console.error('API returned error:', data.data)
                        // Use fallback on API error
                        const fallbackCountries = [
                            { code: 'US', name: 'United States' },
                            { code: 'CA', name: 'Canada' },
                            { code: 'GB', name: 'United Kingdom' },
                            { code: 'AU', name: 'Australia' },
                            { code: 'DE', name: 'Germany' },
                            { code: 'FR', name: 'France' }
                        ]
                        setCountries(fallbackCountries)
                    }
                } catch (parseError) {
                    console.error('JSON parse error:', parseError)
                    console.error('Response was not valid JSON:', responseText)
                }
            } else {
                console.error('HTTP error:', response.status, response.statusText)
                // Use fallback on HTTP error
                const fallbackCountries = [
                    { code: 'US', name: 'United States' },
                    { code: 'CA', name: 'Canada' },
                    { code: 'GB', name: 'United Kingdom' },
                    { code: 'AU', name: 'Australia' },
                    { code: 'DE', name: 'Germany' },
                    { code: 'FR', name: 'France' }
                ]
                setCountries(fallbackCountries)
            }
        } catch (error) {
            console.error('Fetch error:', error)
            // Use fallback on fetch error
            const fallbackCountries = [
                { code: 'US', name: 'United States' },
                { code: 'CA', name: 'Canada' },
                { code: 'GB', name: 'United Kingdom' },
                { code: 'AU', name: 'Australia' },
                { code: 'DE', name: 'Germany' },
                { code: 'FR', name: 'France' }
            ]
            setCountries(fallbackCountries)
        } finally {
            setLoadingCountries(false)
        }
    }

    const handleCountrySelect = (countryCode, countryName) => {
        const currentCountries = selectedCountries || []
        const currentCountryNames = selectedCountryNames || []

        if (currentCountries.includes(countryCode)) {
            return // Already selected
        }

        const newCountries = [...currentCountries, countryCode]
        const newCountryNames = [...currentCountryNames, countryName]

        onCountryChange(newCountries, newCountryNames)
        setCountrySearchTerm('')
        setShowCountryDropdown(false)
    }

    const removeCountryFromSelection = (countryCode) => {
        const currentCountries = selectedCountries || []
        const currentCountryNames = selectedCountryNames || []
        const index = currentCountries.indexOf(countryCode)

        if (index > -1) {
            const newCountries = [...currentCountries]
            const newCountryNames = [...currentCountryNames]
            newCountries.splice(index, 1)
            newCountryNames.splice(index, 1)

            onCountryChange(newCountries, newCountryNames)
        }
    }

    const filteredCountries = countries.filter(country => {
        // If no search term or less than 2 characters, show all countries
        if (!countrySearchTerm || countrySearchTerm.length < 2) {
            return !(selectedCountries || []).includes(country.code)
        }
        // If 2+ characters, filter by search term
        return country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) &&
            !(selectedCountries || []).includes(country.code)
    })

    // Debug log
    console.log('Countries:', countries.length, 'Search term:', countrySearchTerm, 'Filtered:', filteredCountries.length, 'Show dropdown:', showCountryDropdown)

    return (
        <div className={`relative country-dropdown-container country-dropdown-container-${instanceId}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            {/* Multiselect Input Container */}
            <div
                className="min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-text flex flex-wrap items-center gap-2 focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500"
                onClick={() => {
                    const input = document.querySelector(`#${instanceId}`);
                    if (input) input.focus();
                }}
            >
                {/* Selected Countries as Tags */}
                {selectedCountryNames && selectedCountryNames.length > 0 && (
                    selectedCountryNames.map((countryName, index) => (
                        <span
                            key={selectedCountries[index]}
                            className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                        >
                            {countryName}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeCountryFromSelection(selectedCountries[index]);
                                }}
                                className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
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
                    placeholder={selectedCountryNames && selectedCountryNames.length > 0 ? "" : placeholder}
                    value={countrySearchTerm}
                    onChange={(e) => {
                        console.log('Input changed:', e.target.value) // Debug log
                        setCountrySearchTerm(e.target.value)
                        setShowCountryDropdown(true)
                    }}
                    onFocus={() => {
                        console.log('Input focused, showing dropdown') // Debug log
                        setShowCountryDropdown(true)
                    }}
                    className="flex-1 min-w-[120px] bg-transparent text-sm placeholder-gray-400"
                    style={{
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                        backgroundColor: 'transparent'
                    }}
                />
            </div>

            {/* Dropdown List */}
            {showCountryDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto" style={{ zIndex: 9999 }}>
                    {loadingCountries ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Loading countries...</div>
                    ) : filteredCountries.length > 0 ? (
                        filteredCountries.map((country) => (
                            <button
                                key={country.code}
                                type="button"
                                onClick={() => handleCountrySelect(country.code, country.name)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                {country.name}
                                <span className="text-gray-500 text-xs ml-1">({country.code})</span>
                            </button>
                        ))
                    ) : countrySearchTerm && countrySearchTerm.length >= 2 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No countries found</div>
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                            {countrySearchTerm && countrySearchTerm.length < 2
                                ? "Type 2+ characters to search"
                                : "Click to see all countries or type to search"
                            }
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default CountrySelector