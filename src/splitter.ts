const STORAGE_KEY = "crabdown.editorWidth";
const MIN_PERCENT = 15;
const MAX_PERCENT = 85;
const KEYBOARD_STEP = 2;

export function initSplitter(layout: HTMLElement, splitter: HTMLElement): void {
  const setWidth = (percent: number) => {
    const clamped = Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, percent));
    layout.style.setProperty("--editor-width", `${clamped}%`);
    splitter.setAttribute("aria-valuenow", String(Math.round(clamped)));
    localStorage.setItem(STORAGE_KEY, String(clamped));
    return clamped;
  };

  let width = setWidth(Number(localStorage.getItem(STORAGE_KEY)) || 50);

  splitter.addEventListener("pointerdown", (event) => {
    splitter.setPointerCapture(event.pointerId);
    layout.classList.add("resizing");
  });
  splitter.addEventListener("pointermove", (event) => {
    if (!splitter.hasPointerCapture(event.pointerId)) return;
    const box = layout.getBoundingClientRect();
    width = setWidth(((event.clientX - box.left) / box.width) * 100);
  });
  splitter.addEventListener("pointerup", (event) => {
    splitter.releasePointerCapture(event.pointerId);
    layout.classList.remove("resizing");
  });
  splitter.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") width = setWidth(width - KEYBOARD_STEP);
    else if (event.key === "ArrowRight") width = setWidth(width + KEYBOARD_STEP);
    else return;
    event.preventDefault();
  });
}
