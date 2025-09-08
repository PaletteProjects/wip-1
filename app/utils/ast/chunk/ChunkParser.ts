import { isNumericLiteral, isPropertyAssignment, isStringLiteralLike, type Expression, type ObjectLiteralElementLike, type ObjectLiteralExpression, type PropertyName } from "typescript";
import { AstParser } from "../AstParser";
import type { HashMapEntry, ModuleEntry } from "./types";
import { Logger } from "../../Logger";
import { Cache, CacheGetter } from "../../decorators";
import { fromEntries, nonNullish } from "~/utils/array";

const logger = Logger.create("ChunkParser");

export abstract class ChunkParser extends AstParser {
    constructor(text: string) {
        super(text);
    }

    abstract getModuleObject(): ObjectLiteralExpression | undefined;

    private tryParseChunkEntry(entry: ObjectLiteralElementLike): ModuleEntry | undefined {
        const moduleId = this.tryParseStringOrNumberLiteral(entry.name);
        if (!moduleId) {
            logger.warn("Failed to parse module id from chunk entry");
            return;
        }
        if (!isPropertyAssignment(entry)) {
            logger.warn("Chunk entry is not a property assignment");
            return;
        }
        const moduleValue = entry.initializer;
        if (!this.isFunctionish(moduleValue)) {
            logger.warn(`Chunk entry value is not a function-like expression (module id: ${moduleId})`);
            return;
        }
        return [moduleId, moduleValue.getText()];
    }

    @Cache()
    public getDefinedModules(): Record<string, string> | undefined {
        return this
            .getModuleObject()
            ?.properties
            .map(this.tryParseChunkEntry.bind(this))
            .filter(nonNullish)
            .reduce(fromEntries<string, string>, {});
    }
}
