"use client";

import React, { useState } from "react";
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

import { useWindowManager, useSingleWindow, useResponsive } from "@/hooks";
import { FinderWindowConfig, FileWindowConfig, DockActions } from "@/types";
import { desktopIcons, finderData } from "@/config/desktopConfig";
import { DEFAULT_WINDOW_POSITION } from "@/constants";
import { getIconPath } from "@/utils/windowHelpers";

import styles from "./page.module.css";

export default function Home() {
  const { isMobile } = useResponsive();
  const [hideTopbarAndDock, setHideTopbarAndDock] = useState(false);

  // Window management using custom hooks
  const finderWindowManager = useWindowManager<FinderWindowConfig>();
  const fileWindowManager = useWindowManager<FileWindowConfig>();
  const chromeBrowser = useSingleWindow(false);
  const terminal = useSingleWindow(false);
  const vscode = useSingleWindow(false);
  const pdfViewer = useSingleWindow(false);
  const aboutMe = useSingleWindow(true);

  // Dock actions configuration
  const dockActions: DockActions = {
    chrome: chromeBrowser.open,
    terminal: terminal.open,
    vscode: vscode.open,
  };

  // Desktop icon double-click handler
  const handleIconDoubleClick = (icon: (typeof desktopIcons)[0]) => {
    switch (icon.application) {
      case "finder":
        finderWindowManager.openWindow({
          name: icon.name,
          displayName: icon.displayName,
        });
        break;
      case "pdfPreview":
        pdfViewer.open();
        break;
      default:
        fileWindowManager.openWindow({
          title: icon.displayName,
          name: icon.name,
          directory: icon.name,
        });
        break;
    }
  };

  // File window opener (passed to Finder)
  const handleOpenFileWindow = (
    title: string,
    name: string,
    directory: string
  ) => {
    fileWindowManager.openWindow({ title, name, directory });
  };

  // Render mobile view
  if (isMobile) {
    return <AboutMeCore />;
  }

  // Render desktop view
  return (
    <main className={styles.main}>
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
          />
        ))}

        {/* Chrome Browser */}
        {chromeBrowser.isOpen && (
          <ChromeBrowser
            defaultPosition={DEFAULT_WINDOW_POSITION}
            onClose={chromeBrowser.close}
            hideTopbarAndDock={setHideTopbarAndDock}
          />
        )}

        {/* Terminal */}
        {terminal.isOpen && (
          <Terminal
            defaultPosition={DEFAULT_WINDOW_POSITION}
            onClose={terminal.close}
            hideTopbarAndDock={setHideTopbarAndDock}
          />
        )}

        {/* VSCode */}
        {vscode.isOpen && (
          <VSCode
            defaultPosition={DEFAULT_WINDOW_POSITION}
            onClose={vscode.close}
            hideTopbarAndDock={setHideTopbarAndDock}
          />
        )}

        {/* PDF Viewer */}
        {pdfViewer.isOpen && (
          <PDFViewer
            defaultPosition={DEFAULT_WINDOW_POSITION}
            onClose={pdfViewer.close}
            hideTopbarAndDock={setHideTopbarAndDock}
            file="Resume.pdf"
          />
        )}

        {/* About Me */}
        {aboutMe.isOpen && (
          <AboutMe
            defaultPosition={{ x: 250, y: 10 }}
            hideTopbarAndDock={setHideTopbarAndDock}
            onClose={aboutMe.close}
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
          />
        ))}
      </div>

      {!hideTopbarAndDock && <Dock actions={dockActions} />}
    </main>
  );
}
