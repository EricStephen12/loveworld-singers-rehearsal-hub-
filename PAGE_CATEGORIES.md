# Page Categories Feature

## Overview
The Page Categories feature allows administrators to organize pages (praise nights) into custom categories for better organization and navigation. This feature is separate from the existing song categories and provides a way to group pages by themes, events, or other organizational criteria.

## Features

### 1. Create Page Categories
- Administrators can create custom page categories with names and descriptions
- Categories are stored in a dedicated Firebase collection
- Each category can be used to group multiple pages

### 2. Assign Pages to Categories
- When creating or editing a page, administrators can assign it to a page category
- Pages can belong to only one page category at a time
- The page category is stored as a field in the page document

### 3. Manage Page Categories
- View all page categories in a dedicated admin section
- Edit existing page categories
- Delete page categories (with confirmation)
- Search page categories by name or description

## Implementation Details

### Data Structure
The page category feature adds a new field to the PraiseNight interface:
```typescript
interface PraiseNight {
  // ... existing fields
  pageCategory?: string; // New optional field for page category
}
```

A new collection `page_categories` is created in Firebase to store category information:
```typescript
interface PageCategory {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Components
1. **PageCategoriesSection** - Dedicated section for managing page categories
2. **AdminModals** - Updated to include page category creation/editing modal
3. **AdminSidebar** - Added "Page Categories" navigation item
4. **PagesSection** - Updated to include page category field in page editing

### Database Changes
- Added new methods to `FirebaseDatabaseService`:
  - `createPageCategory()`
  - `updatePageCategory()`
  - `deletePageCategory()`
  - `getPageCategories()`

## Usage

### Creating a Page Category
1. Navigate to the "Page Categories" section in the admin panel
2. Click "Add Page Category"
3. Enter a name and description for the category
4. Click "Add Category"

### Assigning a Page to a Category
1. Navigate to the "Pages" section
2. Create a new page or edit an existing page
3. Select a page category from the "Page Category" dropdown
4. Save the page

### Managing Page Categories
1. Navigate to the "Page Categories" section
2. View all existing categories
3. Use the search bar to find specific categories
4. Edit or delete categories using the action buttons

## Benefits
- Improved organization of pages
- Easier navigation for users
- Better content management for administrators
- Flexible grouping options for different types of events or themes