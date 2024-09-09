import { useState } from "react";
import { Rnd } from "react-rnd";
import styles from "./desktopIcon.module.css";

interface DesktopIconProps {
  icon: string;
  label: string;
  onDoubleClick: () => void; // Keep this as onDoubleClick
}

export default function DesktopIcon({
  icon,
  label,
  onDoubleClick,
}: DesktopIconProps) {
  const [dragging, setDragging] = useState(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null); // Track the click timeout

  const handleStart = () => {
    setDragging(false); // Reset dragging state when starting to drag
  };

  const handleDrag = () => {
    setDragging(true); // Set dragging state to true while dragging
  };

  const handleStop = () => {
    setDragging(false); // Reset dragging state when dragging stops
  };

  const handleClick = () => {
    if (dragging) return; // Prevent action if dragging

    // Clear the timeout if a click is registered
    if (clickTimeout) {
      clearTimeout(clickTimeout); // Clear the previous click timeout
      setClickTimeout(null); // Reset timeout state
      onDoubleClick(); // Trigger double-click action
    } else {
      // Set a timeout to detect double click
      const timeout = setTimeout(() => {
        setClickTimeout(null); // Reset the timeout state
      }, 500); // Timeout duration for double-click detection

      setClickTimeout(timeout); // Store the timeout ID
    }
  };

  return (
    <Rnd
      default={{
        x: 50,
        y: 50,
        width: 80,
        height: 80,
      }}
      bounds="window"
      dragHandleClassName={styles.desktopIcon}
      onDragStart={handleStart}
      onDrag={handleDrag}
      onDragStop={handleStop}
      enableResizing={false}
    >
      <div className={styles.desktopIcon} onClick={handleClick} title={label}>
        <img src={icon} alt={label} className={styles.icon} />
        <div className={styles.label}>{label}</div>
      </div>
    </Rnd>
  );
}
