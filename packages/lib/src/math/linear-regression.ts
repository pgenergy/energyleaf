import { type MathJsInstance, type Matrix, all, create } from "mathjs";

export function linearRegression(A: (1 | 0)[][], b: number[][]) {
    const math = create(all, {});
    const AMatrix = math.matrix(A);
    const bMatrix = math.matrix(b);

    const solution = solveLeastSquaresProblem(math, AMatrix, bMatrix);
    const rSquared = calculateRSquared(math, AMatrix, bMatrix, solution);

    return {
        solution: solution.toArray() as number[][],
        rSquared,
    };
}

function solveLeastSquaresProblem(math: MathJsInstance, AMatrix: Matrix, bMatrix: Matrix) {
    const At = math.transpose(AMatrix);
    const AtA = math.multiply(At, AMatrix);
    const Atb = math.multiply(At, bMatrix);
    return math.lusolve(AtA, Atb);
}

function calculateRSquared(math: MathJsInstance, AMatrix: Matrix, bMatrix: Matrix, solution: Matrix) {
    const residuals = math.subtract(bMatrix, math.multiply(AMatrix, solution));
    const subtraction = math.subtract(bMatrix, math.mean(bMatrix)) as Matrix;
    const SST = math.sum(math.map(subtraction, math.square));
    const SSR = math.sum(math.map(residuals, math.square));
    if (SST === 0) {
        return SSR === 0 ? 1 : 0;
    }
    return math.subtract(1, math.divide(SSR, SST)) as number;
}
