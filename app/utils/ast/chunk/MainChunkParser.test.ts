import { assert, describe, expect, it } from "vitest";
import { makeGetFile } from "../testingUtil";
import { MainChunkParser } from "./MainChunkParser";

const getFile = makeGetFile(import.meta.dirname);
describe("MainChunkParser", function () {
    const parser = new MainChunkParser(getFile("fullWeb.js"));
    it("locates __webpack_require__", function () {
        const n = parser.__webpack_require__;
        expect(n).to.not.be.undefined;
    })
});
