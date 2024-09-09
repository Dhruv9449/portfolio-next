import styles from "./finder.module.css";
import { useState } from "react";
import { IoFolderOutline } from "react-icons/io5";
import { CiHardDrive } from "react-icons/ci";
import experienceData from "./experienceData.json";
import projectsData from "./projectData.json";
import schoolData from "./schoolData.json";
import skillsData from "./skillsData.json";
import { Rnd } from "react-rnd";

interface FinderProps {
  title: string;
  currFolder: string;
  iconData: { name: string; displayName: string; fileType: string }[];
  onClose: () => void;
  defaultPosition: { x: number; y: number };
  hideTopbarAndDock: (hide: boolean) => void;
  openFileWindow: (name: string, title: string, directory: string) => void;
}

export default function Finder({
  title,
  currFolder,
  iconData,
  onClose,
  defaultPosition,
  hideTopbarAndDock,
  openFileWindow,
}: FinderProps) {
  const [activeFolder, setActiveFolder] = useState(currFolder);
  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState({ width: 800, height: 500 });
  const [position, setPosition] = useState(defaultPosition);

  const folders = iconData.filter((icon) => icon.fileType === "folder");
  const locations = iconData.filter((icon) => icon.fileType === "location");

  const handleFolderClick = (folderName: string) => {
    setActiveFolder(folderName);
  };

  const getCurrentFolderContents = () => {
    switch (activeFolder) {
      case "Experience":
        return experienceData;
      case "Projects":
        return projectsData;
      case "School":
        return schoolData;
      case "Skills":
        return skillsData.reduce((acc, skill) => {
          if (!acc[skill.category]) {
            acc[skill.category] = [];
          }
          acc[skill.category].push(skill);
          return acc;
        }, {} as { [key: string]: Array<{ name: string; displayName: string; icon: string }> });
      default:
        return [];
    }
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      // Exit document full screen
      // document.exitFullscreen();

      // Restore original size and position
      hideTopbarAndDock(false);
      setSize({ width: 800, height: 500 });
      setPosition(defaultPosition);
    } else {
      // // Enter document full screen
      // document.documentElement.requestFullscreen();
      // // Wait for the document to enter full screen
      // document.addEventListener("fullscreenchange", () => {
      //   if (document.fullscreenElement) {
      // // Maximize window and set position to top-left corner
      hideTopbarAndDock(true);
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setPosition({ x: 0, y: 0 });

      // Remove event listener after maximizing
      // document.removeEventListener("fullscreenchange", () => {});
      // }
    }
    setIsMaximized(!isMaximized);
  };

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      bounds="parent"
      enableResizing={{
        top: false,
        right: true,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: true,
        bottomLeft: false,
        topLeft: false,
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
      }}
      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
      }}
      dragHandleClassName="draggableHandle"
    >
      <div className={styles.finderWindow}>
        <div className={styles.finderContent}>
          <div className={styles.sidebar}>
            <div className={styles.finderSidebarHeader + " draggableHandle"}>
              <div className={styles.windowButtons}>
                <button
                  className={styles.closeButton}
                  onClick={onClose}
                ></button>
                <button className={styles.minimizeButton}></button>
                <button
                  className={styles.maximizeButton}
                  onClick={toggleMaximize}
                ></button>
              </div>
            </div>
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarSectionTitle}>Favorites</h3>
              {folders.map((icon, index) => (
                <div
                  key={index}
                  className={`${styles.sidebarItem} ${
                    activeFolder === icon.displayName ? styles.active : ""
                  }`}
                  onClick={() => handleFolderClick(icon.displayName)}
                >
                  <IoFolderOutline className={styles.sidebarFolderLogo} />
                  {icon.displayName}
                </div>
              ))}
            </div>
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarSectionTitle}>Locations</h3>
              {locations.map((icon, index) => (
                <div
                  key={index}
                  className={`${styles.sidebarItem} ${
                    activeFolder === icon.displayName ? styles.active : ""
                  }`}
                  onClick={() => handleFolderClick(icon.displayName)}
                >
                  <CiHardDrive className={styles.sidebarVolumeLogo} />
                  {icon.displayName}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.mainContent}>
            <div className={styles.finderHeader + " draggableHandle"}>
              <div className={styles.windowTitle}>
                {activeFolder ? `${activeFolder}` : title}
              </div>
            </div>
            <div className={styles.finderBody}>
              {activeFolder === "Skills" ? (
                Object.entries(getCurrentFolderContents()).map(
                  ([category, skills], index) => (
                    <div key={index} className={styles.categorySection}>
                      <h6 className={styles.categoryTitle}>{category}</h6>
                      <div className={styles.iconGrid}>
                        {skills.map((skill, skillIndex) => (
                          <div
                            key={skillIndex}
                            className={styles.iconItem}
                            onClick={() => window.open(skill.link, "_blank")}
                          >
                            <img
                              src={skill.icon}
                              alt={skill.displayName}
                              className={`${styles.iconImage} ${styles.toolIcon}`}
                            />
                            <div className={styles.iconLabel}>
                              {skill.displayName}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className={styles.iconGrid}>
                  {getCurrentFolderContents().map((icon, index) => (
                    <div
                      key={index}
                      className={styles.iconItem}
                      onClick={openFileWindow.bind(
                        null,
                        icon.displayName,
                        icon.name,
                        activeFolder
                      )}
                    >
                      <img
                        src={icon.icon}
                        alt={icon.displayName}
                        className={styles.iconImage}
                      />
                      <div className={styles.iconLabel}>{icon.displayName}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Rnd>
  );
}
