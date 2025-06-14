jest.mock('../../filters/filter-select-range');
import { FilterSelectRangeManager } from '../../filters/filter-select-range';
import Wized from '../../__mocks__/wized';

describe('FilterSelectRangeManager', () => {
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
    manager = new FilterSelectRangeManager(Wized);
  });

  afterEach(() => {
    jest.resetAllMocks();
    window.resetAllRangeSelects = undefined;
  });

  test('should initialize with Wized instance', () => {
    expect(manager).toBeDefined();
    expect(manager.Wized).toBe(Wized);
  });

  test('should set up event listeners on initialization', () => {
    expect(Wized.on).toHaveBeenCalledWith('requestend', expect.any(Function));
  });

  test('should initialize with correct state', () => {
    expect(manager.state).toEqual({
      monitoredRanges: expect.any(Set),
      initialized: true,
      processingChange: false,
      dynamicRanges: expect.any(Map),
    });
  });

  test('should make reset function globally available', () => {
    expect(window.resetAllRangeSelects).toBeDefined();
    expect(window.resetAllRangeSelects).toBe(manager.resetAllRangeSelects);
  });
});
