# Icons Directory

This directory contains common icons used throughout the TindaGo app.

## Required Icons for Search Screen

Please add the following icon files:

### 1. arrow-left.png
- **Description**: Back button arrow pointing left
- **Usage**: Navigation back button in search screen
- **Recommended size**: 24x24px
- **Format**: PNG with transparency
- **Color**: Black (#1E1E1E) or can be tinted dynamically

### 2. filter.png
- **Description**: Filter/funnel icon for search filters
- **Usage**: Filter button in search screen header
- **Recommended size**: 24x24px
- **Format**: PNG with transparency
- **Color**: Black (#1E1E1E) or can be tinted dynamically

### 3. clock.png
- **Description**: Clock icon for recent searches
- **Usage**: Recent search history items
- **Recommended size**: 20x20px
- **Format**: PNG with transparency
- **Color**: Gray (#7A7B7B) or can be tinted dynamically

## Alternative Solution

If you don't have these icons yet, you can:
1. Download free icons from [Iconscout](https://iconscout.com) or [Flaticon](https://www.flaticon.com)
2. Use Ionicons by updating the code to use `<Ionicons>` instead of `<Image>` components
3. Extract icons from your Figma design

## Usage

These icons are used in:
- `app/(main)/(customer)/search.tsx`
- Other screens across the app
