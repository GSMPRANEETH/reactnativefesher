# Product Catalog App

Production-style React Native CLI app focused on scalable state management, list performance, and lifecycle-safe persistence.

## Submission Summary

- React Native CLI + TypeScript + Hooks.
- Redux Toolkit for normalized catalog state.
- 2 screens with stack navigation.
- Public API integration (DummyJSON) with search + infinite scroll.
- AsyncStorage persistence across open, background, and killed states.
- Core React Native components only (no third-party UI libraries).

## Checklist Mapping

- Navigation: Catalog and Product Detail.
- Large data source: DummyJSON products API.
- Search: debounced query with state reset and fresh page fetch.
- Pagination: infinite scroll using page and total tracking.
- State management: Redux Toolkit slice + selectors.
- Persistence: AsyncStorage hydration and save/restore flow.
- Lifecycle:
  - Open: persisted catalog is hydrated before app shell renders.
  - Background: state is saved on AppState transition.
  - Killed: most recent saved state restores on relaunch.

## What It Does

- Fetches and displays a large remote catalog.
- Supports fast, debounced search.
- Loads additional pages as users scroll.
- Navigates to product details with selected-state tracking.
- Handles loading, refresh, empty, and error states.
- Restores catalog data after app restart.

## Tech Stack

- React Native CLI, not Expo
- TypeScript
- Functional components and React Hooks
- Redux Toolkit + react-redux
- React Navigation native stack
- AsyncStorage for local persistence
- Core React Native components only

## Screens

- Catalog screen: search, list, pagination, refresh, and error handling.
- Detail screen: shows the selected product from persisted local state.

## How To Run

1. Install dependencies.

```sh
npm install
```

2. Start Metro.

```sh
npm start
```

3. Run Android.

```sh
npm run android
```

The project is configured to use Metro port 8081.

4. Run iOS.

```sh
cd ios
bundle install
bundle exec pod install
cd ..
npm run ios
```

5. Optional diagnostics.

```sh
npm run doctor
```

## Key Technical Decisions

- Catalog data is stored in normalized Redux state with `ids` and `entities` to keep list rendering efficient.
- Search resets the catalog slice and fetches page 1 so stale results do not bleed into a new query.
- Local persistence stores the catalog slice in AsyncStorage, including the query, loaded pages, and selected product.
- App startup waits for hydration before rendering navigation so the restored state is available immediately.
- App lifecycle persistence is handled in one place so background transitions are saved consistently.
- FlatList virtualization options are tuned (`windowSize`, `maxToRenderPerBatch`, `removeClippedSubviews`) to keep list performance smooth.

## Performance Notes

- Normalized Redux state minimizes unnecessary list re-renders.
- Debounced search reduces request volume while typing.
- FlatList virtualization settings improve scrolling behavior on larger datasets.
- Paginated fetching avoids loading the entire dataset at once.

## What I Would Improve With More Time

- Add unit/integration tests for reducers, selectors, persistence, and async flows.
- Add lightweight telemetry and request timing metrics.
- Add offline-first caching and stale-while-revalidate behavior.
- Add accessibility audits and cross-device visual QA.

## Troubleshooting

- If app opens but shows "Unable to load script":
	- Keep Metro running with `npm start`.
	- Verify emulator/device is visible with `adb devices`.
	- Run `adb reverse tcp:8081 tcp:8081` and relaunch.
- If Android build fails after SDK updates, run:

```sh
npm run clean:android
npm run android
```

## Project Structure

- `App.tsx`: app bootstrap and hydration gate.
- `src/navigation`: stack navigation setup.
- `src/screens`: catalog and detail screens.
- `src/store`: Redux slice, store, hooks, and persistence types.
- `src/store/storage.ts`: AsyncStorage read/write helpers.
- `src/hooks/useCatalogPersistence.ts`: lifecycle-based persistence.
- `src/api/productsApi.ts`: public API client.
