# Filter Data Middleware

This middleware handles ID-to-name mapping for filter components in the UpSellSmart plugin. It resolves IDs to their corresponding names for display purposes and handles the conversion between saved data and component-ready data.

## Features

- **Caching**: Implements intelligent caching with 5-minute expiry to reduce API calls
- **Batch Processing**: Efficiently processes multiple IDs in single requests
- **Error Handling**: Graceful error handling with fallback display names
- **Singleton Pattern**: Single instance shared across the application

## Usage

### Basic Usage

```javascript
import filterDataMiddleware from '../middleware/FilterDataMiddleware'

// Process filter data from saved campaign
const processedData = await filterDataMiddleware.processFilterData(filters)

// Process visibility data
const processedVisibility = await filterDataMiddleware.processVisibilityData(visibility)
```

### Individual Name Resolution

```javascript
// Get category names by IDs
const categoryNames = await filterDataMiddleware.getCategoryNames([19, 21])

// Get tag names by IDs
const tagNames = await filterDataMiddleware.getTagNames([31, 32])

// Get brand names by IDs
const brandNames = await filterDataMiddleware.getBrandNames([35, 34])

// Get attribute names by IDs
const attributeNames = await filterDataMiddleware.getAttributeNames([1, 2])

// Get product names by IDs
const productNames = await filterDataMiddleware.getProductNames([67, 65])
```

## Data Structure

### Input (Filter Data with IDs only)
```javascript
{
  includeCategories: [19, 21],
  includeTags: [31, 32],
  brands: [35, 34],
  attributes: [1, 2],
  excludeProducts: [67, 65],
  excludeCategories: [20]
}
```

### Output (Processed Data with Names)
```javascript
{
  includeCategories: [19, 21],
  includeCategoryNames: ["Electronics", "Accessories"],
  includeTags: [31, 32],
  includeTagNames: ["Featured", "Popular"],
  brands: [35, 34],
  brandNames: ["Apple", "Samsung"],
  attributes: [1, 2],
  attributeNames: ["Color", "Size"],
  excludeProducts: [67, 65],
  excludeProductNames: ["Product A", "Product B"],
  excludeCategories: [20],
  excludeCategoryNames: ["Clearance"]
}
```

## API Endpoints

The middleware uses these WordPress AJAX endpoints:

- `upspr_get_categories` - Fetch all categories
- `upspr_get_tags` - Fetch all tags
- `upspr_get_brands` - Fetch all brands
- `upspr_get_attributes` - Fetch all attributes
- `upspr_get_products_by_ids` - Fetch specific products by IDs

## Cache Management

```javascript
// Clear all caches
filterDataMiddleware.clearCache()

// Get cache statistics
const stats = filterDataMiddleware.getCacheStats()
console.log(stats)
```

## Integration with Components

The middleware is integrated with the CreateRecommendationPage component to automatically resolve names when loading saved campaign data:

```javascript
// In CreateRecommendationPage.js
useEffect(() => {
  const processFilterNames = async () => {
    if (editMode && initialData && initialData.filters) {
      const processedFilters = await filterDataMiddleware.processFilterData(initialData.filters)
      const processedVisibility = await filterDataMiddleware.processVisibilityData(initialData.visibility)
      
      setFormData(prevData => ({
        ...prevData,
        includeCategoryNames: processedFilters.includeCategoryNames || [],
        excludeCategoryNames: processedFilters.excludeCategoryNames || [],
        // ... other name fields
      }))
    }
  }
  
  processFilterNames()
}, [editMode, initialData])
```

## Testing

A test page is available at `/wp-admin/admin.php?page=upsellsmart-test` (only visible when WP_DEBUG is enabled) to test the middleware functionality with sample data.

## Error Handling

The middleware includes comprehensive error handling:

- Network errors are caught and logged
- Invalid IDs fallback to display format like "Category 19"
- Empty arrays are handled gracefully
- Cache failures don't break the application

## Performance Considerations

- **Caching**: 5-minute cache reduces redundant API calls
- **Batch Processing**: Multiple IDs processed in single requests where possible
- **Lazy Loading**: Data is only fetched when needed
- **Memory Efficient**: Uses Map objects for O(1) lookups
