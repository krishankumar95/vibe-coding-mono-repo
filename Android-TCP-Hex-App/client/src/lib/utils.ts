import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

export function formatHexString(hex: string): string {
  // Remove spaces, and ensure even number of characters
  const cleanHex = hex.replace(/\s+/g, "");
  return cleanHex.match(/.{1,2}/g)?.join(" ") || "";
}

export function hexToBuffer(hexString: string): Buffer {
  // Remove all whitespace
  const cleanHex = hexString.replace(/\s+/g, "");
  const bytes = [];
  
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes.push(parseInt(cleanHex.substr(i, 2), 16));
  }
  
  return Buffer.from(bytes);
}

export function bufferToHexString(buffer: Buffer): string {
  return Array.from(buffer)
    .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

export const getLocalStorage = (key: string): any =>
  JSON.parse(window.localStorage.getItem(key) || "null");

export const setLocalStorage = (key: string, value: any): void =>
  window.localStorage.setItem(key, JSON.stringify(value));
