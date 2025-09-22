"use client"

import { useState, useEffect } from 'react'

const TagSelector = ({
    selectedTags = [],
    selectedTagNames = [],
    onTagChange,
    placeholder = "Search and select tags...",
    label = "Tags"
}) => {
    const [tags, setTags] = useState([])
    const [loadingTags, setLoadingTags] = useState(false)
    const [tagSearchTerm, setTagSearchTerm] = useState('')
    const [showTagDropdown, setShowTagDropdown] = useState(false)

    // Fetch WooCommerce tags
    useEffect(() => {
        fetchTags()
    }, [])

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.tag-dropdown-container')) {
                setShowTagDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchTags = async () => {
        setLoadingTags(true)
        try {
            const response = await fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'upspr_get_tags',
                    nonce: window.upspr_ajax.nonce
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setTags(data.data)
                }
            }
        } catch (error) {
            console.error('Error fetching tags:', error)
        } finally {
            setLoadingTags(false)
        }
    }

    const handleTagSelect = (tagId, tagName) => {
        const currentTags = selectedTags || []
        const currentTagNames = selectedTagNames || []

        if (!currentTags.includes(tagId)) {
            const newTags = [...currentTags, tagId]
            const newTagNames = [...currentTagNames, tagName]

            onTagChange(newTags, newTagNames)
        }

        setTagSearchTerm('')
        setShowTagDropdown(false)
    }

    const removeTagFromSelection = (tagId) => {
        const currentTags = selectedTags || []
        const currentTagNames = selectedTagNames || []
        const index = currentTags.indexOf(tagId)

        if (index > -1) {
            const newTags = [...currentTags]
            const newTagNames = [...currentTagNames]
            newTags.splice(index, 1)
            newTagNames.splice(index, 1)

            onTagChange(newTags, newTagNames)
        }
    }

    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase()) &&
        !(selectedTags || []).includes(tag.id.toString())
    )

    return (
        <div className="relative tag-dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            {/* Multiselect Input Container */}
            <div
                className="min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-text flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                onClick={() => {
                    const input = document.querySelector('.tag-search-input');
                    if (input) input.focus();
                }}
            >
                {/* Selected Tags as Tags */}
                {selectedTagNames && selectedTagNames.length > 0 && (
                    selectedTagNames.map((tagName, index) => (
                        <span
                            key={selectedTags[index]}
                            className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200"
                        >
                            {tagName}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeTagFromSelection(selectedTags[index]);
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
                    placeholder={selectedTagNames && selectedTagNames.length > 0 ? "" : placeholder}
                    value={tagSearchTerm}
                    onChange={(e) => {
                        setTagSearchTerm(e.target.value)
                        setShowTagDropdown(true)
                    }}
                    onFocus={() => setShowTagDropdown(true)}
                    className="category-search-input tag-search-input flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm placeholder-gray-400 focus:shadow-none"
                    style={{ boxShadow: 'none', border: 'none !important' }}
                />
            </div>

            {/* Dropdown List */}
            {showTagDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {loadingTags ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Loading tags...</div>
                    ) : filteredTags.length > 0 ? (
                        filteredTags.map((tag) => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleTagSelect(tag.id.toString(), tag.name)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                {tag.name}
                                {tag.count > 0 && (
                                    <span className="text-gray-500 text-xs ml-1">({tag.count})</span>
                                )}
                            </button>
                        ))
                    ) : tagSearchTerm ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No tags found</div>
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">Start typing to search tags</div>
                    )}
                </div>
            )}
        </div>
    )
}

export default TagSelector
