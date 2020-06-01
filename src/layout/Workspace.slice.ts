import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../app/store';

import { StorableShape, frame, Shape } from '../components/Shape.util';
import { areIntersected, Rectangle, Point, normilizeRectangle } from '../util/geometry';


const LS_KEY_OBJECTS = 'objects';
const BOUNCE_DELAY_FOR_SAVING = 5000; // ms

const savedData = window.localStorage.getItem(LS_KEY_OBJECTS);
const savedObjects = savedData ? JSON.parse(savedData) as StorableShape[] : [];

const objects: StorableShape[] = savedObjects.map(properties => ({
    ...properties,
    selected: false,
}));

const initialState = {
    objects,
    workspaceSize: undefined as undefined | Shape['size'],
    workspacePosition: undefined as undefined | Point,
    selectedObjects: [] as number[],
    lastColor: undefined as undefined | string,
    lastBorderColor: undefined as undefined | string,
    nonCompleteSelectedObjects: [] as number[],
    nonCompleteUnselectedObjects: [] as number[],
    previousCursorPositionOnMoving: undefined as undefined | [number, number],
    firstCursorPositionOnSelecting: undefined as undefined | [number, number],
    saved: true,
    saveTimoutId: undefined as undefined | number,
    selectionFrame: undefined as undefined | Rectangle,
};

const getActualSlectionList = (state: RootState['workspace']) => {
    const {
        selectedObjects,
        nonCompleteSelectedObjects,
        nonCompleteUnselectedObjects,
    } = state;

    const actualSelectedObjects = [...selectedObjects];

    if (nonCompleteSelectedObjects.length) {
        actualSelectedObjects.push(...nonCompleteSelectedObjects);
    }

    if (nonCompleteUnselectedObjects.length) {
        for (const unselected of nonCompleteUnselectedObjects) {
            delete actualSelectedObjects[actualSelectedObjects.indexOf(unselected)];
        }
    }

    return actualSelectedObjects.filter(a => a !== undefined);
};

export const workspaceSlice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        setWorkspaceProperties(state, { payload }: PayloadAction<{ size: Shape['size'], position: Point }>) {
            state.workspacePosition = payload.position;
            state.workspaceSize = payload.size;
        },

        setColor(state, { payload: color }: PayloadAction<string>) {
            for (const i of state.selectedObjects) {
                state.objects[i].color = color;
            }

            state.lastColor = color;
        },

        setBorderColor(state, { payload: color }: PayloadAction<string>) {
            for (const i of state.selectedObjects) {
                state.objects[i].border.color = color;
            }

            state.lastBorderColor = color;
        },

        create(state, { payload: shape }: PayloadAction<Shape>) {
            const { workspaceSize } = state;

            if (workspaceSize) {
                state.objects.push({
                    ...shape,
                    position: [
                        workspaceSize.width / 2 - shape.size.width / 2,
                        workspaceSize.height / 2 - shape.size.height / 2,
                    ],
                });
    
                state.selectedObjects = [state.objects.length - 1];
            }
        },

        select(state, { payload: index }: PayloadAction<number>) {
            if (!state.selectedObjects.includes(index)) {
                state.selectedObjects.push(index);
            }
        },

        unselectAll(state) {
            state.selectedObjects = [];
        },

        selectAll(state) {
            state.selectedObjects = [];

            for (const [i, object] of state.objects.entries()) {
                if (!object) {
                    continue;
                }

                state.selectedObjects.push(i);
            }
        },

        deleteSelected(state) {
            for (const i of state.selectedObjects) {
                delete state.objects[i];
                // NOTE: Use delete operator only,
                // because the index uses as key
                // for instance of React-component.
            }

            state.selectedObjects = [];
        },

        mouseDownOnObject(
            state,
            action: PayloadAction<{
                objectIndex: number
                x: number
                y: number
                shiftKey: boolean
            }>
        ) {
            const { payload: { objectIndex, x, y, shiftKey } } = action;

            state.previousCursorPositionOnMoving = [x, y];

            if (shiftKey) {
                const position = state.selectedObjects.indexOf(objectIndex);

                if (position === -1) {
                    state.selectedObjects.push(objectIndex);
                } else {
                    state.selectedObjects = [
                        ...state.selectedObjects.slice(0, position),
                        ...state.selectedObjects.slice(position + 1),
                    ];
                }
            } else {
                if (!state.selectedObjects.includes(objectIndex)) {
                    state.selectedObjects = [objectIndex];
                }
            }
        },

        mouseDownOnWorkspace(
            state,
            action: PayloadAction<{
                point: Point,
                shiftKey: boolean,
            }>
        ) {
            // Selecting:
            if (state.workspacePosition) {
                const framePoint: Point = [
                    action.payload.point[0] - state.workspacePosition[0],
                    action.payload.point[1] - state.workspacePosition[1],
                ];

                state.selectionFrame = [framePoint, framePoint];
                state.firstCursorPositionOnSelecting = action.payload.point;

                if (!action.payload.shiftKey) {
                    state.selectedObjects = [];
                }
            }
        },

        mouseUpOrMoveOnWorkspace(
            state,
            { payload }: PayloadAction<{
                type: 'up' | 'move'
                currentCursorPosition: Point
                shiftKey: boolean
            } | {
                type: 'shiftToggled'
                shiftKey: boolean
            }>
        ) {
            const {
                previousCursorPositionOnMoving,
                firstCursorPositionOnSelecting,
                selectedObjects,
            } = state;

            const { shiftKey } = payload;

            // Moving:
            if (payload.type === 'move' && previousCursorPositionOnMoving) {
                const { currentCursorPosition } = payload;
                const previous = previousCursorPositionOnMoving;

                for (const i of state.selectedObjects) {
                    for (const coordinate of [0, 1]) {
                        const offset = currentCursorPosition[coordinate] - previous[coordinate];

                        state.objects[i].position[coordinate] += offset;
                    }
                }

                state.previousCursorPositionOnMoving = currentCursorPosition;
            }

            // Selecting:
            if (firstCursorPositionOnSelecting && state.workspacePosition && state.selectionFrame) {
                if (payload.type !== 'shiftToggled') {
                    const { currentCursorPosition } = payload;

                    state.selectionFrame = normilizeRectangle([
                        [
                            firstCursorPositionOnSelecting[0] - state.workspacePosition[0],
                            firstCursorPositionOnSelecting[1] - state.workspacePosition[1],
                        ],
                        [
                            currentCursorPosition[0] - state.workspacePosition[0],
                            currentCursorPosition[1] - state.workspacePosition[1],
                        ],
                    ]);
                }

                state.nonCompleteSelectedObjects = [];
                state.nonCompleteUnselectedObjects = [];

                const {
                    nonCompleteSelectedObjects,
                    nonCompleteUnselectedObjects,
                } = state;

                for (const [i, object] of state.objects.entries()) {
                    if (!object) {
                        continue;
                    }

                    if (areIntersected(frame(object), state.selectionFrame)) {
                        if (shiftKey) {
                            if (selectedObjects.includes(i)) {
                                if (!nonCompleteUnselectedObjects.includes(i)) {
                                    nonCompleteUnselectedObjects.push(i);
                                }
                            } else {
                                if (!nonCompleteSelectedObjects.includes(i)) {
                                    nonCompleteSelectedObjects.push(i);
                                }
                            }
                        } else {
                            if (!selectedObjects.includes(i)) {
                                if (!nonCompleteSelectedObjects.includes(i)) {
                                    nonCompleteSelectedObjects.push(i);
                                }
                            }
                        }
                    }
                }

                state.nonCompleteSelectedObjects = nonCompleteSelectedObjects.filter(a => a !== undefined);
                state.nonCompleteUnselectedObjects = nonCompleteUnselectedObjects.filter(a => a !== undefined);
            }

            // End:
            if (payload.type === 'up') {
                const { currentCursorPosition } = payload;

                const cursorNotMoved = (
                    firstCursorPositionOnSelecting?.[0] === currentCursorPosition[0]
                    && firstCursorPositionOnSelecting?.[1] === currentCursorPosition[1]
                );

                if (cursorNotMoved) {
                    state.selectedObjects = [];
                } else {
                    state.selectedObjects = getActualSlectionList(state);
                }

                state.nonCompleteSelectedObjects = [];
                state.nonCompleteUnselectedObjects = [];
                state.previousCursorPositionOnMoving = undefined;
                state.firstCursorPositionOnSelecting = undefined;
                state.selectionFrame = undefined;
            }
        },

        save(state) {
            if (state.saveTimoutId) {
                window.clearTimeout(state.saveTimoutId);
                state.saveTimoutId = undefined;
            }

            state.saved = true;

            const notDeletedObjects = state.objects.filter(value => value);
            window.localStorage.setItem(LS_KEY_OBJECTS, JSON.stringify(notDeletedObjects));
        },

        setSaveTimeout(state, { payload: timeoutId }: PayloadAction<number>) {
            if (state.saveTimoutId) {
                window.clearTimeout(state.saveTimoutId);
            }

            state.saveTimoutId = timeoutId;
            state.saved = false;
        },
    },
});

export const {
    setWorkspaceProperties,
    create,
    select,
    unselectAll,
    selectAll,
    deleteSelected,
    mouseDownOnObject,
    mouseDownOnWorkspace,
    mouseUpOrMoveOnWorkspace,
    save,
    setColor,
    setBorderColor,
    setSaveTimeout,
} = workspaceSlice.actions;

export const saveWithBounce = (): AppThunk => dispatch => {
    const timeoutId = window.setTimeout(() => {
        dispatch(save());
    }, BOUNCE_DELAY_FOR_SAVING);

    dispatch(setSaveTimeout(timeoutId));
};

export const withBouncedSave = (action: PayloadAction<unknown>): AppThunk => dispatch => {
    dispatch(action);
    dispatch(saveWithBounce());
};

export function selectWorkspace(state: RootState) {
    return {
        ...state.workspace,
        selectedObjects: getActualSlectionList(state.workspace),
    };
}

export default workspaceSlice.reducer;
