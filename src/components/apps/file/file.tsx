import { use, useEffect, useState } from "react";
import styles from "./file.module.css";
import { Rnd } from "react-rnd";
import MarkdownRenderer from "@/components/markdownRenderer/markdownRenderer";

interface FileProps {
  file: {
    name: string;
    title: string;
    directory: string;
  };
  defaultPosition: { x: number; y: number };
  hideTopbarAndDock: (hide: boolean) => void;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
}

export default function File({
  file,
  defaultPosition,
  hideTopbarAndDock,
  onClose,
  zIndex = 1000,
  onFocus,
}: FileProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState({ width: 1000, height: 700 });
  const [position, setPosition] = useState(defaultPosition);

  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    // If file found then fetch the markdown content, else set the markdown to "Nothing to see here".
    // Ensure it catches any errors and sets the markdown to "Nothing to see here".
    fetch(`/markdown/${file.directory.toLowerCase()}/${file.name}.md`)
      .then((response) => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error("File not found");
        }
      })
      .then((data) => setMarkdown(data))
      .catch((error) => {
        console.log(error);
        setMarkdown("Nothing to see here");
      });
  }, [file.directory, file.name]);

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
        <div className={styles.windowHeader + " draggableHandle"}>
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
              src={`/icons/${file.directory.toLowerCase()}/${file.name}.png`}
              alt={""}
              className={styles.windowIcon}
            />
            {file.title}
          </div>
        </div>
        <div className={styles.windowContent}>
          <MarkdownRenderer content={markdown} />
        </div>
      </div>
    </Rnd>
  );
}
