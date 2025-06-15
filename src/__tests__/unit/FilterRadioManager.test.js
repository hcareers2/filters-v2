import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import FilterRadioManager from '../../filters/filter-radio';

import Wized from '../../__mocks__/wized';

describe('FilterRadioManager', () => {
  let manager;
  let mockRadio;
  let mockChipsManager;
  let mockWized;
  let filterWrapper;

  beforeEach(() => {
    // Setup DOM mocks
    filterWrapper = {
      querySelectorAll: jest.fn().mockReturnValue([]),
      querySelector: jest.fn(),
    };

    mockRadio = {
      getAttribute: jest.fn((attr) => {
        switch (attr) {
          case 'wized':
            return 'testWized';
          case 'w-filter-radio-variable':
            return 'testVar';
          case 'w-filter-radio-category':
            return 'testCategory';
          default:
            return null;
        }
      }),
      querySelector: jest.fn().mockImplementation((selector) => {
        if (selector === 'input[type="radio"]') {
          return { checked: false, addEventListener: jest.fn() };
        }
        return null;
      }),
      addEventListener: jest.fn(),
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
      },
    };

    // Setup Wized mock
    mockWized = {
      data: {
        v: {},
      },
      requests: {
        execute: jest.fn(),
      },
      on: jest.fn(),
      off: jest.fn(),
    };

    // Setup chips manager mock
    mockChipsManager = {
      create: jest.fn(),
      clear: jest.fn(),
      clearCategory: jest.fn(),
    };

    // Setup global objects
    window.filterChips = mockChipsManager;
    window.filterChipsReady = true;

    document.querySelector = jest.fn().mockReturnValue(filterWrapper);
    document.querySelectorAll = jest.fn().mockReturnValue([mockRadio]);

    // Initialize manager with chips support
    manager = new FilterRadioManager(mockWized);
    manager.state = {
      monitoredGroups: new Set(),
      radioGroups: {},
      hasChipsSupport: true,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    window.filterChips = undefined;
    window.filterChipsReady = false;
  });

  describe('initialization', () => {
    test('should initialize with correct state', () => {
      expect(manager.state.monitoredGroups).toBeDefined();
      expect(manager.state.radioGroups).toEqual({});
      expect(manager.state.hasChipsSupport).toBe(true);
    });
  });

  describe('radio group setup', () => {
    test('should setup radio group with event handlers', () => {
      const mockGroup = {
        elements: [mockRadio],
        wizedName: 'testWized',
        variableName: 'testVar',
        category: 'testCategory',
      };

      manager.setupGroupEventHandlers(mockGroup);
      expect(mockRadio.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    test('should not setup same radio group twice', () => {
      const mockGroup = {
        elements: [mockRadio],
        wizedName: 'testWized',
        variableName: 'testVar',
        category: 'testCategory',
      };

      // Clear any previous calls
      mockRadio.addEventListener.mockClear();
      manager.state.monitoredGroups = new Set(['testWized-testVar']);
      manager.setupGroupEventHandlers(mockGroup);
      expect(mockRadio.addEventListener).not.toHaveBeenCalled();
    });

    test('should trigger handler when input is changed', async () => {
      const inputEl = { addEventListener: jest.fn(), checked: false };

      mockRadio.querySelector.mockImplementation((selector) => {
        if (selector === 'input[type="radio"]') return inputEl;
        if (selector === '[w-filter-radio-label]') return { textContent: 'Test Label' };
        if (selector === '.w-form-formradioinput--inputType-custom') {
          return {
            classList: {
              add: jest.fn(),
              remove: jest.fn(),
              contains: jest.fn().mockReturnValue(false),
            },
          };
        }
        if (selector === '.w-form-formradioinput--inputType-custom.w--redirected-checked') {
          return null;
        }
        return null;
      });

      mockRadio.getAttribute.mockImplementation((attr) => {
        switch (attr) {
          case 'w-filter-radio-category':
            return 'testCategory';
          case 'w-filter-radio-variable':
            return 'testVar';
          case 'w-filter-pagination-current-variable':
            return 'currentPage';
          case 'w-filter-request':
            return 'filterRequest';
          default:
            return null;
        }
      });

      document.querySelector = jest.fn().mockImplementation(() => null);

      const group = {
        elements: [mockRadio],
        wizedName: 'testWized',
        variableName: 'testVar',
        paginationVariable: 'currentPage',
        filterRequest: 'filterRequest',
        isStatic: true,
      };

      manager.setupGroupEventHandlers(group);

      expect(inputEl.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

      const handler = inputEl.addEventListener.mock.calls[0][1];
      handler({ preventDefault: jest.fn() });
      await Promise.resolve();
      await Promise.resolve();

      expect(mockWized.requests.execute).toHaveBeenCalledWith('filterRequest');
    });
  });

  describe('visual state handling', () => {
    test('should update visual state correctly', () => {
      const mockCustomRadio = { classList: { add: jest.fn(), remove: jest.fn() } };
      const inputEl = { checked: false };
      mockRadio.querySelector.mockImplementation((selector) => {
        if (selector === '.w-form-formradioinput--inputType-custom') return mockCustomRadio;
        if (selector === 'input[type="radio"]') return inputEl;
        return null;
      });

      manager.updateRadioVisualState(mockRadio, true);
      expect(mockCustomRadio.classList.add).toHaveBeenCalledWith('w--redirected-checked');
      expect(inputEl.checked).toBe(true);
    });

    test('should handle errors in classList operations', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockCustomRadio = {
        classList: {
          add: jest.fn().mockImplementation(() => {
            throw new Error('Test error');
          }),
          remove: jest.fn().mockImplementation(() => {
            throw new Error('Test error');
          }),
        },
      };
      const inputEl = { checked: false };
      mockRadio.querySelector.mockImplementation((selector) => {
        if (selector === '.w-form-formradioinput--inputType-custom') return mockCustomRadio;
        if (selector === 'input[type="radio"]') return inputEl;
        return null;
      });

      manager.updateRadioVisualState(mockRadio, true);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating radio visual state:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });

    test('should handle missing custom radio element', () => {
      mockRadio.querySelector.mockReturnValue(null);
      expect(() => manager.updateRadioVisualState(mockRadio, true)).not.toThrow();
    });
  });

  describe('request handling', () => {
    let mockGroup;

    beforeEach(() => {
      filterWrapper.querySelectorAll.mockReturnValue([mockRadio]);
      mockGroup = {
        elements: [mockRadio],
        wizedName: 'testWized',
        variableName: 'testVar',
        category: 'testCategory',
        paginationVariable: 'currentPage',
        filterRequest: 'filterRequest',
      };
    });

    test('should handle request end with dynamic request', () => {
      const setupSpy = jest.spyOn(manager, 'setupFilterMonitoring');
      manager.handleRequestEnd({ name: 'dynamicRequest' });
      expect(setupSpy).toHaveBeenCalled();
      setupSpy.mockRestore();
    });

    test('should handle request end with static request', () => {
      const mockGroups = {
        'testWized-testVar': {
          ...mockGroup,
          requestName: 'staticRequest',
          isStatic: true,
        },
      };

      manager.setupFilterMonitoring = jest.fn().mockReturnValue(mockGroups);
      manager.setupGroupEventHandlers = jest.fn();

      manager.handleRequestEnd({ name: 'staticRequest' });
      expect(manager.setupGroupEventHandlers).toHaveBeenCalledWith(mockGroups['testWized-testVar']);
    });

    test('should handle request end with multiple groups', () => {
      const mockGroups = {
        group1: { ...mockGroup, requestName: 'request1', isStatic: false },
        group2: { ...mockGroup, requestName: 'request2', isStatic: false },
      };

      const setupSpy = jest.spyOn(manager, 'setupFilterMonitoring').mockReturnValue(mockGroups);
      const handleSpy = jest.spyOn(manager, 'setupGroupEventHandlers');

      manager.handleRequestEnd({ name: 'request1' });
      expect(setupSpy).toHaveBeenCalled();
      expect(handleSpy).toHaveBeenCalledTimes(2);

      setupSpy.mockRestore();
      handleSpy.mockRestore();
    });
  });

  describe('reset functionality', () => {
    test('should handle reset button click', () => {
      mockRadio.getAttribute.mockImplementation((attr) => {
        switch (attr) {
          case 'w-filter-radio-category':
            return 'testCategory';
          case 'w-filter-radio-variable':
            return 'testVar';
          case 'w-filter-pagination-current-variable':
            return 'currentPage';
          case 'w-filter-request':
            return 'filterRequest';
          default:
            return null;
        }
      });

      const mockResetButton = { addEventListener: jest.fn() };
      document.querySelector = jest.fn().mockImplementation((selector) => {
        if (selector === '[w-filter-radio-reset="testCategory"]') {
          return mockResetButton;
        }
        return null;
      });

      const mockGroup = {
        elements: [mockRadio],
        wizedName: 'testWized',
        variableName: 'testVar',
        category: 'testCategory',
        filterRequest: 'filterRequest',
      };

      manager.setupResetButton(mockGroup);

      // Verify that addEventListener was called
      expect(mockResetButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));

      // Get the click handler and simulate click
      const clickHandler = mockResetButton.addEventListener.mock.calls[0][1];
      mockWized.data.v.testVar = 'some value';
      clickHandler({ preventDefault: jest.fn() });

      expect(mockWized.data.v.testVar).toBe('');
      expect(mockChipsManager.clearCategory).toHaveBeenCalledWith('testCategory');
    });

    test('should handle missing reset button gracefully', () => {
      document.querySelector.mockReturnValue(null);
      const mockGroup = {
        elements: [mockRadio],
        wizedName: 'testWized',
        variableName: 'testVar',
        category: 'testCategory',
      };

      expect(() => manager.setupResetButton(mockGroup)).not.toThrow();
    });

    it('should handle chip removal on radio uncheck', async () => {
      jest.useFakeTimers();

      // Mock Wized requests to resolve immediately
      mockWized.requests.execute.mockResolvedValue(undefined);

      const mockCustomRadio = {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          contains: jest.fn().mockReturnValue(false), // Initially not checked
        },
      };

      const mockRadio = {
        addEventListener: jest.fn(),
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
        },
        getAttribute: jest.fn((attr) => {
          switch (attr) {
            case 'w-filter-radio-category':
              return 'testCategory';
            case 'w-filter-radio-variable':
              return 'testVar';
            case 'w-filter-pagination-current-variable':
              return 'currentPage';
            case 'w-filter-request':
              return 'filterRequest';
            default:
              return null;
          }
        }),
        querySelector: jest.fn((selector) => {
          if (selector === '[w-filter-radio-label]') {
            return { textContent: 'Test Label' };
          }
          if (selector === '.w-form-formradioinput--inputType-custom') {
            return mockCustomRadio;
          }
          if (selector === '.w-form-formradioinput--inputType-custom.w--redirected-checked') {
            return mockCustomRadio.classList.contains.mock.results[0]?.value
              ? mockCustomRadio
              : null;
          }
          return null;
        }),
      };

      const mockChipsManager = {
        create: jest.fn().mockReturnValue({ id: 'test-chip' }),
        clearCategory: jest.fn(),
        addToContainer: jest.fn(),
      };

      window.filterChips = mockChipsManager;
      window.filterChipsReady = true;

      const manager = new FilterRadioManager(mockWized);
      const elements = [mockRadio];

      // First click - should create chip because wasChecked is false
      manager.handleRadioClick(mockRadio, elements, 'testVar', 'currentPage', 'filterRequest');

      // Advance timers and wait for promises
      jest.advanceTimersByTime(50);
      await Promise.resolve(); // Wait for first promise
      await Promise.resolve(); // Wait for nested promise

      // Verify chip was created
      expect(mockChipsManager.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'testCategory',
          label: 'Testcategory: Test Label',
          filterType: 'radio',
          value: 'Test Label',
          sourceElement: mockRadio,
          onSourceUpdate: expect.any(Function),
        })
      );

      // Update mock to simulate checked state for the second click
      mockCustomRadio.classList.contains.mockReturnValue(true);

      // Second click - should clear chip because wasChecked is true
      manager.handleRadioClick(mockRadio, elements, 'testVar', 'currentPage', 'filterRequest');

      // Advance timers and wait for promises
      jest.advanceTimersByTime(50);
      await Promise.resolve(); // Wait for first promise
      await Promise.resolve(); // Wait for nested promise

      // Verify chip was cleared
      expect(mockChipsManager.clearCategory).toHaveBeenCalledWith('testCategory');

      jest.useRealTimers();
    });
  });
});
