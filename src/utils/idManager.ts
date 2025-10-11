/**
 * Unified ID Manager for handling both Supabase numeric IDs and Firebase string IDs
 * This solves the migration issues between Supabase and Firebase
 */

export class IDManager {
  /**
   * Normalize any ID to a consistent string format
   * Handles both numeric IDs (from Supabase) and string IDs (from Firebase)
   */
  static normalizeId(id: any): string {
    if (id === null || id === undefined) {
      return '';
    }
    
    // Convert to string and trim
    const stringId = String(id).trim();
    
    // Return empty string if invalid
    if (stringId === '' || stringId === 'null' || stringId === 'undefined') {
      return '';
    }
    
    return stringId;
  }

  /**
   * Check if an ID is a Firebase document ID (string with letters/numbers)
   */
  static isFirebaseId(id: any): boolean {
    const normalizedId = this.normalizeId(id);
    
    // Firebase IDs are typically 20 characters, alphanumeric
    // They don't start with just numbers
    return normalizedId.length >= 15 && 
           normalizedId.length <= 25 && 
           /^[a-zA-Z0-9]+$/.test(normalizedId) &&
           !/^\d+$/.test(normalizedId); // Not just numbers
  }

  /**
   * Check if an ID is a Supabase numeric ID
   */
  static isSupabaseId(id: any): boolean {
    const normalizedId = this.normalizeId(id);
    
    // Supabase IDs are typically numeric
    return /^\d+$/.test(normalizedId) && normalizedId.length <= 10;
  }

  /**
   * Get the primary ID for database operations
   * Prioritizes Firebase ID if available, falls back to other ID
   */
  static getPrimaryId(song: any): string {
    // Priority order: firebaseId > id > other possible ID fields
    const candidates = [
      song.firebaseId,
      song.id,
      song.documentId,
      song.firebase_document_id
    ];

    for (const candidate of candidates) {
      const normalized = this.normalizeId(candidate);
      if (normalized) {
        return normalized;
      }
    }

    return '';
  }

  /**
   * Get the display ID for UI purposes
   * Always returns a string for consistent display
   */
  static getDisplayId(song: any): string {
    return this.getPrimaryId(song);
  }

  /**
   * Check if two IDs are equivalent (handles different formats)
   */
  static areIdsEqual(id1: any, id2: any): boolean {
    const normalized1 = this.normalizeId(id1);
    const normalized2 = this.normalizeId(id2);
    
    return normalized1 === normalized2 && normalized1 !== '';
  }

  /**
   * Create a safe ID for new songs
   * This will be handled by Firebase when creating documents
   */
  static createNewId(): string {
    // Return empty string - Firebase will generate the actual ID
    return '';
  }

  /**
   * Validate if an ID is suitable for database operations
   */
  static isValidId(id: any): boolean {
    const normalized = this.normalizeId(id);
    return normalized !== '';
  }

  /**
   * Debug helper to log ID information
   */
  static debugIds(song: any, context: string = ''): void {
    console.log(`🔍 ID Debug ${context}:`, {
      originalSong: song,
      firebaseId: song.firebaseId,
      id: song.id,
      primaryId: this.getPrimaryId(song),
      displayId: this.getDisplayId(song),
      isFirebaseId: this.isFirebaseId(this.getPrimaryId(song)),
      isSupabaseId: this.isSupabaseId(this.getPrimaryId(song)),
      allFields: Object.keys(song)
    });
  }
}

export default IDManager;
