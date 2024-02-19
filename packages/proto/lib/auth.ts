// @generated by protobuf-ts 2.9.3
// @generated from protobuf file "auth.proto" (syntax proto3)
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
}
/**
 * @generated from protobuf message TokenResponse
 */
export interface TokenResponse {
    /**
     * @generated from protobuf field: string access_token = 1;
     */
    accessToken: string;
    /**
     * @generated from protobuf field: uint32 expires_in = 2;
     */
    expiresIn: number;
}
// @generated message type with reflection information, may provide speed optimized methods
class TokenRequest$Type extends MessageType<TokenRequest> {
    constructor() {
        super("TokenRequest", [{ no: 1, name: "client_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ }]);
    }
    create(value?: PartialMessage<TokenRequest>): TokenRequest {
        const message = globalThis.Object.create(this.messagePrototype!);
        message.clientId = "";
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
            { no: 1, name: "access_token", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "expires_in", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
        ]);
    }
    create(value?: PartialMessage<TokenResponse>): TokenResponse {
        const message = globalThis.Object.create(this.messagePrototype!);
        message.accessToken = "";
        message.expiresIn = 0;
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
                case /* string access_token */ 1:
                    message.accessToken = reader.string();
                    break;
                case /* uint32 expires_in */ 2:
                    message.expiresIn = reader.uint32();
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
        /* string access_token = 1; */
        if (message.accessToken !== "") writer.tag(1, WireType.LengthDelimited).string(message.accessToken);
        /* uint32 expires_in = 2; */
        if (message.expiresIn !== 0) writer.tag(2, WireType.Varint).uint32(message.expiresIn);
        let u = options.writeUnknownFields;
        if (u !== false) (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message TokenResponse
 */
export const TokenResponse = new TokenResponse$Type();
