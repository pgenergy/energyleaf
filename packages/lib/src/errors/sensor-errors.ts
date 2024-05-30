export class SensorAlreadyExistsError extends Error {
    macAddress: string;

    constructor(macAddress: string) {
        super(`The sensor with the MAC address ${macAddress} already exists`);
        this.macAddress = macAddress;
    }
}

export class UserHasSensorOfSameType extends Error {
    userId: string;
    sensorType: string;

    constructor(userId: string, sensorType: string) {
        super(`The user with ID ${userId} already has a sensor of type ${sensorType}`);
        this.userId = userId;
        this.sensorType = sensorType;
    }
}
