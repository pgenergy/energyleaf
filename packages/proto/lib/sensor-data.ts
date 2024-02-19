// @generated by protobuf-ts 2.9.3
// @generated from protobuf file "sensor-data.proto" (syntax proto3)
// tslint:disable
import type {
    BinaryReadOptions,
    BinaryWriteOptions,
    IBinaryReader,
    IBinaryWriter,
    PartialMessage,
} from "@protobuf-ts/runtime";
import { MessageType, reflectionMergePartial, UnknownFieldHandler, WireType } from "@protobuf-ts/runtime";

/**
 * @generated from protobuf message ELData
 */
export interface ELData {
    /**
     * @generated from protobuf field: string sensorId = 1;
     */
    sensorId: string;
    /**
     * @generated from protobuf field: float sensorValue = 2;
     */
    sensorValue: number;
}
// @generated message type with reflection information, may provide speed optimized methods
class ELData$Type extends MessageType<ELData> {
    constructor() {
        super("ELData", [
            { no: 1, name: "sensorId", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "sensorValue", kind: "scalar", T: 2 /*ScalarType.FLOAT*/ },
        ]);
    }
    create(value?: PartialMessage<ELData>): ELData {
        const message = globalThis.Object.create(this.messagePrototype!);
        message.sensorId = "";
        message.sensorValue = 0;
        if (value !== undefined) reflectionMergePartial<ELData>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ELData): ELData {
        let message = target ?? this.create(),
            end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string sensorId */ 1:
                    message.sensorId = reader.string();
                    break;
                case /* float sensorValue */ 2:
                    message.sensorValue = reader.float();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(
                            `Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`,
                        );
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ELData, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string sensorId = 1; */
        if (message.sensorId !== "") writer.tag(1, WireType.LengthDelimited).string(message.sensorId);
        /* float sensorValue = 2; */
        if (message.sensorValue !== 0) writer.tag(2, WireType.Bit32).float(message.sensorValue);
        let u = options.writeUnknownFields;
        if (u !== false) (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message ELData
 */
export const ELData = new ELData$Type();
