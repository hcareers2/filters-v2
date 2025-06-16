# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.25] - 2025-06-14

### Fixed

- Reapply URL parameters after full page load to override persisted values.

## [1.0.26] - 2025-06-15

### Added

- Allow multiple `main-reset` buttons on a page.

- Checkbox and radio resets now uncheck their underlying `<input>` elements to keep the DOM state consistent.

## [1.0.27] - 2025-06-15
### Added
- Listen for clicks or changes on checkbox and radio inputs, so either the label or input triggers filtering.

## [1.0.28] - 2025-06-16
### Fixed
- Checkbox and radio inputs now reflect URL parameter values by updating their `checked` state.

## [1.0.29] - 2025-06-16
### Added
- Automatically execute pending requests after applying URL parameters.

## [1.0.30] - 2025-06-16
### Fixed
- Retry initial request execution until requests become available.
- Increased the polling window so late-loading requests still run.
 
## [1.0.24] - 2025-06-14

### Fixed

- Defer URL parameter synchronization until DOM is ready and ensure patched requests wait for DOM readiness.

## [1.0.22] - 2025-06-14

### Fixed

- Ensure URL parameters are applied before the first request executes and maintain normal execution when no parameters are present.

## [1.0.21] - 2025-06-14

### Fixed

- Restrict URL syncing to filter variables only and treat null values as empty strings

## [1.0.20] - 2025-06-14

### Added

- Add URL state sync for filters.

## [1.0.19] - 2025-03-01

### Added

- There was an issue when changing radio selection, which is now fixed.

[1.0.27]: https://github.com/aonnoy/wized-filter-pagination/releases/tag/v1.0.27
[1.0.28]: https://github.com/aonnoy/wized-filter-pagination/releases/tag/v1.0.28
[1.0.26]: https://github.com/aonnoy/wized-filter-pagination/releases/tag/v1.0.26
[1.0.25]: https://github.com/aonnoy/wized-filter-pagination/releases/tag/v1.0.25
[1.0.24]: https://github.com/aonnoy/wized-filter-pagination/releases/tag/v1.0.24
[1.0.22]: https://github.com/aonnoy/wized-filter-pagination/releases/tag/v1.0.22
[1.0.21]: https://github.com/aonnoy/wized-filter-pagination/releases/tag/v1.0.21
[1.0.20]: https://github.com/aonnoy/wized-filter-pagination/releases/tag/v1.0.20
[1.0.19]: https://github.com/aonnoy/wized-filter-pagination/releases/tag/v1.0.19
[1.0.29]: https://github.com/aonnoy/wized-filter-pagination/releases/tag/v1.0.29
[1.0.30]: https://github.com/aonnoy/wized-filter-pagination/releases/tag/v1.0.30
