/* global describe, beforeEach, afterEach, test, expect */
import {
  applyUrlParamsToWized,
  updateUrlFromWized,
  syncInputsFromWized,
} from '../../utils/url-sync.js';

// Helper to mock window.location
function setSearch(search) {
  delete window.location;
  window.location = new URL(`https://example.com/${search}`);
}

describe('URL Sync Utilities', () => {
  let originalLocation;
  beforeEach(() => {
    originalLocation = window.location;
    setSearch('');
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  test('applyUrlParamsToWized sets variables from query string', () => {
    setSearch('?foo=bar&list=a,b');
    const Wized = { data: { v: { foo: '', list: [] } } };
    applyUrlParamsToWized(Wized);
    expect(Wized.data.v.foo).toBe('bar');
    expect(Wized.data.v.list).toEqual(['a', 'b']);
  });

  test('applyUrlParamsToWized populates inputs with values', () => {
    document.body.innerHTML = '';

    const searchInput = document.createElement('input');
    searchInput.setAttribute('w-filter-search-variable', 'foo');

    const labelA = document.createElement('label');
    labelA.setAttribute('w-filter-checkbox-variable', 'list');
    const customA = document.createElement('div');
    customA.classList.add('w-checkbox-input--inputType-custom');
    const textA = document.createElement('span');
    textA.setAttribute('w-filter-checkbox-label', '');
    textA.textContent = 'a';
    labelA.appendChild(customA);
    labelA.appendChild(textA);

    const labelB = document.createElement('label');
    labelB.setAttribute('w-filter-checkbox-variable', 'list');
    const customB = document.createElement('div');
    customB.classList.add('w-checkbox-input--inputType-custom');
    const textB = document.createElement('span');
    textB.setAttribute('w-filter-checkbox-label', '');
    textB.textContent = 'b';
    labelB.appendChild(customB);
    labelB.appendChild(textB);

    document.body.appendChild(searchInput);
    document.body.appendChild(labelA);
    document.body.appendChild(labelB);

    setSearch('?foo=bar&list=a,b');
    const Wized = { data: { v: { foo: '', list: [] } } };
    applyUrlParamsToWized(Wized);

    expect(searchInput.value).toBe('bar');
    expect(customA.classList.contains('w--redirected-checked')).toBe(true);
    expect(customB.classList.contains('w--redirected-checked')).toBe(true);
  });

  test('updateUrlFromWized writes variables to query string', () => {
    const Wized = { data: { v: { foo: 'bar', empty: '', list: ['a', 'b'] } } };
    setSearch('');
    const replaceSpy = jest.spyOn(window.history, 'replaceState').mockImplementation((_, __, url) => {
      window.location = new URL(`https://example.com${url}`);
    });
    updateUrlFromWized(Wized);
    expect(replaceSpy).toHaveBeenCalled();
    expect(window.location.search).toBe('?foo=bar&list=a%2Cb');
    replaceSpy.mockRestore();
  });
});
