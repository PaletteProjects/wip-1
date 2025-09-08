import { ChunkParser } from "./ChunkParser";
import { Logger } from "../../Logger";
import { isArrayLiteralExpression, isCallExpression, isExpressionStatement, isObjectLiteralExpression, isPropertyAccessExpression, type Expression, type ObjectLiteralExpression } from "typescript";
import { TAssert } from "../webpack/util";
import { error } from "../util";
import {Cache, CacheGetter} from "../../decorators";

const logger = Logger.create("LazyChunkParser");

export class LazyChunkParser extends ChunkParser {
    public constructor(text: string) {
        super(text);
    }


    @CacheGetter()
    private get pushCall() {
        const topLevelStatments = this.sourceFile.statements.filter(stmt => this.isDirective(stmt) === false);
        if (topLevelStatments.length !== 1) {
            logger.error("expected exactly one top-level statement in lazy chunk");
            return;
        }
        const [stmt] = topLevelStatments;
        if (!isExpressionStatement(stmt)) {
            logger.error("expected top-level statement to be an expression statement");
            return;
        }
        const { expression: call } = stmt;
        if (!isCallExpression(call)) {
            logger.error("expected top-level statement to be a call expression");
            return;
        }

        const { arguments: args, expression: funcExpr } = call;
        // ensure push call
        {
            if (!isPropertyAccessExpression(funcExpr)) {
                logger.error("expected call expression to be a property access expression");
                return;
            }

            const {expression: _pushToGlobal, name: pushIdent} = funcExpr;
            if (!pushIdent) {
                logger.error("failed to parse push call expression");
                return;
            }
            if (pushIdent.text !== "push") {
                logger.error(`expected push call expression to be a push call, got ${pushIdent.text}`);
                return;
            }
        }
        if (args.length !== 1) {
            logger.error("expected push call to have exactly one argument");
            return;
        }
        return call;
    }

    @Cache()
    private assertOneEntry(): [Expression, Expression] {
        const [arg] = this.pushCall?.arguments ?? [];
        if (!arg || !isArrayLiteralExpression(arg)) {
            error("expected push call argument to be an array literal");
        }
        const { elements } = arg;
        if (elements.length !== 2) {
            error("expected push call array literal to have exactly two elements");
        }
        const [idTuple, modulesObj] = elements;
        return [idTuple, modulesObj];
    }

    @CacheGetter()
    get chunkId(): string | undefined {
        const [idTuple] = this.assertOneEntry();
        if (!idTuple) {
            logger.error("failed to find id tuple in push call");
            return;
        }
        if (!isArrayLiteralExpression(idTuple)) {
            logger.error("expected id tuple to be an array literal");
            return;
        }
        const [idExpr] = idTuple.elements;
        const id = this.tryParseStringOrNumberLiteral(idExpr);
        if (id == null) {
            logger.error("expected id to be a string or number literal");
            return;
        }
        return String(id);
    }

    @Cache()
    public override getModuleObject(): ObjectLiteralExpression | undefined {
        const [, modulesArg] = this.assertOneEntry();
        if (!modulesArg) {
            logger.error("failed to find modules argument in push call");
            return;
        }
        if (!isObjectLiteralExpression(modulesArg)) {
            logger.error("expected modules argument to be an object literal");
            return;
        }
        return modulesArg;
    }
}
