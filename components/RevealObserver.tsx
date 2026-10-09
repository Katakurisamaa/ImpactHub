"use client";

import { useEffect } from "react";

export default function RevealObserver() {
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    // Delay observer registration so that React finishes hydrating the DOM first
    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          let delayCount = 0;
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const element = entry.target as HTMLElement;
              element.style.transitionDelay = `${(delayCount % 4) * 0.1}s`;
              element.classList.add("visible");
              delayCount++;
              observer?.unobserve(element);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -40px 0px"
        }
      );

      const checkAndObserve = () => {
        if (!observer) return;
        const elements = document.querySelectorAll(".reveal:not(.visible)");
        elements.forEach((el) => observer!.observe(el));
      };

      checkAndObserve();

      mutationObserver = new MutationObserver((mutations) => {
        let shouldCheck = false;
        mutations.forEach(mutation => {
          if (mutation.addedNodes.length > 0) {
            shouldCheck = true;
          }
        });
        if (shouldCheck) {
          checkAndObserve();
        }
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
      mutationObserver?.disconnect();
    };
  }, []);

  return null;
}
