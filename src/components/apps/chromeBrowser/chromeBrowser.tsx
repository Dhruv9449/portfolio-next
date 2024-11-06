import { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import styles from "./chromeBrowser.module.css";
import { BsBing, BsGithub, BsLinkedin, BsYoutube } from "react-icons/bs";
import { IoMdArrowBack, IoMdArrowForward, IoMdRefresh } from "react-icons/io";

interface Tab {
  name: string;
  url: string;
  favicon: string;
}

const initialTabs: Tab[] = [
  {
    name: "New Tab",
    url: "",
    favicon: "https://www.google.com/chrome/static/images/chrome-logo.svg",
  },
];

const favorites = [
  {
    name: "Bing",
    url: "https://www.bing.com/search?q=Dhruv9449",
    icon: <BsBing />,
    windowRedirect: false,
  },
  {
    name: "GitHub",
    url: "https://github.com/Dhruv9449",
    icon: <BsGithub />,
    windowRedirect: true,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/dhruv9449/",
    icon: <BsLinkedin />,
    windowRedirect: true,
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    icon: <BsYoutube />,
    windowRedirect: true,
  },
];

interface ChromeBrowserProps {
  defaultPosition: { x: number; y: number };
  hideTopbarAndDock: (hide: boolean) => void;
  onClose: () => void;
}

export default function ChromeBrowser({
  defaultPosition,
  hideTopbarAndDock,
  onClose,
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
    if (tabs.length === 0) onClose();
  }, [tabs, onClose]);

  useEffect(() => {
    // Fetch metadata when the URL changes in the active tab
    updateTabTitle();
  }, [iframeKey]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setUrlInput(tabs[index].url);
    setShowHomeScreen(tabs[index].url === "");
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      hideTopbarAndDock(false);
      setSize({ width: 800, height: 500 });
      setPosition(defaultPosition);
    } else {
      hideTopbarAndDock(true);
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setPosition({ x: 0, y: 0 });
    }
    setIsMaximized(!isMaximized);
  };

  const addTab = () => {
    const newTab = {
      name: "New Tab",
      url: "",
      favicon: "https://www.google.com/chrome/static/images/chrome-logo.svg",
    };
    setTabs([...tabs, newTab]);
    setActiveTab(tabs.length);
    setUrlInput("");
    setShowHomeScreen(true);
  };

  const closeTab = (index: number) => {
    if (tabs.length === 1) {
      onClose();
      return;
    }
    const newTabs = tabs.filter((_, i) => i !== index);
    setTabs(newTabs);
    setActiveTab(index > 0 ? index - 1 : 0);
    setUrlInput(newTabs[activeTab]?.url || "");
    setShowHomeScreen(newTabs[activeTab]?.url === "");
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };

  const navigateToUrl = () => {
    // If Url input doesn't start with http or https, add https://
    let url = urlInput;
    if (!url.match(/^https?:\/\//i) && url !== "") {
      url = `https://${url}`;
    }
    setUrlInput(url);
    const updatedTabs = [...tabs];
    updatedTabs[activeTab].url = url;
    setTabs(updatedTabs);
    if (urlInput === "") {
      setShowHomeScreen(true);
    } else {
      setShowHomeScreen(false);
    }
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
    // setShowHomeScreen(true);
    setUrlInput("");
    navigateToUrl();
    // const updatedTabs = [...tabs];
    // updatedTabs[activeTab].url = "";
    // setTabs(updatedTabs);
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
    fetch(`https://api.microlink.io?url=${url}`)
      .then((response) => response.json())
      .then((data) => {
        const updatedTabs = [...tabs];
        updatedTabs[activeTab] = {
          ...updatedTabs[activeTab],
          name: data.data.title || "New Tab",
          favicon: data.data.logo?.url || initialTabs[0].favicon, // Fallback to default favicon
        };
        setTabs(updatedTabs);
      })
      .catch((error) => console.error("Failed to fetch metadata:", error));
  };

  function BrowserHomeScreen() {
    return (
      <div className={styles.homeScreen}>
        {favorites.map((fav, index) => (
          <button
            key={index}
            className={styles.favoriteButton}
            onClick={() =>
              fav.windowRedirect
                ? window.open(fav.url)
                : handleFavoriteClick(fav.url)
            }
          >
            <div className={styles.favoriteIcon}>{fav.icon}</div>
            <div className={styles.favoriteName}>{fav.name}</div>
          </button>
        ))}
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
    >
      <div className={styles.chromeBrowser}>
        <div className={styles.chromeHeader}>
          <div className={styles.windowButtons}>
            <button className={styles.closeButton} onClick={onClose}></button>
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
