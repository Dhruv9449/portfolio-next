import { useState } from "react";
import { Rnd } from "react-rnd";
import { IoFolderOutline } from "react-icons/io5";
import { CiHardDrive } from "react-icons/ci";
import { IconData, SkillData, SkillsByCategory } from "@/types";
import { getMaximizedSize } from "@/utils/windowHelpers";
import experienceData from "@/data/experienceData.json";
import projectsData from "@/data/projectData.json";
import schoolData from "@/data/schoolData.json";
import skillsData from "@/data/skillsData.json";
import styles from "./finder.module.css";

interface FinderProps {
  title: string;
  currFolder: string;
  iconData: IconData[];
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

  // Function to get the contents of the active folder
  const getCurrentFolderContents = ():
    | Array<{ name: string; displayName: string; icon: string }>
    | SkillsByCategory => {
    switch (activeFolder) {
      case "Experience":
        return experienceData;
      case "Projects":
        return projectsData;
      case "School":
        return schoolData;
      case "Skills":
        return (skillsData as SkillData[]).reduce(
          (acc: SkillsByCategory, skill: SkillData) => {
            if (!acc[skill.category]) {
              acc[skill.category] = [];
            }
            acc[skill.category].push(skill);
            return acc;
          },
          {} as SkillsByCategory
        );
      default:
        return [];
    }
  };

  const folderContents = getCurrentFolderContents();

  const toggleMaximize = () => {
    if (isMaximized) {
      hideTopbarAndDock(false);
      setSize({ width: 800, height: 500 });
      setPosition(defaultPosition);
    } else {
      hideTopbarAndDock(true);
      setSize(getMaximizedSize());
      setPosition({ x: 0, y: 0 });
    }
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    // Reset topbar and dock visibility when closing
    if (isMaximized) {
      hideTopbarAndDock(false);
    }
    onClose();
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
      onResizeStop={(e, direction, ref, delta, newPosition) => {
        setSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        setPosition(newPosition);
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
                  onClick={handleClose}
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
                Object.entries(folderContents as SkillsByCategory).map(
                  ([category, skills], index) => (
                    <div
                      key={`category-${index}`}
                      className={styles.categorySection}
                    >
                      <h6 className={styles.categoryTitle}>{category}</h6>
                      <div className={styles.iconGrid}>
                        {skills.map((skill, skillIndex) => (
                          <div
                            key={`skill-${skill.name}-${skillIndex}`}
                            className={styles.iconItem}
                            onClick={() =>
                              skill.link
                                ? window.open(skill.link, "_blank")
                                : null
                            }
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
                  {Array.isArray(folderContents) &&
                    folderContents.map((icon, index) => (
                      <div
                        key={`icon-${icon.name}-${index}`}
                        className={styles.iconItem}
                        onClick={() =>
                          openFileWindow(
                            icon.displayName,
                            icon.name,
                            activeFolder
                          )
                        }
                      >
                        <img
                          src={icon.icon}
                          alt={icon.displayName}
                          className={styles.iconImage}
                        />
                        <div className={styles.iconLabel}>
                          {icon.displayName}
                        </div>
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
