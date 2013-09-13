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
        private nodeStack: TypeScript.SyntaxNode[] = [];

        public visitNode(node: TypeScript.SyntaxNode): void {
            var isNewScope = this.isScopeBoundary(node);

            if (isNewScope) {
                this.scopeStack.push(new ScopeInfo());
            }
            
            this.nodeStack.push(node);
            super.visitNode(node);
            this.nodeStack.pop();

            if (isNewScope) {
                this.scopeStack.pop();
            }
        }

        public visitVariableDeclarator(node: TypeScript.VariableDeclaratorSyntax): void {
            var identifier = node.identifier,
                variableName = identifier.text(),
                position = this.position() + identifier.leadingTriviaWidth(),
                currentScope = this.scopeStack[this.scopeStack.length - 1],
                variableDeclaratorParentNode = this.nodeStack[this.nodeStack.length - 2],
                isMemberVariable = variableDeclaratorParentNode instanceof TypeScript.MemberVariableDeclarationSyntax;

            // Skip member variables because, even though they are VariableDeclaratorSyntax nodes, they are
            // not introduced using "var xyz" syntax in the code, and hence are not what we're looking for.
            if (currentScope && !isMemberVariable) {
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
                || node instanceof TypeScript.ModuleDeclarationSyntax
                || node instanceof TypeScript.ConstructorDeclarationSyntax
                || node instanceof TypeScript.FunctionExpressionSyntax;
        }
    }

    class ScopeInfo {
        public varNames: string[] = [];
    }
}
