import { ComponentType } from "react";
import { BsBing, BsGithub, BsLinkedin, BsYoutube } from "react-icons/bs";
import { IconBaseProps } from "react-icons";
import { SOCIAL_LINKS } from "@/constants";

/**
 * Browser favorite configuration type
 * Stores component references instead of JSX elements for better serialization
 */
export interface BrowserFavoriteConfig {
  name: string;
  url: string;
  IconComponent: ComponentType<IconBaseProps>;
  windowRedirect: boolean;
}

/**
 * Browser favorites configuration
 * Icons are stored as component references, not instantiated JSX
 */
export const browserFavorites: BrowserFavoriteConfig[] = [
  {
    name: "Bing",
    url: "https://www.bing.com/search?q=Dhruv9449",
    IconComponent: BsBing,
    windowRedirect: false,
  },
  {
    name: "GitHub",
    url: SOCIAL_LINKS.github,
    IconComponent: BsGithub,
    windowRedirect: true,
  },
  {
    name: "LinkedIn",
    url: SOCIAL_LINKS.linkedin,
    IconComponent: BsLinkedin,
    windowRedirect: true,
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    IconComponent: BsYoutube,
    windowRedirect: true,
  },
];
