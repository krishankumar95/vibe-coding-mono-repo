/**
 * Validates an IP address string
 */
export function validateIpAddress(ip: string): boolean {
  if (!ip) return false;
  
  // IPv4 address pattern
  const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 address pattern (simplified)
  const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  // Domain name pattern (simplified)
  const domainPattern = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip) || domainPattern.test(ip);
}

/**
 * Validates a port number string 
 */
export function validatePort(port: string): boolean {
  if (!port) return false;
  
  const portNum = parseInt(port, 10);
  return !isNaN(portNum) && portNum > 0 && portNum <= 65535;
}

/**
 * Validates if a string is valid hex format
 */
export function isValidHex(hex: string): boolean {
  if (!hex || hex.trim() === "") return false;
  
  // Remove all whitespace and check if valid hex characters
  const cleanHex = hex.replace(/\s+/g, "");
  
  // Must have at least 2 characters and be in pairs
  if (cleanHex.length < 2 || cleanHex.length % 2 !== 0) return false;
  
  // Check if all characters are valid hex digits
  return /^[0-9A-F]+$/i.test(cleanHex);
}
