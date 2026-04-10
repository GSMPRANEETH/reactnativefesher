# Product Catalog App (React Native CLI)

A clean React Native CLI app built from scratch with only the requested stack:

- React Native CLI (no Expo)
- TypeScript
- React Hooks
- Redux Toolkit + react-redux
- React Navigation (native stack)
- AsyncStorage for local persistence

## Implemented Features

- 2 screens with proper navigation:
  - Catalog screen
  - Product detail screen
- Large product list loaded from a public API (DummyJSON)
- Search
- Infinite scrolling pagination
- Redux state management for data and UI state
- Local data storage and restore after app restart
- App lifecycle handling:
  - Restore on open
  - Save on background transition
  - Data available after killed-state relaunch

## Run

1. Install dependencies

```sh
npm install
```

2. Start Metro

```sh
npm start
```

3. Run Android

```sh
npm run android
```

4. Run iOS

```sh
cd ios
bundle install
bundle exec pod install
cd ..
npm run ios
```

## Project Structure

- `App.tsx`: app bootstrap + hydration gate
- `src/navigation`: stack navigation setup
- `src/screens`: catalog and detail screens
- `src/store`: Redux slice, store, hooks, persistence types
- `src/store/storage.ts`: AsyncStorage read/write helpers
- `src/hooks/useCatalogPersistence.ts`: lifecycle-based persistence
- `src/api/productsApi.ts`: public API client
