export enum GoalState {
    GOOD,
    IN_DANGER,
    EXCEEDED
}

export interface Goal {
    goalValue: number;
    currentValue: number;
    state: GoalState;
    goalName: string;
}