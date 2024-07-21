function evaluatePowerEstimation(powerEstimationRSquared: number) {
    if (powerEstimationRSquared < 0.3) {
        return "insufficiently";
    }

    if (powerEstimationRSquared < 0.8) {
        return "sufficiently";
    }

    return "well";
}

export { evaluatePowerEstimation };
