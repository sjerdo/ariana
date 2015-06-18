app.directive('scale', function() {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: 'app/toolbox/directives/basic/scale/scale.tpl.html',
		controller: 'ScaleCtrl'
	};
});

app.controller('ScaleCtrl', function($scope) {
	$scope.toolname = 'scale';
	$scope.active = $scope.config.tools.activeTool == $scope.toolname;
    $scope.cursorTypes = ["e-resize", "ne-resize", "n-resize", "nw-resize", "w-resize",
                          "sw-resize", "s-resize", "se-resize", "e-resize"];

    $scope.sign = function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
    
	/* init */
	$scope.init = function() {
        $scope.scaling = false;
	};

	/* onMouseDown */
	$scope.mouseDown = function() {
        $scope.scaling = true;
	};

	/* onMouseUp */
	$scope.mouseUp = function() {
        $scope.scaling = false;
	};

	/* onMouseMove */
	$scope.mouseMove = function() {
        
		var mouseCurrentX = $scope.config.mouse.current.x;
        var mouseCurrentY = $scope.config.mouse.current.y; 

        var mouseOldX = $scope.config.mouse.old.x;
        var mouseOldY = $scope.config.mouse.old.y; 

        var currentLayer = $scope.config.layers.currentLayer;
        if (currentLayer == -1) return;

        var layer = $scope.renderEngine.getLayer(currentLayer);

        var x = layer.getPosX();
        var y = layer.getPosY();

        var angle = (Math.atan2(y - mouseCurrentY, mouseCurrentX - x) + 2 * Math.PI) % (2 * Math.PI);
        
        if ($scope.scaling) {

	        var width  = layer.getWidth();
	        var height = layer.getHeight();

            var newWidth = width;
            var newHeight = height;

            var xScaleFactor, yScaleFactor;

	        if ($scope.scaleToolIndex != 2 && $scope.scaleToolIndex != 6) {
                xScaleFactor = (mouseCurrentX - mouseOldX ) / (mouseOldX - x) + 1;

                if (xScaleFactor && isFinite(xScaleFactor)) {
                    newWidth *= xScaleFactor;
                }
                else if (isNaN(xScaleFactor)) {
                    newWidth *= -1;
                }
                else if (!isFinite(xScaleFactor)) {
                    newWidth *= Math.sign(xScaleFactor);
                }
	        }
	        
	        if ($scope.scaleToolIndex != 0 && $scope.scaleToolIndex != 4) {
                yScaleFactor = (mouseCurrentY - mouseOldY ) / (mouseOldY - y) + 1;

                if (yScaleFactor && isFinite(yScaleFactor)) {
                    newHeight *= yScaleFactor;
                }
                else if (isNaN(yScaleFactor)) {
                    newHeight *= -1;
                }
                else if (!isFinite(yScaleFactor)) {
                    newHeight *= Math.sign(yScaleFactor);
                }
	        }

	        layer.setWidth(newWidth);
	        layer.setHeight(newHeight);

            window.requestAnimationFrame(function() {
                $scope.renderEngine.render();
            });

        }
        else {
	        var differenceX = mouseCurrentX - x;
	        var differenceY = y - mouseCurrentY;
                  
	        /* Update the index and the cursor. */
	        if (!($scope.config.mouse.button[1] || $scope.config.mouse.button[3])) {
	            
	            var ratio = Math.abs(differenceY) / Math.abs(differenceX);
	            
	            $scope.scaleToolIndex = Math.round(8 * (angle / (2 * Math.PI)));
                $scope.setCursor($scope.cursorTypes[$scope.scaleToolIndex]);

                if ($scope.scaleToolIndex === 8) {
                    $scope.scaleToolIndex = 0;
                }

                return;
	        }	
        } 
        
        /* Update old mouse. */
        $scope.config.mouse.old.x = $scope.config.mouse.current.x;
        $scope.config.mouse.old.y = $scope.config.mouse.current.y;
	};
    
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
		if (nval) {
			$scope.init();

			$scope.config.tools.activeToolFunctions = {
				mouseDown: $scope.mouseDown,
				mouseUp:   $scope.mouseUp,
				mouseMove: $scope.mouseMove
			};
		}
		else if (oval) {
			var layer = $scope.renderEngine.getLayer($scope.config.layers.currentLayer);
			layer.commitDimensions();
		}
	}, true);
});