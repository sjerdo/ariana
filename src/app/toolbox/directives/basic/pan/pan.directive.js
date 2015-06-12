angular.module('ariana').directive('pan', function() {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'app/toolbox/directives/basic/pan/pan.tpl.html',
        controller: 'PanCtrl',
    };
});

angular.module('ariana').controller('PanCtrl', function($scope) {
	$scope.toolname = 'pan'
	$scope.active = $scope.config.tools.activeTool == $scope.toolname;

	/* init */
	$scope.init = function() {
		$scope.setCursor('grab');
		$scope.panning = false;
	};

	/* onMouseDown */
	$scope.mouseDown = function() {
		$scope.setCursor('grabbing');
		$scope.panning = true;
	};

	/* onMouseUp */
	$scope.mouseUp = function() {
		$scope.setCursor('grab');
		$scope.panning = false;
	};

	/* onMouseMove */
	$scope.mouseMove = function() {
		if (!$scope.panning) return;
		 
		var dx = $scope.config.mouse.current.x - $scope.config.mouse.old.x,
        	dy = $scope.config.mouse.current.y - $scope.config.mouse.old.y;

        $scope.config.mouse.old.x += dx;
        $scope.config.mouse.old.y += dy;
        
        $scope.config.canvas.x += dx;
        $scope.config.canvas.y += dy;
	};
-
	/*
	 * This will watch for this tools' "active" variable changes.
	 * When "active" changes to "true", this tools functions need to
	 * be registered to the global config.
	 * This functions NEEDS to be in each tools controller for
	 * the tool to function. Please assign the correct toolfunctions
	 * to the "activeToolFunctions" object.
	 * Always call "init" first;
	 */
	$scope.$watch('active', function(nval, oval) {
		if (nval)  {
			$scope.init();

			$scope.config.tools.activeToolFunctions = {
				mouseDown: $scope.mouseDown,
				mouseUp: $scope.mouseUp,
				mouseMove: $scope.mouseMove
			};
		}
	}, true);
});