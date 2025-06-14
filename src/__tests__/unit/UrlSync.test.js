import { applyUrlParamsToWized, updateUrlFromWized, initUrlSync } from '../../utils/url-sync.js';

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
    document.body.innerHTML = '';
    const searchInput = document.createElement('input');
    searchInput.setAttribute('w-filter-search-variable', 'foo');

    const checkbox = document.createElement('label');
    checkbox.setAttribute('w-filter-checkbox-variable', 'list');

    document.body.appendChild(searchInput);
    document.body.appendChild(checkbox);

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

  test('syncInputsFromWized uses empty string for null values', () => {
    document.body.innerHTML = '';

    const searchInput = document.createElement('input');
    searchInput.setAttribute('w-filter-search-variable', 'foo');

    document.body.appendChild(searchInput);

    const Wized = { data: { v: { foo: null } } };
    applyUrlParamsToWized(Wized);

    expect(searchInput.value).toBe('');
  });

  test('updateUrlFromWized writes variables to query string', () => {
    document.body.innerHTML = '';
    const searchInput = document.createElement('input');
    searchInput.setAttribute('w-filter-search-variable', 'foo');
    const checkbox = document.createElement('label');
    checkbox.setAttribute('w-filter-checkbox-variable', 'list');
    document.body.appendChild(searchInput);
    document.body.appendChild(checkbox);

    const Wized = {
      data: { v: { foo: 'bar', empty: '', list: ['a', 'b'], extra: 'x' } },
    };
    setSearch('');
    const replaceSpy = jest
      .spyOn(window.history, 'replaceState')
      .mockImplementation((_, __, url) => {
        window.location = new URL(`https://example.com${url}`);
      });
    updateUrlFromWized(Wized);
    expect(replaceSpy).toHaveBeenCalled();
    expect(window.location.search).toBe('?foo=bar&list=a%2Cb');
    replaceSpy.mockRestore();
  });

  test('initUrlSync applies params before first execute', async () => {
    document.body.innerHTML = '';
    const input = document.createElement('input');
    input.setAttribute('w-filter-search-variable', 'foo');
    document.body.appendChild(input);
    setSearch('?foo=baz');
    const execute = jest.fn().mockResolvedValue('ok');
    const Wized = { data: { v: { foo: '' } }, requests: { execute }, on: jest.fn() };
    initUrlSync(Wized);
    expect(Wized.data.v.foo).toBe('baz');
    const result = await Wized.requests.execute('req');
    expect(result).toBe('ok');
    expect(execute).toHaveBeenCalledWith('req');
  });

  test('patched execute behaves normally with no params', async () => {
    document.body.innerHTML = '';
    setSearch('');
    const execute = jest.fn().mockResolvedValue('done');
    const Wized = { data: { v: { foo: '' } }, requests: { execute }, on: jest.fn() };
    initUrlSync(Wized);
    const result = await Wized.requests.execute('normal');
    expect(result).toBe('done');
    expect(execute).toHaveBeenCalledWith('normal');
  });
});
