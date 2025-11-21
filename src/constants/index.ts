/**
 * Application constants
 */

// Window positioning
export const WINDOW_OFFSET = 30;
export const DEFAULT_WINDOW_POSITION = { x: 100, y: 100 };

// Window sizes
export const DEFAULT_FINDER_SIZE = { width: 800, height: 500 };
export const DEFAULT_BROWSER_SIZE = { width: 1000, height: 600 };
export const MAXIMIZED_WINDOW_SIZE = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Responsive breakpoints
export const MOBILE_WIDTH_BREAKPOINT = 500;
export const MOBILE_HEIGHT_BREAKPOINT = 600;

// URLs and Links
export const SOCIAL_LINKS = {
  github: "https://github.com/Dhruv9449",
  linkedin: "https://www.linkedin.com/in/dhruv9449/",
  email: "dhruvshahrds@gmail.com",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  metadata: "https://api.microlink.io",
} as const;

// Default values
export const DEFAULT_TAB = {
  name: "New Tab",
  url: "",
  favicon: "https://www.google.com/chrome/static/images/chrome-logo.svg",
} as const;

// User info
export const USER_INFO = {
  name: "Dhruv Shah",
  title: "Portfolio",
} as const;
