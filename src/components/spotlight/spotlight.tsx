import { useState, useEffect, useRef, useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import styles from "./spotlight.module.css";

interface SpotlightItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  type: "app" | "file" | "project" | "folder";
  action: () => void;
}

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appName: string) => void;
  onOpenFile: (title: string, name: string, directory: string) => void;
}

export default function Spotlight({
  isOpen,
  onClose,
  onOpenApp,
  onOpenFile,
}: SpotlightProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotlightItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search index - all searchable items (memoized to prevent recreation)
  const searchIndex: SpotlightItem[] = useMemo(
    () => [
      // Apps
      {
        id: "chrome",
        title: "Chrome",
        subtitle: "Web Browser",
        icon: "/icons/chrome.png",
        type: "app",
        action: () => onOpenApp("chrome"),
      },
      {
        id: "spotify",
        title: "Spotify",
        subtitle: "Music Player",
        icon: "/icons/spotify.png",
        type: "app",
        action: () => onOpenApp("spotify"),
      },
      {
        id: "terminal",
        title: "Terminal",
        subtitle: "Command Line",
        icon: "/icons/iterm.png",
        type: "app",
        action: () => onOpenApp("terminal"),
      },
      {
        id: "vscode",
        title: "VSCode",
        subtitle: "Code Editor",
        icon: "/icons/vscode.png",
        type: "app",
        action: () => onOpenApp("vscode"),
      },
      {
        id: "resume",
        title: "Resume.pdf",
        subtitle: "PDF Document",
        icon: "/icons/pdf.png",
        type: "file",
        action: () => onOpenApp("pdfViewer"),
      },
      // Projects
      {
        id: "vitty",
        title: "Vitty",
        subtitle: "Project • VIT timetable app",
        icon: "/icons/projects/vitty.png",
        type: "project",
        action: () => onOpenFile("Vitty", "vitty", "Projects"),
      },
      {
        id: "tizori",
        title: "Tizori",
        subtitle: "Project • Self-hosted Secrets Vault",
        icon: "/icons/projects/tizori.png",
        type: "project",
        action: () => onOpenFile("Tizori", "tizori", "Projects"),
      },
      {
        id: "chitros",
        title: "Chitros",
        subtitle: "Project • Social Media",
        icon: "/icons/projects/chitros.png",
        type: "project",
        action: () => onOpenFile("Chitros", "chitros", "Projects"),
      },
      {
        id: "mou",
        title: "Mou",
        subtitle: "Project • Portfolio Blogging website",
        icon: "/icons/projects/mou.png",
        type: "project",
        action: () => onOpenFile("Mou", "mou", "Projects"),
      },
      // Folders
      {
        id: "experience",
        title: "Experience",
        subtitle: "Folder • Work Experience",
        icon: "/icons/experience.png",
        type: "folder",
        action: () => onOpenFile("Experience", "experience", "experience"),
      },
      {
        id: "projects",
        title: "Projects",
        subtitle: "Folder • My Projects",
        icon: "/icons/projects.png",
        type: "folder",
        action: () => onOpenFile("Projects", "projects", "projects"),
      },
      {
        id: "school",
        title: "School",
        subtitle: "Folder • Education",
        icon: "/icons/school.png",
        type: "folder",
        action: () => onOpenFile("School", "school", "school"),
      },
      {
        id: "skills",
        title: "Skills",
        subtitle: "Folder • Technical Skills",
        icon: "/icons/skills.png",
        type: "folder",
        action: () => onOpenFile("Skills", "skills", "skills"),
      },
    ],
    [onOpenApp, onOpenFile]
  );

  // Fuzzy search algorithm
  const fuzzySearch = (
    query: string,
    items: SpotlightItem[]
  ): SpotlightItem[] => {
    if (!query.trim()) return items;

    const lowerQuery = query.toLowerCase();

    const scored = items.map((item) => {
      const title = item.title.toLowerCase();
      const subtitle = item.subtitle.toLowerCase();

      // Exact match gets highest score
      if (title === lowerQuery) return { item, score: 1000 };

      // Starts with query gets high score
      if (title.startsWith(lowerQuery)) return { item, score: 900 };

      // Calculate fuzzy match score
      let score = 0;
      let queryIndex = 0;
      let titleIndex = 0;
      let consecutiveMatches = 0;

      while (queryIndex < lowerQuery.length && titleIndex < title.length) {
        if (lowerQuery[queryIndex] === title[titleIndex]) {
          score += 10 + consecutiveMatches * 5; // Bonus for consecutive matches
          consecutiveMatches++;
          queryIndex++;
        } else {
          consecutiveMatches = 0;
        }
        titleIndex++;
      }

      // Check subtitle match
      if (subtitle.includes(lowerQuery)) {
        score += 50;
      }

      // Bonus if all query chars were found in order
      if (queryIndex === lowerQuery.length) {
        score += 100;
      } else {
        score = 0; // No match
      }

      return { item, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.item);
  };

  // Categorize results
  const categorizedResults = useMemo(() => {
    const apps = results.filter((r) => r.type === "app");
    const projects = results.filter((r) => r.type === "project");
    const folders = results.filter((r) => r.type === "folder");
    const files = results.filter((r) => r.type === "file");

    return {
      topHit: results[0],
      apps,
      projects,
      folders,
      files,
    };
  }, [results]);

  // Update results when query changes
  useEffect(() => {
    const filtered = fuzzySearch(query, searchIndex);
    setResults(filtered);
    setSelectedIndex(0);
  }, [query, searchIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            results[selectedIndex].action();
            onClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = document.getElementById(
      `spotlight-item-${selectedIndex}`
    );
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.spotlight} onClick={(e) => e.stopPropagation()}>
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Spotlight Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className={styles.shortcut}>⌘K</div>
        </div>

        <div className={styles.results}>
          {results.length > 0 ? (
            <>
              {/* Top Hit */}
              {categorizedResults.topHit && query && (
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Top Hit</div>
                  <div
                    id="spotlight-item-0"
                    className={`${styles.resultItem} ${styles.topHit} ${
                      selectedIndex === 0 ? styles.selected : ""
                    }`}
                    onClick={() => {
                      categorizedResults.topHit!.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(0)}
                  >
                    <img
                      src={categorizedResults.topHit.icon}
                      alt={categorizedResults.topHit.title}
                      className={styles.resultIcon}
                    />
                    <div className={styles.resultText}>
                      <div className={styles.resultTitle}>
                        {categorizedResults.topHit.title}
                      </div>
                      <div className={styles.resultSubtitle}>
                        {categorizedResults.topHit.subtitle}
                      </div>
                    </div>
                    {selectedIndex === 0 && (
                      <div className={styles.returnKey}>↵</div>
                    )}
                  </div>
                </div>
              )}

              {/* Files (Documents) */}
              {categorizedResults.files.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Documents</div>
                  {categorizedResults.files.map((item) => {
                    const globalIndex = results.findIndex(
                      (r) => r.id === item.id
                    );
                    return (
                      <div
                        key={item.id}
                        id={`spotlight-item-${globalIndex}`}
                        className={`${styles.resultItem} ${
                          globalIndex === selectedIndex ? styles.selected : ""
                        }`}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <img
                          src={item.icon}
                          alt={item.title}
                          className={styles.resultIcon}
                        />
                        <div className={styles.resultText}>
                          <div className={styles.resultTitle}>{item.title}</div>
                          <div className={styles.resultSubtitle}>
                            {item.subtitle}
                          </div>
                        </div>
                        {globalIndex === selectedIndex && (
                          <div className={styles.returnKey}>↵</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Projects */}
              {categorizedResults.projects.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Projects</div>
                  {categorizedResults.projects.map((item) => {
                    const globalIndex = results.findIndex(
                      (r) => r.id === item.id
                    );
                    return (
                      <div
                        key={item.id}
                        id={`spotlight-item-${globalIndex}`}
                        className={`${styles.resultItem} ${
                          globalIndex === selectedIndex ? styles.selected : ""
                        }`}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <img
                          src={item.icon}
                          alt={item.title}
                          className={styles.resultIcon}
                        />
                        <div className={styles.resultText}>
                          <div className={styles.resultTitle}>{item.title}</div>
                          <div className={styles.resultSubtitle}>
                            {item.subtitle}
                          </div>
                        </div>
                        {globalIndex === selectedIndex && (
                          <div className={styles.returnKey}>↵</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Apps (Applications) */}
              {categorizedResults.apps.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Applications</div>
                  {categorizedResults.apps.map((item, idx) => {
                    const globalIndex = results.findIndex(
                      (r) => r.id === item.id
                    );
                    return (
                      <div
                        key={item.id}
                        id={`spotlight-item-${globalIndex}`}
                        className={`${styles.resultItem} ${
                          globalIndex === selectedIndex ? styles.selected : ""
                        }`}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <img
                          src={item.icon}
                          alt={item.title}
                          className={styles.resultIcon}
                        />
                        <div className={styles.resultText}>
                          <div className={styles.resultTitle}>{item.title}</div>
                          <div className={styles.resultSubtitle}>
                            {item.subtitle}
                          </div>
                        </div>
                        {globalIndex === selectedIndex && (
                          <div className={styles.returnKey}>↵</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Folders */}
              {categorizedResults.folders.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>Folders</div>
                  </div>
                  {categorizedResults.folders.map((item) => {
                    const globalIndex = results.findIndex(
                      (r) => r.id === item.id
                    );
                    return (
                      <div
                        key={item.id}
                        id={`spotlight-item-${globalIndex}`}
                        className={`${styles.resultItem} ${
                          globalIndex === selectedIndex ? styles.selected : ""
                        }`}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <img
                          src={item.icon}
                          alt={item.title}
                          className={styles.resultIcon}
                        />
                        <div className={styles.resultText}>
                          <div className={styles.resultTitle}>{item.title}</div>
                          <div className={styles.resultSubtitle}>
                            {item.subtitle}
                          </div>
                        </div>
                        {globalIndex === selectedIndex && (
                          <div className={styles.returnKey}>↵</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : query ? (
            <div className={styles.noResults}>
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className={styles.suggestions}>
              <div className={styles.sectionTitle}>Suggestions</div>
              {searchIndex.slice(0, 8).map((item, index) => (
                <div
                  key={item.id}
                  id={`spotlight-item-${index}`}
                  className={`${styles.resultItem} ${
                    index === selectedIndex ? styles.selected : ""
                  }`}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <img
                    src={item.icon}
                    alt={item.title}
                    className={styles.resultIcon}
                  />
                  <div className={styles.resultText}>
                    <div className={styles.resultTitle}>{item.title}</div>
                    <div className={styles.resultSubtitle}>{item.subtitle}</div>
                  </div>
                  {index === selectedIndex && (
                    <div className={styles.returnKey}>↵</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
