export function syncInputsFromWized(Wized) {
  if (typeof window === 'undefined') return;

  Object.entries(Wized.data.v).forEach(([key, value]) => {
    const arrValue = Array.isArray(value) ? value : [value];

    // Search inputs
    document
      .querySelectorAll(`input[w-filter-search-variable="${key}"]`)
      .forEach((input) => {
        input.value = Array.isArray(value) ? value.join(',') : `${value}`;
      });

    // Simple selects
    document
      .querySelectorAll(`select[w-filter-select-variable="${key}"]`)
      .forEach((select) => {
        select.value = `${value}`;
      });

    // Range selects
    const [fromVal, toVal] = Array.isArray(value)
      ? value
      : `${value}`.split(',');

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
    document
      .querySelectorAll(`label[w-filter-checkbox-variable="${key}"]`)
      .forEach((label) => {
        const text = label.querySelector('[w-filter-checkbox-label]')?.textContent || '';
        const custom = label.querySelector('.w-checkbox-input--inputType-custom');
        if (custom) {
          if (arrValue.includes(text)) {
            custom.classList.add('w--redirected-checked');
          } else {
            custom.classList.remove('w--redirected-checked');
          }
        }
      });

    // Radios
    document
      .querySelectorAll(`label[w-filter-radio-variable="${key}"]`)
      .forEach((label) => {
        const text = label.querySelector('[w-filter-radio-label]')?.textContent || '';
        const custom = label.querySelector('.w-form-formradioinput--inputType-custom');
        if (custom) {
          if (value === text) {
            custom.classList.add('w--redirected-checked');
          } else {
            custom.classList.remove('w--redirected-checked');
          }
        }
      });
  });
}

export function applyUrlParamsToWized(Wized) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  params.forEach((value, key) => {
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
  Object.entries(Wized.data.v).forEach(([key, value]) => {
    if (value === null || typeof value === 'undefined') return;
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(','));
    } else if (typeof value === 'number') {
      if (value !== 0) params.set(key, value.toString());
    } else if (value !== '') {
      params.set(key, value);
    }
  });
  const newUrl =
    window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
  window.history.replaceState({}, '', newUrl);
}

export function initUrlSync(Wized) {
  applyUrlParamsToWized(Wized);
  Wized.on('requestend', () => updateUrlFromWized(Wized));
}
