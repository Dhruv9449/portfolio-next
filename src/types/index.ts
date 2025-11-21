/**
 * Shared TypeScript types and interfaces for the portfolio application
 */

// Window Management Types
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface WindowConfig {
  id: string;
  defaultPosition: Position;
  defaultSize?: Size;
}

// Icon and File Types
export type FileType = "folder" | "location" | "pdf" | "markdown" | "file";
export type ApplicationType =
  | "finder"
  | "pdfPreview"
  | "chromeBrowser"
  | "terminal"
  | "vscode"
  | "file";

export interface IconData {
  name: string;
  displayName: string;
  fileType: FileType;
  application: ApplicationType;
}

// Data Types
export interface ExperienceData {
  name: string;
  displayName: string;
  icon: string;
  duration?: string;
  location?: string;
  position?: string;
  description?: string[];
}

export interface ProjectData {
  name: string;
  displayName: string;
  icon: string;
}

export interface SchoolData {
  name: string;
  displayName: string;
  icon: string;
}

export interface SkillData {
  name: string;
  displayName: string;
  icon: string;
  category: string;
  link: string;
}

export interface SkillsByCategory {
  [category: string]: SkillData[];
}

// Window Props Types
export interface BaseWindowProps {
  defaultPosition: Position;
  onClose: () => void;
  hideTopbarAndDock: (hide: boolean) => void;
}

export interface FinderWindowConfig extends WindowConfig {
  name: string;
  displayName: string;
}

export interface FileWindowConfig extends WindowConfig {
  title: string;
  name: string;
  directory: string;
}

// Dock Types
export interface DockIcon {
  name: string;
  displayName: string;
  onClick: () => void;
}

export interface DockActions {
  [key: string]: () => void;
}

// Browser Types
export interface Tab {
  name: string;
  url: string;
  favicon: string;
}

// Note: BrowserFavorite type moved to browserConfig.ts to avoid circular dependencies
// and to properly handle icon component references
