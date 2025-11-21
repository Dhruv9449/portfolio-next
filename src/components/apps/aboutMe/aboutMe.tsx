import { use, useEffect, useState } from "react";
import styles from "./aboutMe.module.css";
import { Rnd } from "react-rnd";
import AboutMeCore from "../aboutMeCore/aboutMeCore";

interface AboutMeProps {
  defaultPosition: { x: number; y: number };
  hideTopbarAndDock: (hide: boolean) => void;
  onClose: () => void;
}

export default function AboutMe({
  defaultPosition,
  hideTopbarAndDock,
  onClose,
}: AboutMeProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState({ width: 1000, height: 600 });
  const [position, setPosition] = useState(defaultPosition);

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
          <div className={styles.windowTitle}>About Me</div>
        </div>
        <div className={styles.windowContent}>
          <AboutMeCore />
        </div>
      </div>
    </Rnd>
  );
}
