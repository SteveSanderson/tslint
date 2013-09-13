var notDuplicated;

class Test {
    // This is not considered a duplicate because it's a member variable, not a local variable
    public someFunc;

    private myFunc() {
        var notDuplicated = 123,
            duplicated = 234,
            someFunc = () => {
                var notDuplicated = 345;
            },
            container = {
                item1: function() { var notDuplicated; },
                item2: function() { var notDuplicated; }
            };

        var duplicated = 1;
    }

    constructor() {
        var notDuplicated;
    }
}

function test() {
    var notDuplicated = 123,
        duplicated = 234,
        someFunc = () => {
            var notDuplicated = 345;
        };

    var duplicated = 1;

    try {
        notDuplicated++;
    } catch {
        var notDuplicated; // Catch blocks have new scope
    }
}
