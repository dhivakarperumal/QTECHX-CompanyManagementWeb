import { Suspense, useEffect, useRef, useState } from "react";

export default function DeferredHomeSection({ component: Component }) {
  const sectionRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "700px 0px" }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef}>
      {shouldLoad ? (
        <Suspense fallback={<div className="min-h-[320px]" aria-hidden="true" />}>
          <Component />
        </Suspense>
      ) : (
        <div className="min-h-[320px]" aria-hidden="true" />
      )}
    </div>
  );
}
