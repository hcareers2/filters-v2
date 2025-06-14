import Wized from '../../__mocks__/wized';
import FilterSearchManager from '../../filters/filter-search';

describe('FilterSearchManager', () => {
  let manager;
  let mockInput;
  let mockWrapper;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    document.body.innerHTML = '';

    // Set up Wized mock
    window.Wized = Wized;

    // Create mock search input
    mockInput = document.createElement('input');
    mockInput.setAttribute('w-filter-search-variable', 'searchVar');
    mockInput.setAttribute('w-filter-pagination-current-variable', 'currentPage');
    mockInput.setAttribute('w-filter-request', 'filterRequest');

    // Create mock wrapper
    mockWrapper = document.createElement('div');
    mockWrapper.setAttribute('w-filter-wrapper', '');
    mockWrapper.appendChild(mockInput);
    document.body.appendChild(mockWrapper);

    // Mock document methods
    document.querySelector = jest.fn((selector) => {
      if (selector === '[w-filter-wrapper]') return mockWrapper;
      return null;
    });

    document.querySelectorAll = jest.fn((selector) => {
      if (selector === 'input[w-filter-search-variable]') {
        return [mockInput];
      }
      return [];
    });

    // Initialize Wized mock data
    Wized.data = {
      v: {},
    };

    // Create manager instance
    manager = new FilterSearchManager(Wized);
  });

  afterEach(() => {
    // Clean up
    jest.resetAllMocks();
    document.body.innerHTML = '';
    window.resetAllSearchInputs = undefined;
    jest.useRealTimers();
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
        monitoredSearches: expect.any(Set),
        debounceTimers: expect.any(Map),
        initialized: true,
      });
    });

    test('should make reset function globally available', () => {
      expect(window.resetAllSearchInputs).toBeDefined();
      expect(window.resetAllSearchInputs).toBe(manager.resetAllSearchInputs);
    });

    test('should not initialize twice', () => {
      const initialState = { ...manager.state };
      manager.initialize();
      expect(manager.state).toEqual(initialState);
    });
  });

  // Search input setup tests
  describe('search input setup', () => {
    test('should setup search input with event listener', () => {
      const addEventListenerSpy = jest.spyOn(mockInput, 'addEventListener');
      manager.setupSearch(mockInput);
      expect(addEventListenerSpy).toHaveBeenCalledWith('input', expect.any(Function));
    });

    test('should not setup same search input twice', () => {
      manager.setupSearch(mockInput);
      const initialSetSize = manager.state.monitoredSearches.size;
      manager.setupSearch(mockInput);
      expect(manager.state.monitoredSearches.size).toBe(initialSetSize);
    });

    test('should initialize Wized variable', () => {
      manager.setupSearch(mockInput);
      expect(Wized.data.v.searchVar).toBe('');
    });

    test('should handle missing variable attribute', () => {
      mockInput.removeAttribute('w-filter-search-variable');
      manager.setupSearch(mockInput);
      expect(manager.state.monitoredSearches.size).toBe(0);
    });
  });

  // Debounce functionality tests
  describe('debounce functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    test('should debounce search updates', () => {
      const callback = jest.fn();
      manager.debounceSearch(mockInput, callback);

      expect(callback).not.toHaveBeenCalled();
      jest.advanceTimersByTime(manager.config.debounceDelay);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should clear previous timer on new input', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      manager.debounceSearch(mockInput, callback1);
      jest.advanceTimersByTime(200); // Less than debounce delay
      manager.debounceSearch(mockInput, callback2);
      jest.advanceTimersByTime(manager.config.debounceDelay);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  // Wized variable update tests
  describe('Wized variable updates', () => {
    test('should update Wized variable with search value', async () => {
      mockInput.value = 'test search';
      await manager.updateWizedVariable(mockInput, 'searchVar', 'currentPage', 'filterRequest');
      expect(Wized.data.v.searchVar).toBe('test search');
    });

    test('should reset pagination when updating search', async () => {
      mockInput.value = 'test search';
      await manager.updateWizedVariable(mockInput, 'searchVar', 'currentPage', 'filterRequest');
      expect(Wized.data.v.currentPage).toBe(1);
    });

    test('should execute filter request', async () => {
      mockInput.value = 'test search';
      await manager.updateWizedVariable(mockInput, 'searchVar', 'currentPage', 'filterRequest');
      expect(Wized.requests.execute).toHaveBeenCalledWith('filterRequest');
    });

    test('should handle empty search value', async () => {
      mockInput.value = '';
      await manager.updateWizedVariable(mockInput, 'searchVar', 'currentPage', 'filterRequest');
      expect(Wized.data.v.searchVar).toBe('');
    });

    test('should skip request execution when specified', async () => {
      mockInput.value = 'test search';
      await manager.updateWizedVariable(
        mockInput,
        'searchVar',
        'currentPage',
        'filterRequest',
        false,
        true
      );
      expect(Wized.requests.execute).not.toHaveBeenCalled();
    });
  });

  // Reset functionality tests
  describe('reset functionality', () => {
    test('should reset all search inputs', async () => {
      mockInput.value = 'test search';
      await manager.resetAllSearchInputs();
      expect(mockInput.value).toBe('');
      expect(Wized.data.v.searchVar).toBe('');
    });

    test('should handle no search inputs', async () => {
      document.querySelectorAll.mockReturnValue([]);
      await manager.resetAllSearchInputs();
      expect(Wized.requests.execute).not.toHaveBeenCalled();
    });

    test('should dispatch input event on reset', async () => {
      const dispatchEventSpy = jest.spyOn(mockInput, 'dispatchEvent');
      await manager.resetAllSearchInputs();
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    });
  });

  // Event handling tests
  describe('event handling', () => {
    test('should setup filter monitoring on request end', () => {
      const setupFilterMonitoringSpy = jest.spyOn(manager, 'setupFilterMonitoring');
      manager.handleRequestEnd();
      expect(setupFilterMonitoringSpy).toHaveBeenCalled();
    });

    test('should handle input events with debouncing', () => {
      jest.useFakeTimers();
      manager.setupSearch(mockInput);

      mockInput.value = 'test';
      mockInput.dispatchEvent(new Event('input'));

      jest.advanceTimersByTime(manager.config.debounceDelay);
      expect(Wized.data.v.searchVar).toBe('test');
    });
  });
});
