import React from 'react';

import Polygon, { Props as PolygonProps } from './Polygon';
import { SelectableShape } from './Shape.util';
import styles from "./Shape.module.css";
import { SPACE } from '../util/symbols';


export interface Props extends SelectableShape {
    /**
     * Value of CSS `border` property. Example: `2px blue dashed`.
     */
    selectionFrameStyle?: string

    /**
     * See `eventHandlers` in `Props` from `components/polygon.tsx`.
     */
    eventHandlers?: PolygonProps['eventHandlers']
}

export default function Shape({
    type,
    size: { width, height },
    border,
    color,
    selected,
    selectionFrameStyle,
    eventHandlers
}: Props) {
    let margin: number | undefined;

    if (selectionFrameStyle) {
        // Get border weight of selection frame:
        const regexResult = /(\d)+px/.exec(selectionFrameStyle);
        const selectionFrameWidth = regexResult?.[1];
        
        // Compensate frame border via margin to prevent size changing:
        margin = selectionFrameWidth ? -selectionFrameWidth : undefined;
    }

    return (
        <div
            className={[styles.container, (selected ? styles.selected : '')].join(SPACE)}
            style={!selected ? undefined : {
                border: selectionFrameStyle,
                margin
            }}
        >
            <Polygon
                boxWidth={width}
                boxHeight={height}
                angles={type === 'rectangle' ? 4 : 3}
                style={{
                    fill: color,
                    strokeWidth: border.width,
                    stroke: border.color
                }}
                eventHandlers={eventHandlers}
            />
        </div>
    );
}
