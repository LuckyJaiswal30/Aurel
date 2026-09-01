const glideMilliseconds = 520;
const glideEasing = "cubic-bezier(0.65, 0, 0.35, 1)";
const chatColumnWidth = 768;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function findChatColumn(main: HTMLElement) {
  const box = main.getBoundingClientRect();
  const style = getComputedStyle(main);
  const contentLeft = box.left + parseFloat(style.paddingLeft);
  const contentWidth =
    box.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const width = Math.min(chatColumnWidth, contentWidth);
  return { left: contentLeft + (contentWidth - width) / 2, width };
}

export async function glideToBottom(
  composer: HTMLElement,
  fadingElements: HTMLElement[],
) {
  const main = composer.closest("main");
  if (!main || prefersReducedMotion()) return;
  const start = composer.getBoundingClientRect();
  const column = findChatColumn(main);
  const bottomGap = window.innerWidth >= 768 ? 24 : 16;
  const moveX = column.left - start.left;
  const moveY = window.innerHeight - bottomGap - start.bottom;
  const timing = {
    duration: glideMilliseconds,
    easing: glideEasing,
    fill: "forwards" as const,
  };

  for (const element of fadingElements) {
    element.animate(
      [{ opacity: 1 }, { opacity: 0, transform: "translateY(-0.75rem)" }],
      { ...timing, duration: glideMilliseconds * 0.6 },
    );
  }
  await composer.animate(
    [
      { transform: "translate(0, 0)", width: `${start.width}px` },
      {
        transform: `translate(${moveX}px, ${moveY}px)`,
        width: `${column.width}px`,
      },
    ],
    timing,
  ).finished;
}
