angular.module('ariana').directive('magic', function() {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'app/toolbox/directives/select/magic/magic.tpl.html',
        controller: 'MagicCtrl'
    };
});

angular.module('ariana').controller('MagicCtrl', function($scope) {
	$scope.toolname = 'magic';
	$scope.active = $scope.config.tools.activeTool == $scope.toolname;

	/* init */
	$scope.init = function() {
		$scope.setCursor('crosshair');
		console.log("Magic selection start");
		//$("#main-canvas").css("cursor", "crosshair");

		/* working with $scope to share variables between functions in this file does not seem to work. */
		var scope = angular.element($("#main-canvas")).scope();

		/*scope.imgData = new ImgData($scope.renderEngine.getWidth(), $scope.renderEngine.getHeight());
		 scope.imgData.data = $scope.renderEngine.renderAsUint8Array();
		 scope.magic = new MagicSelection(scope.imgData);*/
		var currentLayer = 0;//$scope.config.layers.currentLayer;
		if (currentLayer == -1) {
			console.log("No layer selected");
			return;
		}

		var layer = $scope.renderEngine.layers[currentLayer];
		if (layer.layerType != LayerType.ImageLayer) {
			console.log("Layer is not of type ImageLayer");
			return;
		}
		var image = layer.getImage();
		scope.magic = magicSelection = new MagicSelection(image);


		// $interval(callAtInterval, 1000);
		scope.sizeAnts = 4;
		scope.offset = 0;
	};

	/* onMouseDown */
	$scope.mouseDown = function() {
		var scope = angular.element($("#main-canvas")).scope();

		/* x and y coordinates in pixels relative to image. */
		var xRelative = $scope.config.mouse.current.x - $scope.config.canvas.x;
		var yRelative = $scope.config.mouse.current.y - $scope.config.canvas.y;

		/* Check wheter user has clicked inside of a selection. */
		if (scope.magic.isInSelection(xRelative, yRelative)) {
			scope.magic.removeSelection(xRelative, yRelative)
		} else {
			var bitmask = scope.magic.getMaskWand(xRelative, yRelative, 10);
		}

		scope.magic.getMaskBorder();

		var width = scope.magic.imageData.width;
		var height = scope.magic.imageData.height;

		var canvas = document.getElementById("editing-canvas");
		var context = canvas.getContext("2d");
		var imgData = context.createImageData(width, height);
		console.log("BItmask: " + bitmask);
		if (bitmask) {
			for (var i = 0; i < bitmask.length; i++) {
				if (bitmask[i]) {
					imgData.data[4 * i] = 255;
					imgData.data[4 * i + 1] = 0;
					imgData.data[4 * i + 2] = 0;
					imgData.data[4 * i + 3] = 255;
				}
			}
			var layer = scope.renderEngine.createSelectionImageLayer(imgData, 0);
			scope.renderEngine.removeLayer(0);
			scope.renderEngine.addLayer(layer);
			scope.renderEngine.render();

			scope.editEngine.setSelectionLayer(scope.magic, layer);
            scope.requestEditEngineUpdate();
		}
	};

	/* onMouseUp */
	$scope.mouseUp = function() {

	};

	/* onMouseMove */
	$scope.mouseMove = function() {
		
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
				mouseUp: $scope.mouseUp,
				mouseMove: $scope.mouseMove
			};
		}
	}, true);
});