import { Rectangle } from "../util/geometry";


export interface Shape {
    type: 'rectangle' | 'triangle'

    size: {
        width: number
        height: number
    }

    color?: string

    border: {
        width: number
        color?: string
    }
}

export interface StorableShape extends Shape {
    position: [number, number]
}

export interface SelectableShape extends Shape {
    selected: boolean
}

/**
 * Return shape coordinates as rectangle.
 */
export function frame(shape: StorableShape): Rectangle {
    return [
        [
            shape.position[0],
            shape.position[1],
        ],
        [
            shape.position[0] + shape.size.width,
            shape.position[1] + shape.size.height,
        ],
    ];
}
