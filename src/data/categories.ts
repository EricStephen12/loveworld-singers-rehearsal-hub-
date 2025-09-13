// Category Management System
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Default categories
export const defaultCategories: Category[] = [
  {
    id: "new-praise-songs",
    name: "New Praise Songs",
    description: "Latest praise and worship songs",
    icon: "Music",
    color: "#3B82F6",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "new-healing-songs",
    name: "New Healing Songs",
    description: "Songs focused on healing and restoration",
    icon: "Heart",
    color: "#EF4444",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "previously-ministered-songs",
    name: "Previously Ministered Songs",
    description: "Songs that have been ministered before",
    icon: "BookOpen",
    color: "#10B981",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "approved-songs",
    name: "Approved Songs",
    description: "Songs approved for ministry",
    icon: "CheckCircle",
    color: "#8B5CF6",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "previously-ministered-healing-songs",
    name: "Previously Ministered Healing Songs",
    description: "Healing songs that have been ministered before",
    icon: "Sparkles",
    color: "#F59E0B",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "loveworld-orchestra",
    name: "LoveWorld Orchestra",
    description: "Orchestral arrangements and performances",
    icon: "Users",
    color: "#EC4899",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "praise-in-languages",
    name: "Praise in Languages",
    description: "Songs in different languages",
    icon: "Globe",
    color: "#06B6D4",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "special-songs",
    name: "Special Songs",
    description: "Special occasion and traditional songs",
    icon: "Star",
    color: "#84CC16",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Category management functions
export class CategoryManager {
  private static STORAGE_KEY = 'praise_night_categories';

  // Get all categories
  static getCategories(): Category[] {
    if (typeof window === 'undefined') return defaultCategories;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((cat: any) => ({
          ...cat,
          createdAt: new Date(cat.createdAt),
          updatedAt: new Date(cat.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
    
    return defaultCategories;
  }

  // Save categories to localStorage
  static saveCategories(categories: Category[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }

  // Add a new category
  static addCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category {
    const categories = this.getCategories();
    const newCategory: Category = {
      ...categoryData,
      id: `category-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  }

  // Update an existing category
  static updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Category | null {
    const categories = this.getCategories();
    const index = categories.findIndex(cat => cat.id === id);
    
    if (index === -1) return null;
    
    categories[index] = {
      ...categories[index],
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveCategories(categories);
    return categories[index];
  }

  // Delete a category
  static deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const filtered = categories.filter(cat => cat.id !== id);
    
    if (filtered.length === categories.length) return false; // Category not found
    
    this.saveCategories(filtered);
    return true;
  }

  // Toggle category active status
  static toggleCategory(id: string): Category | null {
    const categories = this.getCategories();
    const category = categories.find(cat => cat.id === id);
    
    if (!category) return null;
    
    return this.updateCategory(id, { isActive: !category.isActive });
  }

  // Get active categories only
  static getActiveCategories(): Category[] {
    return this.getCategories().filter(cat => cat.isActive);
  }

  // Get category by ID
  static getCategoryById(id: string): Category | null {
    return this.getCategories().find(cat => cat.id === id) || null;
  }

  // Get category by name
  static getCategoryByName(name: string): Category | null {
    return this.getCategories().find(cat => cat.name === name) || null;
  }

  // Reset to default categories
  static resetToDefaults(): void {
    this.saveCategories(defaultCategories);
  }

  // Get category names (for backward compatibility)
  static getCategoryNames(): string[] {
    return this.getActiveCategories().map(cat => cat.name);
  }
}

// Export for easy access
export const categoryManager = CategoryManager;

// Example usage functions for admin panel (ready to use)
export const categoryAdminFunctions = {
  // Add a new category
  addCategory: (name: string, description?: string, icon?: string, color?: string) => {
    return categoryManager.addCategory({
      name,
      description,
      icon: icon || 'Music',
      color: color || '#3B82F6',
      isActive: true
    });
  },

  // Delete a category
  deleteCategory: (id: string) => {
    return categoryManager.deleteCategory(id);
  },

  // Update category name
  updateCategoryName: (id: string, newName: string) => {
    return categoryManager.updateCategory(id, { name: newName });
  },

  // Toggle category active status
  toggleCategory: (id: string) => {
    return categoryManager.toggleCategory(id);
  },

  // Get all categories for admin display
  getAllCategories: () => {
    return categoryManager.getCategories();
  },

  // Get active categories for user display
  getActiveCategories: () => {
    return categoryManager.getActiveCategories();
  },

  // Reset to default categories
  resetCategories: () => {
    categoryManager.resetToDefaults();
  }
};
