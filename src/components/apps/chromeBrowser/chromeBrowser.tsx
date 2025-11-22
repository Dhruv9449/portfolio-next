import { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { IoMdArrowBack, IoMdArrowForward, IoMdRefresh } from "react-icons/io";
import { Tab, BaseWindowProps } from "@/types";
import { browserFavorites } from "@/config/browserConfig";
import { DEFAULT_TAB, API_ENDPOINTS } from "@/constants";
import { normalizeUrl, getMaximizedSize } from "@/utils/windowHelpers";
import styles from "./chromeBrowser.module.css";

const initialTabs: Tab[] = [DEFAULT_TAB];

interface ChromeBrowserProps extends BaseWindowProps {}

export default function ChromeBrowser({
  defaultPosition,
  hideTopbarAndDock,
  onClose,
  zIndex = 1000,
  onFocus,
}: ChromeBrowserProps) {
  const [tabs, setTabs] = useState(initialTabs);
  const [activeTab, setActiveTab] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState({ width: 1000, height: 600 });
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [urlInput, setUrlInput] = useState("");
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [showHomeScreen, setShowHomeScreen] = useState(true);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (tabs.length === 0) handleClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs]);

  useEffect(() => {
    // Fetch metadata when the URL changes in the active tab
    updateTabTitle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeKey]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setUrlInput(tabs[index].url);
    setShowHomeScreen(tabs[index].url === "");
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      hideTopbarAndDock(false);
      setSize({ width: 1000, height: 600 });
      setPosition(defaultPosition);
    } else {
      hideTopbarAndDock(true);
      setSize(getMaximizedSize());
      setPosition({ x: 0, y: 0 });
    }
    setIsMaximized(!isMaximized);
  };

  const addTab = () => {
    setTabs([...tabs, DEFAULT_TAB]);
    setActiveTab(tabs.length);
    setUrlInput("");
    setShowHomeScreen(true);
  };

  const closeTab = (index: number) => {
    if (tabs.length === 1) {
      handleClose();
      return;
    }
    const newTabs = tabs.filter((_, i) => i !== index);
    setTabs(newTabs);
    setActiveTab(index > 0 ? index - 1 : 0);
    setUrlInput(newTabs[activeTab]?.url || "");
    setShowHomeScreen(newTabs[activeTab]?.url === "");
  };

  const handleClose = () => {
    // Reset topbar and dock visibility when closing
    if (isMaximized) {
      hideTopbarAndDock(false);
    }
    onClose();
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };

  const navigateToUrl = () => {
    const url = normalizeUrl(urlInput);
    setUrlInput(url);
    const updatedTabs = [...tabs];
    updatedTabs[activeTab].url = url;
    setTabs(updatedTabs);
    setShowHomeScreen(urlInput === "");
    setIframeKey(Date.now());
  };

  const handleReload = () => {
    navigateToUrl();
  };

  const handleFavoriteClick = (url: string) => {
    setUrlInput(url);
    const updatedTabs = [...tabs];
    updatedTabs[activeTab].url = url;
    setTabs(updatedTabs);
    setShowHomeScreen(false);
    setIframeKey(Date.now());
  };

  const goBack = () => {
    setUrlInput("");
    navigateToUrl();
  };

  const updateTabTitle = () => {
    const url = tabs[activeTab].url;
    // If the URL set title to "New Tab" and favicon to default
    if (!url) {
      const updatedTabs = [...tabs];
      updatedTabs[activeTab].name = initialTabs[0].name;
      updatedTabs[activeTab].favicon = initialTabs[0].favicon;
      setTabs(updatedTabs);
      return;
    }

    // Fetch metadata for title and favicon
    fetch(`${API_ENDPOINTS.metadata}?url=${url}`)
      .then((response) => response.json())
      .then((data) => {
        const updatedTabs = [...tabs];
        updatedTabs[activeTab] = {
          ...updatedTabs[activeTab],
          name: data.data.title || DEFAULT_TAB.name,
          favicon: data.data.logo?.url || DEFAULT_TAB.favicon,
        };
        setTabs(updatedTabs);
      })
      .catch((error) => console.error("Failed to fetch metadata:", error));
  };

  function BrowserHomeScreen() {
    return (
      <div className={styles.homeScreen}>
        {browserFavorites.map((fav, index) => {
          const IconComponent = fav.IconComponent;
          return (
            <button
              key={`favorite-${index}`}
              className={styles.favoriteButton}
              onClick={() =>
                fav.windowRedirect
                  ? window.open(fav.url)
                  : handleFavoriteClick(fav.url)
              }
            >
              <div className={styles.favoriteIcon}>
                <IconComponent />
              </div>
              <div className={styles.favoriteName}>{fav.name}</div>
            </button>
          );
        })}
      </div>
    );
  }

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
      dragHandleClassName={styles.chromeHeader}
      style={{ zIndex }}
      onMouseDown={onFocus}
    >
      <div className={styles.chromeBrowser}>
        <div className={styles.chromeHeader}>
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
          <div className={styles.tabsBar}>
            {tabs.map((tab, index) => (
              <div key={index} className={styles.tabContainer}>
                <div
                  className={`${styles.tab} ${
                    index === activeTab ? styles.activeTab : ""
                  }`}
                  onClick={() => handleTabClick(index)}
                >
                  <img
                    src={tab.favicon || initialTabs[0].favicon}
                    alt=" "
                    className={styles.tabFavicon}
                  />
                  <div className={styles.tabName}>{tab.name}</div>
                  <button
                    className={styles.closeTabButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(index);
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div className={styles.tabSeperator}></div>
              </div>
            ))}
            <button className={styles.addTabButton} onClick={addTab}>
              +
            </button>
          </div>
        </div>

        <div className={styles.addressBar}>
          <button
            className={
              showHomeScreen ? styles.navButton : styles.navButtonActive
            }
            onClick={showHomeScreen ? undefined : goBack}
          >
            <IoMdArrowBack />
          </button>
          <button className={styles.navButton}>
            {" "}
            <IoMdArrowForward />{" "}
          </button>
          <button className={styles.navButtonReload} onClick={handleReload}>
            <IoMdRefresh />
          </button>
          <input
            className={styles.urlInput}
            value={urlInput}
            onChange={handleUrlChange}
            onKeyDown={(e) => e.key === "Enter" && navigateToUrl()}
            onFocus={() => setUrlInput(tabs[activeTab].url)}
            style={{ userSelect: "text" }}
          />
        </div>

        <div className={styles.browserContent}>
          {showHomeScreen ? (
            <BrowserHomeScreen />
          ) : (
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src={tabs[activeTab].url}
              title={tabs[activeTab].name}
              className={styles.iframe}
              sandbox="allow-scripts allow-same-origin"
              onLoad={updateTabTitle} // Update title when iframe loads
            />
          )}
        </div>
      </div>
    </Rnd>
  );
}
