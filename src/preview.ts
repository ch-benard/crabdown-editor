import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { strings } from "./strings";

const RENDER_DELAY_MS = 150;
const HEADING_ID_PREFIX = "user-content-";

export interface Preview {
  render(source: string): Promise<void>;
  scheduleRender(source: string): void;
}

export function createPreview(element: HTMLElement): Preview {
  let timer: number | undefined;
  let latest = 0;

  async function render(source: string): Promise<void> {
    window.clearTimeout(timer);
    const request = ++latest;
    try {
      const html = await invoke<string>("render_markdown", { source });
      if (request === latest) element.innerHTML = html;
    } catch (error) {
      if (request === latest) element.textContent = `${strings.previewError} ${error}`;
    }
  }

  element.addEventListener("click", (event) => {
    const link = (event.target as Element).closest("a");
    const href = link?.getAttribute("href");
    if (!href) return;
    event.preventDefault();
    if (href.startsWith("#")) {
      scrollToAnchor(element, decodeURIComponent(href.slice(1)));
    } else if (/^(https?|mailto):/i.test(href)) {
      void openUrl(href);
    }
  });

  return {
    render,
    scheduleRender(source) {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void render(source), RENDER_DELAY_MS);
    },
  };
}

function scrollToAnchor(root: HTMLElement, id: string): void {
  const target =
    root.querySelector(`[id="${CSS.escape(id)}"]`) ??
    root.querySelector(`[id="${CSS.escape(HEADING_ID_PREFIX + id)}"]`);
  target?.scrollIntoView();
}

export function syncScroll(source: HTMLElement, target: HTMLElement): void {
  source.addEventListener("scroll", () => {
    const ratio = source.scrollTop / Math.max(1, source.scrollHeight - source.clientHeight);
    target.scrollTop = ratio * (target.scrollHeight - target.clientHeight);
  });
}
