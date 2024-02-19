import { useEffect } from "react";

const debounce = <F extends (...args: any[]) => any>(func: F, wait: number): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null;
  return (...args: Parameters<F>) => {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const ScrollDetector = ({ setShowBottomNav, isSMscreen }) => {
  useEffect(() => {
    if (!isSMscreen) {
      return;
    }

    const hideBottomNav = debounce(() => {
      setShowBottomNav(false);
    }, 3000);

    const handleScroll = (event: WheelEvent | TouchEvent) => {
      if ("deltaY" in event && event.deltaY === 0) {
        // Ignore horizontal scroll
        return;
      }

      setShowBottomNav(true);
      hideBottomNav(); // debounce
    };

    window.addEventListener("wheel", handleScroll);
    window.addEventListener("touchmove", handleScroll);

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
    };
  }, [setShowBottomNav, isSMscreen]);

  return null;
};

export default ScrollDetector;
