import { Position, Size } from "@/types";

/**
 * Utility functions for window management
 */

/**
 * Calculates the position for a new window with an offset
 */
export const calculateWindowPosition = (
  windowCount: number,
  offset: number,
  basePosition: Position
): Position => {
  return {
    x: basePosition.x + offset * windowCount,
    y: basePosition.y + offset * windowCount,
  };
};

/**
 * Calculates the maximized window size
 */
export const getMaximizedSize = (): Size => {
  if (typeof window === "undefined") {
    return { width: 1920, height: 1080 }; // Default for SSR
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

/**
 * Checks if the device is mobile based on screen dimensions
 */
export const isMobileDevice = (width: number, height: number): boolean => {
  return width < 500 || height < 600;
};

/**
 * Normalizes a URL by adding https:// if missing
 */
export const normalizeUrl = (url: string): string => {
  if (!url || url.trim() === "") return "";
  if (!url.match(/^https?:\/\//i)) {
    return `https://${url}`;
  }
  return url;
};

/**
 * Formats a file path for icons
 */
export const getIconPath = (name: string, subfolder?: string): string => {
  return subfolder ? `/icons/${subfolder}/${name}.png` : `/icons/${name}.png`;
};
