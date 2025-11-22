import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { WindowConfig } from "@/types";
import { calculateWindowPosition } from "@/utils/windowHelpers";
import { WINDOW_OFFSET } from "@/constants";

/**
 * Generic hook for managing multiple windows of the same type
 */
export function useWindowManager<T extends WindowConfig>() {
  const [windows, setWindows] = useState<T[]>([]);

  const openWindow = useCallback(
    (
      windowData: Omit<T, "id" | "defaultPosition" | "zIndex">,
      basePosition = { x: 100, y: 100 },
      zIndex?: number
    ) => {
      const newWindow = {
        ...windowData,
        id: uuidv4(),
        defaultPosition: calculateWindowPosition(
          windows.length,
          WINDOW_OFFSET,
          basePosition
        ),
        zIndex: zIndex || 1000,
      } as T;
      setWindows((prev) => [...prev, newWindow]);
      return newWindow.id;
    },
    [windows.length]
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((window) => window.id !== id));
  }, []);

  const closeAllWindows = useCallback(() => {
    setWindows([]);
  }, []);

  const updateWindowZIndex = useCallback((id: string, zIndex: number) => {
    setWindows((prev) =>
      prev.map((window) =>
        window.id === id ? ({ ...window, zIndex } as T) : window
      )
    );
  }, []);

  return {
    windows,
    openWindow,
    closeWindow,
    closeAllWindows,
    updateWindowZIndex,
  };
}
