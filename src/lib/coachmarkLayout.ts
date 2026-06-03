export type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type BubblePlacement = "beside" | "above" | "below";

export type CoachmarkArrowDirection = "left" | "right" | "up" | "down";

export type CoachmarkLayout = {
  bubbleTop: number;
  bubbleLeft: number;
  arrowDirection: CoachmarkArrowDirection;
  /** Horizontal offset from bubble left edge (for up/down arrows). */
  arrowOffsetX: number;
};

const BUBBLE_WIDTH = 272;
const BUBBLE_HEIGHT = 120;
const GAP = 20;
const PAD = 8;
const VIEWPORT_MARGIN = 16;

export type CoachmarkLayoutOptions = {
  /** Extra space between target and bubble (added to default gap). */
  gap?: number;
  /** Estimated bubble height for positioning above targets. */
  bubbleHeight?: number;
};

export function rectFromElement(el: Element): TargetRect {
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  };
}

function clampBubblePosition(left: number, top: number) {
  return {
    left: Math.max(
      VIEWPORT_MARGIN,
      Math.min(left, window.innerWidth - BUBBLE_WIDTH - VIEWPORT_MARGIN)
    ),
    top: Math.max(
      VIEWPORT_MARGIN,
      Math.min(top, window.innerHeight - BUBBLE_HEIGHT - VIEWPORT_MARGIN)
    ),
  };
}

export function computeCoachmarkLayout(
  rect: DOMRect,
  placement: BubblePlacement = "beside",
  options?: CoachmarkLayoutOptions
): CoachmarkLayout {
  const gap = options?.gap ?? GAP;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  if (placement === "below") {
    let bubbleLeft = centerX - BUBBLE_WIDTH / 2;
    let bubbleTop = rect.bottom + gap;
    ({ left: bubbleLeft, top: bubbleTop } = clampBubblePosition(
      bubbleLeft,
      bubbleTop
    ));
    const arrowOffsetX = centerX - bubbleLeft - 10;
    return {
      bubbleTop,
      bubbleLeft,
      arrowDirection: "up",
      arrowOffsetX,
    };
  }

  if (placement === "above") {
    const bubbleHeight = options?.bubbleHeight ?? BUBBLE_HEIGHT;
    let bubbleLeft = centerX - BUBBLE_WIDTH / 2;
    let bubbleTop = rect.top - bubbleHeight - gap;
    ({ left: bubbleLeft, top: bubbleTop } = clampBubblePosition(
      bubbleLeft,
      bubbleTop
    ));
    const arrowOffsetX = centerX - bubbleLeft - 10;
    return {
      bubbleTop,
      bubbleLeft,
      arrowDirection: "down",
      arrowOffsetX,
    };
  }

  let bubbleLeft = rect.right + gap;
  let arrowDirection: CoachmarkArrowDirection = "left";

  if (bubbleLeft + BUBBLE_WIDTH > window.innerWidth - VIEWPORT_MARGIN) {
    bubbleLeft = rect.left - BUBBLE_WIDTH - gap;
    arrowDirection = "right";
  }

  let bubbleTop = centerY - BUBBLE_HEIGHT / 2;
  ({ left: bubbleLeft, top: bubbleTop } = clampBubblePosition(
    bubbleLeft,
    bubbleTop
  ));

  return {
    bubbleTop,
    bubbleLeft,
    arrowDirection,
    arrowOffsetX: BUBBLE_WIDTH / 2 - 10,
  };
}

function nearestViewOptionsLinkIn(root: ParentNode): HTMLAnchorElement | null {
  const links = root.querySelectorAll<HTMLAnchorElement>(
    "[data-view-options-link]"
  );
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  let nearest: HTMLAnchorElement | null = null;
  let nearestDist = Infinity;

  for (const link of links) {
    const rect = link.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

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

/** Prefer links in checklist; includes off-screen links for scroll-into-view. */
export function getViewOptionsLinkForTutorial(
  checklistRoot: HTMLElement | null
): HTMLAnchorElement | null {
  if (checklistRoot) {
    const inChecklist = nearestViewOptionsLinkIn(checklistRoot);
    if (inChecklist) return inChecklist;
  }
  return nearestViewOptionsLinkIn(document);
}

export function getNearestVisibleViewOptionsLink(
  root?: HTMLElement | null
): HTMLAnchorElement | null {
  const scope = root ?? document;
  const links = scope.querySelectorAll<HTMLAnchorElement>(
    "[data-view-options-link]"
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
