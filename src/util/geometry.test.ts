import 'jest';

import { areIntersected, normilizeRectangle, Rectangle } from './geometry';


test(`${areIntersected.name}()`, () => {
    const firstRectangle: Rectangle = [
        [0, 0],
        [5, 5],
    ];
    
    const rectangleIntersectedWithFirst: Rectangle = [
        [3, 3],
        [9, 9],
    ];

    const rectangleNotIntersectedWithFirst1: Rectangle = [
        [6, 6],
        [9, 9],
    ];

    const rectangleNotIntersectedWithFirst2: Rectangle = [
        [2, 6],
        [3, 9],
    ];

    const rectangleNotIntersectedWithFirst3: Rectangle = [
        [6, 2],
        [9, 3],
    ];

    expect(areIntersected(firstRectangle, rectangleIntersectedWithFirst)).toBe(true);
    expect(areIntersected(firstRectangle, rectangleIntersectedWithFirst)).toBe(true);
    expect(areIntersected(firstRectangle, rectangleNotIntersectedWithFirst1)).toBe(false);
    expect(areIntersected(firstRectangle, rectangleNotIntersectedWithFirst2)).toBe(false);
    expect(areIntersected(firstRectangle, rectangleNotIntersectedWithFirst3)).toBe(false);

    expect(areIntersected([[18, 63], [98, 103]], [[3, 10], [140, 153]])).toBe(true);
});


test(`${normilizeRectangle.name}()`, () => {
    const normilizedRectangle: Rectangle = [
        [1, 2],
        [5, 6],
    ];

    const sameUnnormalizedRectangle: Rectangle = [
        [5, 2],
        [1, 6],
    ];

    const sameUnnormalizedRectangle2: Rectangle = [
        [5, 6],
        [1, 2],
    ];

    expect(normilizeRectangle(normilizedRectangle)).toEqual(normilizedRectangle);
    expect(normilizeRectangle(sameUnnormalizedRectangle)).toEqual(normilizedRectangle);
    expect(normilizeRectangle(sameUnnormalizedRectangle2)).toEqual(normilizedRectangle);
});
