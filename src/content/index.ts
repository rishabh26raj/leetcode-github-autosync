import type { LeetCodeSubmission, Difficulty } from '../types';

/**
 * Content Script — ISOLATED World (v3)
 *
 * This script runs in Chrome's ISOLATED world. It has access to chrome.runtime
 * APIs but NOT to the page's JS context (window.fetch etc).
 *
 * The MAIN world script (injected.js) handles fetch/XHR interception and
 * sends us messages via window.postMessage when an accepted submission is detected.
 *
 * We then:
 * 1. Fetch problem metadata via LeetCode's GraphQL (using the page's cookies)
 * 2. Fetch the submitted code via GraphQL (if not provided by the interceptor)
 * 3. Send the submission to the background service worker for GitHub sync
 */

const LOG = '[LeetSync]';
const processedIds = new Set<string>();

// ─── Problem Metadata (via GraphQL) ──────────────────────────────────────────

interface ProblemMeta {
  title: string;
  number: number;
  difficulty: Difficulty;
  titleSlug: string;
  description?: string;
  tags?: string[];
}

let metaCache: ProblemMeta | null = null;

function getSlug(): string {
  const m = window.location.pathname.match(/\/problems\/([^/]+)/);
  return m ? m[1] : '';
}

async function fetchMeta(slug: string): Promise<ProblemMeta | null> {
  if (metaCache?.titleSlug === slug) return metaCache;
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query q($s:String!){question(titleSlug:$s){questionId title difficulty titleSlug content topicTags{name}}}`,
        variables: { s: slug },
      }),
    });
    if (!res.ok) return null;
    const d = await res.json();
    const q = d?.data?.question;
    if (!q) return null;
    metaCache = {
      title: q.title,
      number: parseInt(q.questionId, 10),
      difficulty: q.difficulty as Difficulty,
      titleSlug: q.titleSlug,
      description: q.content || undefined,
      tags: q.topicTags?.map((t: any) => t.name) || [],
    };
    console.log(`${LOG} Meta cached:`, metaCache);
    return metaCache;
  } catch (e) {
    console.warn(`${LOG} fetchMeta error:`, e);
    return null;
  }
}

async function fetchSubmissionCode(id: string): Promise<{ code: string; lang: string } | null> {
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query sd($id:Int!){submissionDetails(submissionId:$id){code lang{name verboseName}statusDisplay}}`,
        variables: { id: parseInt(id, 10) },
      }),
    });
    if (!res.ok) return null;
    const d = await res.json();
    const sd = d?.data?.submissionDetails;
    if (!sd || sd.statusDisplay !== 'Accepted') return null;
    return { code: sd.code, lang: sd.lang?.name || sd.lang?.verboseName || 'python3' };
  } catch (e) {
    console.warn(`${LOG} fetchCode error:`, e);
    return null;
  }
}

// ─── Handle Accepted ─────────────────────────────────────────────────────────

async function handleAccepted(
  submissionId: string,
  langHint?: string,
  codeHint?: string,
  runtime?: string,
  memory?: string
): Promise<void> {
  if (processedIds.has(submissionId)) {
    console.log(`${LOG} Already processed ${submissionId}`);
    return;
  }
  processedIds.add(submissionId);
  console.log(`${LOG} 🎯 Processing accepted submission: ${submissionId}`);

  // Filter out test runs (runcode_ IDs)
  if (submissionId.startsWith('runcode_') || !/^\d+$/.test(submissionId)) {
    console.log(`${LOG} Skipping non-submission ID: ${submissionId}`);
    processedIds.delete(submissionId); // Allow retries for real submissions
    return;
  }

  const slug = getSlug();
  if (!slug) { console.warn(`${LOG} No problem slug in URL`); return; }

  const meta = await fetchMeta(slug);
  if (!meta) { console.warn(`${LOG} Could not fetch metadata for: ${slug}`); return; }

  // Get code — prefer the intercepted code, fall back to GraphQL query
  let code = (codeHint && codeHint.length > 10) ? codeHint : '';
  let language = langHint || '';

  if (!code) {
    console.log(`${LOG} Fetching code via GraphQL...`);
    await new Promise(r => setTimeout(r, 2000)); // Wait for submission to be fully processed
    const sd = await fetchSubmissionCode(submissionId);
    if (sd) {
      code = sd.code;
      language = sd.lang;
    }
  }

  if (!code) {
    console.warn(`${LOG} Could not get submission code`);
    return;
  }

  language = language.toLowerCase().replace(/\s+/g, '');

  const submission: LeetCodeSubmission = {
    problemNumber: meta.number,
    problemTitle: meta.title,
    titleSlug: meta.titleSlug,
    difficulty: meta.difficulty,
    language,
    code,
    timestamp: Date.now(),
    runtime,
    memory,
    description: metaCache?.description,
  };

  console.log(`${LOG} Syncing: ${submission.problemNumber}. ${submission.problemTitle} [${submission.language}] (${code.length} chars)`);

  try {
    const resp = await chrome.runtime.sendMessage({
      type: 'SUBMISSION_ACCEPTED',
      payload: submission,
    });
    if (resp?.success) {
      if (resp.isDuplicate) {
        console.log(`${LOG} ✅ Already synced (duplicate)`);
        showToast('Already synced ✅', 'info');
      } else {
        console.log(`${LOG} 🚀 Synced to GitHub!`, resp.commitUrl);
        showToast('Synced to GitHub! 🚀', 'success');
      }
    } else {
      console.error(`${LOG} ❌ Sync failed:`, resp?.error);
      showToast(`Sync failed: ${resp?.error}`, 'error');
    }
  } catch (e) {
    console.error(`${LOG} sendMessage error:`, e);
  }
}

// ─── Listen for Messages from MAIN World (injected.js) ──────────────────────

function setupMessageListener(): void {
  window.addEventListener('message', (ev) => {
    if (ev.source !== window) return;
    if (!ev.data || ev.data.source !== 'leetsync-main') return;
    if (ev.data.type !== 'ACCEPTED') return;

    const { submissionId, lang, code, runtime, memory } = ev.data;
    console.log(`${LOG} Received from MAIN world: submission ${submissionId}`);

    // Small delay to let everything settle
    setTimeout(() => {
      handleAccepted(submissionId, lang, code, runtime, memory);
    }, 1500);
  });
  console.log(`${LOG} Message listener ready`);
}

// ─── DOM Observer (Fallback) ─────────────────────────────────────────────────

function setupDomObserver(): void {
  let debounce: ReturnType<typeof setTimeout> | null = null;

  const observer = new MutationObserver((mutations) => {
    for (const mut of mutations) {
      for (const node of mut.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        const text = node.textContent?.trim();
        if (text !== 'Accepted') continue;

        const isResult =
          node.classList.contains('text-green-s') ||
          node.closest('[data-e2e-locator="submission-result"]') ||
          node.closest('[class*="success"]') ||
          (getComputedStyle(node).color.includes('45, 181'));

        if (!isResult) continue;

        console.log(`${LOG} DOM fallback: "Accepted" detected`);
        if (debounce) clearTimeout(debounce);
        debounce = setTimeout(async () => {
          // Skip if the interceptor already caught this
          if (processedIds.size > 0) {
            console.log(`${LOG} DOM fallback: interceptor already handled it`);
            return;
          }
          await handleAccepted(`dom-${Date.now()}`);
        }, 3000);
        return;
      }
    }
  });

  const startObserving = () => {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
      console.log(`${LOG} DOM observer started`);
    } else {
      requestAnimationFrame(startObserving);
    }
  };
  startObserving();
}

// ─── Toast Notification ──────────────────────────────────────────────────────

function showToast(msg: string, type: 'success' | 'error' | 'info'): void {
  const old = document.getElementById('leetsync-toast');
  if (old) old.remove();

  const bg: Record<string, string> = {
    success: 'linear-gradient(135deg, #00b894, #00cec9)',
    error: 'linear-gradient(135deg, #e17055, #d63031)',
    info: 'linear-gradient(135deg, #0984e3, #6c5ce7)',
  };
  const el = document.createElement('div');
  el.id = 'leetsync-toast';
  el.textContent = msg;
  Object.assign(el.style, {
    position: 'fixed', bottom: '24px', right: '24px', padding: '14px 22px',
    background: bg[type], color: '#fff', borderRadius: '12px',
    fontSize: '14px', fontWeight: '600', fontFamily: "'Inter', sans-serif",
    zIndex: '2147483647', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: '0', transform: 'translateY(20px) scale(0.95)',
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0) scale(1)';
  });
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px) scale(0.95)';
    setTimeout(() => el.remove(), 400);
  }, 4000);
}

// ─── Init ────────────────────────────────────────────────────────────────────

function init(): void {
  console.log(`${LOG} Content script loaded on: ${window.location.href}`);

  // Listen for messages from the MAIN world interceptor
  setupMessageListener();

  // DOM observer as fallback
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDomObserver);
  } else {
    setupDomObserver();
  }

  // Pre-fetch problem metadata
  const slug = getSlug();
  if (slug) {
    const pf = () => fetchMeta(slug).then(m => {
      if (m) console.log(`${LOG} Ready: ${m.number}. ${m.title} (${m.difficulty})`);
    });
    if (document.readyState === 'complete') pf();
    else window.addEventListener('load', pf);
  }
}

init();
