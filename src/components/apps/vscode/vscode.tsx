import { useState } from "react";
import { Rnd } from "react-rnd";
import { BaseWindowProps } from "@/types";
import { getMaximizedSize } from "@/utils/windowHelpers";
import styles from "./vscode.module.css";

interface VSCodeProps extends BaseWindowProps {}

export default function VSCode({
  defaultPosition,
  hideTopbarAndDock,
  onClose,
}: VSCodeProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState({ width: 1000, height: 700 });
  const [position, setPosition] = useState(defaultPosition);

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
              src={`/icons/vscode.png`}
              alt={""}
              className={styles.windowIcon}
            />
            Code
          </div>
        </div>
        <div className={styles.windowContent}>
          <iframe
            src="https://github1s.com/dhruv9449/portfolio-next/blob/main/README.md"
            className={styles.vscode}
          />
        </div>
      </div>
    </Rnd>
  );
}
