import { SOCIAL_LINKS } from "@/constants";

/**
 * Dock icons configuration
 * Note: onClick handlers will be injected by the Dock component
 */
export interface DockIconConfig {
  name: string;
  displayName: string;
  action?: "chrome" | "terminal" | "vscode" | string;
  externalLink?: string;
}

export const dockIcons: DockIconConfig[] = [
  {
    name: "chrome",
    displayName: "Chrome",
    action: "chrome",
  },
  {
    name: "docker",
    displayName: "Docker",
  },
  {
    name: "iterm",
    displayName: "iTerm",
    action: "terminal",
  },
  {
    name: "slack",
    displayName: "Slack",
  },
  {
    name: "textedit",
    displayName: "TextEdit",
  },
  {
    name: "vscode",
    displayName: "VSCode",
    action: "vscode",
  },
  {
    name: "github",
    displayName: "GitHub",
    externalLink: SOCIAL_LINKS.github,
  },
  {
    name: "linkedin",
    displayName: "LinkedIn",
    externalLink: SOCIAL_LINKS.linkedin,
  },
  {
    name: "mail",
    displayName: "Mail",
    externalLink: `mailto:${SOCIAL_LINKS.email}`,
  },
  {
    name: "contact",
    displayName: "Contact",
  },
];
