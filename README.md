# Product Catalog App (React Native CLI)

A clean React Native CLI app built with only the requested stack:

- React Native CLI (no Expo)
- TypeScript
- React Hooks (functional components throughout)
- Redux Toolkit + react-redux
- React Navigation (native stack)
- AsyncStorage for local persistence

---

## App Functionality

**Screen 1 – Product Catalog** (`src/screens/ProductListScreen.tsx`)

- Loads products from [DummyJSON](https://dummyjson.com/products)
- Search bar with 350 ms debounce
- Infinite scroll — next page is fetched when you near the bottom
- Pull-to-refresh to re-fetch the first page
- Tap any card to navigate to the detail screen
- **Categories** button in the header navigates to Screen 2

**Screen 2 – Browse by Category** (`src/screens/CategoriesScreen.tsx`)

- Fetches the full category list from the DummyJSON categories endpoint
- Tapping a category pre-fills the catalog search and returns you to the list
- Error state with a retry button

**Screen 3 – Product Detail** (`src/screens/ProductDetailScreen.tsx`)

- Displays thumbnail, title, description, category, price, rating, and stock
- Product is read from Redux state so it is available offline if it was previously fetched

---

## How to Run

### 1. Install JS dependencies

```sh
npm install
```

### 2. iOS — install CocoaPods

```sh
cd ios
bundle install
bundle exec pod install
cd ..
```

### 3. Android — configure the SDK path

The Android build requires a `local.properties` file (not committed to git) that
points to your Android SDK.

**Option A – create the file manually**

```sh
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
```

Adjust the path for your OS:

| OS        | Typical path                                |
|-----------|---------------------------------------------|
| macOS     | `$HOME/Library/Android/sdk`                 |
| Linux     | `$HOME/Android/Sdk`                         |
| Windows   | `C:\\Users\\<user>\\AppData\\Local\\Android\\Sdk` |

**Option B – set an environment variable**

```sh
export ANDROID_HOME=$HOME/Library/Android/sdk   # macOS example
```

### 4. Start Metro bundler

```sh
npm start
```

### 5. Run the app

```sh
# Android (requires a running emulator or connected device)
npm run android

# iOS (requires Xcode and a simulator)
npm run ios
```

---

## Project Structure

```
App.tsx                         # Bootstrap + hydration gate
src/
  api/
    productsApi.ts              # Products fetch helper (DummyJSON)
    categoriesApi.ts            # Categories fetch helper (DummyJSON)
  hooks/
    useCatalogPersistence.ts    # Lifecycle-aware persistence hook
  navigation/
    AppNavigator.tsx            # Stack navigator wiring
    types.ts                    # Typed route param list
  screens/
    ProductListScreen.tsx       # Screen 1: catalog + search
    CategoriesScreen.tsx        # Screen 2: browse by category
    ProductDetailScreen.tsx     # Screen 3: product detail
  store/
    catalogSlice.ts             # Products Redux slice (async thunk, pagination)
    categoriesSlice.ts          # Categories Redux slice
    store.ts                    # Store configuration
    hooks.ts                    # Typed useSelector / useDispatch
    storage.ts                  # AsyncStorage read/write helpers
    types.ts                    # CatalogState / PersistedCatalogState types
  types/
    product.ts                  # Product & API response interfaces
```

---

## Key Technical Decisions

| Decision | Rationale |
|---|---|
| **Redux Toolkit** | Removes boilerplate; `createAsyncThunk` handles the loading/error lifecycle cleanly without manual action types |
| **Normalised entity map** | Products stored as `{ ids[], entities{} }` so detail lookup is O(1) regardless of list size |
| **Pagination as page number** | Simple, stateless, and lets us reconstruct full state from persisted data after an app restart |
| **Debounced search** | Avoids a network request on every keystroke; 350 ms is below the threshold of feeling laggy |
| **Hydration gate** | `AppShell` blocks render until AsyncStorage is loaded, preventing a flash of empty state |
| **AppState listener + debounced write** | Catalog is written to disk on background/inactive transitions *and* debounced after each Redux state change — no data loss even if the app is force-quit |
| **`replace` flag on fetch** | Lets the same thunk handle both a fresh search and pagination, keeping the API layer thin |
| **No third-party UI libs** | All components are core React Native (`FlatList`, `Pressable`, `TextInput`, `ScrollView`, …) |
| **TypeScript throughout** | Typed navigation params, typed Redux hooks, and typed API responses eliminate an entire class of runtime errors |

---

## Improvements with More Time

- **Images on the list card** — render `product.thumbnail` in the card using an `Image` component with a fixed aspect ratio; currently omitted to keep the list performant on first render
- **Offline-first error state** — show stale data when the network is unavailable instead of an error banner
- **Search history** — persist recent queries in AsyncStorage and suggest them in a dropdown
- **Category persistence** — persist the category list alongside the catalog state so categories are available offline
- **Unit tests** — slice reducers and async thunks are pure enough to test with Jest + `@reduxjs/toolkit`'s `configureStore`
- **E2E tests** — Detox integration for the happy-path flows (open, search, navigate to detail)
- **Pull-to-refresh on categories** — currently categories are cached for the session; adding a pull-to-refresh would let users get an updated list
