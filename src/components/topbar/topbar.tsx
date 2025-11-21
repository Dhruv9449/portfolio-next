import { useEffect, useState } from "react";
import { FaWifi } from "react-icons/fa";
import { BsBatteryFull } from "react-icons/bs";
import { USER_INFO } from "@/constants";
import styles from "./topbar.module.css";

export default function TopBar() {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const optionsDate: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    const optionsTime: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };

    const updateDateTime = () => {
      const date = new Date();
      setCurrentDate(date.toLocaleDateString(undefined, optionsDate));
      setCurrentTime(date.toLocaleTimeString(undefined, optionsTime));
    };

    updateDateTime(); // Set initial date and time
    const intervalId = setInterval(updateDateTime, 60000); // Update every minute

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  return (
    <div className={styles.topbar}>
      <div className={styles.left}>
        <img
          src="./logo-small.svg"
          alt={USER_INFO.name}
          width={16}
          className={styles.logo}
        />
        <p>
          <strong>{USER_INFO.name}</strong>
        </p>
      </div>
      <div className={styles.right}>
        <div className={styles.iconGroup}>
          <p className={styles.iconText}>100%</p>
          <BsBatteryFull className={styles.batteryIcon} />
        </div>
        <div className={styles.iconGroup}>
          <FaWifi className={styles.wifiIcon} />
        </div>
        <div className={styles.iconGroup}>
          <p className={styles.date}>{currentDate}</p>
          <p className={styles.time}>{currentTime}</p>
        </div>
      </div>
    </div>
  );
}
