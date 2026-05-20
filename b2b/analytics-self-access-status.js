(function() {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  if (!params.has('ga_status')) return;

  var optOutKey = 'ezlize_ga_opt_out';
  var disableKeys = ['ga_off', 'analytics_off', 'internal_preview', 'preview', 'no_ga', 'ga_status'];

  function readLocalStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return '__unavailable__';
    }
  }

  function asText(value) {
    return value ? 'true' : 'false';
  }

  function ensurePanel() {
    var panel = document.getElementById('analytics-self-access-status');
    if (panel) return panel;

    panel = document.createElement('pre');
    panel.id = 'analytics-self-access-status';
    panel.setAttribute('role', 'status');
    panel.setAttribute('aria-live', 'polite');
    panel.style.cssText = [
      'position:fixed',
      'z-index:2147483647',
      'top:12px',
      'left:12px',
      'max-width:min(560px, calc(100vw - 24px))',
      'max-height:calc(100vh - 24px)',
      'overflow:auto',
      'box-sizing:border-box',
      'margin:0',
      'padding:12px 14px',
      'border:2px solid #1d4ed8',
      'border-radius:10px',
      'background:#eff6ff',
      'color:#172554',
      'font:13px/1.45 ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace',
      'white-space:pre-wrap',
      'box-shadow:0 14px 34px rgba(15,23,42,.24)'
    ].join(';');
    document.body.appendChild(panel);
    return panel;
  }

  function renderStatus() {
    var optOutValue = readLocalStorage(optOutKey);
    var optOut = optOutValue === '1';
    var urlOptOut = disableKeys.some(function(key) { return params.has(key); });
    var suppressed = window.ezlizeAnalyticsSuppressed === true;
    var gtagFunction = typeof window.gtag === 'function';
    var gtagScriptPresent = !!document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    var statusOk = (optOut || urlOptOut) && suppressed && !gtagFunction && !gtagScriptPresent;

    var panel = ensurePanel();
    panel.dataset.gaOptOutStatus = statusOk ? 'OK' : 'FAILED';
    panel.dataset.b2bOptOut = asText(optOut);
    panel.dataset.b2bUrlOptOut = asText(urlOptOut);
    panel.dataset.b2bSuppressed = asText(suppressed);
    panel.dataset.b2bGtagFunction = asText(gtagFunction);
    panel.textContent = [
      'EZLIZE_GA_STATUS',
      'GA_OPT_OUT_STATUS=' + (statusOk ? 'OK' : 'FAILED'),
      'B2B_OPT_OUT=' + asText(optOut),
      'B2B_URL_OPT_OUT=' + asText(urlOptOut),
      'B2B_SUPPRESSED=' + asText(suppressed),
      'B2B_GTAG_FUNCTION=' + asText(gtagFunction),
      'B2B_GTAG_SCRIPT_PRESENT=' + asText(gtagScriptPresent),
      'LOCAL_STORAGE_' + optOutKey + '=' + optOutValue,
      'HOST=' + window.location.hostname,
      'PATH=' + window.location.pathname,
      'CHECKED_AT=' + new Date().toISOString()
    ].join('\n');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderStatus, { once: true });
  } else {
    renderStatus();
  }
})();
