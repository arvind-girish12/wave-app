// Character ID to name mapping for sharing functionality
export const characterNames = {
  1: 'mira',
  2: 'nova james',
  3: 'seraphina',
  4: 'marcus "mac" callahan',
  5: 'zenny',
  6: 'reed callahan',
  7: 'arjun',
  8: 'lucky',
  9: 'dadu'
};

// Character name to ID mapping (reverse lookup)
export const characterNameToId = Object.fromEntries(
  Object.entries(characterNames).map(([id, name]) => [name, parseInt(id)])
);

// Get character name by ID
export const getCharacterName = (id) => {
  return characterNames[id] || null;
};

// Get character ID by name (handles both full names and partial matches)
export const getCharacterId = (name) => {
  if (!name) return null;
  
  const normalizedName = name.toLowerCase().trim();
  
  // First try exact match
  if (characterNameToId[normalizedName]) {
    return characterNameToId[normalizedName];
  }
  
  // Then try partial match (first word)
  const firstWord = normalizedName.split(' ')[0];
  if (characterNameToId[firstWord]) {
    return characterNameToId[firstWord];
  }
  
  // Finally try matching any part of the name
  for (const [charName, charId] of Object.entries(characterNameToId)) {
    if (charName.includes(normalizedName) || normalizedName.includes(charName)) {
      return charId;
    }
  }
  
  return null;
};

// Generate share URL for a character
export const generateShareUrl = (characterName) => {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://app.wave-length.in';
  
  return `${baseUrl}?character=${characterName}`;
}; 