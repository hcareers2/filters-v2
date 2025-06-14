import FilterPaginationManager from '../../filters/filter-pagination';
import Wized from '../../__mocks__/wized';

describe('FilterPaginationManager', () => {
  let manager;
  let mockWrapper;
  let mockTrigger;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock DOM elements
    mockTrigger = {
      getAttribute: jest.fn((attr) => {
        const attrs = {
          'w-filter-request': 'testRequest',
          'w-filter-result-data-path': 'data.items',
          'w-filter-result-variable': 'resultVar',
          'w-filter-pagination-next-variable': 'nextVar',
          'w-filter-pagination-current-variable': 'currentVar',
          'w-filter-pagination-request': 'initialRequest',
        };
        return attrs[attr] || null;
      }),
    };

    mockWrapper = {
      querySelector: jest.fn(() => mockWrapper),
      querySelectorAll: jest.fn(() => [mockTrigger]),
    };

    // Mock document methods
    document.querySelector = jest.fn(() => mockWrapper);

    // Initialize Wized mock data structure
    Wized.data = {
      v: {},
      r: {
        initialRequest: { hasRequested: false },
        testRequest: { hasRequested: false },
      },
    };

    // Create a new instance of the manager
    manager = new FilterPaginationManager(Wized);
  });

  afterEach(() => {
    jest.resetAllMocks();
    // Reset Wized data
    Wized.data = {
      v: {},
      r: {},
    };
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
        monitoredTriggers: expect.any(Set),
        initialized: true,
        processingRequest: false,
      });
    });
  });

  // Filter monitoring tests
  describe('filter monitoring', () => {
    test('should setup filter monitoring when wrapper exists', () => {
      manager.setupFilterMonitoring();
      expect(document.querySelector).toHaveBeenCalledWith('[w-filter-wrapper]');
      expect(mockWrapper.querySelectorAll).toHaveBeenCalledWith('[w-filter-pagination-trigger]');
    });

    test('should not setup monitoring when wrapper does not exist', () => {
      // Reset manager to avoid initialization effects
      jest.clearAllMocks();
      document.querySelector.mockReturnValue(null);

      // Create new instance with cleared mocks
      manager = new FilterPaginationManager(Wized);
      manager.setupFilterMonitoring();

      expect(mockWrapper.querySelectorAll).not.toHaveBeenCalled();
    });

    test('should not setup monitoring when no triggers exist', () => {
      // Reset manager to avoid initialization effects
      jest.clearAllMocks();
      mockWrapper.querySelectorAll.mockReturnValue([]);

      // Create new instance with cleared mocks
      manager = new FilterPaginationManager(Wized);
      manager.setupFilterMonitoring();

      expect(mockTrigger.getAttribute).not.toHaveBeenCalled();
    });
  });

  // Trigger setup tests
  describe('trigger setup', () => {
    test('should setup trigger with correct configuration', async () => {
      await manager.setupTrigger(mockTrigger);
      expect(manager.state.monitoredTriggers.has('testRequest')).toBeTruthy();
    });

    test('should not setup same trigger twice', async () => {
      // Setup trigger first time
      await manager.setupTrigger(mockTrigger);

      // Get the initial size of monitored triggers
      const initialSize = manager.state.monitoredTriggers.size;

      // Try to setup the same trigger again
      await manager.setupTrigger(mockTrigger);

      // The size should not have changed
      expect(manager.state.monitoredTriggers.size).toBe(initialSize);
    });
  });

  // Pagination handling tests
  describe('pagination handling', () => {
    test('should handle pagination trigger correctly', async () => {
      const config = {
        paginationRequestName: 'testRequest',
        resultDataPath: 'data.items',
        resultVariableName: 'resultVar',
        nextVariableName: 'nextVar',
        currentVariableName: 'currentVar',
      };

      // Mock next page value exists and data structure
      Wized.data = {
        v: {
          nextVar: 2,
          currentVar: 1,
        },
        r: {
          testRequest: { hasRequested: true },
        },
        data: {
          items: [{ id: 4 }, { id: 5 }, { id: 6 }],
        },
      };

      await manager.handlePaginationTrigger(config);
      expect(Wized.data.v.currentVar).toBe(2);
      expect(Wized.requests.execute).toHaveBeenCalledWith('testRequest');
    });

    test('should not paginate when no next page exists', async () => {
      const config = {
        paginationRequestName: 'testRequest',
        nextVariableName: 'nextVar',
      };

      // Mock no next page
      Wized.data = {
        v: {
          nextVar: null,
        },
        r: {
          testRequest: { hasRequested: false },
        },
      };

      await manager.handlePaginationTrigger(config);
      expect(Wized.requests.execute).not.toHaveBeenCalled();
    });
  });

  // Data handling tests
  describe('data handling', () => {
    test('should merge results correctly', () => {
      const currentData = [1, 2, 3];
      const newData = [4, 5, 6];
      Wized.data.v = { resultVar: currentData };

      manager.mergeResults('resultVar', newData);
      expect(Wized.data.v.resultVar).toEqual([1, 2, 3, 4, 5, 6]);
    });

    test('should handle empty initial results', () => {
      const newData = [1, 2, 3];
      Wized.data.v = {};

      manager.mergeResults('resultVar', newData);
      expect(Wized.data.v.resultVar).toEqual([1, 2, 3]);
    });

    test('should get data from nested path correctly', () => {
      Wized.data = {
        items: {
          nested: {
            data: [1, 2, 3],
          },
        },
      };

      const result = manager.getDataFromPath('items.nested.data');
      expect(result).toEqual([1, 2, 3]);
    });
  });
});
