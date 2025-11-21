import { useState, useEffect } from "react";
import { isMobileDevice } from "@/utils/windowHelpers";
import { MOBILE_WIDTH_BREAKPOINT, MOBILE_HEIGHT_BREAKPOINT } from "@/constants";

/**
 * Hook to detect if the current device is mobile
 */
export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = isMobileDevice(window.innerWidth, window.innerHeight);
      setIsMobile(mobile);
    };

    // Set initial state based on window dimensions
    handleResize();

    // Listen to window resize events
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile };
}
