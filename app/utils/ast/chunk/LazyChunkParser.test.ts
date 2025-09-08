import { describe, expect, it } from "vitest";
import { makeGetFile } from "../testingUtil";
import { LazyChunkParser } from "./LazyChunkParser";

const getFile = makeGetFile(import.meta.dirname);

describe("LazyChunkParser", function () {
    // Add your tests here
    it("gets modules from a lazy chunk", function () {
        const parser = new LazyChunkParser(getFile("lazyChunk.js"));
        const modules = parser.getDefinedModules();
        expect(modules).toMatchSnapshot();
    })
    it("gets chunk id from a lazy chunk", function () {
        const parser = new LazyChunkParser(getFile("lazyChunk.js"));
        const chunkId = parser.chunkId;
        expect(chunkId).toMatchSnapshot();
    });
});
