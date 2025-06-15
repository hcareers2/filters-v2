/**
 * FilterResetManager: Main class responsible for managing global filter reset functionality
 *
 * This class handles:
 * 1. State Management: Tracks active filter states across all filter types
 * 2. UI Management: Handles reset button interactions
 * 3. Event Handling: Manages click events and request completions
 * 4. Wized Integration: Coordinates with Wized for data and requests
 * 5. Cross-Filter Coordination: Manages reset operations across all filter types
 */
export default class FilterResetManager {
  constructor(Wized) {
    this.Wized = Wized;

    // Internal state
    this.state = {
      initialized: false,
      processingReset: false, // Prevent multiple simultaneous resets
      mainResetButtons: [],
    };

    // Expose global reset state
    if (typeof window !== 'undefined') {
      window.isGlobalResetInProgress = false;
    }

    // Bind methods
    this.setupMainResetButton = this.setupMainResetButton.bind(this);
    this.checkForActiveFilters = this.checkForActiveFilters.bind(this);
    this.resetAllFilters = this.resetAllFilters.bind(this);

    // Initialize immediately
    this.initialize();
  }

  // =============================================
  // INITIALIZATION AND SETUP
  // =============================================

  /**
   * Initializes the manager and sets up event listeners
   */
  initialize() {
    if (this.state.initialized) return;
    this.setupMainResetButton();
    this.state.initialized = true;
  }

  // =============================================
  // FILTER STATE DETECTION
  // =============================================

  /**
   * Checks if there are any active filters by examining Wized variables
   * @returns {boolean} True if any filters are active
   */
  checkForActiveFilters() {
    const variables = this.Wized.data.v;
    console.log('=== Checking Active Filters ===');
    console.log('All Wized variables:', variables);

    // List of variables to always skip
    const skipVariables = ['pagination', 'result', 'cards', 'itemsperpage', 'index'];

    const activeFilters = Object.entries(variables).filter(([key, value]) => {
      console.log(`Checking variable: ${key} with value:`, value);

      // Skip non-filter variables
      if (skipVariables.some((skip) => key.toLowerCase().includes(skip))) {
        console.log(`Skipping system variable: ${key}`);
        return false;
      }

      // Handle null values
      if (value === null) {
        console.log(`Null value for ${key}: inactive`);
        return false;
      }

      // Check arrays (used by checkboxes, sort, and selected options)
      if (Array.isArray(value)) {
        // Special handling for sort options
        if (key.includes('_sort')) {
          const isActive = value.some(
            (item) => item && typeof item === 'object' && (item.orderBy || item.sortBy)
          );
          console.log(`Sort array check for ${key}: ${isActive ? 'active' : 'inactive'}`);
          return isActive;
        }

        // Special handling for filter arrays
        if (
          key.includes('_make') ||
          key.includes('_fuelType') ||
          key.includes('_year') ||
          key.includes('_location')
        ) {
          const isActive = value.length > 0;
          console.log(`Filter array check for ${key}: ${isActive ? 'active' : 'inactive'}`);
          return isActive;
        }
        return false;
      }

      // Check strings (used by radio and select)
      if (typeof value === 'string') {
        const isActive = value !== '';
        console.log(`String check for ${key}: ${isActive ? 'active' : 'inactive'}`);
        return isActive;
      }

      // Check numbers (used by range filters)
      if (typeof value === 'number') {
        const isActive = value !== 0;
        console.log(`Number check for ${key}: ${isActive ? 'active' : 'inactive'}`);
        return isActive;
      }

      console.log(`Skipping unknown type for ${key}:`, typeof value);
      return false;
    });

    console.log('Active filters found:', activeFilters);
    console.log('=== Filter Check Complete ===');

    return activeFilters.length > 0;
  }

  // =============================================
  // RESET FUNCTIONALITY
  // =============================================

  /**
   * Resets all filters and executes the filter request
   * @param {HTMLElement} resetButton - The reset button element
   */
  async resetAllFilters(resetButton) {
    console.log('=== Reset Request Started ===');
    console.log('Processing Reset State:', this.state.processingReset);

    if (this.state.processingReset) {
      console.log('Reset already in progress, skipping...');
      return;
    }

    this.state.processingReset = true;
    window.isGlobalResetInProgress = true;
    console.log('Set processingReset flag to:', this.state.processingReset);
    console.log('Set global reset flag to:', window.isGlobalResetInProgress);

    console.log('=== Starting Filter Reset ===');
    try {
      const resetPromises = [];
      console.log('Initializing reset promises array');

      // Collect all reset operations
      if (typeof window.uncheckAllFilterCheckboxes === 'function') {
        console.log('Adding checkbox reset to queue');
        resetPromises.push(window.uncheckAllFilterCheckboxes());
      }

      if (typeof window.uncheckAllRadioButtons === 'function') {
        console.log('Adding radio reset to queue');
        resetPromises.push(window.uncheckAllRadioButtons());
      }

      if (typeof window.resetAllSelectInputs === 'function') {
        console.log('Adding select reset to queue');
        resetPromises.push(window.resetAllSelectInputs());
      }

      if (typeof window.resetAllRangeSelects === 'function') {
        console.log('Adding range reset to queue');
        resetPromises.push(window.resetAllRangeSelects());
      }

      if (typeof window.resetAllSortInputs === 'function') {
        console.log('Adding sort reset to queue');
        resetPromises.push(window.resetAllSortInputs());
      }

      if (typeof window.resetAllSearchInputs === 'function') {
        console.log('Adding search reset to queue');
        resetPromises.push(window.resetAllSearchInputs());
      }

      console.log(`Total reset operations queued: ${resetPromises.length}`);

      // Wait for all reset operations to complete
      console.log('Executing all reset operations...');
      await Promise.all(resetPromises);
      console.log('All reset operations completed successfully');

      // Reset pagination to 1
      const paginationVariable = resetButton.getAttribute('w-filter-pagination-current-variable');
      if (paginationVariable) {
        console.log(`Setting pagination variable ${paginationVariable} to 1`);
        this.Wized.data.v[paginationVariable] = 1;
      }

      // Execute filter request once to update results
      const filterRequest = resetButton.getAttribute('w-filter-request');
      if (filterRequest) {
        console.log(`[REQUEST-START] Executing filter request: ${filterRequest}`);
        console.log('Current processingReset state:', this.state.processingReset);

        try {
          await this.Wized.requests.execute(filterRequest);
          console.log('[REQUEST-END] Filter request executed successfully');
        } catch (error) {
          console.error('[REQUEST-ERROR] Error executing filter request:', error);
        }
      } else {
        console.log('No filter request attribute found on reset button');
      }
    } catch (error) {
      console.error('Error in resetAllFilters:', error);
    } finally {
      this.state.processingReset = false;
      window.isGlobalResetInProgress = false;
      console.log('Reset processingReset flag to:', this.state.processingReset);
      console.log('Reset global reset flag to:', window.isGlobalResetInProgress);
    }
    console.log('=== Filter Reset Complete ===');
  }

  // =============================================
  // EVENT HANDLING
  // =============================================

  /**
   * Sets up the main reset button event listener and initializes its state
   */
  setupMainResetButton() {
    console.log('=== Setting up Reset Button ===');
    const resetButtons = document.querySelectorAll('[w-filter-reset="main-reset"]');
    console.log('Reset buttons found:', resetButtons);

    if (!resetButtons || resetButtons.length === 0) {
      console.log('No reset button found, exiting setup');
      return;
    }

    this.state.mainResetButtons = Array.from(resetButtons);

    this.state.mainResetButtons.forEach((button) => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('=== Reset Button Click Event Started ===');
        console.log('Event timestamp:', new Date().toISOString());

        // Check if any filters are active
        console.log('Checking for active filters...');
        const hasActiveFilters = this.checkForActiveFilters();
        console.log('Active filters check result:', hasActiveFilters);

        if (hasActiveFilters) {
          console.log('Active filters found, proceeding with reset');
          await this.resetAllFilters(button);
        } else {
          console.log('No active filters found, skipping reset');
        }
        console.log('=== Reset Button Click Event Completed ===');
      });
    });
    console.log('Reset button setup complete');
  }
}

// Initialize Wized and the FilterResetManager
if (typeof window !== 'undefined' && !window.__TESTING__) {
  if (!Array.isArray(window.Wized)) {
    window.Wized = [];
  }
  if (typeof window.Wized.push === 'function') {
    window.Wized.push((Wized) => {
      new FilterResetManager(Wized);
    });
  } else {
    console.warn('Wized initialization queue not available');
  }
}
