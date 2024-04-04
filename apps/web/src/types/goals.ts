export enum GoalState {
    GOOD,
    IN_DANGER,
    EXCEEDED
}

export class GoalStatus {
    readonly goalValue: number;
    readonly currentValue: number;
    readonly state: GoalState;
    readonly goalName: string;
    readonly progress: number;

    constructor(goalValue: number, currentValue: number, state: GoalState, goalName: string) {
        if (currentValue < 0) {
            throw new Error("Current value must be greater than 0");
        }

        if (goalValue < 0) {
            throw new Error("Goal value must be greater than 0");
        }

        if (state === GoalState.EXCEEDED && currentValue < goalValue) {
            throw new Error("Current value must be greater than or equal to the goal value when the state is EXCEEDED");
        }

        if (state !== GoalState.EXCEEDED && currentValue >= goalValue) {
            throw new Error("Current value must be less than the goal value when the state is not EXCEEDED");
        }

        this.goalValue = goalValue;
        this.currentValue = currentValue;
        this.state = state;
        this.goalName = goalName;
        this.progress = currentValue >= goalValue ? 100 : (currentValue / goalValue) * 100;
    }
}