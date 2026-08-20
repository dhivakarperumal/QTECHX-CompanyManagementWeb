import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.documentElement.scrollTo({ top: 0, behavior: "instant" });
    document.body.scrollTo({ top: 0, behavior: "instant" });

    const scrollableElements = document.querySelectorAll(
      'main, .overflow-y-auto, [class*="overflow-y-auto"], .admin-root, .employee-root'
    );
    scrollableElements.forEach((el) => {
      if (el && el.scrollTop > 0) {
        el.scrollTo({ top: 0, behavior: "instant" });
      }
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
