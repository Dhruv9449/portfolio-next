"use client";

import React, { useState, useEffect, useCallback } from "react";
import TopBar from "@/components/topbar/topbar";
import Dock from "@/components/dock/dock";
import DesktopIcon from "@/components/desktopIcon/desktopIcon";
import FinderWindow from "@/components/apps/finder/finder";
import File from "@/components/apps/file/file";
import ChromeBrowser from "@/components/apps/chromeBrowser/chromeBrowser";
import PDFViewer from "@/components/apps/pdfViewer/pdfViewer";
import AboutMe from "@/components/apps/aboutMe/aboutMe";
import AboutMeCore from "@/components/apps/aboutMeCore/aboutMeCore";
import Terminal from "@/components/apps/terminal/terminal";
import VSCode from "@/components/apps/vscode/vscode";
import Spotify from "@/components/apps/spotify/spotify";
import Spotlight from "@/components/spotlight/spotlight";

import { useWindowManager, useSingleWindow, useResponsive } from "@/hooks";
import { FinderWindowConfig, FileWindowConfig, DockActions } from "@/types";
import { desktopIcons, finderData } from "@/config/desktopConfig";
import { DEFAULT_WINDOW_POSITION } from "@/constants";
import { getIconPath } from "@/utils/windowHelpers";

import styles from "./page.module.css";

export default function Home() {
  const { isMobile } = useResponsive();
  const [hideTopbarAndDock, setHideTopbarAndDock] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  // Global z-index management for all windows
  const [highestZIndex, setHighestZIndex] = useState(1000);
  const [singleWindowZIndexes, setSingleWindowZIndexes] = useState<{
    [key: string]: number;
  }>({
    chrome: 1000,
    terminal: 1000,
    vscode: 1000,
    pdfViewer: 1000,
    aboutMe: 1001,
    spotify: 1000,
  });

  const bringToFront = useCallback(
    (windowId: string, isSingleWindow: boolean = false) => {
      const newZIndex = highestZIndex + 1;
      setHighestZIndex(newZIndex);

      if (isSingleWindow) {
        setSingleWindowZIndexes((prev) => ({
          ...prev,
          [windowId]: newZIndex,
        }));
      }

      return newZIndex;
    },
    [highestZIndex]
  );

  // Window management using custom hooks
  const finderWindowManager = useWindowManager<FinderWindowConfig>();
  const fileWindowManager = useWindowManager<FileWindowConfig>();
  const chromeBrowser = useSingleWindow(false);
  const terminal = useSingleWindow(false);
  const vscode = useSingleWindow(false);
  const pdfViewer = useSingleWindow(false);
  const aboutMe = useSingleWindow(true);
  const spotify = useSingleWindow(false);

  // Keyboard shortcuts for Spotlight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Cmd+Space
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === " ")) {
        e.preventDefault();
        setIsSpotlightOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Dock actions configuration
  const dockActions: DockActions = {
    chrome: () => {
      bringToFront("chrome", true);
      chromeBrowser.open();
    },
    terminal: () => {
      bringToFront("terminal", true);
      terminal.open();
    },
    vscode: () => {
      bringToFront("vscode", true);
      vscode.open();
    },
    spotify: () => {
      bringToFront("spotify", true);
      spotify.open();
    },
  };

  // Desktop icon double-click handler
  const handleIconDoubleClick = (icon: (typeof desktopIcons)[0]) => {
    switch (icon.application) {
      case "finder":
        const newZIndex = highestZIndex + 1;
        setHighestZIndex(newZIndex);
        finderWindowManager.openWindow(
          {
            name: icon.name,
            displayName: icon.displayName,
          },
          undefined,
          newZIndex
        );
        break;
      case "pdfPreview":
        const pdfZIndex = bringToFront("pdfViewer", true);
        pdfViewer.open();
        break;
      default:
        const fileZIndex = highestZIndex + 1;
        setHighestZIndex(fileZIndex);
        fileWindowManager.openWindow(
          {
            title: icon.displayName,
            name: icon.name,
            directory: icon.name,
          },
          undefined,
          fileZIndex
        );
        break;
    }
  };

  // File window opener (passed to Finder)
  const handleOpenFileWindow = (
    title: string,
    name: string,
    directory: string
  ) => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);
    fileWindowManager.openWindow(
      { title, name, directory },
      undefined,
      newZIndex
    );
  };

  // Spotlight handlers
  const handleSpotlightOpenApp = (appName: string) => {
    switch (appName) {
      case "chrome":
        bringToFront("chrome", true);
        chromeBrowser.open();
        break;
      case "terminal":
        bringToFront("terminal", true);
        terminal.open();
        break;
      case "vscode":
        bringToFront("vscode", true);
        vscode.open();
        break;
      case "spotify":
        bringToFront("spotify", true);
        spotify.open();
        break;
      case "pdfViewer":
        bringToFront("pdfViewer", true);
        pdfViewer.open();
        break;
      default:
        console.log("Unknown app:", appName);
    }
  };

  const handleSpotlightOpenFile = (
    title: string,
    name: string,
    directory: string
  ) => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);

    if (
      directory === "experience" ||
      directory === "projects" ||
      directory === "school" ||
      directory === "skills"
    ) {
      // Open finder window
      finderWindowManager.openWindow(
        {
          name: directory,
          displayName: title,
        },
        undefined,
        newZIndex
      );
    } else {
      // Open file window
      fileWindowManager.openWindow(
        { title, name, directory },
        undefined,
        newZIndex
      );
    }
  };

  // Render mobile view
  if (isMobile) {
    return <AboutMeCore />;
  }

  // Render desktop view
  return (
    <main className={styles.main}>
      {/* Spotlight Search */}
      <Spotlight
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onOpenApp={handleSpotlightOpenApp}
        onOpenFile={handleSpotlightOpenFile}
      />

      {!hideTopbarAndDock && <TopBar />}

      <div className={styles.desktop}>
        {/* Desktop Icons */}
        {desktopIcons.map((icon, index) => (
          <DesktopIcon
            key={`${icon.name}-${index}`}
            icon={getIconPath(icon.name)}
            label={icon.displayName}
            initialCoordinates={{
              x: (index % 8) * 100,
              y: Math.floor(index / 8) * 100,
            }}
            onDoubleClick={() => handleIconDoubleClick(icon)}
          />
        ))}

        {/* Finder Windows */}
        {finderWindowManager.windows.map((window) => (
          <FinderWindow
            key={window.id}
            title={window.displayName}
            currFolder={window.displayName}
            iconData={finderData}
            onClose={() => finderWindowManager.closeWindow(window.id)}
            defaultPosition={window.defaultPosition}
            hideTopbarAndDock={setHideTopbarAndDock}
            openFileWindow={handleOpenFileWindow}
            zIndex={window.zIndex}
            onFocus={() => {
              const newZIndex = bringToFront(window.id, false);
              finderWindowManager.updateWindowZIndex(window.id, newZIndex);
            }}
          />
        ))}

        {/* Chrome Browser */}
        {chromeBrowser.isOpen && (
          <ChromeBrowser
            defaultPosition={DEFAULT_WINDOW_POSITION}
            onClose={chromeBrowser.close}
            hideTopbarAndDock={setHideTopbarAndDock}
            zIndex={singleWindowZIndexes.chrome}
            onFocus={() => bringToFront("chrome", true)}
          />
        )}

        {/* Terminal */}
        {terminal.isOpen && (
          <Terminal
            defaultPosition={DEFAULT_WINDOW_POSITION}
            onClose={terminal.close}
            hideTopbarAndDock={setHideTopbarAndDock}
            zIndex={singleWindowZIndexes.terminal}
            onFocus={() => bringToFront("terminal", true)}
          />
        )}

        {/* VSCode */}
        {vscode.isOpen && (
          <VSCode
            defaultPosition={DEFAULT_WINDOW_POSITION}
            onClose={vscode.close}
            hideTopbarAndDock={setHideTopbarAndDock}
            zIndex={singleWindowZIndexes.vscode}
            onFocus={() => bringToFront("vscode", true)}
          />
        )}

        {/* Spotify */}
        {spotify.isOpen && (
          <Spotify
            defaultPosition={DEFAULT_WINDOW_POSITION}
            onClose={spotify.close}
            hideTopbarAndDock={setHideTopbarAndDock}
            zIndex={singleWindowZIndexes.spotify}
            onFocus={() => bringToFront("spotify", true)}
          />
        )}

        {/* PDF Viewer */}
        {pdfViewer.isOpen && (
          <PDFViewer
            defaultPosition={DEFAULT_WINDOW_POSITION}
            onClose={pdfViewer.close}
            hideTopbarAndDock={setHideTopbarAndDock}
            file="Resume.pdf"
            zIndex={singleWindowZIndexes.pdfViewer}
            onFocus={() => bringToFront("pdfViewer", true)}
          />
        )}

        {/* About Me */}
        {aboutMe.isOpen && (
          <AboutMe
            defaultPosition={{ x: 250, y: 10 }}
            hideTopbarAndDock={setHideTopbarAndDock}
            onClose={aboutMe.close}
            zIndex={singleWindowZIndexes.aboutMe}
            onFocus={() => bringToFront("aboutMe", true)}
          />
        )}

        {/* File Windows */}
        {fileWindowManager.windows.map((window) => (
          <File
            key={window.id}
            file={{
              name: window.name,
              title: window.title,
              directory: window.directory,
            }}
            defaultPosition={window.defaultPosition}
            hideTopbarAndDock={setHideTopbarAndDock}
            onClose={() => fileWindowManager.closeWindow(window.id)}
            zIndex={window.zIndex}
            onFocus={() => {
              const newZIndex = bringToFront(window.id, false);
              fileWindowManager.updateWindowZIndex(window.id, newZIndex);
            }}
          />
        ))}
      </div>

      {!hideTopbarAndDock && <Dock actions={dockActions} />}
    </main>
  );
}
