/**
 * BranchPanda content script.
 *
 * Injected into every https://github.com/{owner}/{repo}/* page.
 * – Detects repository pages via the stable #repository-details-container element.
 * – Inserts a "BranchPanda" button as the first <li> in the actions <ul>.
 * – Clicking the button slides in a fixed sidebar from the left containing the
 *   extension popup in an <iframe>, pre-loading the current repository automatically.
 * – Handles GitHub's Turbo navigation (pjax/turbo:render) so the button
 *   survives soft navigations between pages.
 */

import pandaIconUrl from '../assets/app/branchpanda-icon.svg?url';

const BP_BTN_ID = 'branchpanda-btn';
const BP_SIDEBAR_ID = 'branchpanda-sidebar';
const BP_STYLES_ID = 'branchpanda-styles';
const BP_INJECTED_LI_ID = 'branchpanda-btn-li';
const BP_RESIZE_ID = 'branchpanda-resize-handle';
const DEFAULT_SIDEBAR_WIDTH = 860;
const HOST_SCROLLBAR_RESERVE = 14;

function getHostInsets(): { top: number; right: number } {
  const headerSelectors = [
    'header.AppHeader',
    'header.Header',
    '.js-header-wrapper',
    '#repository-container-header',
  ];
  let top = 0;
  for (const sel of headerSelectors) {
    const el = document.querySelector(sel);
    if (!el) continue;
    top = Math.max(top, Math.ceil(el.getBoundingClientRect().bottom));
  }

  const doc = document.documentElement;
  const hasPageScrollbar = doc.scrollHeight > doc.clientHeight;
  const right = hasPageScrollbar ? HOST_SCROLLBAR_RESERVE : 0;

  return { top, right };
}

function syncSidebarLayout(sidebar: HTMLElement): void {
  const { top, right } = getHostInsets();
  sidebar.style.top = `${top}px`;
  sidebar.style.height = `calc(100dvh - ${top}px)`;

  if (sidebar.classList.contains('bp-fullscreen')) {
    sidebar.style.width = right ? `calc(100vw - ${right}px)` : '100vw';
    sidebar.style.maxWidth = right ? `calc(100vw - ${right}px)` : '100vw';
  }
}

function watchHostLayout(sidebar: HTMLElement): () => void {
  syncSidebarLayout(sidebar);

  let raf = 0;
  const schedule = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => syncSidebarLayout(sidebar));
  };

  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('scroll', schedule, { passive: true });

  const observed = new Set<Element>();
  for (const sel of ['header.AppHeader', 'header.Header', '.js-header-wrapper']) {
    const el = document.querySelector(sel);
    if (el && !observed.has(el)) {
      observed.add(el);
      new ResizeObserver(schedule).observe(el);
    }
  }

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', schedule);
    window.removeEventListener('scroll', schedule);
  };
}

let stopLayoutWatch: (() => void) | null = null;

function getExtensionUrl(path: string): string {
  const g = globalThis as Record<string, unknown>;
  type RT = { runtime: { getURL: (p: string) => string } };
  const c = g['chrome'] as RT | undefined;
  const b = g['browser'] as RT | undefined;
  return c?.runtime.getURL(path) ?? b?.runtime.getURL(path) ?? path;
}

/** Returns "owner/repo" string when on a repository page, null otherwise. */
function getRepo(): string | null {
  const m = location.pathname.match(/^\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/);
  if (!m) return null;

  const owner = m[1].toLowerCase();
  const nonRepoOwners = new Set([
    'orgs', 'sponsors', 'marketplace', 'topics', 'trending', 'explore',
    'features', 'pricing', 'security', 'enterprise', 'about', 'contact',
    'settings', 'notifications', 'pulls', 'issues', 'discussions', 'new',
    'login', 'join', 'codespaces', 'copilot', 'readme', 'github-actions',
    'apps', 'users',
  ]);
  if (nonRepoOwners.has(owner)) return null;

  if (!document.getElementById('repository-details-container')) return null;

  return `${m[1]}/${m[2]}`;
}

function injectStyles(): void {
  if (document.getElementById(BP_STYLES_ID)) return;
  const style = document.createElement('style');
  style.id = BP_STYLES_ID;
  style.textContent = `
    #${BP_BTN_ID} {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      font-size: 12px;
      font-weight: 500;
      line-height: 20px;
      cursor: pointer;
      white-space: nowrap;
      vertical-align: middle;
      user-select: none;
      appearance: none;
      color: var(--fgColor-default, #1f2328);
      background-color: var(--bgColor-muted, #f6f8fa);
      border: 1px solid var(--borderColor-default, rgba(31,35,40,.15));
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      transition: background-color 0.12s, border-color 0.12s;
    }
    #${BP_BTN_ID}:hover {
      background-color: var(--button-default-bgColor-hover, var(--bgColor-muted-hover, #eaeef2));
      border-color: var(--button-default-borderColor-hover, var(--borderColor-default, rgba(31,35,40,.3)));
    }
    #${BP_BTN_ID}.bp-active {
      background-color: var(--button-default-bgColor-selected, var(--bgColor-muted, #f6f8fa));
      color: var(--fgColor-default, #1f2328);
      border-color: var(--button-default-borderColor-selected, var(--borderColor-default, rgba(31,35,40,.3)));
      box-shadow: var(--button-default-shadow-selected, inset 0 0 0 1px rgba(31,35,40,.15));
    }
    #${BP_BTN_ID}.bp-active:hover {
      background-color: var(--button-default-bgColor-hover, var(--bgColor-muted-hover, #eaeef2));
    }
    #${BP_BTN_ID} .bp-icon {
      width: 14px;
      height: 14px;
      display: block;
    }

    #${BP_SIDEBAR_ID} {
      position: fixed;
      top: 0;
      left: 0;
      width: 860px;
      max-width: 92vw;
      height: 100dvh;
      z-index: 100000;
      background: #020617;
      box-shadow: 6px 0 32px rgba(0, 0, 0, 0.35);
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    #${BP_SIDEBAR_ID}.bp-open {
      transform: translateX(0);
    }
    #${BP_SIDEBAR_ID}.bp-fullscreen {
      max-width: 100vw !important;
    }
    #${BP_RESIZE_ID} {
      position: absolute;
      top: 0;
      right: 0;
      width: 6px;
      height: 100%;
      cursor: col-resize;
      z-index: 1;
      touch-action: none;
    }
    #${BP_RESIZE_ID}:hover,
    #${BP_RESIZE_ID}.bp-dragging {
      background: rgba(255, 255, 255, 0.12);
    }
    #${BP_SIDEBAR_ID} > iframe {
      flex: 1;
      width: 100%;
      border: none;
      display: block;
    }
  `;
  document.head.appendChild(style);
}

function createButtonLi(): HTMLLIElement {
  const li = document.createElement('li');
  li.id = BP_INJECTED_LI_ID;

  const btn = document.createElement('button');
  btn.id = BP_BTN_ID;
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Open BranchPanda file explorer');

  const icon = document.createElement('img');
  icon.className = 'bp-icon';
  icon.src = pandaIconUrl;
  icon.alt = '';
  icon.draggable = false;

  btn.appendChild(icon);
  btn.appendChild(document.createTextNode(' BranchPanda'));
  btn.addEventListener('click', toggleSidebar);

  li.appendChild(btn);
  return li;
}

function attachResizeHandle(sidebar: HTMLDivElement): void {
  const handle = document.createElement('div');
  handle.id = BP_RESIZE_ID;
  handle.setAttribute('aria-label', 'Resize panel');
  handle.setAttribute('role', 'separator');

  let startX = 0;
  let startWidth = DEFAULT_SIDEBAR_WIDTH;

  handle.addEventListener('pointerdown', (e) => {
    if (sidebar.classList.contains('bp-fullscreen')) return;
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    handle.classList.add('bp-dragging');
    startX = e.clientX;
    startWidth = sidebar.getBoundingClientRect().width;

    function onMove(ev: PointerEvent) {
      const next = Math.min(window.innerWidth, Math.max(360, startWidth + (ev.clientX - startX)));
      sidebar.style.width = `${next}px`;
    }

    function onUp() {
      handle.classList.remove('bp-dragging');
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
    }

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
  });

  sidebar.appendChild(handle);
}

function createSidebar(repo: string): HTMLDivElement {
  const sidebar = document.createElement('div');
  sidebar.id = BP_SIDEBAR_ID;
  sidebar.setAttribute('role', 'complementary');
  sidebar.setAttribute('aria-label', 'BranchPanda file explorer');

  const iframe = document.createElement('iframe');
  const popupBase = getExtensionUrl('index.html');
  iframe.src = `${popupBase}?repo=${encodeURIComponent(repo)}&autoload=true`;
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.setAttribute('title', 'BranchPanda file explorer');

  sidebar.appendChild(iframe);
  attachResizeHandle(sidebar);
  return sidebar;
}

function openSidebar(): void {
  const repo = getRepo();
  if (!repo) return;

  let sidebar = document.getElementById(BP_SIDEBAR_ID) as HTMLDivElement | null;
  if (!sidebar) {
    sidebar = createSidebar(repo);
    document.body.appendChild(sidebar);
    stopLayoutWatch = watchHostLayout(sidebar);
  }

  syncSidebarLayout(sidebar);

  requestAnimationFrame(() => {
    sidebar!.classList.add('bp-open');
  });

  document.getElementById(BP_BTN_ID)?.classList.add('bp-active');
}

function closeSidebar(): void {
  const sidebar = document.getElementById(BP_SIDEBAR_ID);
  if (sidebar) {
    sidebar.classList.remove('bp-open');
    stopLayoutWatch?.();
    stopLayoutWatch = null;
    setTimeout(() => { sidebar.remove(); }, 310);
  }
  document.getElementById(BP_BTN_ID)?.classList.remove('bp-active');
}

function toggleSidebar(): void {
  const sidebar = document.getElementById(BP_SIDEBAR_ID);
  if (sidebar?.classList.contains('bp-open')) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function injectButton(): void {
  if (document.getElementById(BP_INJECTED_LI_ID)) return;

  const repo = getRepo();
  if (!repo) return;

  const container = document.getElementById('repository-details-container');
  if (!container) return;

  const ul = container.querySelector('ul');
  if (!ul) return;

  injectStyles();
  ul.insertBefore(createButtonLi(), ul.firstChild);
}

function removeInjection(): void {
  document.getElementById(BP_INJECTED_LI_ID)?.remove();
  document.getElementById(BP_SIDEBAR_ID)?.remove();
}

injectButton();

const observer = new MutationObserver(() => { injectButton(); });
observer.observe(document.body, { childList: true, subtree: true });

document.addEventListener('turbo:render', () => {
  removeInjection();
  injectButton();
});
document.addEventListener('turbo:navigate', () => { closeSidebar(); });

document.addEventListener('pjax:end', () => {
  removeInjection();
  injectButton();
});

window.addEventListener('message', (e) => {
  if (e.data?.source !== 'branchpanda') return;

  if (e.data.type === 'close') {
    closeSidebar();
    return;
  }

  if (e.data.type === 'fullscreen') {
    const sidebar = document.getElementById(BP_SIDEBAR_ID);
    if (!sidebar) return;
    sidebar.classList.toggle('bp-fullscreen', Boolean(e.data.full));
    if (e.data.full) sidebar.style.width = '';
    else sidebar.style.width = `${DEFAULT_SIDEBAR_WIDTH}px`;
    syncSidebarLayout(sidebar);
  }
});
