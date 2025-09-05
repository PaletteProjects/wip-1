import { describe, expect, it } from "vitest";
import { makeGetFile } from "../testingUtil";
import { GlobalEnvParser } from "./GlobalEnvParser";

const getFile = makeGetFile(import.meta.dirname);

describe("GlobalEnvParser", () => {
    it("parses an example discord buildenv correctly", () => {
        const parser = new GlobalEnvParser(getFile("exampleEnv.js"));
        const env = parser.getGlobalEnvObject();
        expect(env).toMatchSnapshot();
    })
});
