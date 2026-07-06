/**
 * INJECTED SCRIPT — Runs in MAIN world (LeetCode's JS context)
 * 
 * v5: Simplified — one unified handler for ALL intercepted responses.
 * Logs every relevant URL and deep-scans all responses for accepted status.
 */

(function () {
  if ((window as any).__leetSyncInjected) return;
  (window as any).__leetSyncInjected = true;

  const postedIds = new Set<string>();

  /** Recursively scan for accepted submission data in any response shape */
  function findAccepted(obj: any, depth = 0): any {
    if (!obj || typeof obj !== 'object' || depth > 6) return null;

    const status = obj.statusDisplay || obj.status_display || obj.statusMsg || obj.status_msg;
    if (
      (status === 'Accepted') ||
      (obj.status === 10) ||
      (obj.state === 'SUCCESS' && (obj.status_display === 'Accepted' || obj.status_msg === 'Accepted'))
    ) {
      const id = obj.submissionId || obj.submission_id || obj.id;
      if (id) return obj;
    }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        const r = findAccepted(item, depth + 1);
        if (r) return r;
      }
    } else {
      for (const key of Object.keys(obj)) {
        const r = findAccepted(obj[key], depth + 1);
        if (r) return r;
      }
    }
    return null;
  }

  function post(obj: any, via: string) {
    const id = String(obj.submissionId || obj.submission_id || obj.id || '');
    // Must have an ID and it must be numeric (not runcode_)
    if (!id || !/^\d+$/.test(id)) return;
    // Deduplicate
    if (postedIds.has(id)) return;
    postedIds.add(id);

    console.log(`[LeetSync:MAIN] ✅ Accepted submission ${id} via ${via}`);
    window.postMessage({
      source: 'leetsync-main',
      type: 'ACCEPTED',
      submissionId: id,
      lang: obj.lang?.name || obj.lang?.verboseName || obj.lang || '',
      code: obj.code || obj.typed_code || obj.typedCode || '',
      runtime: obj.runtimeDisplay || obj.status_runtime || obj.runtime || '',
      memory: obj.memoryDisplay || obj.status_memory || obj.memory || '',
    }, '*');
  }

  /** Check if this URL is relevant for submission detection */
  function isRelevant(url: string): boolean {
    return (
      url.includes('/check') ||
      url.includes('/submit') ||
      url.includes('/graphql') ||
      url.includes('submission')
    );
  }

  // ─── Patch fetch ───────────────────────────────────────────────────────────

  const _fetch = window.fetch;
  window.fetch = function (...args: Parameters<typeof fetch>) {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || '';

    return _fetch.apply(this, args).then((response) => {
      if (!isRelevant(url) || url.includes('runcode_')) return response;

      try {
        response.clone().json().then((data: any) => {
          // For GraphQL, scan inside data.data
          const scanTarget = (url.includes('/graphql')) ? data?.data : data;
          if (!scanTarget) return;

          // Log GraphQL response keys for debugging
          if (url.includes('/graphql') && data?.data) {
            const keys = Object.keys(data.data);
            console.log(`[LeetSync:MAIN] GraphQL keys: [${keys.join(', ')}]`);
          }

          // Log check endpoint responses for debugging
          if (url.includes('/check')) {
            const state = data?.state || data?.status;
            console.log(`[LeetSync:MAIN] Check response: state=${state}, status_display=${data?.status_display || 'N/A'}`);
          }

          const accepted = findAccepted(scanTarget);
          if (accepted) {
            post(accepted, url.substring(0, 100));
          }
        }).catch(() => {});
      } catch {
        // Never break LeetCode
      }
      return response;
    });
  };

  // ─── Patch XMLHttpRequest ──────────────────────────────────────────────────

  const _xhrOpen = XMLHttpRequest.prototype.open;
  const _xhrSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...rest: any[]) {
    (this as any).__lsUrl = String(url);
    return _xhrOpen.apply(this, [method, url, ...rest] as any);
  };

  XMLHttpRequest.prototype.send = function (...args: any[]) {
    this.addEventListener('load', function () {
      try {
        const url: string = (this as any).__lsUrl || '';
        if (!isRelevant(url) || url.includes('runcode_')) return;

        const data = JSON.parse(this.responseText);
        const scanTarget = url.includes('/graphql') ? data?.data : data;
        const accepted = findAccepted(scanTarget);
        if (accepted) {
          post(accepted, 'XHR:' + url.substring(0, 80));
        }
      } catch {
        // Silent
      }
    });
    return _xhrSend.apply(this, args as any);
  };

  console.log('[LeetSync:MAIN] Network interceptors installed ✓');
})();
