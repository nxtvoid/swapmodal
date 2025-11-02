# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.0.0] - SwapModal (2025-11-02)

### 🎉 Initial Release

This is the initial release of **SwapModal**, forked from pushmodal with improvements and bug fixes.

### Features

* Handle shadcn dialog, sheet and drawer with ease
* Type-safe modal management with TypeScript
* Stack multiple modals
* Event system for modal state changes
* Responsive wrapper for mobile/desktop (drawer/dialog)
* Support for custom wrappers (Dialog, Drawer, Sheet)

### Bug Fixes

* **responsive**: Fixed drawer reopening and losing animation with createResponsiveWrapper on Vaul ^1.1.2
  - Fixed issue where `useIsMobile()` hook was being called independently in both Wrapper and Content components
  - Implemented Context API to share `isMobile` state between components ensuring consistency
  - Added proper state initialization to avoid hydration mismatches
  - Improved compatibility with Vaul ^1.1.2 and later versions

---

## Previous History (from pushmodal)

### [1.0.3](https://github.com/lindesvard/pushmodal/compare/v1.0.2...v1.0.3) (2024-04-10)

### [1.0.2](https://github.com/lindesvard/pushmodal/compare/v1.0.1...v1.0.2) (2024-04-10)

### [1.0.1](https://github.com/lindesvard/pushmodal/compare/v0.0.8...v1.0.1) (2024-04-10)

### [1.0.0](https://github.com/lindesvard/pushmodal/compare/v0.0.8...v1.0.0) (2024-04-07)

First stable release of this library 🤤

### [0.0.8](https://github.com/lindesvard/pushmodal/compare/v0.0.7...v0.0.8) (2024-04-05)


### Features

* allow interface + remove second param(props) if component does not require props ([3416efb](https://github.com/lindesvard/pushmodal/commit/3416efbab41e2264e53d157d96cf09a71029e919))

### [0.0.7](https://github.com/lindesvard/pushmodal/compare/v0.0.6...v0.0.7) (2024-04-04)

### [0.0.6](https://github.com/lindesvard/pushmodal/compare/v0.0.5...v0.0.6) (2024-04-04)

### [0.0.5](https://github.com/lindesvard/pushmodal/compare/v0.0.4...v0.0.5) (2024-04-04)


### Features

* make props optional on pushModal ([f335d0a](https://github.com/lindesvard/pushmodal/commit/f335d0a150989b40f9f84c53b8a945e0a27dc767))

### [0.0.4](https://github.com/lindesvard/pushmodal/compare/v0.0.3...v0.0.4) (2024-04-03)

### [0.0.3](https://github.com/DonAdam2/react-rollup-npm-boilerplate/compare/v0.0.2...v0.0.3) (2024-04-03)

### 0.0.2 (2024-04-03)
