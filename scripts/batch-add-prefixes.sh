#!/bin/bash

# Batch script to add upspr_ prefix to all remaining function definitions
# This script processes all campaign type and helper class files

echo "========================================="
echo "Batch Adding UPSPR_ Prefix to Functions"
echo "========================================="
echo ""

# Define the plugin directory
PLUGIN_DIR="/Users/wpdev94/Local Sites/dev-me/app/public/wp-content/plugins/upsellsmart-plugin"

# Change to plugin directory
cd "$PLUGIN_DIR" || exit 1

# Create backup
echo "Creating backup..."
BACKUP_DIR="${PLUGIN_DIR}_batch_backup_$(date +%Y%m%d_%H%M%S)"
cp -r "$PLUGIN_DIR" "$BACKUP_DIR"
echo "✅ Backup created at: $BACKUP_DIR"
echo ""

# Function to process a single file
process_file() {
    local file=$1
    echo "Processing: $file"
    
    if [ ! -f "$file" ]; then
        echo "  ⚠️  File not found: $file"
        return
    fi
    
    # Create temporary file
    local temp_file="${file}.tmp"
    
    # Use sed to add prefix to function definitions
    # Match: public/private/protected [static] function function_name(
    # Replace with: public/private/protected [static] function upspr_function_name(
    
    sed -E '
        # Public static functions
        s/^([[:space:]]*)public static function ([a-z_][a-z0-9_]*)\(/\1public static function upspr_\2(/g
        # Public functions
        s/^([[:space:]]*)public function ([a-z_][a-z0-9_]*)\(/\1public function upspr_\2(/g
        # Private static functions
        s/^([[:space:]]*)private static function ([a-z_][a-z0-9_]*)\(/\1private static function upspr_\2(/g
        # Private functions
        s/^([[:space:]]*)private function ([a-z_][a-z0-9_]*)\(/\1private function upspr_\2(/g
        # Protected static functions
        s/^([[:space:]]*)protected static function ([a-z_][a-z0-9_]*)\(/\1protected static function upspr_\2(/g
        # Protected functions
        s/^([[:space:]]*)protected function ([a-z_][a-z0-9_]*)\(/\1protected function upspr_\2(/g
    ' "$file" > "$temp_file"
    
    # Fix double prefixes (in case function already had prefix)
    sed -i '' 's/upspr_upspr_/upspr_/g' "$temp_file"
    
    # Restore magic methods (they should NOT have prefix)
    sed -i '' 's/public function upspr___construct(/public function __construct(/g' "$temp_file"
    sed -i '' 's/private function upspr___construct(/private function __construct(/g' "$temp_file"
    sed -i '' 's/protected function upspr___construct(/protected function __construct(/g' "$temp_file"
    sed -i '' 's/public function upspr___destruct(/public function __destruct(/g' "$temp_file"
    sed -i '' 's/public function upspr___call(/public function __call(/g' "$temp_file"
    sed -i '' 's/public function upspr___callStatic(/public function __callStatic(/g' "$temp_file"
    sed -i '' 's/public function upspr___get(/public function __get(/g' "$temp_file"
    sed -i '' 's/public function upspr___set(/public function __set(/g' "$temp_file"
    sed -i '' 's/public function upspr___isset(/public function __isset(/g' "$temp_file"
    sed -i '' 's/public function upspr___unset(/public function __unset(/g' "$temp_file"
    sed -i '' 's/public function upspr___toString(/public function __toString(/g' "$temp_file"
    sed -i '' 's/public function upspr___invoke(/public function __invoke(/g' "$temp_file"
    
    # Replace original file with processed file
    mv "$temp_file" "$file"
    
    echo "  ✅ Definitions updated"
}

# List of files to process
FILES=(
    "includes/class-upspr-engine-type/class-upspr-location-display.php"
    "includes/class-upspr-engine-type/class-upspr-cross-sell.php"
    "includes/class-upspr-engine-type/class-upspr-cross-sell-integration.php"
    "includes/class-upspr-engine-type/class-upspr-upsell.php"
    "includes/class-upspr-engine-type/class-upspr-related-products.php"
    "includes/class-upspr-engine-type/class-upspr-frequently-bought-together.php"
    "includes/class-upspr-engine-type/class-upspr-personalized-recommendations.php"
    "includes/class-upspr-engine-type/class-upspr-trending-products.php"
    "includes/class-upspr-engine-type/class-upspr-recently-viewed.php"
    "includes/class-upspr-engine-type/Helper/class-upspr-amplifier.php"
    "includes/class-upspr-engine-type/Helper/class-upspr-performance-tracker.php"
    "includes/class-upspr-engine-type/Helper/class-upspr-personalization.php"
    "includes/class-upspr-engine-type/Helper/class-upspr-product-filter.php"
    "includes/class-upspr-engine-type/Helper/class-upspr-visibility-checker.php"
)

echo "Files to process: ${#FILES[@]}"
echo ""

# Process each file
for file in "${FILES[@]}"; do
    process_file "$file"
done

echo ""
echo "========================================="
echo "✅ Phase 1 Complete: Function Definitions Updated"
echo "========================================="
echo ""
echo "Files processed: ${#FILES[@]}"
echo "Backup location: $BACKUP_DIR"
echo ""

