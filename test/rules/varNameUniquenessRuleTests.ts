/// <reference path='../references.ts' />

describe("<varnameuniqueness>", () => {
    it("ensures there is not more than one var declaration with the same name in a single scope", () => {
        var fileName = "rules/varnameuniqueness.test.ts";
        var failureString = Lint.Rules.VarNameUniquenessRule.FAILURE_STRING;

        var createFailure = Lint.Test.createFailuresOnFile(fileName, failureString);
        var expectedFailures = [
            createFailure([18, 13], [18, 23]),
            createFailure([33, 9], [33, 19])
        ];

        var actualFailures = Lint.Test.applyRuleOnFile(fileName, "varnameuniqueness");
        Lint.Test.assertFailuresEqual(actualFailures, expectedFailures);
    });
});
