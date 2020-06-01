import React from 'react';
import './Polygon.module.css';


export interface Props {
    boxWidth: number
    boxHeight: number
    angles: 3 | 4
    
    /**
     * NOTE: `style.strokeWidth` will be set to `0` if not provided.
     * Provide `strokeWidth` here, because other CSS rules will be overridden.
     */
    style?: React.CSSProperties

    /**
     * Only `svg` events can be observed.
     * 
     * Event handlers will attach to inside `polygon` element to save its shape
     * for events.
     */
    eventHandlers?: React.SVGProps<SVGPolygonElement>
}

export default function Polygon({ boxWidth, boxHeight, angles, style, eventHandlers }: Props) {
    style = {
        strokeWidth: 0,
        ...style,
    };
    
    const strokeWidth = style.strokeWidth as number;

    const halfOfStroke = strokeWidth / 2;
    const limitedWidth = boxWidth - halfOfStroke;
    const limitedHeight = boxHeight - halfOfStroke;

    const polygonPoints = (angles === 3) ? (`
        ${boxWidth / 2},${halfOfStroke}
        ${limitedWidth},${limitedHeight}
        ${halfOfStroke},${limitedHeight}
    `) : (`
        ${halfOfStroke},${halfOfStroke}
        ${limitedWidth},${halfOfStroke}
        ${limitedWidth},${limitedHeight}
        ${halfOfStroke},${limitedHeight}
    `);

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={String(boxWidth)}
            height={String(boxHeight)}
            viewBox={`0 0 ${boxWidth} ${boxHeight}`}
            style={style}
        >
            <polygon
                points={polygonPoints}
                {...eventHandlers}
            />
        </svg>
    );
}
