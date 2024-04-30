import { configureStore } from '@reduxjs/toolkit';
import alertReducer from './reducers/alertReducer';
import containerReducer from './reducers/containerReducer';
import imageReducer from './reducers/imageReducer';
import logReducer from './reducers/logReducer';
import configurationReducer from './reducers/configurationReducer';
import volumeReducer from './reducers/volumeReducer';
import networkReducer from './reducers/networkReducer';
import pruneReducer from './reducers/pruneReducer';

const store = configureStore({
  reducer: {
    containers: containerReducer,
    images: imageReducer,
    volumes: volumeReducer,
    logs: logReducer,
    alerts: alertReducer,
    networks: networkReducer,
    pruneNetwork: pruneReducer,
    configuration: configurationReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;

// grabbing type of state returned from the reducer and setting that equal to RootState
// RootState is used to dynamically change the type of the hooks
export type RootState = ReturnType<typeof store.getState>;

export default store;



