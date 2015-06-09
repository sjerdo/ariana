angular.module('ariana').controller('toolBoxController', function($scope) {

    
    $scope.swapColors = function() {
        var temp = $scope.config.tools.colors.primary;
        $scope.config.tools.colors.primary = $scope.config.tools.colors.secondary;
        $scope.config.tools.colors.secondary = temp;
        console.log($scope.config.tools.colors.primary);
    };

    $scope.toolbox = {
        basic: {
            image: 'arrow-all.svg',
            tools: {
                pan: {
                    image: 'cursor-pointer.svg',
                    toolFunctions: panTool,
                },
                translate: {
                    image: 'arrow-all.svg',
                    toolFunctions: translateTool,
                },
                scale: {
                    image: 'arrow-expand.svg'
                },
                rotate: {
                    image: 'rotate-left.svg',
                    toolFunctions: rotateTool,
                },
                crop: {
                    image: 'crop.svg'
                }
            }
        },
        painting: {
            image: 'brush.svg',
            tools: {
                color: {
                    image: 'palette.svg'
                },
                pencil: {
                    image: 'pen.svg'
                },
                brush: {
                    image: 'brush.svg'
                },
                eraser: {
                    image: 'eraser.svg'
                },
                picker: {
                    image: 'eyedropper.svg',
                    toolFunctions: colorPicker,
                },
                fill: {
                    image: 'format-color-fill.svg'
                }
            }
        },
        select: {
            image: 'select.svg',
            tools: {
                rectangle: {
                    image: 'select.svg'
                },
                elipse: {
                    image: 'checkbox-blank-circle-outline.svg'
                },
                curve: {
                    image: 'vector-curve.svg'
                },
                wand: {
                    image: 'auto-fix.svg' 
                }
            }
        },
        text: {
            image: 'format-size.svg'
        }
    };

    /* This function selects a toolset and therefore opens a toolbox. */
    $scope.selectToolSet = function(name) {
        if ($scope.config.tools.activeToolset == name) {
            $scope.config.tools.activeToolset = null;
            $scope.selectTool(null, "pan");
        }
        else {
            $scope.config.tools.activeToolset = name;
        }
    };
    
    /* This function selects a tool. */
    $scope.selectTool = function(e, tool) {
        if (e) e.stopPropagation();

        $scope.config.tools.activeTool = tool;

        var toolset = $scope.config.tools.activeToolset;
        
        if (toolset) {
            toolFunctions = $scope.toolbox[toolset].tools[tool].toolFunctions;
        }
        else {
            // exception for basic tools
            toolFunctions = $scope.toolbox.basic.tools[tool].toolFunctions;
        }
        
        if (toolFunctions) {
            $scope.config.tools.activeToolFunctions = toolFunctions;
            toolFunctions.start();
        }
        else {
            $scope.config.tools.activeToolFunctions = null;
            $("#main-canvas").css("cursor", "default");
        }
    };
    $scope.selectTool(null, "pan");

    /*$scope.loadImages = function() {
        console.log("Request images");
        $("div.svg").each(function () {
            console.log("Image found");
            var img = $(this);
            var id = img.attr('id');
            var src = img.attr('data');

            //$scope.sources.push(src);
            console.log("Request " + src);

            $(this).removeClass("svg");

            $.get(src, function (data) {
                // Get the SVG tag, ignore the rest
                var svg = $(data).find('svg');

                // Add replaced image's ID to the new SVG
                if (typeof id !== 'undefined') {
                    svg = svg.attr('id', id);
                }

                console.log("Setting svg with src="+src);

                // Remove any invalid XML tags as per http://validator.w3.org
                svg = svg.removeAttr('xmlns');
                svg = svg.removeAttr('xmlns:xlink');

                // Replace image with new SVG
                img.replaceWith(svg);

            }, 'xml');
        });
    };*/

    setTimeout(function() {
        $("img.svg").each(function () {
            var img = $(this);
            var id = img.attr('id');
            var src = img.attr('data');

            //$scope.sources.push(src);
            $(this).removeClass("svg");

            $.get(src, function (data) {
                // Get the SVG tag, ignore the rest
                var svg = $(data).find('svg');

                // Add replaced image's ID to the new SVG
                if (typeof id !== 'undefined') {
                    svg = svg.attr('id', id);
                }

                // Remove any invalid XML tags as per http://validator.w3.org
                svg = svg.removeAttr('xmlns');
                svg = svg.removeAttr('xmlns:xlink');

                // Replace image with new SVG
                img.replaceWith(svg);

            }, 'xml');
        });
    }, 1);
    //$scope.loadImages();
});
