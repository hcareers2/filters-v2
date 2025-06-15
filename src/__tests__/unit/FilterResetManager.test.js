import FilterResetManager from '../../filters/filter-reset';
import Wized from '../../__mocks__/wized';

// Mock window and document
window.__TESTING__ = true;

// Mock document methods
document.querySelectorAll = jest.fn();

// Mock console methods
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();

describe('FilterResetManager', () => {
  let manager;
  let mockWized;
  let mockResetButton;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock Wized instance
    mockWized = {
      data: {
        v: {
          test_make: [],
          test_year: '',
          test_sort: [],
        },
      },
      requests: {
        execute: jest.fn(),
      },
      on: jest.fn(),
    };

    // Mock reset button
    mockResetButton = {
      addEventListener: jest.fn(),
      getAttribute: jest.fn(),
    };

    // Setup document.querySelectorAll mock
    document.querySelectorAll.mockReturnValue([mockResetButton]);

    // Create manager instance
    manager = new FilterResetManager(mockWized);
  });

  describe('initialization', () => {
    it('should initialize with Wized instance', () => {
      expect(manager.Wized).toBe(mockWized);
    });

    it('should initialize with correct state', () => {
      expect(manager.state).toEqual({
        initialized: true,
        processingReset: false,
        mainResetButtons: [mockResetButton],
      });
    });

    it('should not initialize twice', () => {
      manager.initialize();
      expect(document.querySelectorAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('filter state detection', () => {
    it('should detect active array filters', () => {
      mockWized.data.v.test_make = ['value1', 'value2'];
      expect(manager.checkForActiveFilters()).toBe(true);
    });

    it('should detect active string filters', () => {
      mockWized.data.v.test_year = '2020';
      expect(manager.checkForActiveFilters()).toBe(true);
    });

    it('should detect active sort filters', () => {
      mockWized.data.v.test_sort = [{ orderBy: 'asc' }];
      expect(manager.checkForActiveFilters()).toBe(true);
    });

    it('should return false when no active filters', () => {
      mockWized.data.v = {
        test_make: [],
        test_year: '',
        test_sort: [],
      };
      expect(manager.checkForActiveFilters()).toBe(false);
    });
  });

  describe('reset functionality', () => {
    beforeEach(() => {
      // Mock global reset functions
      window.uncheckAllFilterCheckboxes = jest.fn();
      window.uncheckAllRadioButtons = jest.fn();
      window.resetAllSelectInputs = jest.fn();
      window.resetAllRangeSelects = jest.fn();
      window.resetAllSortInputs = jest.fn();
    });

    it('should reset all filter types', async () => {
      mockResetButton.getAttribute.mockImplementation((attr) => {
        if (attr === 'w-filter-pagination-current-variable') return 'page';
        if (attr === 'w-filter-request') return 'filterRequest';
        return null;
      });

      await manager.resetAllFilters(mockResetButton);

      expect(window.uncheckAllFilterCheckboxes).toHaveBeenCalled();
      expect(window.uncheckAllRadioButtons).toHaveBeenCalled();
      expect(window.resetAllSelectInputs).toHaveBeenCalled();
      expect(window.resetAllRangeSelects).toHaveBeenCalled();
      expect(window.resetAllSortInputs).toHaveBeenCalled();
    });

    it('should prevent multiple simultaneous resets', async () => {
      manager.state.processingReset = true;
      await manager.resetAllFilters(mockResetButton);

      expect(window.uncheckAllFilterCheckboxes).not.toHaveBeenCalled();
    });

    it('should handle missing reset functions gracefully', async () => {
      delete window.uncheckAllFilterCheckboxes;

      await manager.resetAllFilters(mockResetButton);
      expect(mockWized.requests.execute).not.toHaveBeenCalled();
    });

    it('should execute filter request after reset', async () => {
      mockResetButton.getAttribute.mockReturnValue('filterRequest');

      await manager.resetAllFilters(mockResetButton);
      expect(mockWized.requests.execute).toHaveBeenCalledWith('filterRequest');
    });
  });

  describe('event handling', () => {
    it('should set up click handler for reset button', () => {
      expect(mockResetButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should handle missing reset button', () => {
      document.querySelectorAll.mockReturnValue([]);
      const newManager = new FilterResetManager(mockWized);
      expect(newManager.state.mainResetButtons).toEqual([]);
    });

    it('should only reset when active filters exist', async () => {
      const clickHandler = mockResetButton.addEventListener.mock.calls[0][1];

      // Mock active filters
      jest.spyOn(manager, 'checkForActiveFilters').mockReturnValue(false);

      await clickHandler({ preventDefault: jest.fn() });
      expect(mockWized.requests.execute).not.toHaveBeenCalled();
    });
  });
});
