import { configureStore, ThunkAction, Action, combineReducers } from '@reduxjs/toolkit';
import workspaceReducer from '../layout/Workspace.slice';


const rootReducer = combineReducers({
    workspace: workspaceReducer,
});

export const store = configureStore({
    reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
