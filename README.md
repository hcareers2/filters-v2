![Cover Image for Wized Filter and Pagination](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b9e4c67d2fe311fdd5b011_Youtube%20Cover.png)

# Wized Filter and Pagination

A no-code solution that seamlessly integrates filtering and pagination into your Webflow, Wized, and Xano projects. By simply adding attributes to your Webflow filters and configuring requests and elements in Wized, you can set up a fully functional system in minutes—saving you hours of development time.
⚠️ **Note:**

- This solution is **designed exclusively for Xano** as the backend.
  <br><br>
  <br><br>
  <br><br>

## 🚀 Quick Links

- [📺 Checkout the Demo](https://filters-with-pagination-wwx.webflow.io/)
- [🎥 Watch the YouTube Tutorial](https://youtu.be/r-fotNAy8NI)
- [🌐 Get the Webflow Cloneable](https://webflow.com/made-in-webflow/website/filters-with-pagination-tutorial)
- [🔥Grab the Wized Cloneable](https://app.wized.com/clone/Zz9JP3G6H6ahstd4yxdT)
- [🔥Grab the Xano Snippet](https://www.xano.com/snippet/96QVQ8A7)
- [📦 View the NPM Package](https://www.npmjs.com/package/filterandlist-for-wized)
- [☕ Buy Me a Coffee](https://buymeacoffee.com/aonnoy)
- [🛠️ Create an Account on Wized (Affiliate Link)](https://www.wized.com/?via=aonnoy)
- [🛠️ Create an Account On Xano (Affiliate Link)](https://xano.io/mgfswoqi)
  <br><br>
  <br><br>
  <br><br>

## Supported Filter Types

- [**Checkbox**](#create-checkbox-filter-and-its-attributes-list) – Allow users to select multiple options.
- [**Radio Select**](#create-radio-select-filter-and-its-attributes-list) – Enable single-option selection.
- [**Select**](#create-select-filter-and-its-attributes-list) – Dropdown-based selection.
- [**Select Range**](#create-select-range-filter-and-its-attributes-list) – Filter by range.
- [**Sort**](#create-sort-filter-and-its-attributes-list) – Arrange results based on predefined criteria.
- [**Infinite Pagination**](#create-infinite-pagination-and-its-attributes-list) – Seamless content loading as users scroll.
- [**Search**](#create-search-filter-and-its-attributes-list) – Keyword-based filtering.
- [**Chips**](#create-chips-filter-and-its-attributes-list) – Visual filter tags for quick selection.
- [**Reset All Filters**](#create-reset-all-and-its-attributes-list) – Clear all active filters at once.
- [**Reset Individual Filters**](#create-single-reset-for-filter-category-and-its-attributes-list) – Remove specific filters without affecting others.
  <br><br>
  <br><br>
  <br><br>

## Features

- **Custom Filter Triggers** – Define how and when filters are applied.
- **Flexible Styling Options** – Easily customise the look and feel to match your design.
- **Configurable Behaviours** – Adjust filter logic to suit different use cases.
- **Event-Based Architecture** – Filters and pagination respond dynamically to user actions.
- **Optimised Performance** – Efficient updates with minimal page reloads.
- **Debounced Filter Updates** – Prevent unnecessary requests for a smoother experience.
- **State Management Built-in** – Filters stay in sync without extra setup.
- **Seamless Infinite Scroll** – Load more content automatically as users scroll.
  <br><br>
  <br><br>
  <br><br>

## Get Started

To use **Wized Filter and Pagination**, include the CDN link in the `<head>` tag of your page:

```html
<!-- WIZED FILTER AND PAGINATION BY AONNOY-->
<script
  async
  type="module"
  src="https://cdn.jsdelivr.net/npm/filterandlist-for-wized@1/dist/index.min.js"
></script>
```

<br><br>
<br><br>
<br><br>

## Setup

### Add Attribute to the Form Element that contains the filters

![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b71986c99472e781610605_Screenshot%202025-02-20%20at%2012.00.40.png)
![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b7198d3c5f02b91e2caa8a_Screenshot%202025-02-20%20at%2012.00.52.png)

| **ATTRIBUTE**      | **VALUE**         | **REQUIRED** | **DESCRIPTION**                                                                        |
| ------------------ | ----------------- | ------------ | -------------------------------------------------------------------------------------- |
| `w-filter-wrapper` | (No value needed) | ✅           | The Webflow form element that wraps all filters, pagination, and items to be filtered. |

<br><br>
<br><br>
<br><br>

## Create Infinite Pagination and its attributes list

This feature enables infinite scrolling, where more content loads dynamically as the user scrolls.
To implement infinite pagination correctly, follow these key setup steps:

### 🚨 Important Setup Requirements

1. **Create Two Wized Requests:**

   - You need **two Wized requests** responsible for fetching and rendering paginated content:
     - **First Request:** Executes on page load, fetches initial data, and stores it in a **Wized variable**. Your filter content should be rendered from this variable.
     - **Second Request (Clone of the First):** This request is triggered **by the pagination element**. When it finishes, the script will append the newly fetched data to the existing Wized variable, ensuring smooth content loading.

2. **Create Two Wized Variables for Pagination Control:**

   - **Current Page Variable:** Stores the number of the current page.
   - **Next Page Variable:** Stores the number of the next page.
   - **Both variables must be updated** whenever either of the two Wized requests is executed.

3. **Pagination Stops Automatically:**

   - The pagination will **stop functioning** when the Wized variable holding the **next page number** becomes `null`, indicating that there are no more pages to fetch.

4. The following attributes should be applied to a **div block with no styling**. Additionally, ensure this div is positioned **below the filter item content**.

![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b686a22ad2b3b31ff2e273_Screenshot%202025-02-20%20at%2001.33.34.png)
![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b686c39224f86a83d9f82e_Screenshot%202025-02-20%20at%2001.33.53.png)

| **ATTRIBUTE**                          | **VALUE**                 | **REQUIRED** | **DESCRIPTION**                                                                                                                                         |
| -------------------------------------- | ------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `w-filter-pagination-trigger`          | _(No value needed)_       | ✅           | Identifies this element as the **infinite pagination trigger**. The script detects this to load more content.                                           |
| `w-filter-pagination-request`          | _Wized Request Name_      | ✅           | The name of the Wized request that initializes pagination. Pagination only begins **after this request successfully executes**.                         |
| `w-filter-pagination-current-variable` | _Wized Variable Name_     | ✅           | Tracks the **current page number** stored in the specified Wized variable. This variable must be updated with each request execution.                   |
| `w-filter-pagination-next-variable`    | _Wized Variable Name_     | ✅           | Checks the **next page number** stored in the specified Wized variable. **Pagination stops when this value is `null`**.                                 |
| `w-filter-request`                     | _Wized Request Name_      | ✅           | The request that fetches the **next batch of items** when pagination is triggered.                                                                      |
| `w-filter-result-variable`             | _Wized Variable Name_     | ✅           | The variable that stores the **entire dataset** being filtered and paginated. This variable gets updated as new data is fetched.                        |
| `w-filter-result-data-path`            | _Wized Request Data Path_ | ✅           | Specifies the **data path** where the new batch of content is located. The script retrieves this data and appends it to the `w-filter-result-variable`. |

<br><br>
<br><br>
<br><br>

## Create Checkbox Filter and its attributes list

- This filter is ideal for allowing users to select multiple options within a category.
- You can create multiple checkbox filters as needed. Ensure that attributes with unique values are distinct to prevent conflicts.
- Attributes should be applied to the **checkbox wrapper**.
- Checkboxes can be **static** or **dynamically generated**. Follow the attribute table below for setup details.
  ![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b687f78e3a3ff529099e8f_Screenshot%202025-02-20%20at%2001.39.36.png)
  ![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b68800508157d6423be4ea_Screenshot%202025-02-20%20at%2001.39.47.png)

| **ATTRIBUTE**                          | **VALUE**             | **REQUIRED** | **DESCRIPTION**                                                                                                                                                              |
| -------------------------------------- | --------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wized`                                | _WIZED IDENTIFIER_    | ✅           | Standard Wized identifier for this element.                                                                                                                                  |
| `w-filter-checkbox-variable`           | _WIZED VARIABLE NAME_ | ✅           | Stores the selected checkbox **label values** inside the specified Wized variable as an array of strings.                                                                    |
| `w-filter-checkbox-request`            | _WIZED REQUEST NAME_  | ⬜ Optional  | Used **only** if checkboxes are dynamically loaded. The value should be the name of the Wized request fetching the checkbox options. **Not required for static checkboxes.** |
| `w-filter-checkbox-category`           | _UNIQUE IDENTIFIER_   | ✅           | Groups checkboxes together. Essential for **Chips Filters** and for targeting specific checkbox groups when using the reset feature.                                         |
| `w-filter-pagination-current-variable` | _WIZED VARIABLE NAME_ | ✅           | Ensures pagination resets to **page 1** when a checkbox is selected/deselected. Must match the correct Wized variable for pagination.                                        |
| `w-filter-request`                     | _WIZED REQUEST NAME_  | ✅           | Fires a Wized request to reload filtered content whenever a checkbox is toggled.                                                                                             |

### Attributes for Checkbox Label

![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67bbbec04fa910180fe3b1cc_Screenshot%202025-02-24%20at%2000.34.20.png)
![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67bbbec99b970d0e42e41232_Screenshot%202025-02-24%20at%2000.34.31.png)

| **ATTRIBUTE**             | **VALUE**           | **REQUIRED** | **DESCRIPTION**                                                                                                |
| ------------------------- | ------------------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| `w-filter-checkbox-label` | _(No value needed)_ | ✅           | Enables the script to capture the checkbox label as the value when storing it in the specified Wized variable. |
| `wized`                   | _Wized Identifier_  | ✅           | Standard Wized identifier for this element.                                                                    |

<br><br>
<br><br>
<br><br>

## Create Radio Select Filter and its attributes list

- This filter is ideal for allowing users to select only one option from a predefined set.
- You can create multiple radio selects as needed. Ensure that attributes with unique values are distinct to prevent conflicts.
- Attributes should be applied to the **radio select wrapper**.
- Radio Selects can be **static** or **dynamically generated**. Follow the attribute table below for setup details.
  ![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b68f8bb032b0bef6e4ddf1_Screenshot%202025-02-20%20at%2002.11.52.png)
  ![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b68f97f8c022a57e51ba86_Screenshot%202025-02-20%20at%2002.11.58.png)

| **ATTRIBUTE**                          | **VALUE**             | **REQUIRED** | **DESCRIPTION**                                                                                                                                                                 |
| -------------------------------------- | --------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wized`                                | _WIZED IDENTIFIER_    | ✅           | Standard Wized identifier for this element.                                                                                                                                     |
| `w-filter-radio-variable`              | _WIZED VARIABLE NAME_ | ✅           | Stores the selected radio **label value** inside the specified Wized variable as a string                                                                                       |
| `w-filter-radio-request`               | _WIZED REQUEST NAME_  | ⬜ Optional  | Used **only** if radios are dynamically loaded. The value should be the name of the Wized request fetching the radio select options. **Not required for static radio selects.** |
| `w-filter-radio-category`              | _UNIQUE IDENTIFIER_   | ✅           | Groups radios together. Essential for **Chips Filters** and for targeting specific radio groups when using the reset feature.                                                   |
| `w-filter-pagination-current-variable` | _WIZED VARIABLE NAME_ | ✅           | Ensures pagination resets to **page 1** when a radio is selected/deselected. Must match the correct Wized variable for pagination.                                              |
| `w-filter-request`                     | _WIZED REQUEST NAME_  | ✅           | Fires a Wized request to reload filtered content whenever a radio is selected or reset                                                                                          |

### Attributes for Radio Label

![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67bbc01c7f15dfc01fe28f03_Screenshot%202025-02-24%20at%2000.38.36.png)
![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67bbc02941e4436f8f92cafa_Screenshot%202025-02-24%20at%2000.39.15.png)

| **ATTRIBUTE**          | **VALUE**           | **REQUIRED** | **DESCRIPTION**                                                                                             |
| ---------------------- | ------------------- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| `w-filter-radio-label` | _(No value needed)_ | ✅           | Enables the script to capture the radio label as the value when storing it in the specified Wized variable. |
| `wized`                | _Wized Identifier_  | ✅           | Standard Wized identifier for this element.                                                                 |

<br><br>
<br><br>
<br><br>

## Create Select Filter and its attributes list

- This filter is ideal for providing users with a dropdown menu to select a single option from a list.
- You can create multiple select filters as needed. Ensure that attribute values are unique to prevent conflicts.
- Attributes should be applied **directly** to the `<select>` element.
- The select filter can be **static** or **dynamically loaded**. Follow the attribute table below for setup details.
  ![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b690212de8552877663b72_Screenshot%202025-02-20%20at%2002.14.14.png)
  ![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b69044f8c022a57e5258ba_Screenshot%202025-02-20%20at%2002.15.17.png)

| **ATTRIBUTE**                          | **VALUE**             | **REQUIRED** | **DESCRIPTION**                                                                                                                                                                            |
| -------------------------------------- | --------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `wized`                                | _WIZED IDENTIFIER_    | ✅           | Standard Wized identifier for this element.                                                                                                                                                |
| `w-filter-select-variable`             | _WIZED VARIABLE NAME_ | ✅           | Stores the selected select filter **value** inside the specified Wized variable as a string                                                                                                |
| `w-filter-select-request`              | _WIZED REQUEST NAME_  | ⬜ Optional  | Used **only** if the select filter is dynamically loaded. The value should be the name of the Wized request fetching the select filter options. **Not required for static select filter.** |
| `w-filter-select-category`             | _UNIQUE IDENTIFIER_   | ✅           | Groups select filters together. Essential for **Chips Filters** and for targeting specific select filter groups when using the reset feature.                                              |
| `w-filter-pagination-current-variable` | _WIZED VARIABLE NAME_ | ✅           | Ensures pagination resets to **page 1** when a select filter is selected/deselected. Must match the correct Wized variable for pagination.                                                 |
| `w-filter-request`                     | _WIZED REQUEST NAME_  | ✅           | Fires a Wized request to reload filtered content whenever a select filter is selected or reset                                                                                             |

### If your select filter needs to dynamically load options, follow these additional steps:

1. Add the attributes mentioned above to your select filter.
2. Apply a **combo class** to hide the select filter (as it will be populated dynamically).
3. Create a **div block** containing two **text elements** inside it.
4. Apply the following attributes to the **div block**:
5. You will need to ensure that this div block is placed close to the select filter especially if they share the same w-filter-select-category value

| **ATTRIBUTE**              | **VALUE**                                                                          | **REQUIRED** | **DESCRIPTION**                                                |
| -------------------------- | ---------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------- |
| `w-filter-select-category` | _NEEDS TO HAVE THE SAME VALUE AS THE SELECT FILTER THAT THIS DIV BLOCK BELONGS TO_ | ✅           | Ensures this div block is linked to the correct select filter. |
| `w-filter-select-option`   | wrapper                                                                            | ✅           | Identifies the div block as the wrapper for dynamic options.   |

One of the text elements in the div block will need to have the following attributes:

| **ATTRIBUTE**            | **VALUE**          | **REQUIRED** | **DESCRIPTION**                                                                         |
| ------------------------ | ------------------ | ------------ | --------------------------------------------------------------------------------------- |
| `wized`                  | _WIZED IDENTIFIER_ | ✅           | Used to render the option text.                                                         |
| `w-filter-select-option` | option-text        | ✅           | Defines the text that will be displayed as the **option label** in the select dropdown. |

The other text element in the div block will need to have the following attributes:

| **ATTRIBUTE**            | **VALUE**          | **REQUIRED** | **DESCRIPTION**                                                                       |
| ------------------------ | ------------------ | ------------ | ------------------------------------------------------------------------------------- |
| `wized`                  | _WIZED IDENTIFIER_ | ✅           | Used to render the option value.                                                      |
| `w-filter-select-option` | value-text         | ✅           | Defines the actual **value** that will be stored in the Wized variable when selected. |

<br><br>
<br><br>
<br><br>

## Create Select Range Filter and its attributes list

- This filter allows users to select a range using two dropdowns (e.g., a "FROM" and "TO" value).
- You can create multiple select range filters as needed. Ensure that each filter has unique attribute values to prevent conflicts.
- Attributes must be applied **directly** to each `<select>` element.
- The select range filter can be **static** or **dynamically loaded**.
- The setup is similar to the standard **Select Filter**, but with separate attributes for "FROM" and "TO" dropdowns.

### Attributes for "FROM" Select Range

![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b6934151d7af312e43b4e7_Screenshot%202025-02-20%20at%2002.27.07.png)
![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b6934b981b0268036eb44e_Screenshot%202025-02-20%20at%2002.27.16.png)

| **ATTRIBUTE**                          | **VALUE**             | **REQUIRED** | **DESCRIPTION**                                                                                                                                                   |
| -------------------------------------- | --------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wized`                                | _Wized Identifier_    | ✅           | Standard Wized identifier for this element.                                                                                                                       |
| `w-filter-select-range-from-variable`  | _Wized Variable Name_ | ✅           | Stores the selected **FROM value** inside the specified Wized variable as a string.                                                                               |
| `w-filter-select-range-category`       | _Unique Identifier_   | ✅           | Groups select range filters together. Essential for **Chips Filters** and for targeting specific filter groups when using the reset feature.                      |
| `w-filter-request`                     | _Wized Request Name_  | ✅           | Fires a Wized request to reload filtered content whenever a selection is made or reset.                                                                           |
| `w-filter-select-range-request`        | _Wized Request Name_  | ⬜ Optional  | Used **only** if the select filter options are dynamically loaded. Set this value to the Wized request fetching the options. **Not required for static filters.** |
| `w-filter-pagination-current-variable` | _Wized Variable Name_ | ✅           | Ensures pagination resets to **page 1** when a selection is made. Must match the correct Wized variable for pagination.                                           |

### Attributes for "TO" Select Range

![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b6934151d7af312e43b4e7_Screenshot%202025-02-20%20at%2002.27.07.png)
![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b693dd396b35d511107b07_Screenshot%202025-02-20%20at%2002.30.20.png)

| **ATTRIBUTE**                          | **VALUE**             | **REQUIRED** | **DESCRIPTION**                                                                                                                                                   |
| -------------------------------------- | --------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wized`                                | _Wized Identifier_    | ✅           | Standard Wized identifier for this element.                                                                                                                       |
| `w-filter-select-range-to-variable`    | _Wized Variable Name_ | ✅           | Stores the selected **TO value** inside the specified Wized variable as a string.                                                                                 |
| `w-filter-select-range-category`       | _Unique Identifier_   | ✅           | Groups select range filters together. Essential for **Chips Filters** and for targeting specific filter groups when using the reset feature.                      |
| `w-filter-request`                     | _Wized Request Name_  | ✅           | Fires a Wized request to reload filtered content whenever a selection is made or reset.                                                                           |
| `w-filter-select-range-request`        | _Wized Request Name_  | ⬜ Optional  | Used **only** if the select filter options are dynamically loaded. Set this value to the Wized request fetching the options. **Not required for static filters.** |
| `w-filter-pagination-current-variable` | _Wized Variable Name_ | ✅           | Ensures pagination resets to **page 1** when a selection is made. Must match the correct Wized variable for pagination.                                           |

### Dynamically Loading Select Range Filters

If your select range filter needs to dynamically load options, follow these additional steps:

1. Add the required attributes to both the **FROM** and **TO** select filters.
2. **Hide the select filters** using a **combo class**, as they will be populated dynamically.
3. Create **two div blocks**, each containing **two text elements**. These blocks will serve as wrappers for the dynamically loaded options.
4. Apply the following attributes to each **div block**:
5. Ensure the **div blocks** are placed near the select filters, especially if they share the same `w-filter-select-range-category` value.

### Attributes for "FROM" Select Range Option Wrapper

![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b69457780b924c935e2434_Screenshot%202025-02-20%20at%2002.31.58.png)
![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b694ad8f983cc9bfbc255d_Screenshot%202025-02-20%20at%2002.33.25.png)

| **ATTRIBUTE**                       | **VALUE**                                      | **REQUIRED** | **DESCRIPTION**                                              |
| ----------------------------------- | ---------------------------------------------- | ------------ | ------------------------------------------------------------ |
| `w-filter-select-range-category`    | _(Same value as the associated select filter)_ | ✅           | Links this wrapper to the correct select filter.             |
| `w-filter-select-range-from-option` | `wrapper`                                      | ✅           | Identifies the div block as the wrapper for dynamic options. |

### Attributes for "FROM" Text Elements

![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b694c253ce7e04f52771f7_Screenshot%202025-02-20%20at%2002.33.35.png)
![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b694cd1a7210c9b97471dc_Screenshot%202025-02-20%20at%2002.33.42.png)

| **ATTRIBUTE**                       | **VALUE**          | **REQUIRED** | **DESCRIPTION**                                                                  |
| ----------------------------------- | ------------------ | ------------ | -------------------------------------------------------------------------------- |
| `wized`                             | _Wized Identifier_ | ✅           | Used to render the option text.                                                  |
| `w-filter-select-range-from-option` | `option-text`      | ✅           | Defines the text that will be displayed as the **option label** in the dropdown. |
| `wized`                             | _Wized Identifier_ | ✅           | Used to render the option value.                                                 |
| `w-filter-select-range-from-value`  | `value-text`       | ✅           | Defines the **value** that will be stored in the Wized variable when selected.   |

### Attributes for "TO" Select Range Option Wrapper

![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b6963ff408125ff2c1244e_Screenshot%202025-02-20%20at%2002.40.31.png)
![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b6964d51d7af312e4651fe_Screenshot%202025-02-20%20at%2002.40.40.png)

| **ATTRIBUTE**                     | **VALUE**                                      | **REQUIRED** | **DESCRIPTION**                                              |
| --------------------------------- | ---------------------------------------------- | ------------ | ------------------------------------------------------------ |
| `w-filter-select-range-category`  | _(Same value as the associated select filter)_ | ✅           | Links this wrapper to the correct select filter.             |
| `w-filter-select-range-to-option` | `wrapper`                                      | ✅           | Identifies the div block as the wrapper for dynamic options. |

### Attributes for "TO" Text Elements

![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b696f2f2bea74a4dd4cc42_Screenshot%202025-02-20%20at%2002.42.05.png)
![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b696fdfb9f72bcff4daf94_Screenshot%202025-02-20%20at%2002.42.14.png)

| **ATTRIBUTE**                     | **VALUE**          | **REQUIRED** | **DESCRIPTION**                                                                  |
| --------------------------------- | ------------------ | ------------ | -------------------------------------------------------------------------------- |
| `wized`                           | _Wized Identifier_ | ✅           | Used to render the option text.                                                  |
| `w-filter-select-range-to-option` | `option-text`      | ✅           | Defines the text that will be displayed as the **option label** in the dropdown. |
| `wized`                           | _Wized Identifier_ | ✅           | Used to render the option value.                                                 |
| `w-filter-select-range-to-value`  | `value-text`       | ✅           | Defines the **value** that will be stored in the Wized variable when selected.   |

<br><br>
<br><br>
<br><br>

## Create Sort Filter and its attributes list

- This filter allows users to sort content using a select dropdown.
- Multiple sort filters can be used within the same setup.
- Attributes must be applied **directly** to the `<select>` element.
- **⚠️ The sort filter currently only supports static options and does not work with dynamically loaded content.**
  ![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b697d6162cf09c6ade6671_Screenshot%202025-02-20%20at%2002.47.16.png)
  ![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b697e3584a3c13a557c28b_Screenshot%202025-02-20%20at%2002.47.23.png)

| **ATTRIBUTE**                          | **VALUE**             | **REQUIRED** | **DESCRIPTION**                                                                                                                    |
| -------------------------------------- | --------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `wized`                                | _Wized Identifier_    | ✅           | Standard Wized identifier for this element.                                                                                        |
| `w-filter-sort-variable`               | _Wized Variable Name_ | ✅           | Stores the selected **sort value** inside the specified Wized variable as a string.                                                |
| `w-filter-request`                     | _Wized Request Name_  | ✅           | Fires a Wized request to reload filtered content whenever a selection is made or reset.                                            |
| `w-filter-pagination-current-variable` | _Wized Variable Name_ | ✅           | Ensures pagination resets to **page 1** when a selection is made. Must match the correct Wized variable for pagination.            |
| `w-filter-sort-category`               | _Unique Identifier_   | ✅           | Groups sort filters together. Essential for **Chips Filters** and for targeting specific sort groups when using the reset feature. |

### Setting Up the Sort Filter Options

Although the **Sort Filter** is static, it requires a **separate div block (option wrapper)** to store text elements that define the available sorting options.

**Attributes for the Option Wrapper:**
![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b698564ab810b327e0a876_Screenshot%202025-02-20%20at%2002.49.11.png)
![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b6986496c4c59296ee48eb_Screenshot%202025-02-20%20at%2002.49.18.png)

| **ATTRIBUTE**            | **VALUE**                                      | **REQUIRED** | **DESCRIPTION**                                           |
| ------------------------ | ---------------------------------------------- | ------------ | --------------------------------------------------------- |
| `w-filter-sort-option`   | `wrapper`                                      | ✅           | Identifies the div block as the wrapper for sort options. |
| `w-filter-sort-category` | _(Same value as the associated select filter)_ | ✅           | Links this wrapper to the correct sort filter.            |

### Attributes for Text Elements Inside the Option Wrapper

![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b6987753ce7e04f52ae344_Screenshot%202025-02-20%20at%2002.49.26.png)

| **ATTRIBUTE**           | **VALUE**                       | **REQUIRED** | **DESCRIPTION**                                                                                                              |
| ----------------------- | ------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `w-filter-sort-option`  | `option-text`                   | ✅           | Defines the text label for the sorting option displayed in the dropdown.                                                     |
| `w-filter-sort-orderby` | `asc` / `desc`                  | ✅           | Determines whether the sorting is **ascending (asc)** or **descending (desc)**.                                              |
| `w-filter-sort-sortby`  | _(Column field name from Xano)_ | ✅           | Specifies the field in Xano by which the content will be sorted. This must match the exact field name in your Xano database. |

<br><br>
<br><br>
<br><br>

## Create Chips Filter and its attributes list

- Chips are dynamically generated based on the filters selected by the user.
- To set up chips, you need to create a **div block** that contains:
  - A **text element** (chip label)
  - A **link block** (chip remove trigger)
- **You do not need to manually hide the chip template**—the script automatically handles its visibility.
  ![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b69b976af87ba823011196_Screenshot%202025-02-20%20at%2003.03.04.png)

### Attribute for the Chip Template (div block)

![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b69bad8f983cc9bfc2a712_Screenshot%202025-02-20%20at%2003.03.11.png)

| **ATTRIBUTE**   | **VALUE** | **REQUIRED** | **DESCRIPTION**                                       |
| --------------- | --------- | ------------ | ----------------------------------------------------- |
| `w-filter-chip` | `chip`    | ✅           | Applied to the chip template to define its structure. |

### Attribute for the Chip Label

![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b69bbf3b1fb5527225d26f_Screenshot%202025-02-20%20at%2003.03.18.png)

| **ATTRIBUTE**   | **VALUE** | **REQUIRED** | **DESCRIPTION**                                                                   |
| --------------- | --------- | ------------ | --------------------------------------------------------------------------------- |
| `w-filter-chip` | `label`   | ✅           | Applied to the text element inside the chip to display the selected filter value. |

### Attribute for the Chip Remove Button

![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b69bd263fef312ee0886f4_Screenshot%202025-02-20%20at%2003.03.27.png)

| **ATTRIBUTE**   | **VALUE** | **REQUIRED** | **DESCRIPTION**                                                                          |
| --------------- | --------- | ------------ | ---------------------------------------------------------------------------------------- |
| `w-filter-chip` | `remove`  | ✅           | Applied to the link block inside the chip. Clicking it removes the corresponding filter. |

<br><br>
<br><br>
<br><br>

## Create Search Filter and its attributes list

- The Search Filter allows users to filter content based on a keyword search.
- It requires a simple **input field**, where the script automatically detects and filters content based on the text entered.
- The following attributes must be applied to the **search input field**.
  ![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b69c473b1fb5527226796a_Screenshot%202025-02-20%20at%2003.06.10.png)
  ![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b69c4f50e810f9f1cb757b_Screenshot%202025-02-20%20at%2003.06.19.png)

### Search Filter Attributes

| **ATTRIBUTE**                          | **VALUE**             | **REQUIRED** | **DESCRIPTION**                                                                                                              |
| -------------------------------------- | --------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `wized`                                | _Wized Identifier_    | ✅           | Standard Wized identifier for this element.                                                                                  |
| `w-filter-search-variable`             | _Wized Variable Name_ | ✅           | Stores the search input value inside the specified Wized variable.                                                           |
| `w-filter-request`                     | _Wized Request Name_  | ✅           | Fires a Wized request to reload filtered content whenever a user types in the search input.                                  |
| `w-filter-pagination-current-variable` | _Wized Variable Name_ | ✅           | Ensures pagination resets to **page 1** when a search term is entered. Must match the correct Wized variable for pagination. |

<br><br>
<br><br>
<br><br>

## Create Reset All and its attributes list

- This feature allows users to reset all active filters with a single click.
- It requires **one or more link block elements**, each acting as the reset trigger.
- The following attributes must be applied to the reset link block.
  ![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b69ca0335a6e59be6bc7b1_Screenshot%202025-02-20%20at%2003.07.41.png)
  ![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b69ca6d0b1e9668cb7ce65_Screenshot%202025-02-20%20at%2003.07.48.png)

| **ATTRIBUTE**                          | **VALUE**             | **REQUIRED** | **DESCRIPTION**                                                                                                              |
| -------------------------------------- | --------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `w-filter-reset`                       | main-reset            | ✅           | Stores the search input value inside the specified Wized variable.                                                           |
| `w-filter-request`                     | _Wized Request Name_  | ✅           | Fires a Wized request to reload filtered content whenever a user clicks on it                                                |
| `w-filter-pagination-current-variable` | _Wized Variable Name_ | ✅           | Ensures pagination resets to **page 1** when a search term is entered. Must match the correct Wized variable for pagination. |

<br><br>
<br><br>
<br><br>

## Create Single Reset for Filter Category and Its Attributes List

- **This feature allows users to reset a specific filter category without affecting others.**
- It requires a **single link block element**, which will act as the reset trigger.
- **⚠️ Important:** The reset button **must be placed close** to the filter group it resets.
- The **Single Reset** feature is **not required** for **Sort Filters, Search, and Chips Filters**.
- The following attributes must be applied to the reset link block.
  ![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b69e5b16844089f33e5fa7_Screenshot%202025-02-20%20at%2003.14.55.png)
  ![Webflow Screenshot](https://cdn.prod.website-files.com/657244ba4d804c29a2ef5ce0/67b69e6606e0b321735e3353_Screenshot%202025-02-20%20at%2003.15.16.png)

| **ATTRIBUTE**                 | **VALUE**                                                        | **REQUIRED** | **DESCRIPTION**                                                                               |
| ----------------------------- | ---------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `w-filter-checkbox-reset`     | _(Same value as the `w-filter-checkbox-category` attribute)_     | ✅           | Resets the **Checkbox** filter category if the value matches the associated filter group.     |
| `w-filter-radio-reset`        | _(Same value as the `w-filter-radio-category` attribute)_        | ✅           | Resets the **Radio** filter category if the value matches the associated filter group.        |
| `w-filter-select-reset`       | _(Same value as the `w-filter-select-category` attribute)_       | ✅           | Resets the **Select** filter category if the value matches the associated filter group.       |
| `w-filter-select-range-reset` | _(Same value as the `w-filter-select-range-category` attribute)_ | ✅           | Resets the **Select Range** filter category if the value matches the associated filter group. |

## License

This project is licensed under the ISC License - see the [LICENSE](https://github.com/aonnoy/wized-filter-pagination/blob/main/LICENSE) file for details.

## Support

For support, please:

- **📖 Check the Documentation** – Refer to the official [documentation](https://github.com/aonnoy/wized-filter-pagination) for setup instructions and troubleshooting.
- **🐞 Open an Issue** – If you encounter a bug or need assistance, submit an [issue](https://github.com/aonnoy/wized-filter-pagination/issues) on GitHub.
- **📧 Contact Me** – You can reach me via email at [hello@aonnoysengupta.com](mailto:hello@aonnoysengupta.com) or connect with me on Discord (**aonnoy5683**).
