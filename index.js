angular.module('rx.sliderInput', []).service('EventBus', function() {
    var eventMap = {};

    return {
        on: function (eventType, handler) {
            if (!eventMap[eventType]) {
                eventMap[eventType] = [];
            }
            eventMap[eventType].push(handler);
        },

        off: function (eventType, handler) {
            for (var i = 0; i < eventMap[eventType].length; i++) {
                if (eventMap[eventType][i] === handler) {
                    eventMap[eventType].splice(i, 1);
                    break;
                }
            }
        },

        fire: function (event) {
            var eventType = event.type;
            if (eventMap[eventType]) {
                for (var i = 0; i < eventMap[eventType].length; i++) {
                    eventMap[eventType][i](event);
                }
            }
        }
    };
})
/**
 *  @example:
 *  <input type="text" rx-slider-input="slider.value" ng-model="foo" min="1" max="10" slider-id="uniqueId">
 */

.directive('rxSliderInput', ['EventBus', function(EventBus) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
            var min, max, lastValidValue;

            min = parseFloat(scope.$eval(attrs.min));
            max = parseFloat(scope.$eval(attrs.max));

            //Do not use $setViewValue to set viewValue here, because it will trigger $parse pipeline.
            ngModelCtrl.$parsers.push(function(input) {
                input = parseFloat(input);
                if (isNaN(input)) {
                    ngModelCtrl.$viewValue = '';
                    ngModelCtrl.$render();
                } else if (input >= min && input <= max) {
                    if (lastValidValue !== input) {
                        //Use EventBus to inform slider to change model 
                        EventBus.fire({
                            type: 'rx.slider.input.valid',
                            data: input,
                            sliderId: attrs.sliderId
                        });
                    }
                    lastValidValue = input;
                    ngModelCtrl.$viewValue = input;
                    ngModelCtrl.$render();
                } 
                return lastValidValue;
            });

            element.on('blur', function() {
                if (ngModelCtrl.$viewValue !== lastValidValue) {
                    ngModelCtrl.$setViewValue(lastValidValue);
                    ngModelCtrl.$render();
                    scope.$apply();
                }
            });

            scope.$watch(attrs.rxSliderInput, function(value) {
                lastValidValue = value;
                ngModelCtrl.$viewValue = value;
                ngModelCtrl.$render();
            });
        }
    }
}]);