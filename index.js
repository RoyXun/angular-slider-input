angular.module('rx.sliderInput', [])
/**
 *  @example:
 *  <input type="text" class="form-control" 
 *      ng-model="fooInput" 
 *      rx-slider-input="sliderValue" 
 *      min="0" 
 *      max="100" 
 *      step="2" 
 *      on-blur="resetSlider(value)">
 */

.directive('rxSliderInput', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            min: '=', 
            max: '=',
            step: '=',
            slider: '=rxSliderInput',
            onBlur: '&'
        },
        link: function(scope, element, attrs, ngModelCtrl) {
            var min = scope.min;
            var max = scope.max;
            var step = scope.step || 1;

            var getValidValue = function(input, min, max, step) {
                var value = parseFloat(input) || 0;
                //determine if input is in the valid range
                if (value < min) {
                    value = min;
                } else if (value > max) {
                    value = max;
                }

                //determin if input is valid 
                value = min + Math.round((value - min) / step) * step;
                if (value < min) {
                    value += step;
                } else if (value > max) {
                    value -= step;
                }

                return value;
            };

            // the input value should be consistent with the slider model.
            scope.$watch('slider', function(value) {
                ngModelCtrl.$setViewValue(value);
                ngModelCtrl.$render();
            });

            // validate value and reset slider when blur
            element.on('blur', function() {
                var value = getValidValue(ngModelCtrl.$viewValue, min, max, step);

                if (value != scope.slider) {
                    scope.onBlur({value: value});
                }

                ngModelCtrl.$setViewValue(value);
                ngModelCtrl.$render();
                scope.$apply();
            });
        }
    };
});