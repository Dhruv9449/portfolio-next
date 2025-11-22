import { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { BaseWindowProps } from "@/types";
import { getMaximizedSize } from "@/utils/windowHelpers";
import styles from "./terminal.module.css";

// Define types for the file system
type File = {
  type: "file";
  content: string;
};

type Folder = {
  type: "folder";
  contents: { [key: string]: File | Folder };
};

type FileSystem = {
  "~": Folder;
};

// Mock file system structure
const fileSystem: FileSystem = {
  "~": {
    type: "folder",
    contents: {
      about: {
        type: "folder",
        contents: {
          "aboutme.txt": {
            type: "file",
            content:
              "I'm a passionate developer with a knack for backend systems, always eager to explore new technologies and solve challenging problems.",
          },
          "contacts.txt": {
            type: "file",
            content:
              "Email: dhruvshahrds@gmail.com\nLinkedIn: linkedin.com/in/dhruv9449",
          },
        },
      },
      "test.py": {
        type: "file",
        content: "print('Hello, World!')",
      },
    },
  },
};

// Helper function to format prompt path
const formatPromptPath = (path: string): string => path.replace(/^~\/?/, "~");

interface TerminalProps extends BaseWindowProps {}

export default function Terminal({
  defaultPosition,
  hideTopbarAndDock,
  onClose,
  zIndex = 1000,
  onFocus,
}: TerminalProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState({ width: 1000, height: 700 });
  const [position, setPosition] = useState(defaultPosition);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [currentPath, setCurrentPath] = useState("~");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [commandHistory]);

  const handleCommand = () => {
    const args = input.trim().split(" ");
    const command = args[0];
    const arg = args[1];
    let response = "";

    // Helper function to navigate file system path
    const traversePath = (path: string) => {
      return path.split("/").reduce((dir: Folder | undefined, part: string) => {
        if (part === "~") return fileSystem["~"];
        if (dir?.type === "folder" && dir.contents[part]) {
          return dir.contents[part] as Folder;
        }
        return undefined;
      }, fileSystem["~"]);
    };

    const currentDir = traversePath(currentPath);

    switch (command) {
      case "help":
        response = "Available commands: ls, cd, cat, help, clear";
        break;

      case "ls":
        if (currentDir?.type === "folder") {
          // Generate HTML output with distinct CSS classes for files and folders
          response = Object.entries(currentDir.contents)
            .map(
              ([name, item]) =>
                `<span class="${
                  item.type === "folder" ? styles.folder : styles.file
                }">${name}</span>`
            )
            .join("  ");
        } else {
          response = "Error: Not a directory";
        }
        break;

      case "cd":
        if (!arg) {
          setCurrentPath("~"); // Default to home directory if no argument is given
        } else if (arg === "..") {
          const newPath = currentPath.split("/").slice(0, -1).join("/") || "~";
          setCurrentPath(newPath);
        } else if (
          currentDir?.contents[arg] &&
          (currentDir.contents[arg] as Folder).type === "folder"
        ) {
          setCurrentPath(
            currentPath === "~" ? `~/${arg}` : `${currentPath}/${arg}`
          );
        } else {
          response = `cd: no such file or directory: ${arg}`;
        }
        break;

      case "cat":
        if (
          arg &&
          currentDir?.contents[arg] &&
          (currentDir.contents[arg] as File).type === "file"
        ) {
          response = (currentDir.contents[arg] as File).content;
        } else {
          response = `cat: ${arg}: No such file`;
        }
        break;

      case "":
        break;

      case "clear":
        setCommandHistory([]);
        setInput("");
        return;

      default:
        response = `Command not found: ${command}`;
    }

    setCommandHistory([
      ...commandHistory,
      `<span class="${styles.prompt}"><span class="${
        styles.hostName
      }">dhruv9449@macbook-pro:</span><span class="${
        styles.path
      }">${formatPromptPath(currentPath)}</span>$ <span class="${
        styles.oldInput
      }">${input}</span>`,
      `<span class="${styles.commandOutput}">${response}</span>`,
    ]);
    setInput("");
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      hideTopbarAndDock(false);
      setSize({ width: 1000, height: 700 });
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

  // Updated helper function to format prompt path
  const formatPromptPath = (path: string): string => {
    return path === "~" ? "~" : path.replace(/^~\//, "~/");
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
      style={{ zIndex }}
      onMouseDown={onFocus}
    >
      <div className={styles.window}>
        <div className={`${styles.windowHeader} draggableHandle`}>
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
          <div className={styles.windowTitle}>
            <img
              src={`/icons/iterm.png`}
              alt="Terminal Icon"
              className={styles.windowIcon}
            />
            Terminal
          </div>
        </div>
        <div className={styles.windowContent}>
          {commandHistory.map((line, index) => (
            <div key={index} dangerouslySetInnerHTML={{ __html: line }} />
          ))}
          <div className={styles.inputLine}>
            <div>
              <span className={styles.prompt}>
                <span className={styles.hostName}>
                  {"dhruv9449@macbook-pro:"}
                </span>
                <span className={styles.path}>
                  {formatPromptPath(currentPath)}
                </span>
                {"$"}
              </span>
            </div>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCommand();
              }}
            />
          </div>
        </div>
      </div>
    </Rnd>
  );
}
