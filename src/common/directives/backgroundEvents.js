/*
 * Project Ariana
 * backgroundEvents.js
 *
 * This file contains an Angular directive for catching mouse input on the 
 * background. 
 *
 */
 
app.directive('backgroundEvents', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$watch('config.canvas.cursor', function(nval, oval) {
                element.css('cursor', scope.config.canvas.cursor);
            }, true);
        }
    }
});