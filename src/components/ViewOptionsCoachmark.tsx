"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "dorm-living-os:view-options-coachmark:v1";
const TIME_ON_PAGE_MS = 30_000;
const DISMISS_LOCK_MS = 2_000;
const VIEW_OPTIONS_SELECTOR = "[data-view-options-link]";

function getNearestVisibleViewOptionsLink(): HTMLAnchorElement | null {
  const links = document.querySelectorAll<HTMLAnchorElement>(
    VIEW_OPTIONS_SELECTOR
  );
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  let nearest: HTMLAnchorElement | null = null;
  let nearestDist = Infinity;

  for (const link of links) {
    const rect = link.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    const inViewport =
      rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      rect.right > 0 &&
      rect.left < window.innerWidth;
    if (!inViewport) continue;

    const linkCenterX = rect.left + rect.width / 2;
    const linkCenterY = rect.top + rect.height / 2;
    const dist =
      (linkCenterX - centerX) ** 2 + (linkCenterY - centerY) ** 2;

    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = link;
    }
  }

  return nearest;
}

interface ViewOptionsCoachmarkProps {
  active: boolean;
  checklistRef: React.RefObject<HTMLElement | null>;
}

type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export default function ViewOptionsCoachmark({
  active,
  checklistRef,
}: ViewOptionsCoachmarkProps) {
  const [visible, setVisible] = useState(false);
  const [highlightedLink, setHighlightedLink] =
    useState<HTMLAnchorElement | null>(null);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [layout, setLayout] = useState<{
    bubbleTop: number;
    bubbleLeft: number;
    arrowLeft: number;
    arrowTop: number;
    arrowRotate: number;
  } | null>(null);
  const dismissedRef = useRef(false);
  const timeReadyRef = useRef(false);
  const scrolledToChecklistRef = useRef(false);
  const backdropDismissibleRef = useRef(false);

  const dismiss = useCallback(() => {
    dismissedRef.current = true;
    setVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const wasDismissedBefore = useCallback(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  }, []);

  const updateLayout = useCallback(() => {
    const link = getNearestVisibleViewOptionsLink();
    if (!link) {
      setHighlightedLink(null);
      setTargetRect(null);
      setLayout(null);
      return null;
    }

    setHighlightedLink(link);

    const rect = link.getBoundingClientRect();
    const pad = 8;
    const target: TargetRect = {
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    };
    setTargetRect(target);

    const bubbleWidth = 272;
    const bubbleHeight = 110;
    const gap = 20;
    const centerY = rect.top + rect.height / 2;

    let bubbleLeft = rect.right + gap;
    let arrowRotate = 180;

    if (bubbleLeft + bubbleWidth > window.innerWidth - 16) {
      bubbleLeft = rect.left - bubbleWidth - gap;
      arrowRotate = 0;
    }

    bubbleLeft = Math.max(16, Math.min(bubbleLeft, window.innerWidth - bubbleWidth - 16));
    let bubbleTop = centerY - bubbleHeight / 2;
    bubbleTop = Math.max(16, Math.min(bubbleTop, window.innerHeight - bubbleHeight - 16));

    const arrowLeft =
      arrowRotate === 180
        ? bubbleLeft - 14
        : bubbleLeft + bubbleWidth;
    const arrowTop = centerY - 10;

    setLayout({ bubbleTop, bubbleLeft, arrowLeft, arrowTop, arrowRotate });
    return link;
  }, []);

  const tryShow = useCallback(() => {
    if (
      !active ||
      dismissedRef.current ||
      wasDismissedBefore() ||
      !timeReadyRef.current ||
      !scrolledToChecklistRef.current
    ) {
      return;
    }

    if (updateLayout()) setVisible(true);
  }, [active, updateLayout, wasDismissedBefore]);

  useEffect(() => {
    if (!active || wasDismissedBefore()) {
      dismissedRef.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      timeReadyRef.current = true;
      tryShow();
    }, TIME_ON_PAGE_MS);

    return () => window.clearTimeout(timer);
  }, [active, tryShow, wasDismissedBefore]);

  useEffect(() => {
    if (!active || dismissedRef.current) return;

    const el = checklistRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          scrolledToChecklistRef.current = true;
          tryShow();
        }
      },
      { threshold: 0.12, rootMargin: "-60px 0px 0px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [active, checklistRef, tryShow]);

  useEffect(() => {
    if (!visible) {
      backdropDismissibleRef.current = false;
      return;
    }

    backdropDismissibleRef.current = false;
    const unlockTimer = window.setTimeout(() => {
      backdropDismissibleRef.current = true;
    }, DISMISS_LOCK_MS);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && backdropDismissibleRef.current) dismiss();
    };

    const onScrollOrResize = () => {
      if (!updateLayout() && backdropDismissibleRef.current) dismiss();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    return () => {
      window.clearTimeout(unlockTimer);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [visible, dismiss, updateLayout]);

  useEffect(() => {
    if (!visible || !highlightedLink) return;

    const onLinkClick = () => dismiss();
    highlightedLink.addEventListener("click", onLinkClick);
    return () => highlightedLink.removeEventListener("click", onLinkClick);
  }, [visible, highlightedLink, dismiss]);

  if (!visible || !targetRect || !layout || !highlightedLink) return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-options-coachmark-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Dismiss tip"
        onClick={() => {
          if (backdropDismissibleRef.current) dismiss();
        }}
      />

      {/* Dim everything except spotlight (box-shadow cutout) */}
      <div
        className="pointer-events-none absolute rounded-lg border-2 border-accent bg-transparent shadow-[0_0_0_9999px_rgba(30,41,59,0.58)] motion-reduce:transition-none"
        style={{
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
        }}
      />

      {/* Keep link clickable above overlay */}
      <a
        href={highlightedLink.href}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute z-[102] rounded-md ring-2 ring-accent ring-offset-2 ring-offset-transparent"
        style={{
          top: targetRect.top + 8,
          left: targetRect.left + 8,
          width: targetRect.width - 16,
          height: targetRect.height - 16,
        }}
      >
        <span className="sr-only">View options</span>
      </a>

      {/* Chunky arrow */}
      <div
        className="pointer-events-none absolute z-[103] h-0 w-0 border-y-[10px] border-y-transparent border-r-[14px] border-r-foreground motion-safe:animate-pop-in motion-reduce:animate-none"
        style={{
          top: layout.arrowTop,
          left: layout.arrowLeft,
          transform: `rotate(${layout.arrowRotate}deg)`,
        }}
        aria-hidden
      />

      <div
        className={cn(
          "absolute z-[103] w-[272px] speech-bubble border-2 border-foreground bg-card p-4 shadow-pop-lg",
          "motion-safe:animate-pop-in motion-reduce:animate-none"
        )}
        style={{ top: layout.bubbleTop, left: layout.bubbleLeft }}
      >
        <p
          id="view-options-coachmark-title"
          className="font-body text-sm leading-relaxed text-foreground"
        >
          Don&apos;t waste time researching. Tap here to see the best dorm
          essentials, that I personally picked!
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-3 font-body text-xs font-semibold text-accent hover:underline"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
