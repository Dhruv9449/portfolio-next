"use client"; // Mark this file as a Client Component

import React, { useEffect, useState } from "react";
import TopBar from "@/components/topbar/topbar";
import Dock from "@/components/dock/dock";
import styles from "./page.module.css";
import DesktopIcon from "@/components/desktopIcon/desktopIcon";
import FinderWindow from "@/components/apps/finder/finder";
import { v4 as uuidv4 } from "uuid";
import File from "@/components/apps/file/file";
import ChromeBrowser from "@/components/apps/chromeBrowser/chromeBrowser";
import PDFViewer from "@/components/apps/pdfViewer/pdfViewer";
import AboutMe from "@/components/apps/aboutMe/aboutMe";
import AboutMeCore from "@/components/apps/aboutMeCore/aboutMeCore";
import Terminal from "@/components/apps/terminal/terminal";

// Define the icon data with name and displayName
const finderData = [
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

const iconData = [
  ...finderData,
  {
    name: "pdf",
    displayName: "Resume.pdf",
    fileType: "pdf",
    application: "pdfPreview",
  },
  // Add more icons as needed
];

export default function Home() {
  // If device is not a desktop, return a just AboutMeCore component, else return the full desktop
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 500 || window.innerHeight < 600;
      setIsMobile(mobile);
    };

    // Set initial state based on window dimensions
    handleResize();

    // Listen to window resize events
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Chrome Browser Management
  // ---------------------------------------------------------------------------------------------------------------------
  const [isChromeBrowserOpen, setIsChromeBrowserOpen] = useState(false);

  const openChromeBrowser = () => {
    setIsChromeBrowserOpen(true);
  };

  const closeChromeBrowser = () => {
    setIsChromeBrowserOpen(false);
  };
  // ---------------------------------------------------------------------------------------------------------------------

  // Terminal Window Management
  // ---------------------------------------------------------------------------------------------------------------------
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const openTerminal = () => {
    setIsTerminalOpen(true);
  };

  const closeTerminal = () => {
    setIsTerminalOpen(false);
  };

  const dockActions = {
    chrome: openChromeBrowser,
    terminal: openTerminal,
  };

  // PDF Viewer Management
  // ---------------------------------------------------------------------------------------------------------------------
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);

  const openPdfViewer = (name: string, displayName: string) => {
    setIsPdfViewerOpen(true);
  };

  const closePdfViewer = () => {
    setIsPdfViewerOpen(false);
  };
  // ---------------------------------------------------------------------------------------------------------------------

  // About Me Window Management
  // ---------------------------------------------------------------------------------------------------------------------
  const [isAboutMeOpen, setIsAboutMeOpen] = useState(true);

  const openAboutMe = () => {
    setIsAboutMeOpen(true);
  };

  const closeAboutMe = () => {
    setIsAboutMeOpen(false);
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

  return isMobile ? (
    <AboutMeCore />
  ) : (
    <main className={styles.main}>
      {!hideTopbarAndDock && <TopBar />}
      <div className={styles.desktop}>
        {/* <div className={styles.iconGrid}> */}
        {iconData.map((icon, index) => (
          <DesktopIcon
            key={index}
            icon={`/icons/${icon.name}.png`} // Constructing the icon path
            label={icon.displayName}
            // Align icons in a grid layout
            initialCoordinates={{
              x: (index % 8) * 100,
              y: Math.floor(index / 8) * 100,
            }}
            onDoubleClick={() => {
              if (icon.application === "finder") {
                openFinderWindow({
                  name: icon.name,
                  displayName: icon.displayName,
                });
              } else if (icon.application === "pdfPreview") {
                openPdfViewer(icon.name, icon.displayName);
              } else {
                openFileWindow(icon.displayName, icon.name, icon.name);
              }
            }}
          />
        ))}
        {/* </div> */}
        {finderWindows.map((window) => (
          <FinderWindow
            key={window.id} // Use the unique window ID as the key
            title={window.displayName}
            currFolder={window.displayName}
            iconData={finderData}
            onClose={() => closeFinderWindow(window.id)} // Close the specific window
            defaultPosition={{ x: window.x, y: window.y }} // Set the position for each window
            hideTopbarAndDock={setHideTopbarAndDock} // Pass the function to hide/show topbar and dock
            openFileWindow={openFileWindow} // Pass the function to open a file window
          />
        ))}
        {isChromeBrowserOpen && (
          <ChromeBrowser
            defaultPosition={{ x: 100, y: 100 }}
            onClose={closeChromeBrowser}
            hideTopbarAndDock={setHideTopbarAndDock}
          />
        )}
        {isTerminalOpen && (
          <Terminal
            defaultPosition={{ x: 100, y: 100 }}
            onClose={closeTerminal}
            hideTopbarAndDock={setHideTopbarAndDock}
          />
        )}
        {isPdfViewerOpen && (
          <PDFViewer
            defaultPosition={{ x: 100, y: 100 }}
            onClose={closePdfViewer}
            hideTopbarAndDock={setHideTopbarAndDock}
            file="Resume.pdf"
          />
        )}
        {isAboutMeOpen && (
          <AboutMe
            // Setting the default position as center of the screen
            defaultPosition={{ x: 250, y: 10 }}
            hideTopbarAndDock={setHideTopbarAndDock}
            onClose={closeAboutMe}
          />
        )}
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
