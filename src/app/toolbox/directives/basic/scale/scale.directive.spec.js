describe("The scale directive controller", function() {
    beforeEach(module('ariana'));

    var $controller, $scope;

    beforeEach(inject(
        function(_$controller_, _$rootScope_) {
            $scope = _$rootScope_.$new();

            _$controller_("AppCtrl", {$scope: $scope});
            _$controller_("ToolboxCtrl", {$scope: $scope});
            $controller = _$controller_("ScaleCtrl", {$scope: $scope});
        })
    );

    describe("initial state", function() {
        it("should not be undefined", function() {
            expect($controller).not.toBeUndefined();
        });
    });

    describe("default variable", function() {
        it("toolname should match", function() {
            expect($scope.toolname).toEqual('scale');
        });
        it("tool should be active", function() {
            expect($scope.active).toBe(false);
        });
    });

    describe("init", function() {
        it("changes active state", function() {
            $scope.active = true;

            it("should not change cursor", function() {
                $scope.init();
                expect($scope.getCursor()).toEqual('default');
            });

            it("should change tool functions", function() {
                $scope.init();
                expect($scope.getActiveToolFunctions().mouseDown).toBe($scope.mouseDown());
                expect($scope.getActiveToolFunctions().mouseUp).toBe($scope.mouseUp());
                expect($scope.getActiveToolFunctions().mouseMove).toBe($scope.mouseMove());
            });
        });
    });

});