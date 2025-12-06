import { useEffect, useRef } from "react";

export default function useScrollAnimation() {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("animate-fade-slide");
          observer.unobserve(element);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
  }, []);

  return ref;
}
