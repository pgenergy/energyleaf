export class SensorAlreadyExistsError extends Error {
    macAddress: string;

    constructor(macAddress: string) {
        super(`The sensor with the MAC address ${macAddress} already exists`);
        this.macAddress = macAddress;
    }
}
