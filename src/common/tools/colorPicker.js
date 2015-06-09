var colorPicker = {
    
    start: function() {
        $("#main-canvas").css("cursor", "crosshair");
    },
    
    mouseDown: function($scope) {
        var x = $scope.config.mouse.current.x - canvasLocationX;
        var y = $scope.config.mouse.current.y - canvasLocationY;
        
        var value = $scope.renderEngine.getPixelColor(x, y);
        
        /* Write color to config. */
        $scope.config.tools.colors.primary.r = value[0];
        $scope.config.tools.colors.primary.g = value[1];
        $scope.config.tools.colors.primary.b = value[2];
    },
    
    mouseUp: function($scope) {
    },
    
    mouseMove: function($scope) {    
        // TODO call mouseDown
    },
}