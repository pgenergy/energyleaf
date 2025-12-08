export function uint8ArrayToBuffer(data: Uint8Array<ArrayBufferLike>) {
	return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}
