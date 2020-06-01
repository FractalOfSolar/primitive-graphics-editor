export type Point = [number, number];
export type Rectangle = [ Point, Point ];

const minAndMax = (...[a, b]: number[]) => [
    Math.min(a, b),
    Math.max(a, b),
]

export function areIntersected(...[r1, r2]: Rectangle[]): boolean {
    const [left1, right1] = minAndMax(r1[0][0], r1[1][0]);
    const [top1, bottom1] = minAndMax(r1[0][1], r1[1][1]);
    
    const [left2, right2] = minAndMax(r2[0][0], r2[1][0]);
    const [top2, bottom2] = minAndMax(r2[0][1], r2[1][1]);

    return left1 <= right2
        && left2 <= right1
        && top1 <= bottom2
        && top2 <= bottom1;
}

export function normilizeRectangle(rectangle: Rectangle): Rectangle {
    return [
        [
            Math.min(rectangle[0][0], rectangle[1][0]),
            Math.min(rectangle[0][1], rectangle[1][1]),
        ],
        [
            Math.max(rectangle[0][0], rectangle[1][0]),
            Math.max(rectangle[0][1], rectangle[1][1]),
        ],
    ];
}
