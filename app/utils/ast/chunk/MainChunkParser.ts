import type { VariableInfo } from "ts-api-utils";
import { ChunkParser } from "./ChunkParser";
import { CacheGetter, Cache } from "../../decorators";

export class MainChunkParser extends ChunkParser {
    constructor(text: string) {
        super(text);
    }

    @CacheGetter()
    get __webpack_require__(): VariableInfo | undefined {
        for (const [ident, info] of this.vars) {
            if (ident.text === "__webpack_require__") {
                return info;
            }
        }
    }

    @Cache()
    getJsChunkHashes(): string[] {
        return [];
    }
}
