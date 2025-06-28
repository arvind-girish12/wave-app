// Character ID to name mapping for sharing functionality
export const characterNames = {
  1: 'mira',
  2: 'nova',
  3: 'seraphina',
  4: 'maccallan',
  5: 'zenny',
  6: 'reed',
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

// Get character ID by name
export const getCharacterId = (name) => {
  return characterNameToId[name] || null;
};

// Generate share URL for a character
export const generateShareUrl = (characterName) => {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://app.wave-length.in';
  
  return `${baseUrl}?character=${characterName}`;
}; 