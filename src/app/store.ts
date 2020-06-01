import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import workspaceReducer from '../layout/Workspace.slice';


export const store = configureStore({
    reducer: {
        workspace: workspaceReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
