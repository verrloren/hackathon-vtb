import { useEffect } from "react";

export const usePreventScrollbarShift = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.paddingRight = "";
    }
  }, [isOpen]);
};