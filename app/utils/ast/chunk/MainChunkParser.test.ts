import { assert, describe, expect, it } from "vitest";
import { makeGetFile } from "../testingUtil";
import { MainChunkParser } from "./MainChunkParser";
import { pick } from "../util";

const getFile = makeGetFile(import.meta.dirname);
describe(
    "MainChunkParser",
    {
        timeout: 20_000
    },
    function () {
        function commonTests(parser: MainChunkParser) {
            it("locates __webpack_require__", function () {
                const n = parser.__webpack_require__;
                expect(n
                    ?.declarations
                    .map(parser.makeRangeFromAstNode.bind(parser))
                )
                .toMatchSnapshot();
            })
            it("locates __webpack_modules__", function () {
                const n = parser.__webpack_modules__;
                expect(n
                    ?.declarations
                    .map(parser.makeRangeFromAstNode.bind(parser))
                )
                .toMatchSnapshot();
            })
            it("gets js chunk hashes", function () {
                const hashes = parser.getJsChunkHashes();
                expect(hashes.toSorted()).toMatchSnapshot();
            });
            it("gets all initial module text", function () {
                const moduleMap = parser.getDefinedModules();
                assert(moduleMap);
                const keys = Object.keys(moduleMap);
                const numEntries = parser.getModuleObject()?.properties.length;
                expect(keys.length, "An entry was missed").to.equal(numEntries);
                expect(keys).toMatchSnapshot();
            });
        }
        const fullParser = new MainChunkParser(getFile("fullWeb.js"));
        const partParser = new MainChunkParser(getFile("partWeb.js"));
        describe("with partial file", function () {
            const parser = partParser;
            commonTests(parser);
        })
        describe("with full file", function () {
            const parser = fullParser;
            commonTests(parser);
        });
        describe("fullFile results are the same as partFile results", function () {
            it("js chunk hashes match", function () {
                const full = fullParser.getJsChunkHashes().toSorted();
                const part = partParser.getJsChunkHashes().toSorted();
                expect(full).to.deep.equal(part);
            })
        })
    }
);
