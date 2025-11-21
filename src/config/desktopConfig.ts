import { IconData } from "@/types";

/**
 * Desktop icons configuration
 */
export const finderData: IconData[] = [
  {
    name: "experience",
    displayName: "Experience",
    fileType: "folder",
    application: "finder",
  },
  {
    name: "projects",
    displayName: "Projects",
    fileType: "folder",
    application: "finder",
  },
  {
    name: "school",
    displayName: "School",
    fileType: "folder",
    application: "finder",
  },
  {
    name: "skills",
    displayName: "Skills",
    fileType: "location",
    application: "finder",
  },
];

export const desktopIcons: IconData[] = [
  ...finderData,
  {
    name: "pdf",
    displayName: "Resume.pdf",
    fileType: "pdf",
    application: "pdfPreview",
  },
];
