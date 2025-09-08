import type { VariableInfo } from "ts-api-utils";
import { ChunkParser } from "./ChunkParser";
import { CacheGetter, Cache } from "../../decorators";
import {Logger} from "../../Logger";
import { isArrowFunction, isElementAccessExpression, isNumericLiteral, isObjectLiteralExpression, isPropertyAccessExpression, isPropertyAssignment, isStringLiteralLike, isVariableDeclaration, NodeFlags, type Expression, type ObjectLiteralElementLike, type ObjectLiteralExpression, type PropertyName } from "typescript";
import type { Functionish } from "../types";
import type { HashMapEntry } from "./types";
import { nonNullish } from "../../array";
import { findParent, lastChild } from "../util";

const logger = new Logger("MainChunkParser");

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

    @CacheGetter()
    get __webpack_modules__(): VariableInfo | undefined {
        for (const [ident, info] of this.vars) {
            if (ident.text === "__webpack_modules__") {
                return info;
            }
        }
    }

    @Cache()
    public getJsChunkHashes(): HashMapEntry[] {
        const uses = this.__webpack_require__?.uses;

        if (!uses) {
            return [];
        }

        let uFunc: Functionish;

        foundU: {
            for (const {location: {parent}} of uses) {
                if (!isPropertyAccessExpression(parent)) {
                    continue;
                }
                // webpack js chunk name->id function
                if (parent.name.text !== "u") {
                    continue;
                }
                const maybeAssign = parent.parent;
                if(!this.isAssignmentExpression(maybeAssign)) {
                    continue;
                }
                if (!this.isFunctionish(maybeAssign.right)) {
                    continue;
                }
                uFunc = maybeAssign.right;
                break foundU;
            }
            return [];
        }

        if (!isArrowFunction(uFunc)) {
            logger.warn("u is not an arrow function");
            return [];
        }
        const ret = uFunc.body;

        // expect body to be BinExp>[BinExp>["" + {id:hash}[id]] + ".js"]
        if (!this.isBinaryPlusExpression(ret)) {
            logger.warn("u body is not a binary plus expression");
            return [];
        }
        const concatWithHashMap = ret.left;
        if (!this.isBinaryPlusExpression(concatWithHashMap)) {
            logger.warn("u body left is not a binary plus expression");
            return [];
        }
        // {id:hash}[id]
        const hashMapAccess = concatWithHashMap.right;
        if (!isElementAccessExpression(hashMapAccess)) {
            logger.warn("expected element access expression");
            return [];
        }

        let hashMap = lastChild(hashMapAccess.expression, isObjectLiteralExpression);
        if (!hashMap) {
            logger.warn("expected object literal expression");
            return [];
        }

        return hashMap
            .properties
            .map(this.parseHashMapEntry.bind(this))
            .filter(nonNullish);
    }


    /**
     * used to parse map in main chunk and chunk id in lazy chunk
     */
    protected tryParseHashMapKey(node: PropertyName): string | undefined {
        return this.tryParseStringOrNumberLiteral(node);
    }

    private tryParseHashMapValue(node: Expression): string | undefined {
        if (isStringLiteralLike(node)) {
            return node.text;
        }
        return;
    }

    private parseHashMapEntry(node: ObjectLiteralElementLike): HashMapEntry | undefined {
        if (!isPropertyAssignment(node)) {
            logger.warn("Only property assignments are supported in hash map entries");
            return;
        }
        const id = this.tryParseHashMapKey(node.name);
        if (!id) {
            logger.warn("Could not parse hash map entry id");
            return;
        }
        const hash = this.tryParseHashMapValue(node.initializer);
        if(!hash) {
            logger.warn("Could not parse hash map entry hash");
            return;
        }
        return [id, hash];
    }

    @Cache()
    public override getModuleObject(): ObjectLiteralExpression | undefined {
        const wpModules = this.__webpack_modules__;
        if (!wpModules) {
            logger.warn("Could not find __webpack_modules__");
            return;
        }
        const decls = wpModules.declarations;
        if (decls.length !== 1) {
            logger.warn("Expected exactly one __webpack_modules__ declaration");
            return;
        }
        const wpModulesDecl = findParent(decls[0], isVariableDeclaration)?.initializer;
        if (!wpModulesDecl || !isObjectLiteralExpression(wpModulesDecl)) {
            logger.warn("Could not find __webpack_modules__ object literal");
            return;
        }
        return wpModulesDecl;
    }
}
