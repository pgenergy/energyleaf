export enum TrendModes {
    UP = "up",
    DOWN = "down",
    RIGHT = "right",
}

export function getTrendMode(prevValue: number, newValue: number): TrendModes {
    if (prevValue < newValue) {
        return TrendModes.UP;
    }

    if (prevValue > newValue) {
        return TrendModes.DOWN;
    }

    return TrendModes.RIGHT;
}
