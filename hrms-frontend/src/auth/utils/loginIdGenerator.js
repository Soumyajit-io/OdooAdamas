/**
 * Login ID Auto-Generation Utility
 * 
 * Format: [CompanyInitials][First2First+First2Last][Year][Serial]
 * Example: OIJODO20220001
 * 
 * OI     = Odoo India (company initials — first letter of each word)
 * JODO   = First 2 letters of first name (JO) + first 2 letters of last name (DO)
 * 2022   = Year of joining
 * 0001   = Serial number of joining that year (zero-padded to 4 digits)
 */

/**
 * Extract initials from a company name.
 * Takes the first letter of each word, uppercased.
 * e.g. "Odoo India" → "OI", "Adamas Consulting" → "AC"
 */
export function getCompanyInitials(companyName) {
  if (!companyName || typeof companyName !== 'string') return 'XX';
  return companyName
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Generate the name code from first name and last name.
 * Takes first 2 characters of each, uppercased.
 * e.g. "John", "Doe" → "JODO"
 * Pads with 'X' if name is shorter than 2 chars.
 */
export function getNameCode(firstName, lastName) {
  const fn = (firstName || 'XX').toUpperCase().replace(/[^A-Z]/g, '');
  const ln = (lastName || 'XX').toUpperCase().replace(/[^A-Z]/g, '');
  const firstPart = (fn + 'XX').substring(0, 2);
  const lastPart = (ln + 'XX').substring(0, 2);
  return firstPart + lastPart;
}

/**
 * Format serial number to 4-digit zero-padded string.
 * e.g. 1 → "0001", 42 → "0042"
 */
export function formatSerial(number) {
  return String(Math.max(1, number || 1)).padStart(4, '0');
}

/**
 * Generate a complete Login ID.
 * 
 * @param {string} companyName - Full company name (e.g. "Odoo India")
 * @param {string} firstName - Employee's first name
 * @param {string} lastName - Employee's last name
 * @param {number|string} joiningYear - Year of joining (e.g. 2022)
 * @param {number} serialNumber - Serial number for that year (e.g. 1)
 * @returns {string} Generated Login ID (e.g. "OIJODO20220001")
 */
export function generateLoginId(companyName, firstName, lastName, joiningYear, serialNumber) {
  const initials = getCompanyInitials(companyName);
  const nameCode = getNameCode(firstName, lastName);
  const year = String(joiningYear || new Date().getFullYear());
  const serial = formatSerial(serialNumber);
  return `${initials}${nameCode}${year}${serial}`;
}

/**
 * Generate a temporary password.
 * Format: first 4 chars of Login ID + "@" + random 4-digit number
 * e.g. "OIJO@7342"
 */
export function generateTempPassword(loginId) {
  const prefix = (loginId || 'TEMP').substring(0, 4);
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `${prefix}@${rand}`;
}
