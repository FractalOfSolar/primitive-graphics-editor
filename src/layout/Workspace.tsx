import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Shape from '../components/Shape';

import {
    selectWorkspace,
    setWorkspaceProperties,
    unselectAll,
    deleteSelected,
    mouseDownOnObject,
    mouseUpOrMoveOnWorkspace,
    mouseDownOnWorkspace,
    selectAll,
    saveWithBounce,
    save,
} from './Workspace.slice';
import styles from './Workspace.module.css';


export default function Workspace() {
    const {
        selectionFrame,
        previousCursorPositionOnMoving,
        firstCursorPositionOnSelecting,
        objects,
        selectedObjects,
    } = useSelector(selectWorkspace);
    const dispatch = useDispatch();

    const workspaceDomElement = useRef<HTMLDivElement>(null);
    const offsetWidth = workspaceDomElement.current?.offsetWidth;
    const offsetHeight = workspaceDomElement.current?.offsetHeight;

    useEffect(() => {
        if (workspaceDomElement.current) {
            const {
                offsetWidth: width,
                offsetHeight: height,
                offsetLeft,
                offsetTop,
            } = workspaceDomElement.current;

            const onWindowResize = () => {
                dispatch(setWorkspaceProperties({
                    size: { width, height },
                    position: [offsetLeft, offsetTop],
                }));
            };

            onWindowResize();

            window.addEventListener('resize', onWindowResize);

            return () => {
                window.removeEventListener('resize', onWindowResize);
            };
        }
    }, [offsetWidth, offsetHeight, dispatch]);

    useEffect(() => {
        const keyboardEventHandler = (event: KeyboardEvent) => {
            if (event.type === 'keydown') {
                if (event.code === 'Escape') {
                    dispatch(unselectAll());
                } else if (event.code === 'Delete' || event.code === 'Backspace') {
                    dispatch(deleteSelected());
                } else if (event.code === 'KeyA' && event.ctrlKey && !event.altKey && !event.shiftKey) {
                    dispatch(selectAll());
                } else if (event.key === 'Shift') {
                    dispatch(mouseUpOrMoveOnWorkspace({
                        type: 'shiftToggled',
                        shiftKey: true,
                    }));
                }
            } else if (event.type === 'keyup') {
                if (event.key === 'Shift') {
                    dispatch(mouseUpOrMoveOnWorkspace({
                        type: 'shiftToggled',
                        shiftKey: false,
                    }));
                }
            }
        };

        document.addEventListener('keydown', keyboardEventHandler);
        document.addEventListener('keyup', keyboardEventHandler);

        return () => {
            document.removeEventListener('keydown', keyboardEventHandler);
            document.removeEventListener('keyup', keyboardEventHandler);
        };
    }, [dispatch]);

    useEffect(() => {
        const visibilityChangeHandler = () => {
            if (document.visibilityState === 'hidden') {
                dispatch(save());
            }
        };

        const windowCloseHandler = () => {
            dispatch(save());
        }

        document.addEventListener("visibilitychange", visibilityChangeHandler);
        window.addEventListener('close', windowCloseHandler);

        return () => {
            document.removeEventListener("visibilitychange", visibilityChangeHandler);
            window.removeEventListener('close', windowCloseHandler);
        };
    }, [dispatch])

    return (
        <div
            className={styles.container}
            ref={workspaceDomElement}
            onMouseDown={event => {
                const { clientX, clientY, shiftKey } = event;
                
                if (workspaceDomElement.current) {
                    dispatch(mouseDownOnWorkspace({
                        point: [clientX, clientY],
                        shiftKey,
                    }));
                }
            }}
            onMouseUp={({ clientX, clientY, shiftKey }) => {
                dispatch(mouseUpOrMoveOnWorkspace({
                    type: 'up',
                    currentCursorPosition: [clientX, clientY],
                    shiftKey
                }));
            }}
            onMouseMove={({ clientX, clientY, shiftKey }) => {
                if (previousCursorPositionOnMoving || firstCursorPositionOnSelecting) {
                    dispatch(mouseUpOrMoveOnWorkspace({
                        type: 'move',
                        currentCursorPosition: [clientX, clientY],
                        shiftKey
                    }));

                    if (previousCursorPositionOnMoving) {
                        dispatch(saveWithBounce());
                    }
                }
            }}
        >
            { objects.map((object, key) => object &&
                <div
                    key={key}
                    className={styles.placedShapeContainer}
                    style={{ left: object.position[0], top: object.position[1] }}
                >
                    <Shape
                        {...object}
                        selected={selectedObjects.includes(key)}
                        eventHandlers={{
                            onMouseDown: (event) => {
                                const { clientX: x, clientY: y, shiftKey } = event;

                                event.stopPropagation();

                                dispatch(mouseDownOnObject({
                                    objectIndex: key,
                                    x,
                                    y,
                                    shiftKey,
                                }));
                            },
                        }}
                    />
                </div>
            ) }
            { selectionFrame &&
                <div
                    className={styles.selectionFrame}
                    style={{
                        left: selectionFrame[0][0],
                        top: selectionFrame[0][1],
                        width: selectionFrame[1][0] - selectionFrame[0][0],
                        height: selectionFrame[1][1] - selectionFrame[0][1],
                    }}
                />
            }
        </div>
    );
}
