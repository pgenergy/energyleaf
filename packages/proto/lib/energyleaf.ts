// @generated by protobuf-ts 2.9.3
// @generated from protobuf file "energyleaf.proto" (syntax proto3)
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
 * @generated from protobuf message TokenRequest
 */
export interface TokenRequest {
    /**
     * @generated from protobuf field: string client_id = 1;
     */
    clientId: string;
    /**
     * @generated from protobuf field: SensorType type = 2;
     */
    type: SensorType;
}
/**
 * @generated from protobuf message TokenResponse
 */
export interface TokenResponse {
    /**
     * @generated from protobuf field: optional string access_token = 1;
     */
    accessToken?: string;
    /**
     * @generated from protobuf field: optional uint32 expires_in = 2;
     */
    expiresIn?: number; // in seconds (look documentation for correct value)
    /**
     * @generated from protobuf field: uint32 status = 3;
     */
    status: number; // In range of 200-299 correct, else bad
    /**
     * @generated from protobuf field: optional string status_message = 4;
     */
    statusMessage?: string;
    /**
     * @generated from protobuf field: optional string script = 5;
     */
    script?: string;
    /**
     * @generated from protobuf field: optional uint32 analog_rotation_per_kwh = 6;
     */
    analogRotationPerKwh?: number;
}
/**
 * @generated from protobuf message SensorDataRequest
 */
export interface SensorDataRequest {
    /**
     * @generated from protobuf field: string access_token = 1;
     */
    accessToken: string;
    /**
     * @generated from protobuf field: SensorType type = 2;
     */
    type: SensorType;
    /**
     * @generated from protobuf field: float value = 3;
     */
    value: number;
}
/**
 * @generated from protobuf message SensorDataResponse
 */
export interface SensorDataResponse {
    /**
     * @generated from protobuf field: uint32 status = 1;
     */
    status: number; // In range of 200-299 correct, else bad
    /**
     * @generated from protobuf field: optional string status_message = 2;
     */
    statusMessage?: string;
}
/**
 * @generated from protobuf message ScriptAcceptedRequest
 */
export interface ScriptAcceptedRequest {
    /**
     * @generated from protobuf field: string access_token = 1;
     */
    accessToken: string;
}
/**
 * @generated from protobuf message ScriptAcceptedResponse
 */
export interface ScriptAcceptedResponse {
    /**
     * @generated from protobuf field: uint32 status = 1;
     */
    status: number; // In range of 200-299 correct, else bad
    /**
     * @generated from protobuf field: optional string status_message = 2;
     */
    statusMessage?: string;
}
/**
 * @generated from protobuf enum SensorType
 */
export enum SensorType {
    /**
     * @generated from protobuf enum value: ANALOG_ELECTRICITY = 0;
     */
    ANALOG_ELECTRICITY = 0,
    /**
     * @generated from protobuf enum value: DIGITAL_ELECTRICITY = 1;
     */
    DIGITAL_ELECTRICITY = 1,
    /**
     * @generated from protobuf enum value: GAS = 2;
     */
    GAS = 2,
    /**
     * @generated from protobuf enum value: WATER = 3;
     */
    WATER = 3,
}
// @generated message type with reflection information, may provide speed optimized methods
class TokenRequest$Type extends MessageType<TokenRequest> {
    constructor() {
        super("TokenRequest", [
            { no: 1, name: "client_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "type", kind: "enum", T: () => ["SensorType", SensorType] },
        ]);
    }
    create(value?: PartialMessage<TokenRequest>): TokenRequest {
        const message = globalThis.Object.create(this.messagePrototype!);
        message.clientId = "";
        message.type = 0;
        if (value !== undefined) reflectionMergePartial<TokenRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(
        reader: IBinaryReader,
        length: number,
        options: BinaryReadOptions,
        target?: TokenRequest,
    ): TokenRequest {
        let message = target ?? this.create(),
            end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string client_id */ 1:
                    message.clientId = reader.string();
                    break;
                case /* SensorType type */ 2:
                    message.type = reader.int32();
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
    internalBinaryWrite(message: TokenRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string client_id = 1; */
        if (message.clientId !== "") writer.tag(1, WireType.LengthDelimited).string(message.clientId);
        /* SensorType type = 2; */
        if (message.type !== 0) writer.tag(2, WireType.Varint).int32(message.type);
        let u = options.writeUnknownFields;
        if (u !== false) (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message TokenRequest
 */
export const TokenRequest = new TokenRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TokenResponse$Type extends MessageType<TokenResponse> {
    constructor() {
        super("TokenResponse", [
            { no: 1, name: "access_token", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "expires_in", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
            { no: 3, name: "status", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 4, name: "status_message", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "script", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 6, name: "analog_rotation_per_kwh", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
        ]);
    }
    create(value?: PartialMessage<TokenResponse>): TokenResponse {
        const message = globalThis.Object.create(this.messagePrototype!);
        message.status = 0;
        if (value !== undefined) reflectionMergePartial<TokenResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(
        reader: IBinaryReader,
        length: number,
        options: BinaryReadOptions,
        target?: TokenResponse,
    ): TokenResponse {
        let message = target ?? this.create(),
            end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* optional string access_token */ 1:
                    message.accessToken = reader.string();
                    break;
                case /* optional uint32 expires_in */ 2:
                    message.expiresIn = reader.uint32();
                    break;
                case /* uint32 status */ 3:
                    message.status = reader.uint32();
                    break;
                case /* optional string status_message */ 4:
                    message.statusMessage = reader.string();
                    break;
                case /* optional string script */ 5:
                    message.script = reader.string();
                    break;
                case /* optional uint32 analog_rotation_per_kwh */ 6:
                    message.analogRotationPerKwh = reader.uint32();
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
    internalBinaryWrite(message: TokenResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* optional string access_token = 1; */
        if (message.accessToken !== undefined) writer.tag(1, WireType.LengthDelimited).string(message.accessToken);
        /* optional uint32 expires_in = 2; */
        if (message.expiresIn !== undefined) writer.tag(2, WireType.Varint).uint32(message.expiresIn);
        /* uint32 status = 3; */
        if (message.status !== 0) writer.tag(3, WireType.Varint).uint32(message.status);
        /* optional string status_message = 4; */
        if (message.statusMessage !== undefined) writer.tag(4, WireType.LengthDelimited).string(message.statusMessage);
        /* optional string script = 5; */
        if (message.script !== undefined) writer.tag(5, WireType.LengthDelimited).string(message.script);
        /* optional uint32 analog_rotation_per_kwh = 6; */
        if (message.analogRotationPerKwh !== undefined)
            writer.tag(6, WireType.Varint).uint32(message.analogRotationPerKwh);
        let u = options.writeUnknownFields;
        if (u !== false) (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message TokenResponse
 */
export const TokenResponse = new TokenResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SensorDataRequest$Type extends MessageType<SensorDataRequest> {
    constructor() {
        super("SensorDataRequest", [
            { no: 1, name: "access_token", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "type", kind: "enum", T: () => ["SensorType", SensorType] },
            { no: 3, name: "value", kind: "scalar", T: 2 /*ScalarType.FLOAT*/ },
        ]);
    }
    create(value?: PartialMessage<SensorDataRequest>): SensorDataRequest {
        const message = globalThis.Object.create(this.messagePrototype!);
        message.accessToken = "";
        message.type = 0;
        message.value = 0;
        if (value !== undefined) reflectionMergePartial<SensorDataRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(
        reader: IBinaryReader,
        length: number,
        options: BinaryReadOptions,
        target?: SensorDataRequest,
    ): SensorDataRequest {
        let message = target ?? this.create(),
            end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string access_token */ 1:
                    message.accessToken = reader.string();
                    break;
                case /* SensorType type */ 2:
                    message.type = reader.int32();
                    break;
                case /* float value */ 3:
                    message.value = reader.float();
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
    internalBinaryWrite(message: SensorDataRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string access_token = 1; */
        if (message.accessToken !== "") writer.tag(1, WireType.LengthDelimited).string(message.accessToken);
        /* SensorType type = 2; */
        if (message.type !== 0) writer.tag(2, WireType.Varint).int32(message.type);
        /* float value = 3; */
        if (message.value !== 0) writer.tag(3, WireType.Bit32).float(message.value);
        let u = options.writeUnknownFields;
        if (u !== false) (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message SensorDataRequest
 */
export const SensorDataRequest = new SensorDataRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SensorDataResponse$Type extends MessageType<SensorDataResponse> {
    constructor() {
        super("SensorDataResponse", [
            { no: 1, name: "status", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 2, name: "status_message", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
        ]);
    }
    create(value?: PartialMessage<SensorDataResponse>): SensorDataResponse {
        const message = globalThis.Object.create(this.messagePrototype!);
        message.status = 0;
        if (value !== undefined) reflectionMergePartial<SensorDataResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(
        reader: IBinaryReader,
        length: number,
        options: BinaryReadOptions,
        target?: SensorDataResponse,
    ): SensorDataResponse {
        let message = target ?? this.create(),
            end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* uint32 status */ 1:
                    message.status = reader.uint32();
                    break;
                case /* optional string status_message */ 2:
                    message.statusMessage = reader.string();
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
    internalBinaryWrite(
        message: SensorDataResponse,
        writer: IBinaryWriter,
        options: BinaryWriteOptions,
    ): IBinaryWriter {
        /* uint32 status = 1; */
        if (message.status !== 0) writer.tag(1, WireType.Varint).uint32(message.status);
        /* optional string status_message = 2; */
        if (message.statusMessage !== undefined) writer.tag(2, WireType.LengthDelimited).string(message.statusMessage);
        let u = options.writeUnknownFields;
        if (u !== false) (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message SensorDataResponse
 */
export const SensorDataResponse = new SensorDataResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ScriptAcceptedRequest$Type extends MessageType<ScriptAcceptedRequest> {
    constructor() {
        super("ScriptAcceptedRequest", [{ no: 1, name: "access_token", kind: "scalar", T: 9 /*ScalarType.STRING*/ }]);
    }
    create(value?: PartialMessage<ScriptAcceptedRequest>): ScriptAcceptedRequest {
        const message = globalThis.Object.create(this.messagePrototype!);
        message.accessToken = "";
        if (value !== undefined) reflectionMergePartial<ScriptAcceptedRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(
        reader: IBinaryReader,
        length: number,
        options: BinaryReadOptions,
        target?: ScriptAcceptedRequest,
    ): ScriptAcceptedRequest {
        let message = target ?? this.create(),
            end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string access_token */ 1:
                    message.accessToken = reader.string();
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
    internalBinaryWrite(
        message: ScriptAcceptedRequest,
        writer: IBinaryWriter,
        options: BinaryWriteOptions,
    ): IBinaryWriter {
        /* string access_token = 1; */
        if (message.accessToken !== "") writer.tag(1, WireType.LengthDelimited).string(message.accessToken);
        let u = options.writeUnknownFields;
        if (u !== false) (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message ScriptAcceptedRequest
 */
export const ScriptAcceptedRequest = new ScriptAcceptedRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ScriptAcceptedResponse$Type extends MessageType<ScriptAcceptedResponse> {
    constructor() {
        super("ScriptAcceptedResponse", [
            { no: 1, name: "status", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 2, name: "status_message", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
        ]);
    }
    create(value?: PartialMessage<ScriptAcceptedResponse>): ScriptAcceptedResponse {
        const message = globalThis.Object.create(this.messagePrototype!);
        message.status = 0;
        if (value !== undefined) reflectionMergePartial<ScriptAcceptedResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(
        reader: IBinaryReader,
        length: number,
        options: BinaryReadOptions,
        target?: ScriptAcceptedResponse,
    ): ScriptAcceptedResponse {
        let message = target ?? this.create(),
            end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* uint32 status */ 1:
                    message.status = reader.uint32();
                    break;
                case /* optional string status_message */ 2:
                    message.statusMessage = reader.string();
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
    internalBinaryWrite(
        message: ScriptAcceptedResponse,
        writer: IBinaryWriter,
        options: BinaryWriteOptions,
    ): IBinaryWriter {
        /* uint32 status = 1; */
        if (message.status !== 0) writer.tag(1, WireType.Varint).uint32(message.status);
        /* optional string status_message = 2; */
        if (message.statusMessage !== undefined) writer.tag(2, WireType.LengthDelimited).string(message.statusMessage);
        let u = options.writeUnknownFields;
        if (u !== false) (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message ScriptAcceptedResponse
 */
export const ScriptAcceptedResponse = new ScriptAcceptedResponse$Type();
