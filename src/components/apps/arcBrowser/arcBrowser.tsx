import { useState } from "react";
import Draggable from "react-draggable";
import styles from "./arcBrowser.module.css"; // Assuming custom CSS is in arcBrowser.module.css

interface Tab {
  name: string;
  url: string;
}

const initialTabs: Tab[] = [
  {
    name: "Google",
    url: "https://www.google.com/search?igu=1",
  },
  { name: "GitHub", url: "https://www.github.dev/Dhruv9449/Chitros" },
  { name: "YouTube", url: "https://www.youtube.com" },
];

export default function ArcBrowser({ onClose }: { onClose: () => void }) {
  const [tabs, setTabs] = useState(initialTabs);
  const [activeTab, setActiveTab] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState({ width: 1000, height: 600 });
  const [position, setPosition] = useState({ x: 100, y: 100 });

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      setSize({ width: 1000, height: 600 });
      setPosition({ x: 100, y: 100 });
    } else {
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setPosition({ x: 0, y: 0 });
    }
    setIsMaximized(!isMaximized);
  };

  return (
    <Draggable
      bounds="body"
      position={isMaximized ? { x: 0, y: 0 } : position}
      handle=".arcBrowserHeader"
    >
      <div className={styles.arcBrowser}>
        {/* Header with macOS-style window buttons */}
        <div className={`${styles.arcBrowserHeader} draggableHandle`}>
          <div className={styles.windowButtons}>
            <button className={styles.closeButton} onClick={onClose}></button>
            <button className={styles.minimizeButton}></button>
            <button
              className={styles.maximizeButton}
              onClick={toggleMaximize}
            ></button>
          </div>
          <div className={styles.windowTitle}>{tabs[activeTab].name}</div>
        </div>

        {/* Sidebar with tabs */}
        <div className={styles.sidebar}>
          {tabs.map((tab, index) => (
            <div
              key={index}
              className={`${styles.tab} ${
                index === activeTab ? styles.activeTab : ""
              }`}
              onClick={() => handleTabClick(index)}
            >
              {tab.name}
            </div>
          ))}
        </div>

        {/* Main content area (iframe to simulate web page) */}
        <div className={styles.browserContent}>
          <iframe
            src={tabs[activeTab].url}
            title={tabs[activeTab].name}
            className={styles.iframe}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </Draggable>
  );
}
