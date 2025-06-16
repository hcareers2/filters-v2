function getFilterVariableNames() {
  if (typeof document === 'undefined') return new Set();

  const selectors = [
    '[w-filter-search-variable]',
    '[w-filter-select-variable]',
    '[w-filter-select-range-from-variable]',
    '[w-filter-select-range-to-variable]',
    '[w-filter-checkbox-variable]',
    '[w-filter-radio-variable]',
    '[w-filter-sort-variable]',
  ];

  const elements = document.querySelectorAll(selectors.join(','));
  const names = new Set();

  elements.forEach((el) => {
    const attrs = [
      'w-filter-search-variable',
      'w-filter-select-variable',
      'w-filter-select-range-from-variable',
      'w-filter-select-range-to-variable',
      'w-filter-checkbox-variable',
      'w-filter-radio-variable',
      'w-filter-sort-variable',
    ];

    attrs.forEach((attr) => {
      if (el.hasAttribute(attr)) {
        names.add(el.getAttribute(attr));
      }
    });
  });

  return names;
}

export function syncInputsFromWized(Wized) {
  if (typeof window === 'undefined') return;

  Object.entries(Wized.data.v).forEach(([key, value]) => {
    const normalized = value == null ? '' : value;
    const arrValue = Array.isArray(normalized) ? normalized : [normalized];

    // Search inputs
    document.querySelectorAll(`input[w-filter-search-variable="${key}"]`).forEach((input) => {
      input.value = Array.isArray(normalized) ? normalized.join(',') : `${normalized}`;
    });

    // Simple selects
    document.querySelectorAll(`select[w-filter-select-variable="${key}"]`).forEach((select) => {
      select.value = `${normalized}`;
    });

    // Range selects
    const [fromVal, toVal] = Array.isArray(normalized) ? normalized : `${normalized}`.split(',');

    document
      .querySelectorAll(`select[w-filter-select-range-from-variable="${key}"]`)
      .forEach((select) => {
        if (fromVal) select.value = fromVal;
      });

    document
      .querySelectorAll(`select[w-filter-select-range-to-variable="${key}"]`)
      .forEach((select) => {
        if (toVal) select.value = toVal;
      });

    // Checkboxes
    document.querySelectorAll(`label[w-filter-checkbox-variable="${key}"]`).forEach((label) => {
      const text = label.querySelector('[w-filter-checkbox-label]')?.textContent || '';
      const custom = label.querySelector('.w-checkbox-input--inputType-custom');
      const input = label.querySelector('input[type="checkbox"]');
      const isChecked = arrValue.includes(text);

      if (custom) {
        if (isChecked) {
          custom.classList.add('w--redirected-checked');
        } else {
          custom.classList.remove('w--redirected-checked');
        }
      }

      if (input) {
        input.checked = isChecked;
      }
    });

    // Radios
    document.querySelectorAll(`label[w-filter-radio-variable="${key}"]`).forEach((label) => {
      const text = label.querySelector('[w-filter-radio-label]')?.textContent || '';
      const custom = label.querySelector('.w-form-formradioinput--inputType-custom');
      const input = label.querySelector('input[type="radio"]');
      const isChecked = normalized === text;

      if (custom) {
        if (isChecked) {
          custom.classList.add('w--redirected-checked');
        } else {
          custom.classList.remove('w--redirected-checked');
        }
      }

      if (input) {
        input.checked = isChecked;
      }
    });
  });
}

export function applyUrlParamsToWized(Wized) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const filterVars = getFilterVariableNames();
  params.forEach((value, key) => {
    if (!filterVars.has(key)) return;
    const current = Wized.data.v[key];
    if (Array.isArray(current)) {
      Wized.data.v[key] = value ? value.split(',') : [];
    } else if (typeof current === 'number') {
      const num = Number(value);
      Wized.data.v[key] = Number.isNaN(num) ? current : num;
    } else {
      Wized.data.v[key] = value;
    }
  });

  syncInputsFromWized(Wized);
}

export function updateUrlFromWized(Wized) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams();
  const filterVars = getFilterVariableNames();
  Object.entries(Wized.data.v).forEach(([key, value]) => {
    if (!filterVars.has(key)) return;
    if (value === null || typeof value === 'undefined') return;
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(','));
    } else if (typeof value === 'number') {
      if (value !== 0) params.set(key, value.toString());
    } else if (value !== '') {
      params.set(key, value);
    }
  });
  const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
  window.history.replaceState({}, '', newUrl);
}

export async function executePendingRequests(Wized, { requestName, retries = 5, delay = 50 } = {}) {
  if (!Wized.requests || typeof Wized.requests.execute !== 'function') return;

  let attempts = 0;
  while (attempts <= retries) {
    const requests = Wized?.data?.r || {};

    if (requestName) {
      const info = requests[requestName];
      if (!info) {
        attempts += 1;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (!info.hasRequested) {
        try {
          await Wized.requests.execute(requestName);
        } catch (err) {
          console.error('Failed to execute request', requestName, err);
        }
      }
      break;
    }

    const entries = Object.entries(requests);
    if (entries.length === 0) {
      attempts += 1;
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }

    for (const [name, info] of entries) {
      if (!info || !info.hasRequested) {
        try {
          await Wized.requests.execute(name);
        } catch (err) {
          console.error('Failed to execute request', name, err);
        }
      }
    }
    break;
  }
}

export function initUrlSync(Wized) {
  let paramsApplied = false;

  const applyOnce = async () => {
    if (!paramsApplied) {
      paramsApplied = true;
      applyUrlParamsToWized(Wized);
      if (typeof document !== 'undefined') {
        const wrapper = document.querySelector('[w-filter-wrapper]');
        const requestName = wrapper?.getAttribute('w-filter-request') || undefined;
        await executePendingRequests(Wized, { requestName });
      } else {
        await executePendingRequests(Wized);
      }
    }
  };

  const domReady = new Promise((resolve) => {
    if (typeof document === 'undefined' || document.readyState !== 'loading') {
      resolve();
    } else {
      document.addEventListener('DOMContentLoaded', resolve, { once: true });
    }
  });

  // Patch execute to ensure params are applied before the first request runs
  if (Wized.requests && typeof Wized.requests.execute === 'function') {
    const originalExecute = Wized.requests.execute.bind(Wized.requests);
    Wized.requests.execute = async (...args) => {
      await domReady;
      await applyOnce();
      return originalExecute(...args);
    };
  }

  // Apply params once DOM is ready
  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        applyOnce();
      },
      { once: true }
    );
  } else {
    applyOnce();
  }

  // Ensure params override persisted state after all resources load
  if (typeof window !== 'undefined') {
    window.addEventListener(
      'load',
      () => {
        applyOnce();
      },
      { once: true }
    );
  }

  Wized.on('requestend', () => updateUrlFromWized(Wized));
}
