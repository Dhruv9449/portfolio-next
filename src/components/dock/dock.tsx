import { DockActions } from "@/types";
import { dockIcons } from "@/config/dockConfig";
import { getIconPath } from "@/utils/windowHelpers";
import styles from "./dock.module.css";

interface DockProps {
  actions: DockActions;
}

export default function Dock({ actions }: DockProps) {
  const handleIconClick = (iconConfig: (typeof dockIcons)[0]) => {
    // Handle action-based clicks
    if (iconConfig.action && actions[iconConfig.action]) {
      actions[iconConfig.action]();
      return;
    }

    // Handle external link clicks
    if (iconConfig.externalLink) {
      if (iconConfig.externalLink.startsWith("mailto:")) {
        window.location.href = iconConfig.externalLink;
      } else {
        window.open(iconConfig.externalLink, "_blank");
      }
      return;
    }

    // No action defined - do nothing
  };

  return (
    <div className={styles.dock}>
      {dockIcons.map((icon, index) => (
        <div
          className={styles.dockIcon}
          key={`${icon.name}-${index}`}
          onClick={() => handleIconClick(icon)}
        >
          <img
            src={getIconPath(icon.name)}
            alt={icon.displayName}
            className={styles.iconImage}
          />
          <div className={styles.tooltip}>{icon.displayName}</div>
        </div>
      ))}
    </div>
  );
}
