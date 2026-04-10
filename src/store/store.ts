import { configureStore } from '@reduxjs/toolkit';

import catalogReducer from './catalogSlice';
import categoriesReducer from './categoriesSlice';

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    categories: categoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
