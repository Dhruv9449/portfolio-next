"use client"; // Mark this file as a Client Component

import React, { useState } from "react";
import TopBar from "@/components/topbar/topbar";
import Dock from "@/components/dock/dock";
import styles from "./page.module.css";
import DesktopIcon from "@/components/desktopIcon/desktopIcon";
import FinderWindow from "@/components/apps/finder/finder";
import { v4 as uuidv4 } from "uuid";
import ArcBrowser from "@/components/apps/arcBrowser/arcBrowser";
import File from "@/components/apps/file/file";

// Define the icon data with name and displayName
const iconData = [
  { name: "experience", displayName: "Experience", fileType: "folder" },
  { name: "projects", displayName: "Projects", fileType: "folder" },
  { name: "school", displayName: "School", fileType: "folder" },
  { name: "skills", displayName: "Skills", fileType: "location" },
  // Add more icons as needed
];

export default function Home() {
  // State to manage dock & topbar visibility
  const [hideTopbarAndDock, setHideTopbarAndDock] = useState(false);

  // Finder Window Management
  // ---------------------------------------------------------------------------------------------------------------------
  // State to manage open finder windows with unique IDs and positions
  const [finderWindows, setFinderWindows] = useState<
    { id: string; name: string; displayName: string; x: number; y: number }[]
  >([]);

  // Offset for window positioning
  const windowOffset = 30;

  // Function to open a new Finder window with a unique ID and position
  const openFinderWindow = (props: { name: string; displayName: string }) => {
    // Initial position should be the center of the screen
    const newWindow = {
      id: uuidv4(), // Generate a unique ID for the window
      name: props.name,
      displayName: props.displayName,
      // Position the window with an offset based on the number of open windows
      x: windowOffset * (finderWindows.length + 10),
      y: windowOffset * (finderWindows.length + 5),
    };
    setFinderWindows((prevWindows) => [...prevWindows, newWindow]);
  };

  // Function to close a Finder window by its unique ID
  const closeFinderWindow = (id: string) => {
    setFinderWindows((prevWindows) =>
      prevWindows.filter((window) => window.id !== id)
    );
  };
  // ---------------------------------------------------------------------------------------------------------------------

  // Arc Browser Management
  // ---------------------------------------------------------------------------------------------------------------------
  const [isArcBrowserOpen, setIsArcBrowserOpen] = useState(false);

  const openArcBrowser = () => {
    setIsArcBrowserOpen(true);
  };

  const closeArcBrowser = () => {
    setIsArcBrowserOpen(false);
  };

  const dockActions = {
    arc: openArcBrowser,
  };

  // ---------------------------------------------------------------------------------------------------------------------

  // File window management
  // ---------------------------------------------------------------------------------------------------------------------

  // State to manage open file windows with unique IDs and positions
  const [fileWindows, setFileWindows] = useState<
    {
      id: string;
      title: string;
      name: string;
      directory: string;
      x: number;
      y: number;
    }[]
  >([]);

  // Function to open a new file window with a unique ID and position
  const openFileWindow = (title: string, name: string, directory: string) => {
    // Initial position should be the center of the screen
    const newWindow = {
      id: uuidv4(), // Generate a unique ID for the window
      title,
      name,
      directory,
      // Position the window with an offset based on the number of open windows
      x: windowOffset * (fileWindows.length + 5),
      y: windowOffset * (fileWindows.length + 5),
    };
    setFileWindows((prevWindows) => [...prevWindows, newWindow]);
  };

  // Function to close a file window by its unique ID
  const closeFileWindow = (id: string) => {
    setFileWindows((prevWindows) =>
      prevWindows.filter((window) => window.id !== id)
    );
  };

  // ---------------------------------------------------------------------------------------------------------------------

  return (
    <main className={styles.main}>
      {!hideTopbarAndDock && <TopBar />}
      <div className={styles.desktop}>
        {/* <div className={styles.iconGrid}> */}
        {iconData.map((icon, index) => (
          <DesktopIcon
            key={index}
            icon={`/icons/${icon.name}.png`} // Constructing the icon path
            label={icon.displayName}
            onDoubleClick={() =>
              openFinderWindow({
                name: icon.name,
                displayName: icon.displayName,
              })
            }
          />
        ))}
        {/* </div> */}
        {finderWindows.map((window) => (
          <FinderWindow
            key={window.id} // Use the unique window ID as the key
            title={window.displayName}
            currFolder={window.displayName}
            iconData={iconData}
            onClose={() => closeFinderWindow(window.id)} // Close the specific window
            defaultPosition={{ x: window.x, y: window.y }} // Set the position for each window
            hideTopbarAndDock={setHideTopbarAndDock} // Pass the function to hide/show topbar and dock
            openFileWindow={openFileWindow} // Pass the function to open a file window
          />
        ))}
        {isArcBrowserOpen && <ArcBrowser onClose={closeArcBrowser} />}
        {fileWindows.map((window) => (
          <File
            key={window.id}
            file={{
              name: window.name,
              title: window.title,
              directory: window.directory,
            }}
            defaultPosition={{ x: window.x, y: window.y }}
            hideTopbarAndDock={setHideTopbarAndDock}
            onClose={() => closeFileWindow(window.id)}
          />
        ))}
      </div>
      {!hideTopbarAndDock && <Dock actions={dockActions} />}
    </main>
  );
}
