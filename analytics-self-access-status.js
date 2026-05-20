(function() {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  if (!params.has('ga_status')) return;

  var measurementId = 'G-YJ1WP1J2NQ';
  var optOutKey = 'urayaha_ga_opt_out';

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
      'border:2px solid #0f766e',
      'border-radius:10px',
      'background:#f0fdfa',
      'color:#042f2e',
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
    var gaDisable = window['ga-disable-' + measurementId] === true;
    var suppressed = window.urayahaAnalyticsSuppressed === true || gaDisable;
    var gtagFunction = typeof window.gtag === 'function';
    var gtagScriptPresent = !!document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    var statusOk = optOut && suppressed && gaDisable;

    var panel = ensurePanel();
    panel.dataset.gaOptOutStatus = statusOk ? 'OK' : 'FAILED';
    panel.dataset.c2cOptOut = asText(optOut);
    panel.dataset.c2cSuppressed = asText(suppressed);
    panel.dataset.c2cGaDisable = asText(gaDisable);
    panel.textContent = [
      'URAYAHA_GA_STATUS',
      'GA_OPT_OUT_STATUS=' + (statusOk ? 'OK' : 'FAILED'),
      'C2C_OPT_OUT=' + asText(optOut),
      'C2C_SUPPRESSED=' + asText(suppressed),
      'C2C_GA_DISABLE=' + asText(gaDisable),
      'C2C_GTAG_FUNCTION=' + asText(gtagFunction),
      'C2C_GTAG_SCRIPT_PRESENT=' + asText(gtagScriptPresent),
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
