import React from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';

import {
    create,
    selectWorkspace,
    setColor,
    setBorderColor,
    withBouncedSave,
} from './Workspace.slice';
import { Shape as ShapeInterface } from '../components/Shape.util';
import Shape from '../components/Shape';
import styles from './SidePanel.module.css';
import { SPACE } from '../util/symbols';


const SHAPE_TYPES: Array<ShapeInterface['type']> = ['rectangle', 'triangle'];

const SHAPE_SIZE = {
    width: 80,
    height: 40,
};

const SHAPE_BORDER = {
    width: 3,
    color: '#818181',
};

const SHAPE_COLOR = '#EAEAEA';

const SELECTION_FRAME_STYLE = '2px dashed #2F80ED';

const SHAPE_VARIANTS: ShapeInterface[] = SHAPE_TYPES.map(type => ({
    type,
    size: SHAPE_SIZE,
    color: SHAPE_COLOR,
    border: SHAPE_BORDER,
}));


export default function SidePanel() {
    const dispatch = useAppDispatch();
    const {
        workspaceSize,
        saved,
        objects,
        selectedObjects,
        lastColor,
        lastBorderColor,
    } = useAppSelector(selectWorkspace);
    
    return (
        <div className={styles.container}>
            <div className={[styles.block, styles.blockShapes].join(SPACE)}>
                <h2>Shapes</h2>
                <div className={styles.shapes}>
                    {
                        SHAPE_VARIANTS.map(shape => (
                            <Shape
                                key={shape.type}
                                {...shape}
                                selectionFrameStyle={SELECTION_FRAME_STYLE}
                                selected={false}
                                eventHandlers={{
                                    onClick: () => {
                                        if (workspaceSize) {
                                            dispatch(withBouncedSave(create({
                                                ...shape,
                                                color: lastColor || SHAPE_COLOR,
                                                border: {
                                                    ...shape.border,
                                                    color: lastBorderColor || SHAPE_BORDER.color,
                                                }
                                            })));
                                        }
                                    },
                                }}
                            />
                        ))
                    }
                </div>
            </div>
            <div className={[styles.block, styles.blockStyle].join(SPACE)}>
                <h2>Style</h2>
                <div className={[styles.property, styles.propertyFill].join(SPACE)}>
                    <h3>Fill</h3>
                    <input
                        type="color"
                        value={selectedObjects.length === 0 ? '#000000' : objects[selectedObjects[0]].color}
                        disabled={selectedObjects.length === 0}
                        onChange={event => {
                            dispatch(withBouncedSave(setColor(event.target.value)));
                        }}
                    />
                </div>
                <div className={[styles.property, styles.propertyBorder].join(SPACE)}>
                    <h3>Border</h3>
                    <input
                        type="color"
                        value={selectedObjects.length === 0 ? '#000000' : objects[selectedObjects[0]].border.color}
                        disabled={selectedObjects.length === 0}
                        onChange={event => {
                            dispatch(withBouncedSave(setBorderColor(event.target.value)));
                        }}
                    />
                </div>
            </div>
            <div className={[styles.block, styles.savingStatus].join(SPACE)}>
                { saved
                    ? "Saved 👌"
                    : "Saving... 😉"
                }
            </div>
        </div>
    );
}
