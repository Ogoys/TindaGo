# Search Screen Assets

This directory contains images for the customer search screen.

## Required Images

Please add the following images to this directory:

### 1. search-illustration.png
- **Description**: Empty state illustration when no search query is entered
- **Suggested content**: Magnifying glass icon or search-related illustration
- **Recommended size**: 200x200px or larger
- **Format**: PNG with transparency

### 2. no-results.png
- **Description**: Illustration shown when search returns no results
- **Suggested content**: Empty box, sad face, or "no results" illustration
- **Recommended size**: 200x200px or larger
- **Format**: PNG with transparency

## Usage

These images are used in:
- `app/(main)/(customer)/search.tsx`

The search screen will show:
1. `search-illustration.png` - When the search bar is empty (initial state)
2. `no-results.png` - When a search query returns zero results
