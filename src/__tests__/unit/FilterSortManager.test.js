import FilterSortManager from '../../filters/filter-sort';
import Wized from '../../__mocks__/wized';

describe('FilterSortManager', () => {
  let manager;
  let mockSelect;
  let mockWrapper;
  let mockOptionsWrapper;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    document.body.innerHTML = '';

    // Create mock sort select
    mockSelect = document.createElement('select');
    mockSelect.setAttribute('w-filter-sort-variable', 'sortVar');
    mockSelect.setAttribute('w-filter-sort-category', 'price');
    mockSelect.setAttribute('w-filter-pagination-current-variable', 'currentPage');
    mockSelect.setAttribute('w-filter-request', 'filterRequest');

    // Add placeholder option
    const placeholder = document.createElement('option');
    placeholder.text = 'Sort by...';
    placeholder.value = '';
    mockSelect.add(placeholder);

    // Create mock options wrapper
    mockOptionsWrapper = document.createElement('div');
    mockOptionsWrapper.setAttribute('w-filter-sort-category', 'price');
    mockOptionsWrapper.setAttribute('w-filter-sort-option', 'wrapper');

    // Add mock options
    const option1 = document.createElement('div');
    option1.setAttribute('w-filter-sort-option', 'option-text');
    option1.setAttribute('w-filter-sort-orderby', 'price');
    option1.setAttribute('w-filter-sort-sortby', 'asc');
    option1.textContent = 'Price: Low to High';
    mockOptionsWrapper.appendChild(option1);

    const option2 = document.createElement('div');
    option2.setAttribute('w-filter-sort-option', 'option-text');
    option2.setAttribute('w-filter-sort-orderby', 'price');
    option2.setAttribute('w-filter-sort-sortby', 'desc');
    option2.textContent = 'Price: High to Low';
    mockOptionsWrapper.appendChild(option2);

    // Create mock wrapper
    mockWrapper = document.createElement('div');
    mockWrapper.setAttribute('w-filter-wrapper', '');
    mockWrapper.appendChild(mockSelect);
    mockWrapper.appendChild(mockOptionsWrapper);
    document.body.appendChild(mockWrapper);

    // Mock document methods
    document.querySelector = jest.fn((selector) => {
      if (selector === '[w-filter-wrapper]') return mockWrapper;
      if (selector === `[w-filter-sort-category="price"][w-filter-sort-option="wrapper"]`)
        return mockOptionsWrapper;
      return null;
    });

    document.querySelectorAll = jest.fn((selector) => {
      if (selector === 'select[w-filter-sort-variable]') {
        return [mockSelect];
      }
      if (selector.includes('[w-filter-sort-option="option-text"]')) {
        return mockOptionsWrapper.querySelectorAll(selector);
      }
      return [];
    });

    // Mock window.filterChips
    window.filterChips = {
      create: jest.fn(),
      addToContainer: jest.fn(),
      clearCategory: jest.fn(),
    };
    window.filterChipsReady = true;

    // Initialize Wized mock data
    Wized.data = {
      v: {},
    };

    // Create manager instance
    manager = new FilterSortManager(Wized);
  });

  afterEach(() => {
    // Clean up
    jest.resetAllMocks();
    document.body.innerHTML = '';
    window.filterChips = undefined;
    window.filterChipsReady = undefined;
    window.resetAllSortInputs = undefined;
  });

  // Basic initialization tests
  describe('initialization', () => {
    test('should initialize with Wized instance', () => {
      expect(manager).toBeDefined();
      expect(manager.Wized).toBe(Wized);
    });

    test('should set up event listeners on initialization', () => {
      expect(Wized.on).toHaveBeenCalledWith('requestend', expect.any(Function));
    });

    test('should initialize with correct state', () => {
      expect(manager.state).toEqual({
        monitoredSorts: expect.any(Set),
        initialized: true,
        processingChange: false,
        dynamicSorts: expect.any(Map),
      });
    });

    test('should make reset function globally available', () => {
      expect(window.resetAllSortInputs).toBeDefined();
      expect(window.resetAllSortInputs).toBe(manager.resetAllSortInputs);
    });

    test('should not initialize twice', () => {
      const initialState = { ...manager.state };
      manager.initialize();
      expect(manager.state).toEqual(initialState);
    });
  });

  // Sort select setup tests
  describe('sort select setup', () => {
    test('should setup sort select with options', () => {
      manager.setupSelect(mockSelect);
      expect(mockSelect.options.length).toBe(3); // Including placeholder
      expect(mockSelect.options[0].text).toBe('Sort by...');
      expect(mockSelect.options[1].text).toBe('Price: Low to High');
      expect(mockSelect.options[2].text).toBe('Price: High to Low');
    });

    test('should not setup same sort select twice', () => {
      manager.setupSelect(mockSelect);
      const initialOptionsLength = mockSelect.options.length;
      manager.setupSelect(mockSelect);
      expect(mockSelect.options.length).toBe(initialOptionsLength);
    });

    test('should handle missing options wrapper', () => {
      document.querySelector = jest.fn().mockReturnValue(null);
      const initialOptionsLength = mockSelect.options.length;
      manager.setupSelect(mockSelect);
      expect(mockSelect.options.length).toBe(initialOptionsLength);
    });

    test('should initialize Wized variable', () => {
      manager.setupSelect(mockSelect);
      expect(Wized.data.v.sortVar).toEqual([]);
    });

    test('should handle missing category attribute', () => {
      mockSelect.removeAttribute('w-filter-sort-category');
      const initialOptionsLength = mockSelect.options.length;
      manager.setupSelect(mockSelect);
      expect(mockSelect.options.length).toBe(initialOptionsLength);
    });

    test('should handle invalid JSON in select value', async () => {
      mockSelect.value = 'invalid-json';
      await manager.updateWizedVariable(mockSelect, 'sortVar', 'currentPage', 'filterRequest');
      expect(Wized.data.v.sortVar).toEqual([{ orderBy: '', sortBy: '' }]);
    });
  });

  // Dynamic sort tests
  describe('dynamic sort functionality', () => {
    beforeEach(() => {
      mockSelect.setAttribute('w-filter-sort-request', 'dynamicRequest');
    });

    test('should setup dynamic sort monitoring', () => {
      manager.setupDynamicSort(mockSelect);
      expect(manager.state.dynamicSorts.has(mockSelect)).toBe(true);
      expect(Wized.on).toHaveBeenCalledWith('requestend', expect.any(Function));
    });

    test('should update options on dynamic request end', () => {
      manager.setupDynamicSort(mockSelect);
      const requestEndCallback = Wized.on.mock.calls[1][1];
      requestEndCallback({ id: 'dynamicRequest' });
      expect(mockSelect.options.length).toBe(3);
    });

    test('should handle missing wrapper for dynamic sort', () => {
      document.querySelector = jest.fn().mockReturnValue(null);
      manager.setupDynamicSort(mockSelect);
      expect(manager.state.dynamicSorts.has(mockSelect)).toBe(false);
    });

    test('should handle missing request name', () => {
      mockSelect.removeAttribute('w-filter-sort-request');
      manager.setupDynamicSort(mockSelect);
      expect(manager.state.dynamicSorts.has(mockSelect)).toBe(false);
    });

    test('should update Wized variable on dynamic update', () => {
      manager.setupDynamicSort(mockSelect);
      const requestEndCallback = Wized.on.mock.calls[1][1];
      mockSelect.value = JSON.stringify({ orderBy: 'price', sortBy: 'asc' });
      requestEndCallback({ id: 'dynamicRequest' });
      expect(Wized.data.v.sortVar).toEqual([{ orderBy: 'price', sortBy: 'asc' }]);
    });
  });

  // Event handling tests
  describe('event handling', () => {
    beforeEach(() => {
      manager.setupSelect(mockSelect);
      // Reset Wized data before each test
      Wized.data = { v: {} };
    });

    test('should handle sort selection change', async () => {
      mockSelect.value = JSON.stringify({ orderBy: 'price', sortBy: 'asc' });
      await mockSelect.dispatchEvent(new Event('change', { bubbles: true }));

      expect(Wized.data.v.sortVar).toEqual([
        {
          orderBy: 'price',
          sortBy: 'asc',
        },
      ]);
      expect(Wized.data.v.currentPage).toBe(1);
      expect(Wized.requests.execute).toHaveBeenCalledWith('filterRequest');
    });

    test('should create filter chip on selection', async () => {
      mockSelect.value = JSON.stringify({ orderBy: 'price', sortBy: 'asc' });
      await mockSelect.dispatchEvent(new Event('change', { bubbles: true }));

      expect(window.filterChips.create).toHaveBeenCalledWith(
        expect.objectContaining({
          label: expect.stringContaining('Price'),
          filterType: 'sort',
          category: 'price',
          value: expect.any(String),
          sourceElement: mockSelect,
          onSourceUpdate: expect.any(Function),
        })
      );
    });

    test('should clear chips on selection reset', async () => {
      mockSelect.value = '';
      await mockSelect.dispatchEvent(new Event('change', { bubbles: true }));

      expect(window.filterChips.clearCategory).toHaveBeenCalledWith('price');
      expect(Wized.data.v.sortVar).toEqual([]);
    });

    test('should handle filter request errors', async () => {
      const error = new Error('Request failed');
      Wized.requests.execute.mockRejectedValueOnce(error);

      mockSelect.value = JSON.stringify({ orderBy: 'price', sortBy: 'asc' });
      await mockSelect.dispatchEvent(new Event('change', { bubbles: true }));

      expect(Wized.data.v.sortVar).toEqual([
        {
          orderBy: 'price',
          sortBy: 'asc',
        },
      ]);
    });

    test('should prevent multiple simultaneous changes', async () => {
      manager.state.processingChange = true;
      const initialValue = Wized.data.v.sortVar;
      mockSelect.value = JSON.stringify({ orderBy: 'price', sortBy: 'asc' });
      await mockSelect.dispatchEvent(new Event('change', { bubbles: true }));
      expect(Wized.requests.execute).not.toHaveBeenCalled();
      expect(Wized.data.v.sortVar).toBe(initialValue);
    });

    test('should handle missing filterChips', async () => {
      window.filterChips = undefined;
      mockSelect.value = JSON.stringify({ orderBy: 'price', sortBy: 'asc' });
      await mockSelect.dispatchEvent(new Event('change', { bubbles: true }));
      expect(Wized.data.v.sortVar).toEqual([
        {
          orderBy: 'price',
          sortBy: 'asc',
        },
      ]);
    });

    test('should handle missing filterChipsReady', async () => {
      window.filterChipsReady = false;
      mockSelect.value = JSON.stringify({ orderBy: 'price', sortBy: 'asc' });
      await mockSelect.dispatchEvent(new Event('change', { bubbles: true }));
      expect(Wized.data.v.sortVar).toEqual([
        {
          orderBy: 'price',
          sortBy: 'asc',
        },
      ]);
    });
  });

  // Reset functionality tests
  describe('reset functionality', () => {
    beforeEach(() => {
      manager.setupSelect(mockSelect);
    });

    test('should reset all sort inputs', async () => {
      // Set initial sort value
      mockSelect.value = JSON.stringify({ orderBy: 'price', sortBy: 'asc' });
      Wized.data.v.sortVar = [{ orderBy: 'price', sortBy: 'asc' }];

      // Reset
      await manager.resetAllSortInputs();

      expect(mockSelect.selectedIndex).toBe(0);
      expect(Wized.data.v.sortVar).toEqual([]);
      expect(window.filterChips.clearCategory).toHaveBeenCalledWith('price');
    });

    test('should handle missing sort selects during reset', async () => {
      document.querySelector = jest.fn().mockReturnValue(null);
      await manager.resetAllSortInputs();
      expect(mockSelect.selectedIndex).toBe(0);
    });

    test('should handle missing filter wrapper during reset', async () => {
      document.querySelector = jest.fn((selector) => {
        if (selector === '[w-filter-wrapper]') return null;
        return mockSelect;
      });
      await manager.resetAllSortInputs();
      expect(mockSelect.selectedIndex).toBe(0);
    });
  });
});
