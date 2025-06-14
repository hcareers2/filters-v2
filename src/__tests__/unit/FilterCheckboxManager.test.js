import FilterCheckboxManager from '../../filters/filter-checkbox';
import { jest } from '@jest/globals';

describe('FilterCheckboxManager', () => {
  let manager;
  let mockCheckbox;
  let mockChipsManager;
  let mockGroup;
  let mockWized;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Create mock checkbox element
    mockCheckbox = {
      getAttribute: jest.fn(),
      checked: false,
      addEventListener: jest.fn(),
      closest: jest.fn(),
      dataset: {},
      querySelector: jest.fn().mockImplementation((selector) => {
        if (selector === '[w-filter-checkbox-label]') {
          return { textContent: 'Test Label' };
        }
        if (selector === '.w-checkbox-input--inputType-custom') {
          return {
            classList: {
              add: jest.fn(),
              remove: jest.fn(),
              contains: jest.fn().mockReturnValue(false),
            },
          };
        }
        return null;
      }),
    };

    // Create mock group
    mockGroup = {
      elements: [mockCheckbox],
      variableName: 'testVar',
      category: 'testCategory',
      paginationVariable: 'currentPage',
      filterRequest: 'filterRequest',
      requestName: 'dynamicRequest',
      isStatic: false,
    };

    // Create mock chips manager
    mockChipsManager = {
      create: jest.fn(),
      removeByValue: jest.fn(),
      clearAll: jest.fn(),
    };

    // Create mock Wized
    mockWized = {
      data: {
        v: {
          testVar: [],
          currentPage: 1,
        },
      },
      requests: {
        execute: jest.fn().mockResolvedValue(undefined),
      },
      on: jest.fn(),
      off: jest.fn(),
    };

    // Mock DOM methods
    document.querySelector = jest.fn().mockReturnValue(null);
    document.querySelectorAll = jest.fn().mockReturnValue([]);

    // Setup window.filterChips
    window.filterChips = mockChipsManager;
    window.filterChipsReady = true;

    // Create a new instance of the manager
    manager = new FilterCheckboxManager(mockWized);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.resetAllMocks();
    window.filterChips = undefined;
    window.filterChipsReady = undefined;
  });

  describe('initialization', () => {
    test('should initialize with Wized instance', () => {
      expect(manager).toBeDefined();
      expect(manager.Wized).toBe(mockWized);
    });

    test('should set up event listeners on initialization', () => {
      expect(mockWized.on).toHaveBeenCalledWith('requestend', expect.any(Function));
    });

    test('should initialize with correct state', () => {
      expect(manager.state.monitoredGroups).toBeDefined();
      expect(manager.state.checkboxGroups).toBeNull();
      expect(manager.state.hasChipsSupport).toBe(false);
    });

    test('should make uncheckAllFilterCheckboxes globally available', () => {
      expect(window.uncheckAllFilterCheckboxes).toBeDefined();
      expect(typeof window.uncheckAllFilterCheckboxes).toBe('function');
    });
  });

  describe('UI helpers and DOM manipulation', () => {
    test('should get checkbox label text', () => {
      const label = manager.getCheckboxLabel(mockCheckbox);
      expect(label).toBe('Test Label');
    });

    test('should handle missing checkbox label', () => {
      mockCheckbox.querySelector.mockReturnValue(null);
      const label = manager.getCheckboxLabel(mockCheckbox);
      expect(label).toBe('');
    });

    test('should update checkbox visual state to checked', () => {
      const customCheckbox = {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
        },
      };
      mockCheckbox.querySelector.mockReturnValue(customCheckbox);

      manager.updateCheckboxVisualState(mockCheckbox, true);
      expect(customCheckbox.classList.add).toHaveBeenCalledWith('w--redirected-checked');
      expect(customCheckbox.classList.remove).not.toHaveBeenCalled();
    });

    test('should update checkbox visual state to unchecked', () => {
      const customCheckbox = {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
        },
      };
      mockCheckbox.querySelector.mockReturnValue(customCheckbox);

      manager.updateCheckboxVisualState(mockCheckbox, false);
      expect(customCheckbox.classList.remove).toHaveBeenCalledWith('w--redirected-checked');
      expect(customCheckbox.classList.add).not.toHaveBeenCalled();
    });

    test('should handle missing custom checkbox element', () => {
      mockCheckbox.querySelector.mockReturnValue(null);
      expect(() => manager.updateCheckboxVisualState(mockCheckbox, true)).not.toThrow();
    });
  });

  describe('checkbox group setup', () => {
    test('should handle missing filter wrapper', () => {
      document.querySelector.mockReturnValue(null);
      const result = manager.setupFilterMonitoring();
      expect(result).toBeNull();
    });

    test('should group checkboxes by wized value', () => {
      const mockWrapper = {
        querySelectorAll: jest.fn().mockReturnValue([
          {
            getAttribute: (attr) =>
              ({
                wized: 'group1',
                'w-filter-checkbox-variable': 'var1',
                'w-filter-pagination-current-variable': 'page1',
                'w-filter-request': 'request1',
                'w-filter-checkbox-request': 'dynamicRequest1',
              })[attr],
          },
          {
            getAttribute: (attr) =>
              ({
                wized: 'group1',
                'w-filter-checkbox-variable': 'var1',
                'w-filter-pagination-current-variable': 'page1',
                'w-filter-request': 'request1',
                'w-filter-checkbox-request': null,
              })[attr],
          },
        ]),
      };
      document.querySelector.mockReturnValue(mockWrapper);

      const result = manager.setupFilterMonitoring();
      expect(result).toHaveProperty('group1');
      expect(result.group1.elements).toHaveLength(2);
      expect(result.group1.isStatic).toBe(false);
    });
  });

  describe('checkbox state handling', () => {
    beforeEach(() => {
      mockCheckbox.querySelector.mockImplementation((selector) => {
        if (selector === '[w-filter-checkbox-label]') {
          return { textContent: 'Test Label' };
        }
        if (selector === '.w-checkbox-input--inputType-custom') {
          return {
            classList: {
              add: jest.fn(),
              remove: jest.fn(),
              contains: jest.fn().mockReturnValue(false),
            },
          };
        }
        return null;
      });
    });

    test('should update Wized variable on checkbox change', async () => {
      await manager.updateWizedVariable([mockCheckbox], 'testVar', 'currentPage', 'filterRequest');
      expect(mockWized.data.v.testVar).toEqual([]);
      expect(mockWized.data.v.currentPage).toBe(1);
      expect(mockWized.requests.execute).toHaveBeenCalledWith('filterRequest');
    });

    test('should handle checkbox click', async () => {
      mockCheckbox.getAttribute.mockImplementation(
        (attr) =>
          ({
            'w-filter-checkbox-category': 'testCategory',
            'w-filter-checkbox-variable': 'testVar',
            'w-filter-pagination-current-variable': 'currentPage',
            'w-filter-request': 'filterRequest',
          })[attr]
      );

      mockCheckbox.querySelector.mockImplementation((selector) => {
        if (selector === '[w-filter-checkbox-label]') {
          return { textContent: 'Test Label' };
        }
        if (selector === '.w-checkbox-input--inputType-custom') {
          return {
            classList: {
              add: jest.fn(),
              remove: jest.fn(),
              contains: jest.fn().mockReturnValue(false),
            },
          };
        }
        if (selector === '.w-checkbox-input--inputType-custom.w--redirected-checked') {
          return true;
        }
        return null;
      });

      await manager.handleCheckboxClick(
        mockCheckbox,
        [mockCheckbox],
        'testVar',
        'currentPage',
        'filterRequest'
      );
      jest.runAllTimers();

      expect(mockWized.data.v.testVar).toEqual(['Test Label']);
      expect(mockWized.data.v.currentPage).toBe(1);
      expect(mockWized.requests.execute).toHaveBeenCalledWith('filterRequest');
    });

    test('should handle checkbox click without chips support', async () => {
      window.filterChips = undefined;
      window.filterChipsReady = false;

      mockCheckbox.getAttribute.mockImplementation((attr) => {
        switch (attr) {
          case 'w-filter-checkbox-category':
            return 'testCategory';
          case 'w-filter-checkbox-variable':
            return 'testVar';
          case 'w-filter-pagination-current-variable':
            return 'currentPage';
          case 'w-filter-request':
            return 'filterRequest';
          default:
            return null;
        }
      });

      mockCheckbox.querySelector.mockImplementation((selector) => {
        if (selector === '[w-filter-checkbox-label]') {
          return { textContent: 'Test Label' };
        }
        if (selector === '.w-checkbox-input--inputType-custom') {
          return {
            classList: {
              add: jest.fn(),
              remove: jest.fn(),
              contains: jest.fn().mockReturnValue(false),
            },
          };
        }
        if (selector === '.w-checkbox-input--inputType-custom.w--redirected-checked') {
          return true;
        }
        return null;
      });

      await manager.handleCheckboxClick(
        mockCheckbox,
        [mockCheckbox],
        'testVar',
        'currentPage',
        'filterRequest'
      );
      jest.runAllTimers();

      expect(mockWized.data.v.testVar).toEqual(['Test Label']);
      expect(mockWized.requests.execute).toHaveBeenCalledWith('filterRequest');
    });

    test('should handle errors in updateWizedVariable', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockWized.requests.execute.mockRejectedValue(new Error('Test error'));

      await manager.updateWizedVariable([mockCheckbox], 'testVar', 'currentPage', 'filterRequest');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error executing filter request:',
        expect.any(Error)
      );
    });
  });

  describe('visual state handling', () => {
    test('should handle errors in classList operations', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const customCheckbox = {
        classList: {
          add: jest.fn().mockImplementation(() => {
            throw new Error('Test error');
          }),
          remove: jest.fn().mockImplementation(() => {
            throw new Error('Test error');
          }),
        },
      };

      mockCheckbox.querySelector.mockReturnValue(customCheckbox);

      manager.updateCheckboxVisualState(mockCheckbox, true);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating checkbox visual state:',
        expect.any(Error)
      );
    });

    test('should handle missing custom checkbox element', () => {
      mockCheckbox.querySelector.mockReturnValue(null);
      expect(() => manager.updateCheckboxVisualState(mockCheckbox, true)).not.toThrow();
    });
  });

  describe('chip integration', () => {
    test('should handle chip creation with missing label', () => {
      mockCheckbox.querySelector = jest.fn().mockImplementation((selector) => {
        if (selector === '[w-filter-checkbox-label]') {
          return null;
        }
        return {
          classList: {
            add: jest.fn(),
            remove: jest.fn(),
          },
        };
      });

      manager.createCheckboxChip(mockCheckbox, 'testCategory');
      expect(window.filterChips.create).not.toHaveBeenCalled();
    });

    test('should handle chip creation with empty label', () => {
      mockCheckbox.querySelector = jest.fn().mockImplementation((selector) => {
        if (selector === '[w-filter-checkbox-label]') {
          return { textContent: '' };
        }
        return {
          classList: {
            add: jest.fn(),
            remove: jest.fn(),
          },
        };
      });

      manager.createCheckboxChip(mockCheckbox, 'testCategory');
      expect(window.filterChips.create).not.toHaveBeenCalled();
    });

    test('should handle chip creation with special characters in category', () => {
      mockCheckbox.querySelector = jest.fn().mockImplementation((selector) => {
        if (selector === '[w-filter-checkbox-label]') {
          return { textContent: 'Test Label' };
        }
        return {
          classList: {
            add: jest.fn(),
            remove: jest.fn(),
          },
        };
      });

      manager.createCheckboxChip(mockCheckbox, 'test/category@123');
      expect(window.filterChips.create).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Test/category@123: Test Label',
          category: 'test/category@123',
        })
      );
    });
  });

  describe('request handling', () => {
    beforeEach(() => {
      manager.setupFilterMonitoring = jest.fn();
    });

    test('should handle request end with dynamic request', () => {
      const mockGroups = {
        group1: { ...mockGroup, requestName: 'dynamicRequest', isStatic: false },
      };
      manager.state.checkboxGroups = mockGroups;

      manager.handleRequestEnd({ name: 'dynamicRequest' });
      expect(manager.setupFilterMonitoring).toHaveBeenCalled();
    });

    test('should handle request end with static request', () => {
      const mockGroups = {
        group1: {
          ...mockGroup,
          requestName: 'staticRequest',
          isStatic: true,
        },
      };

      manager.setupFilterMonitoring = jest.fn().mockReturnValue(mockGroups);
      manager.setupGroupEventHandlers = jest.fn();

      manager.handleRequestEnd({ name: 'staticRequest' });
      expect(manager.setupGroupEventHandlers).toHaveBeenCalledWith(mockGroups.group1);
    });

    test('should handle request end with multiple groups', () => {
      const mockGroups = {
        group1: { ...mockGroup, requestName: 'request1', isStatic: false },
        group2: { ...mockGroup, requestName: 'request2', isStatic: false },
      };
      manager.state.checkboxGroups = mockGroups;

      manager.handleRequestEnd({ name: 'request1' });
      expect(manager.setupFilterMonitoring).toHaveBeenCalled();

      jest.clearAllMocks();
      manager.handleRequestEnd({ name: 'request2' });
      expect(manager.setupFilterMonitoring).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    test('should handle errors in Wized variable updates', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockWized.requests.execute.mockRejectedValue(new Error('Test error'));

      await manager.updateWizedVariable([mockCheckbox], 'testVar', 'currentPage', 'filterRequest');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error executing filter request:',
        expect.any(Error)
      );
    });

    test('should handle errors in request execution', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockWized.requests.execute.mockRejectedValueOnce(new Error('Test error'));

      await manager.updateWizedVariable([mockCheckbox], 'testVar', 'currentPage', 'filterRequest');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error executing filter request:',
        expect.any(Error)
      );
    });
  });

  describe('chips integration', () => {
    beforeEach(() => {
      window.filterChips = mockChipsManager;
      window.filterChipsReady = true;
    });

    test('should create chip for checked checkbox', () => {
      mockCheckbox.getAttribute.mockImplementation((attr) => {
        switch (attr) {
          case 'w-filter-checkbox-variable':
            return 'testVar';
          case 'w-filter-pagination-current-variable':
            return 'currentPage';
          case 'w-filter-request':
            return 'filterRequest';
          default:
            return null;
        }
      });

      manager.createCheckboxChip(mockCheckbox, 'testCategory');
      expect(mockChipsManager.create).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Testcategory: Test Label',
          category: 'testCategory',
          value: 'Test Label',
          filterType: 'checkbox',
        })
      );
    });

    test('should handle missing chips manager', () => {
      window.filterChips = undefined;
      expect(() => manager.createCheckboxChip(mockCheckbox, 'testCategory')).not.toThrow();
      expect(mockChipsManager.create).not.toHaveBeenCalled();
    });

    test('should handle missing label', () => {
      mockCheckbox.querySelector.mockReturnValue(null);
      manager.createCheckboxChip(mockCheckbox, 'testCategory');
      expect(mockChipsManager.create).not.toHaveBeenCalled();
    });

    test('should add chip to container if addToContainer is available', () => {
      const mockChip = { id: 'test-chip' };
      mockChipsManager.create.mockReturnValue(mockChip);
      mockChipsManager.addToContainer = jest.fn();

      manager.createCheckboxChip(mockCheckbox, 'testCategory');
      expect(mockChipsManager.addToContainer).toHaveBeenCalledWith(mockChip);
    });
  });

  describe('state management', () => {
    test('should update Wized variable with checked values', async () => {
      const mockCheckedCheckbox = {
        ...mockCheckbox,
        querySelector: jest.fn().mockImplementation((selector) => {
          if (selector === '[w-filter-checkbox-label]') {
            return { textContent: 'Test Label' };
          }
          if (selector === '.w-checkbox-input--inputType-custom.w--redirected-checked') {
            return true;
          }
          return null;
        }),
      };

      await manager.updateWizedVariable(
        [mockCheckedCheckbox],
        'testVar',
        'currentPage',
        'filterRequest'
      );
      expect(mockWized.data.v.testVar).toEqual(['Test Label']);
      expect(mockWized.data.v.currentPage).toBe(1);
      expect(mockWized.requests.execute).toHaveBeenCalledWith('filterRequest');
    });

    test('should handle force empty update', async () => {
      const mockCheckedCheckbox = {
        ...mockCheckbox,
        querySelector: jest.fn().mockImplementation((selector) => {
          if (selector === '[w-filter-checkbox-label]') {
            return { textContent: 'Test Label' };
          }
          if (selector === '.w-checkbox-input--inputType-custom.w--redirected-checked') {
            return true;
          }
          return null;
        }),
      };

      await manager.updateWizedVariable(
        [mockCheckedCheckbox],
        'testVar',
        'currentPage',
        'filterRequest',
        true,
        true
      );
      expect(mockWized.data.v.testVar).toEqual([]);
      expect(mockWized.data.v.currentPage).toBe(1);
      expect(mockWized.requests.execute).toHaveBeenCalledWith('filterRequest');
    });

    test('should handle reset with checked boxes', async () => {
      const mockCheckedCheckbox = {
        ...mockCheckbox,
        querySelector: jest.fn().mockImplementation((selector) => {
          if (selector === '[w-filter-checkbox-label]') {
            return { textContent: 'Test Label' };
          }
          if (selector === '.w-checkbox-input--inputType-custom.w--redirected-checked') {
            return true;
          }
          return null;
        }),
      };

      await manager.updateWizedVariable(
        [mockCheckedCheckbox],
        'testVar',
        'currentPage',
        'filterRequest',
        true,
        true
      );
      expect(mockWized.data.v.testVar).toEqual([]);
      expect(mockWized.data.v.currentPage).toBe(1);
      expect(mockWized.requests.execute).toHaveBeenCalledWith('filterRequest');
    });
  });

  describe('event handling', () => {
    test('should handle chip removal on uncheck', async () => {
      mockCheckbox.getAttribute.mockImplementation((attr) => {
        switch (attr) {
          case 'w-filter-checkbox-category':
            return 'testCategory';
          case 'w-filter-checkbox-variable':
            return 'testVar';
          case 'w-filter-pagination-current-variable':
            return 'currentPage';
          case 'w-filter-request':
            return 'filterRequest';
          default:
            return null;
        }
      });

      mockCheckbox.querySelector.mockImplementation((selector) => {
        if (selector === '[w-filter-checkbox-label]') {
          return { textContent: 'Test Label' };
        }
        if (selector === '.w-checkbox-input--inputType-custom') {
          return {
            classList: {
              add: jest.fn(),
              remove: jest.fn(),
              contains: jest.fn().mockReturnValue(false),
            },
          };
        }
        if (selector === '.w-checkbox-input--inputType-custom.w--redirected-checked') {
          return false;
        }
        return null;
      });

      await manager.handleCheckboxClick(
        mockCheckbox,
        [mockCheckbox],
        'testVar',
        'currentPage',
        'filterRequest'
      );
      jest.runAllTimers();

      expect(mockChipsManager.removeByValue).toHaveBeenCalledWith('testCategory', 'Test Label');
    });
  });

  describe('public API', () => {
    test('should uncheck all filter checkboxes', async () => {
      const mockWrapper = {
        querySelectorAll: jest.fn().mockReturnValue([mockCheckbox, mockCheckbox]),
      };
      document.querySelector.mockReturnValue(mockWrapper);

      mockCheckbox.getAttribute.mockImplementation((attr) => {
        switch (attr) {
          case 'w-filter-checkbox-variable':
            return 'testVar';
          default:
            return null;
        }
      });

      await manager.uncheckAllFilterCheckboxes();

      expect(mockChipsManager.clearAll).toHaveBeenCalled();
      expect(mockWized.data.v.testVar).toEqual([]);
    });

    test('should handle missing filter wrapper when unchecking all', async () => {
      document.querySelector.mockReturnValue(null);
      await manager.uncheckAllFilterCheckboxes();
      expect(mockChipsManager.clearAll).not.toHaveBeenCalled();
    });

    test('should handle missing checkboxes when unchecking all', async () => {
      const mockWrapper = {
        querySelectorAll: jest.fn().mockReturnValue([]),
      };
      document.querySelector.mockReturnValue(mockWrapper);

      await manager.uncheckAllFilterCheckboxes();
      expect(mockChipsManager.clearAll).not.toHaveBeenCalled();
    });

    test('should handle chips manager errors when unchecking all', async () => {
      const mockWrapper = {
        querySelectorAll: jest.fn().mockReturnValue([mockCheckbox]),
      };
      document.querySelector.mockReturnValue(mockWrapper);

      mockChipsManager.clearAll.mockImplementation(() => {
        throw new Error('Test error');
      });

      await manager.uncheckAllFilterCheckboxes();
      expect(mockWized.data.v.testVar).toEqual([]);
    });
  });
});
