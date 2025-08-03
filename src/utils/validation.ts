/**
 * Utilitaires de validation pour l'application ClimInvest
 */

/**
 * Valide un numéro de téléphone pour les pays d'Afrique de l'Ouest
 * Formats acceptés:
 * - Bénin: +229 XX XX XX XX
 * - Burkina Faso: +226 XX XX XX XX
 * - Sénégal: +221 XX XXX XX XX
 * - Niger: +227 XX XX XX XX
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Nettoyer le numéro (supprimer espaces, tirets, etc.)
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Patterns pour les différents pays
  const patterns = [
    /^\+229[0-9]{8}$/, // Bénin
    /^\+226[0-9]{8}$/, // Burkina Faso
    /^\+221[0-9]{9}$/, // Sénégal
    /^\+227[0-9]{8}$/, // Niger
    /^229[0-9]{8}$/,   // Bénin sans +
    /^226[0-9]{8}$/,   // Burkina Faso sans +
    /^221[0-9]{9}$/,   // Sénégal sans +
    /^227[0-9]{8}$/,   // Niger sans +
  ];

  return patterns.some(pattern => pattern.test(cleanPhone));
}

/**
 * Formate un numéro de téléphone pour l'affichage
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';

  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Ajouter le + si manquant
  let formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone;
  
  // Formater selon le pays
  if (formattedPhone.startsWith('+229')) {
    // Bénin: +229 XX XX XX XX
    return formattedPhone.replace(/(\+229)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  } else if (formattedPhone.startsWith('+226')) {
    // Burkina Faso: +226 XX XX XX XX
    return formattedPhone.replace(/(\+226)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  } else if (formattedPhone.startsWith('+221')) {
    // Sénégal: +221 XX XXX XX XX
    return formattedPhone.replace(/(\+221)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  } else if (formattedPhone.startsWith('+227')) {
    // Niger: +227 XX XX XX XX
    return formattedPhone.replace(/(\+227)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  return formattedPhone;
}

/**
 * Valide un nom (au moins 2 caractères, lettres et espaces uniquement)
 */
export function validateName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const trimmedName = name.trim();
  return trimmedName.length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(trimmedName);
}

/**
 * Valide une taille de ferme (doit être un nombre positif)
 */
export function validateFarmSize(size: number | string): boolean {
  const numSize = typeof size === 'string' ? parseFloat(size) : size;
  return !isNaN(numSize) && numSize > 0 && numSize <= 1000; // Max 1000 hectares
}

/**
 * Valide un type de culture
 */
export function validateCropType(cropType: string): boolean {
  const validCrops = ['maize', 'rice', 'cotton', 'millet', 'sorghum', 'yam', 'cassava'];
  return validCrops.includes(cropType);
}

/**
 * Valide des coordonnées GPS
 */
export function validateCoordinates(lat: number, lon: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180 &&
    !isNaN(lat) &&
    !isNaN(lon)
  );
}

/**
 * Valide une adresse email
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valide un montant d'assurance
 */
export function validateInsuranceAmount(amount: number | string): boolean {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(numAmount) && numAmount >= 10000 && numAmount <= 10000000; // Entre 10k et 10M FCFA
}

/**
 * Valide une date (doit être dans le futur pour les échéances)
 */
export function validateFutureDate(date: string | Date): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  return targetDate > now;
}

/**
 * Valide les données complètes d'inscription
 */
export function validateRegistrationData(data: {
  name: string;
  phone: string;
  farmSize: number;
  cropType: string;
  location?: { latitude: number; longitude: number; region: string };
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!validateName(data.name)) {
    errors.push('Le nom doit contenir au moins 2 caractères et uniquement des lettres');
  }

  if (!validatePhone(data.phone)) {
    errors.push('Format de téléphone invalide. Utilisez: +229 XX XX XX XX');
  }

  if (!validateFarmSize(data.farmSize)) {
    errors.push('La taille de la ferme doit être un nombre positif (max 1000 ha)');
  }

  if (!validateCropType(data.cropType)) {
    errors.push('Type de culture invalide');
  }

  if (data.location && !validateCoordinates(data.location.latitude, data.location.longitude)) {
    errors.push('Coordonnées GPS invalides');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
