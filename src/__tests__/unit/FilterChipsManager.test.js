import FilterChipsManager from '../../filters/filter-chips';
import Wized from '../../__mocks__/wized';

describe('FilterChipsManager', () => {
  let manager;
  let mockTemplate;
  let mockContainer;
  let mockChip;

  beforeEach(() => {
    // Clear all mocks and reset DOM
    jest.clearAllMocks();
    document.body.innerHTML = '';

    // Create mock template
    mockTemplate = document.createElement('div');
    mockTemplate.setAttribute('w-filter-chip', 'chip');
    mockTemplate.innerHTML = `
      <span w-filter-chip="label">Label</span>
      <button w-filter-chip="remove">Remove</button>
    `;

    // Create mock container
    mockContainer = document.createElement('div');
    mockContainer.appendChild(mockTemplate);
    document.body.appendChild(mockContainer);

    // Mock document methods
    document.querySelector = jest.fn((selector) => {
      if (selector === 'div[w-filter-chip="chip"]') return mockTemplate;
      return document.body.querySelector(selector);
    });

    document.querySelectorAll = jest.fn((selector) => {
      return Array.from(document.body.querySelectorAll(selector));
    });

    // Create a new instance of the manager
    manager = new FilterChipsManager(Wized);
  });

  afterEach(() => {
    // Clean up
    jest.resetAllMocks();
    window.filterChips = undefined;
    window.filterChipsReady = undefined;
    document.body.innerHTML = '';
  });

  // Helper function to create and add a chip
  const createAndAddChip = (data) => {
    const chip = manager.createFilterChip(data);
    if (chip) {
      manager.addChipToContainer(chip);
      mockContainer.appendChild(chip);
      return chip;
    }
    return null;
  };

  // Initialization tests
  describe('initialization', () => {
    test('should initialize with Wized instance', () => {
      expect(manager).toBeDefined();
      expect(manager.Wized).toBe(Wized);
    });

    test('should initialize with correct state', () => {
      const { state } = manager;
      expect(state.chipTemplate).toBeDefined();
      expect(state.chipContainer).toBeDefined();
      expect(state.chipTemplate.nodeType).toBe(1); // Element node
      expect(state.chipContainer.nodeType).toBe(1); // Element node
      expect(state.chipRelationships).toBeInstanceOf(Map);
      expect(state.activeChips).toBeInstanceOf(Set);
      expect(state.singleSelectionCategories).toBeInstanceOf(Set);
      expect(state.chipsByType).toBeInstanceOf(Map);
    });

    test('should setup template correctly', () => {
      expect(manager.state.chipTemplate).toBe(mockTemplate);
      expect(mockTemplate.style.display).toBe('none');
    });

    test('should setup container correctly', () => {
      expect(manager.state.chipContainer).toBe(mockContainer);
    });

    test('should initialize chip type tracking', () => {
      expect(manager.state.chipsByType.get('checkbox')).toBeInstanceOf(Set);
      expect(manager.state.chipsByType.get('radio')).toBeInstanceOf(Set);
      expect(manager.state.chipsByType.get('select')).toBeInstanceOf(Set);
    });

    test('should expose public API', () => {
      expect(window.filterChips).toBeDefined();
      expect(window.filterChipsReady).toBe(true);
      expect(window.filterChips).toEqual({
        create: expect.any(Function),
        addToContainer: expect.any(Function),
        removeByValue: expect.any(Function),
        clearCategory: expect.any(Function),
        clearType: expect.any(Function),
        clearAll: expect.any(Function),
        exists: expect.any(Function),
      });
    });
  });

  // Chip creation tests
  describe('chip creation', () => {
    const chipData = {
      label: 'Test Chip',
      filterType: 'checkbox',
      category: 'test',
      value: '1',
      sourceElement: document.createElement('input'),
      onSourceUpdate: jest.fn(),
    };

    test('should create chip with correct attributes', () => {
      const chip = manager.createFilterChip(chipData);

      expect(chip).toBeDefined();
      expect(chip.getAttribute('data-filter-type')).toBe('checkbox');
      expect(chip.getAttribute('data-filter-category')).toBe('test');
      expect(chip.getAttribute('data-filter-value')).toBe('1');
      expect(chip.getAttribute('data-chip-id')).toBe('test-1');
    });

    test('should set correct label text', () => {
      const chip = manager.createFilterChip(chipData);
      const label = chip.querySelector('[w-filter-chip="label"]');

      expect(label.textContent).toBe('Test Chip');
    });

    test('should not create duplicate chips', () => {
      const firstChip = createAndAddChip(chipData);
      const secondChip = manager.createFilterChip(chipData);

      expect(firstChip).toBeDefined();
      expect(secondChip).toBeNull();
    });

    test('should handle single selection types', () => {
      // Create first radio chip
      createAndAddChip({
        ...chipData,
        filterType: 'radio',
        value: '1',
      });

      // Create second radio chip
      createAndAddChip({
        ...chipData,
        filterType: 'radio',
        value: '2',
      });

      // Only the second chip should remain
      expect(manager.state.activeChips.size).toBe(1);
      expect(manager.state.activeChips.has('test-2')).toBe(true);
      expect(manager.state.activeChips.has('test-1')).toBe(false);
    });
  });

  // Chip removal tests
  describe('chip removal', () => {
    const mockSourceUpdate = jest.fn();
    let chip;

    beforeEach(() => {
      // Create and add chip to container
      chip = createAndAddChip({
        label: 'Test Chip',
        filterType: 'checkbox',
        category: 'test',
        value: '1',
        sourceElement: document.createElement('input'),
        onSourceUpdate: mockSourceUpdate,
      });

      // Create relationship
      manager.createChipRelationship('test-1', document.createElement('input'), mockSourceUpdate);
    });

    test('should remove chip on remove button click', () => {
      const removeButton = chip.querySelector('[w-filter-chip="remove"]');
      removeButton.click();

      expect(manager.state.activeChips.has('test-1')).toBe(false);
      expect(mockContainer.contains(chip)).toBe(false);
    });

    test('should call source update callback on removal', () => {
      manager.handleChipRemoval(chip);
      expect(mockSourceUpdate).toHaveBeenCalled();
    });

    test('should remove chip by value', () => {
      const result = manager.removeChipByValue('test', '1');
      expect(result).toBe(true);
      expect(manager.state.activeChips.has('test-1')).toBe(false);
    });

    test('should clear category chips', () => {
      manager.clearCategoryChips('test');
      expect(manager.state.activeChips.size).toBe(0);
    });

    test('should clear type chips', () => {
      manager.clearTypeChips('checkbox');
      expect(manager.state.activeChips.size).toBe(0);
      expect(manager.state.chipsByType.get('checkbox').size).toBe(0);
    });

    test('should clear all chips', () => {
      manager.clearAllChips();
      expect(manager.state.activeChips.size).toBe(0);
      expect(manager.state.chipsByType.get('checkbox').size).toBe(0);
    });
  });

  // Chip relationship tests
  describe('chip relationships', () => {
    test('should create chip relationship', () => {
      const sourceElement = document.createElement('input');
      const onSourceUpdate = jest.fn();

      manager.createChipRelationship('test-1', sourceElement, onSourceUpdate);

      const relationship = manager.state.chipRelationships.get('test-1');
      expect(relationship).toBeDefined();
      expect(relationship.sourceElement).toBe(sourceElement);
      expect(relationship.onSourceUpdate).toBe(onSourceUpdate);
    });

    test('should handle invalid relationship parameters', () => {
      const consoleSpy = jest.spyOn(console, 'error');

      manager.createChipRelationship();

      expect(consoleSpy).toHaveBeenCalledWith('Invalid chip relationship parameters');
      expect(manager.state.chipRelationships.size).toBe(0);
    });
  });

  // Error handling tests
  describe('error handling', () => {
    test('should handle missing template gracefully', () => {
      document.querySelector.mockReturnValue(null);
      const newManager = new FilterChipsManager(Wized);

      expect(newManager.state.chipTemplate).toBeNull();
      expect(newManager.state.chipContainer).toBeNull();
    });

    test('should handle missing required parameters in chip creation', () => {
      const consoleSpy = jest.spyOn(console, 'error');

      const chip = manager.createFilterChip({});

      expect(chip).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[FilterChipsManager] Missing required parameters for chip creation'
      );
    });

    test('should handle chip removal with missing attributes', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const invalidChip = document.createElement('div');

      manager.handleChipRemoval(invalidChip);

      expect(consoleSpy).toHaveBeenCalledWith('Chip missing required data-chip-id attribute');
    });
  });
});
