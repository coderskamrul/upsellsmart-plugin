"use client"

import { useState, useRef, useEffect } from 'react'

const KeywordSelector = ({
    selectedKeywords = [],
    onKeywordChange,
    placeholder = "Type keywords and press Enter or comma...",
    label = "Keywords"
}) => {
    const [inputValue, setInputValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef(null)

    // Generate unique ID for this instance
    const instanceId = useState(() => `keyword-selector-${Math.random().toString(36).substr(2, 9)}`)[0]

    // Handle adding keywords
    const addKeyword = (keyword) => {
        const trimmedKeyword = keyword.trim()
        if (trimmedKeyword && !selectedKeywords.includes(trimmedKeyword)) {
            const newKeywords = [...selectedKeywords, trimmedKeyword]
            onKeywordChange(newKeywords)
        }
        setInputValue('')
    }

    // Handle removing keywords
    const removeKeyword = (keywordToRemove) => {
        const newKeywords = selectedKeywords.filter(keyword => keyword !== keywordToRemove)
        onKeywordChange(newKeywords)
    }

    // Handle input key events
    const handleKeyDown = (e) => {
        const value = e.target.value.trim()

        if (e.key === 'Enter') {
            e.preventDefault()
            if (value) {
                addKeyword(value)
            }
        } else if (e.key === 'Backspace' && !value && selectedKeywords.length > 0) {
            // Remove last keyword when backspacing on empty input
            removeKeyword(selectedKeywords[selectedKeywords.length - 1])
        }
    }

    // Handle input change (for comma separation)
    const handleInputChange = (e) => {
        const value = e.target.value

        // Check if user typed a comma
        if (value.includes(',')) {
            const keywords = value.split(',').map(k => k.trim()).filter(k => k)
            keywords.forEach(keyword => {
                if (keyword && !selectedKeywords.includes(keyword)) {
                    addKeyword(keyword)
                }
            })
            setInputValue('')
        } else {
            setInputValue(value)
        }
    }

    // Handle input blur (add current value as keyword if any)
    const handleBlur = () => {
        setIsFocused(false)
        if (inputValue.trim()) {
            addKeyword(inputValue.trim())
        }
    }

    // Handle container click to focus input
    const handleContainerClick = () => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }

    return (
        <div className={`keyword-selector-container keyword-selector-container-${instanceId}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            {/* Keywords Input Container */}
            <div
                className={`min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-text flex flex-wrap items-center gap-2 transition-colors ${isFocused ? 'ring-2 ring-green-500 border-green-500' : 'hover:border-gray-400'
                    }`}
                onClick={handleContainerClick}
            >
                {/* Selected Keywords as Tags */}
                {selectedKeywords.map((keyword, index) => (
                    <span
                        key={`${keyword}-${index}`}
                        className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800 border border-green-200"
                    >
                        {keyword}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                removeKeyword(keyword)
                            }}
                            className="ml-1 text-green-600 hover:text-green-800 focus:outline-none focus:text-green-800 transition-colors"
                            aria-label={`Remove ${keyword}`}
                        >
                            ×
                        </button>
                    </span>
                ))}

                {/* Input Field */}
                <input
                    ref={inputRef}
                    id={instanceId}
                    type="text"
                    placeholder={selectedKeywords.length > 0 ? "" : placeholder}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    className="flex-1 min-w-[120px] bg-transparent text-sm placeholder-gray-400 border-none outline-none"
                />
            </div>

            {/* Helper Text */}
            <p className="mt-1 text-xs text-gray-500">
                Type keywords and press Enter or use comma to separate multiple keywords
            </p>
        </div>
    )
}

export default KeywordSelector