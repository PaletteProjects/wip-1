import { isNumericLiteral, isPropertyAssignment, isStringLiteralLike, type Expression, type ObjectLiteralElementLike, type PropertyName } from "typescript";
import { AstParser } from "../AstParser";
import type { HashMapEntry } from "./types";
import { Logger } from "../../Logger";

const logger = new Logger("ChunkParser");

export class ChunkParser extends AstParser {
    protected constructor(text: string) {
        super(text);
    }

}
