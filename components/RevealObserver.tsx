"use client";

import { useEffect } from "react";

export default function RevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let delayCount = 0;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Appliquer un transitionDelay progressif par groupe de 4 éléments
            const element = entry.target as HTMLElement;
            element.style.transitionDelay = `${(delayCount % 4) * 0.1}s`;
            element.classList.add("visible");
            delayCount++;
            observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    const checkAndObserve = () => {
      const elements = document.querySelectorAll(".reveal:not(.visible)");
      elements.forEach((el) => observer.observe(el));
    };

    // Run initially and then set up a MutationObserver to catch newly added elements
    checkAndObserve();

    const mutationObserver = new MutationObserver((mutations) => {
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

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
