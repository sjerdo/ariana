/*
 * Project Ariana
 * toolbox.logic.js
 *
 * This file contains the ToolboxCtrl, which controls the behaviour of
 * the toolbox and the color preview. 
 *
 */

app.controller('ToolboxCtrl', function($scope) {
    
    $scope.setCursor = function(cursor) {
        $scope.config.canvas.cursor = cursor;
    };

    $scope.getCursor = function() {
        return $scope.config.canvas.cursor;
    };

    /* This function swaps the primary and secondary color. */
    $scope.swapColors = function() {
        var temp = $scope.config.tools.colors.primary;
        $scope.config.tools.colors.primary = $scope.config.tools.colors.secondary;
        $scope.config.tools.colors.secondary = temp;
        $scope.$broadcast('swapColorsBC', {});
    };
    
    $scope.checkVisible = function() {
        return (!($scope.config.mouse.button[1] || $scope.config.mouse.button[2] || $scope.config.mouse.button[3]));
    };

    $scope.isActive = function(name) {
        return $scope.config.tools.activeTool == name;
    };

    $scope.isActiveToolset = function(name) {
        return $scope.config.tools.activeToolset == name;
    };

    /* This function selects a toolset and therefore opens a toolbox. When
     * a toolset is already selected, it becomes unselected. The pan tool will
     * then be used. */
    $scope.selectToolSet = function(name) {
        if ($scope.config.tools.activeToolset == name) {
            $scope.config.tools.activeToolset = null;
            return true;
        }

        $scope.config.tools.activeToolset = name;
    };

    $scope.selectTool = function(event, name) {
        if (event) {
            event.stopPropagation();
        }
        
        $scope.config.tools.activeTool = name;
        return true;
    };

    $scope.getActiveToolFunctions = function() {
        return $scope.config.tools.activeToolFunctions;
    }
});
