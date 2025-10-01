#!/usr/bin/env python3
"""
Script to add upspr_ prefix to all function definitions in PHP files
"""

import re
import os
import sys
from pathlib import Path

def add_prefix_to_functions(content):
    """Add upspr_ prefix to function definitions"""
    
    # Pattern to match function definitions
    # Matches: public/private/protected [static] function function_name(
    pattern = r'(\s*)(public|private|protected)(\s+static)?\s+function\s+([a-z_][a-z0-9_]*)\s*\('
    
    def replace_func(match):
        indent = match.group(1)
        visibility = match.group(2)
        static = match.group(3) or ''
        func_name = match.group(4)
        
        # Skip magic methods
        if func_name.startswith('__'):
            return match.group(0)
        
        # Skip if already has prefix
        if func_name.startswith('upspr_'):
            return match.group(0)
        
        # Add prefix
        return f'{indent}{visibility}{static} function upspr_{func_name}('
    
    # Apply replacement
    content = re.sub(pattern, replace_func, content)
    
    return content

def process_file(file_path):
    """Process a single PHP file"""
    print(f"Processing: {file_path}")
    
    try:
        # Read file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add prefixes
        new_content = add_prefix_to_functions(content)
        
        # Write back if changed
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"  ✅ Updated")
            return True
        else:
            print(f"  ⏭️  No changes needed")
            return False
            
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    # Base directory
    base_dir = Path("/Users/wpdev94/Local Sites/dev-me/app/public/wp-content/plugins/upsellsmart-plugin")
    
    # Files to process
    files = [
        "includes/class-upspr-engine-type/class-upspr-location-display.php",
        "includes/class-upspr-engine-type/class-upspr-cross-sell.php",
        "includes/class-upspr-engine-type/class-upspr-cross-sell-integration.php",
        "includes/class-upspr-engine-type/class-upspr-upsell.php",
        "includes/class-upspr-engine-type/class-upspr-related-products.php",
        "includes/class-upspr-engine-type/class-upspr-frequently-bought-together.php",
        "includes/class-upspr-engine-type/class-upspr-personalized-recommendations.php",
        "includes/class-upspr-engine-type/class-upspr-trending-products.php",
        "includes/class-upspr-engine-type/class-upspr-recently-viewed.php",
        "includes/class-upspr-engine-type/Helper/class-upspr-amplifier.php",
        "includes/class-upspr-engine-type/Helper/class-upspr-performance-tracker.php",
        "includes/class-upspr-engine-type/Helper/class-upspr-personalization.php",
        "includes/class-upspr-engine-type/Helper/class-upspr-product-filter.php",
        "includes/class-upspr-engine-type/Helper/class-upspr-visibility-checker.php",
    ]
    
    print("=" * 60)
    print("Adding UPSPR_ Prefix to Function Definitions")
    print("=" * 60)
    print()
    
    updated_count = 0
    for file_rel_path in files:
        file_path = base_dir / file_rel_path
        if file_path.exists():
            if process_file(file_path):
                updated_count += 1
        else:
            print(f"⚠️  File not found: {file_path}")
    
    print()
    print("=" * 60)
    print(f"✅ Complete! Updated {updated_count} files")
    print("=" * 60)

if __name__ == "__main__":
    main()

