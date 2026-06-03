"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  computeCoachmarkLayout,
  getViewOptionsLinkForTutorial,
  rectFromElement,
  type BubblePlacement,
  type CoachmarkArrowDirection,
  type CoachmarkLayout,
  type CoachmarkLayoutOptions,
  type TargetRect,
} from "@/lib/coachmarkLayout";

const TUTORIAL_STORAGE_KEY = "dorm-living-os:checklist-tutorial:v3";
const LEGACY_VIEW_OPTIONS_KEY = "dorm-living-os:view-options-coachmark:v1";
const SCROLL_SETTLE_MS = 450;
const VIEW_OPTIONS_SCROLL_SETTLE_MS = 700;

type TutorialStepId =
  | "estimated-total"
  | "owned-checkbox"
  | "remove"
  | "add-item"
  | "export-buttons"
  | "view-options";

const STEP_PLACEMENT: Record<TutorialStepId, BubblePlacement> = {
  "estimated-total": "below",
  "owned-checkbox": "above",
  remove: "beside",
  "add-item": "below",
  "export-buttons": "below",
  "view-options": "beside",
};

const STEP_LAYOUT_OPTIONS: Partial<
  Record<TutorialStepId, CoachmarkLayoutOptions>
> = {
  "owned-checkbox": { gap: 16, bubbleHeight: 172 },
};

const STEPS: { id: TutorialStepId; message: string }[] = [
  {
    id: "estimated-total",
    message:
      "This estimated total is the sum of everything on your checklist. Items you mark as already owned are excluded.",
  },
  {
    id: "owned-checkbox",
    message:
      "Already have something? Click this box to mark it as owned — it won't count toward your total.",
  },
  {
    id: "remove",
    message:
      "Don't need or want an item? Use the trash button to remove it from your list.",
  },
  {
    id: "add-item",
    message:
      "If the list is missing something, you can add your own item here.",
  },
  {
    id: "export-buttons",
    message:
      "Ready to shop? Export PDF saves a full priced breakdown you can review or share. Printable checklist opens a simple checkbox list for printing and marking items off.",
  },
  {
    id: "view-options",
    message:
      "Don't waste time researching. Tap here to see the best dorm essentials, that I personally picked!",
  },
];

interface ChecklistTutorialProps {
  active: boolean;
  checklistRef: React.RefObject<HTMLElement | null>;
}

const ARROW_CLASS: Record<CoachmarkArrowDirection, string> = {
  up: "border-x-[10px] border-x-transparent border-b-[14px] border-b-foreground",
  down: "border-x-[10px] border-x-transparent border-t-[14px] border-t-foreground",
  left: "border-y-[10px] border-y-transparent border-r-[14px] border-r-foreground",
  right: "border-y-[10px] border-y-transparent border-l-[14px] border-l-foreground",
};

function wasTutorialCompleted(): boolean {
  try {
    return sessionStorage.getItem(TUTORIAL_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markTutorialCompleted(): void {
  try {
    sessionStorage.setItem(TUTORIAL_STORAGE_KEY, "1");
    sessionStorage.setItem(LEGACY_VIEW_OPTIONS_KEY, "1");
  } catch {
    /* ignore */
  }
}

function resolveStepTarget(
  stepId: TutorialStepId,
  checklistRef: React.RefObject<HTMLElement | null>
): Element | null {
  const checklist = checklistRef.current;

  switch (stepId) {
    case "estimated-total":
      return document.querySelector('[data-tutorial-target="estimated-total"]');
    case "owned-checkbox":
      return checklist?.querySelector("[data-tutorial-owned-checkbox]") ?? null;
    case "remove":
      return checklist?.querySelector("[data-tutorial-remove]") ?? null;
    case "add-item":
      return document.querySelector(
        '[data-tutorial-target="add-item-button"]'
      );
    case "export-buttons":
      return document.querySelector('[data-tutorial-target="export-buttons"]');
    case "view-options":
      return getViewOptionsLinkForTutorial(checklist);
    default:
      return null;
  }
}

export default function ChecklistTutorial({
  active,
  checklistRef,
}: ChecklistTutorialProps) {
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [layout, setLayout] = useState<CoachmarkLayout | null>(null);
  const dismissedRef = useRef(false);
  const hasShownRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const dismiss = useCallback((markComplete = true) => {
    dismissedRef.current = true;
    setVisible(false);
    if (markComplete && hasShownRef.current) {
      markTutorialCompleted();
    }
  }, []);

  const updateLayoutForStep = useCallback(
    (index: number) => {
      const stepId = STEPS[index]?.id;
      if (!stepId) {
        setTargetRect(null);
        setLayout(null);
        return false;
      }

      const target = resolveStepTarget(stepId, checklistRef);
      if (!target) {
        setTargetRect(null);
        setLayout(null);
        return false;
      }

      const rect = target.getBoundingClientRect();
      const targetBox = rectFromElement(target);
      setTargetRect(targetBox);
      setLayout(
        computeCoachmarkLayout(
          rect,
          STEP_PLACEMENT[stepId] ?? "beside",
          STEP_LAYOUT_OPTIONS[stepId]
        )
      );
      return true;
    },
    [checklistRef]
  );

  const scrollToStep = useCallback(
    (index: number, onDone: () => void) => {
      const stepId = STEPS[index]?.id;
      if (!stepId) {
        onDone();
        return;
      }

      const target = resolveStepTarget(stepId, checklistRef);
      if (!target) {
        onDone();
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "center" });
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      const settleMs =
        stepId === "view-options"
          ? VIEW_OPTIONS_SCROLL_SETTLE_MS
          : SCROLL_SETTLE_MS;
      scrollTimerRef.current = setTimeout(onDone, settleMs);
    },
    [checklistRef]
  );

  const showStep = useCallback(
    (index: number) => {
      if (index >= STEPS.length) {
        dismiss(hasShownRef.current);
        return;
      }

      setStepIndex(index);
      setTargetRect(null);
      setLayout(null);
      scrollToStep(index, () => {
        const tryLayout = (attempt: number) => {
          if (updateLayoutForStep(index)) {
            hasShownRef.current = true;
            setVisible(true);
            return;
          }
          const stepId = STEPS[index]?.id;
          if (stepId === "view-options" && attempt < 4) {
            scrollTimerRef.current = setTimeout(
              () => tryLayout(attempt + 1),
              200
            );
            return;
          }
          showStep(index + 1);
        };
        tryLayout(0);
      });
    },
    [scrollToStep, updateLayoutForStep, dismiss]
  );

  const advance = useCallback(() => {
    if (isLastStep) {
      dismiss();
      return;
    }
    showStep(stepIndex + 1);
  }, [isLastStep, dismiss, showStep, stepIndex]);

  useEffect(() => {
    if (wasTutorialCompleted()) {
      dismissedRef.current = true;
      return;
    }

    if (!active || dismissedRef.current) return;

    const startTimer = window.setTimeout(() => {
      if (dismissedRef.current || wasTutorialCompleted()) return;
      showStep(0);
    }, 400);

    return () => window.clearTimeout(startTimer);
  }, [active, showStep]);

  useEffect(() => {
    if (!visible) return;

    const onScrollOrResize = () => updateLayoutForStep(stepIndex);

    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [visible, stepIndex, updateLayoutForStep]);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  if (!visible || !step || !targetRect || !layout) return null;

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checklist-tutorial-title"
    >
      <div className="absolute inset-0 z-[101]" aria-hidden />

      <div
        className="pointer-events-none absolute z-[102] rounded-lg border-2 border-accent bg-transparent shadow-[0_0_0_9999px_rgba(30,41,59,0.58)] motion-reduce:transition-none"
        style={{
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
        }}
      />

      <div
        className="pointer-events-auto absolute z-[103] w-[272px] overflow-visible motion-safe:animate-pop-in motion-reduce:animate-none"
        style={{ top: layout.bubbleTop, left: layout.bubbleLeft }}
      >
        {layout.arrowDirection === "up" && (
          <div
            className={cn(
              "pointer-events-none absolute -top-3 h-0 w-0",
              ARROW_CLASS.up
            )}
            style={{ left: layout.arrowOffsetX }}
            aria-hidden
          />
        )}
        {layout.arrowDirection === "left" && (
          <div
            className={cn(
              "pointer-events-none absolute top-1/2 -left-3.5 h-0 w-0 -translate-y-1/2",
              ARROW_CLASS.left
            )}
            aria-hidden
          />
        )}

        <div className="speech-bubble border-2 border-foreground bg-card p-4 shadow-pop-lg">
          <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Quick tour · {stepIndex + 1} of {STEPS.length}
          </p>
          <p
            id="checklist-tutorial-title"
            className="mt-1 font-body text-sm leading-relaxed text-foreground"
          >
            {step.message}
          </p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => dismiss()}
              className="font-body text-xs font-medium text-muted-foreground hover:underline"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={advance}
              className="font-body text-xs font-semibold text-accent hover:underline"
            >
              {isLastStep ? "Got it" : "Next"}
            </button>
          </div>
        </div>

        {layout.arrowDirection === "down" && (
          <div
            className={cn(
              "pointer-events-none absolute -bottom-3 h-0 w-0",
              ARROW_CLASS.down
            )}
            style={{ left: layout.arrowOffsetX }}
            aria-hidden
          />
        )}
        {layout.arrowDirection === "right" && (
          <div
            className={cn(
              "pointer-events-none absolute top-1/2 -right-3.5 h-0 w-0 -translate-y-1/2",
              ARROW_CLASS.right
            )}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
