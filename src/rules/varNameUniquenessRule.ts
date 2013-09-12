/// <reference path='rule.ts'/>
/// <reference path='abstractRule.ts'/>

module Lint.Rules {

    export class VarNameUniquenessRule extends AbstractRule {
        public static FAILURE_STRING = "variable names must be unique within their scope";

        public apply(syntaxTree: TypeScript.SyntaxTree): RuleFailure[] {
            return this.applyWithWalker(new VarNameUniquenessWalker(syntaxTree));
        }
    }

    class VarNameUniquenessWalker extends Lint.RuleWalker {
        private scopeStack: ScopeInfo[] = [];

        public visitNode(node: TypeScript.SyntaxNode): void {
            var isNewScope = this.isScopeBoundary(node);

            if (isNewScope) {
                this.scopeStack.push(new ScopeInfo());
            }
            
            super.visitNode(node);

            if (isNewScope) {
                this.scopeStack.pop();
            }
        }

        public visitVariableDeclarator(node: TypeScript.VariableDeclaratorSyntax): void {
            var identifier = node.identifier,
                variableName = identifier.text(),
                position = this.position() + identifier.leadingTriviaWidth(),
                currentScope = this.scopeStack[this.scopeStack.length - 1];

            if (currentScope) {
                if (currentScope.varNames.indexOf(variableName) >= 0) {
                    this.addFailure(this.createFailure(position, identifier.width(), VarNameUniquenessRule.FAILURE_STRING));
                } else {
                    currentScope.varNames.push(variableName);
                }
            }

            super.visitVariableDeclarator(node);
        }

        private isScopeBoundary(node: TypeScript.SyntaxNode): boolean {
            return node instanceof TypeScript.FunctionDeclarationSyntax
                || node instanceof TypeScript.MemberFunctionDeclarationSyntax
                || node instanceof TypeScript.SimpleArrowFunctionExpressionSyntax
                || node instanceof TypeScript.ParenthesizedArrowFunctionExpressionSyntax
                || node instanceof TypeScript.ModuleDeclarationSyntax;
        }
    }

    class ScopeInfo {
        public varNames: string[] = [];
    }
}
