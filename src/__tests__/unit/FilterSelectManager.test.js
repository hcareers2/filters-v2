jest.mock('../../filters/filter-select');
import { FilterSelectManager } from '../../filters/filter-select';
import Wized from '../../__mocks__/wized';

describe('FilterSelectManager', () => {
  let manager;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset the DOM mocks
    jest.spyOn(document, 'querySelector').mockImplementation(() => null);
    jest.spyOn(document, 'querySelectorAll').mockImplementation(() => []);
    jest.spyOn(document, 'createElement').mockImplementation(() => ({
      options: [],
      add: jest.fn(),
      innerHTML: '',
    }));

    // Create a new instance of the manager
    manager = new FilterSelectManager(Wized);
  });

  afterEach(() => {
    jest.resetAllMocks();
    window.resetAllSelectInputs = undefined;
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
        monitoredSelects: expect.any(Set),
        initialized: true,
        processingChange: false,
        dynamicSelects: expect.any(Map),
      });
    });

    test('should make reset function globally available', () => {
      expect(window.resetAllSelectInputs).toBeDefined();
      expect(window.resetAllSelectInputs).toBe(manager.resetAllSelectInputs);
    });
  });

  // Helper method tests
  describe('helper methods', () => {
    test('should create select identifier from category and variable', () => {
      const mockSelect = {
        getAttribute: jest.fn((attr) => {
          if (attr === 'w-filter-select-category') return 'testCategory';
          if (attr === 'w-filter-select-variable') return 'testVariable';
          return null;
        }),
      };

      manager.createSelectIdentifier.mockImplementation((select) => {
        const category = select.getAttribute('w-filter-select-category') || '';
        const variable = select.getAttribute('w-filter-select-variable') || '';
        return `${category}-${variable}`;
      });

      const result = manager.createSelectIdentifier(mockSelect);
      expect(result).toBe('testCategory-testVariable');
    });

    test('should get selected value from select element', () => {
      const mockSelect = { value: 'testValue' };
      manager.getSelectedValue.mockImplementation((select) => select.value || '');

      const result = manager.getSelectedValue(mockSelect);
      expect(result).toBe('testValue');
    });
  });

  // Wized integration tests
  describe('Wized integration', () => {
    test('should update Wized variable with select value', async () => {
      const mockSelect = {
        value: 'testValue',
        getAttribute: jest.fn((attr) => {
          if (attr === 'w-filter-select-variable') return 'testVariable';
          return null;
        }),
      };

      manager.updateWizedVariable.mockImplementation(async (select, variableName) => {
        Wized.data.v[variableName] = select.value;
      });

      await manager.updateWizedVariable(
        mockSelect,
        'testVariable',
        'testPagination',
        'testRequest'
      );

      expect(Wized.data.v.testVariable).toBe('testValue');
    });
  });
});
