/**
 * FilterSearchManager: Main class responsible for managing search-based filtering functionality
 *
 * This class handles:
 * 1. State Management: Tracks search input states and filter variables
 * 2. UI Management: Handles search input updates
 * 3. Event Handling: Manages input events with debouncing
 * 4. Wized Integration: Coordinates with Wized for data and requests
 */
class FilterSearchManager {
  constructor(Wized) {
    this.Wized = Wized;

    // Internal state
    this.state = {
      monitoredSearches: new Set(), // Tracks which search inputs are being monitored
      debounceTimers: new Map(), // Tracks debounce timers for each search input
      initialized: false,
    };

    // Configuration
    this.config = {
      debounceDelay: 300, // Milliseconds to wait before triggering search
    };

    // Bind methods
    this.setupFilterMonitoring = this.setupFilterMonitoring.bind(this);
    this.handleRequestEnd = this.handleRequestEnd.bind(this);
    this.resetAllSearchInputs = this.resetAllSearchInputs.bind(this);

    // Initialize immediately
    this.initialize();
  }

  // =============================================
  // INITIALIZATION AND SETUP
  // =============================================

  initialize() {
    if (this.state.initialized) return;

    // Make reset function globally available
    window.resetAllSearchInputs = this.resetAllSearchInputs;

    // Set up request monitoring
    this.Wized.on('requestend', this.handleRequestEnd);

    this.state.initialized = true;
  }

  // =============================================
  // DEBOUNCE FUNCTIONALITY
  // =============================================

  /**
   * Creates a debounced version of the search update
   * @param {HTMLInputElement} searchInput - The search input element
   * @param {Function} callback - The function to debounce
   */
  debounceSearch(searchInput, callback) {
    const timerId = this.state.debounceTimers.get(searchInput);
    if (timerId) {
      clearTimeout(timerId);
    }

    const newTimerId = setTimeout(() => {
      callback();
      this.state.debounceTimers.delete(searchInput);
    }, this.config.debounceDelay);

    this.state.debounceTimers.set(searchInput, newTimerId);
  }

  // =============================================
  // STATE MANAGEMENT AND WIZED INTEGRATION
  // =============================================

  /**
   * Updates Wized variables and triggers filter requests
   */
  async updateWizedVariable(
    searchInput,
    variableName,
    paginationVariable,
    filterRequest,
    forceEmpty = false,
    skipRequest = false
  ) {
    const value = forceEmpty ? '' : searchInput.value.trim();
    console.log('=== Updating Search Variables ===');
    console.log('Search value:', value);
    console.log('Global reset in progress:', window.isGlobalResetInProgress);

    // Update Wized variable
    this.Wized.data.v[variableName] = value;
    console.log(`Updated search variable ${variableName} to:`, value);

    // Reset pagination if needed
    if (paginationVariable) {
      this.Wized.data.v[paginationVariable] = 1;
      console.log(`Reset pagination variable ${paginationVariable} to: 1`);
    }

    // Execute filter request if provided and not skipped and not during global reset
    if (filterRequest && !skipRequest && !window.isGlobalResetInProgress) {
      console.log(`Executing filter request: ${filterRequest}`);
      try {
        await this.Wized.requests.execute(filterRequest);
        console.log('Filter request completed successfully');
      } catch (error) {
        console.error(`Error executing filter request:`, error);
      }
    } else {
      console.log('Skipping request execution:', {
        hasFilterRequest: !!filterRequest,
        skipRequest,
        isGlobalReset: window.isGlobalResetInProgress,
      });
    }
    console.log('=== Search Update Complete ===');
  }

  // =============================================
  // SEARCH INPUT SETUP AND MONITORING
  // =============================================

  /**
   * Sets up a single search input
   */
  setupSearch(searchInput) {
    const variableName = searchInput.getAttribute('w-filter-search-variable');
    if (!variableName || this.state.monitoredSearches.has(variableName)) return;

    this.state.monitoredSearches.add(variableName);

    const paginationVariable = searchInput.getAttribute('w-filter-pagination-current-variable');
    const filterRequest = searchInput.getAttribute('w-filter-request');

    // Initialize Wized variable if needed
    if (typeof this.Wized.data.v[variableName] === 'undefined') {
      this.Wized.data.v[variableName] = '';
    }

    // Add input handler with debouncing
    searchInput.addEventListener('input', () => {
      this.debounceSearch(searchInput, () => {
        this.updateWizedVariable(searchInput, variableName, paginationVariable, filterRequest);
      });
    });
  }

  setupFilterMonitoring() {
    const filterWrapper = document.querySelector('[w-filter-wrapper]');
    if (!filterWrapper) return;

    const searchInputs = filterWrapper.querySelectorAll('input[w-filter-search-variable]');
    if (searchInputs.length === 0) return;

    searchInputs.forEach((searchInput) => this.setupSearch(searchInput));
  }

  // =============================================
  // EVENT HANDLING
  // =============================================

  handleRequestEnd() {
    this.setupFilterMonitoring();
  }

  // =============================================
  // PUBLIC API
  // =============================================

  /**
   * Resets all search inputs and their associated variables
   */
  async resetAllSearchInputs() {
    const filterWrapper = document.querySelector('[w-filter-wrapper]');
    if (!filterWrapper) return;

    const searchInputs = filterWrapper.querySelectorAll('input[w-filter-search-variable]');
    if (searchInputs.length === 0) return;

    console.log('=== Resetting All Search Inputs ===');
    for (const searchInput of searchInputs) {
      const variableName = searchInput.getAttribute('w-filter-search-variable');
      const paginationVariable = searchInput.getAttribute('w-filter-pagination-current-variable');
      const filterRequest = searchInput.getAttribute('w-filter-request');

      console.log(`Resetting search input with variable: ${variableName}`);
      console.log('Pagination variable:', paginationVariable);
      console.log('Filter request:', filterRequest);

      // Clear input value
      searchInput.value = '';

      // Dispatch input event to notify Wized of the change
      const inputEvent = new Event('input', { bubbles: true });
      searchInput.dispatchEvent(inputEvent);

      console.log('Cleared input value and dispatched input event');

      // Update Wized state but skip request execution
      await this.updateWizedVariable(
        searchInput,
        variableName,
        paginationVariable,
        filterRequest,
        true,
        true
      );
    }
    console.log('=== Search Reset Complete ===');
  }
}

// Initialize Wized and the FilterSearchManager
if (typeof window !== 'undefined') {
  window.Wized = window.Wized || [];
  if (!Array.isArray(window.Wized)) {
    // If Wized is already initialized, create instance immediately
    new FilterSearchManager(window.Wized);
  } else {
    // Otherwise wait for Wized initialization
    window.Wized.push((Wized) => {
      new FilterSearchManager(Wized);
    });
  }
}

export default FilterSearchManager;
