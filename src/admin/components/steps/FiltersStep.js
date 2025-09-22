"use client"

import { useState, useEffect } from 'react'
import CategorySelector from '../CategorySelector'
import TagSelector from '../TagSelector'
import BrandSelector from '../BrandSelector'
import AttributeSelector from '../AttributeSelector'
import ProductSelector from '../ProductSelector'

const FiltersStep = ({ formData, updateFormData }) => {
  const handleArrayUpdate = (field, value) => {
    const values = value.split(',').map(v => v.trim()).filter(v => v)
    updateFormData(field, values)
  }

  const handlePriceRangeUpdate = (type, value) => {
    updateFormData('priceRange', {
      ...formData.priceRange,
      [type]: value
    })
  }

  const handleIncludeCategoryChange = (categoryIds, categoryNames) => {
    updateFormData('includeCategories', categoryIds)
    updateFormData('includeCategoryNames', categoryNames)
  }

  const handleExcludeCategoryChange = (categoryIds, categoryNames) => {
    updateFormData('excludeCategories', categoryIds)
    updateFormData('excludeCategoryNames', categoryNames)
  }

  const handleIncludeTagChange = (tagIds, tagNames) => {
    updateFormData('includeTags', tagIds)
    updateFormData('includeTagNames', tagNames)
  }

  const handleIncludeBrandChange = (brandIds, brandNames) => {
    updateFormData('brands', brandIds)
    updateFormData('brandNames', brandNames)
  }

  const handleIncludeAttributeChange = (attributeIds, attributeNames) => {
    updateFormData('attributes', attributeIds)
    updateFormData('attributeNames', attributeNames)
  }

  const handleExcludeProductChange = (productIds, productNames) => {
    updateFormData('excludeProducts', productIds)
    updateFormData('excludeProductNames', productNames)
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Filters</h3>
        <p className="text-gray-600">Define which products should be included or excluded from recommendations</p>
      </div>

      {/* Include Products Section */}
      <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Include Products</h4>
        <p className="text-sm text-gray-600 mb-4">Products that match these criteria will be included</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories */}
          <CategorySelector
            selectedCategories={formData.includeCategories || []}
            selectedCategoryNames={formData.includeCategoryNames || []}
            onCategoryChange={handleIncludeCategoryChange}
            placeholder="Search and select categories to include..."
            label="Categories"
          />

          {/* Tags */}
          <TagSelector
            selectedTags={formData.includeTags || []}
            selectedTagNames={formData.includeTagNames || []}
            onTagChange={handleIncludeTagChange}
            placeholder="Search and select tags to include..."
            label="Tags"
          />

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={formData.priceRange.min}
                onChange={(e) => handlePriceRangeUpdate('min', e.target.value)}
                className="upspr-input"
              />
              <input
                type="number"
                placeholder="Max"
                value={formData.priceRange.max}
                onChange={(e) => handlePriceRangeUpdate('max', e.target.value)}
                className="upspr-input"
              />
            </div>
          </div>

          {/* Stock Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Status
            </label>
            <select
              value={formData.stockStatus}
              onChange={(e) => updateFormData('stockStatus', e.target.value)}
              className="upspr-select"
            >
              <option value="any">Any</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="on-backorder">On Backorder</option>
            </select>
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Type
            </label>
            <select
              value={formData.productType}
              onChange={(e) => updateFormData('productType', e.target.value)}
              className="upspr-select"
            >
              <option value="any">Any</option>
              <option value="simple">Simple</option>
              <option value="variable">Variable</option>
              <option value="grouped">Grouped</option>
              <option value="external">External</option>
            </select>
          </div>

          {/* Brands */}
          <BrandSelector
            selectedBrands={formData.brands || []}
            selectedBrandNames={formData.brandNames || []}
            onBrandChange={handleIncludeBrandChange}
            placeholder="Search and select brands..."
            label="Brands"
          />

          {/* Attributes */}
          <AttributeSelector
            selectedAttributes={formData.attributes || []}
            selectedAttributeNames={formData.attributeNames || []}
            onAttributeChange={handleIncludeAttributeChange}
            placeholder="Search and select attributes..."
            label="Attributes"
          />
        </div>
      </div>

      {/* Exclude Products Section */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Exclude Products</h4>
        <p className="text-sm text-gray-600 mb-4">Products that match these criteria will be excluded</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Specific Products */}
          <ProductSelector
            selectedProducts={formData.excludeProducts || []}
            selectedProductNames={formData.excludeProductNames || []}
            onProductChange={handleExcludeProductChange}
            placeholder="Search and select products to exclude..."
            label="Specific Products"
          />

          {/* Categories to Exclude */}
          <CategorySelector
            selectedCategories={formData.excludeCategories || []}
            selectedCategoryNames={formData.excludeCategoryNames || []}
            onCategoryChange={handleExcludeCategoryChange}
            placeholder="Search and select categories to exclude..."
            label="Categories to Exclude"
          />
        </div>

        {/* Exclusion Checkboxes */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="exclude-sale"
              checked={formData.excludeSaleProducts}
              onChange={(e) => updateFormData('excludeSaleProducts', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="exclude-sale" className="ml-2 text-sm text-gray-700">
              Exclude Sale Products
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="exclude-featured"
              checked={formData.excludeFeaturedProducts}
              onChange={(e) => updateFormData('excludeFeaturedProducts', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="exclude-featured" className="ml-2 text-sm text-gray-700">
              Exclude Featured Products
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FiltersStep
