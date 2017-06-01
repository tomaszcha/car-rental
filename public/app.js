var app = angular.module('app', []);

app.controller('NewCarController',
    function ($scope, $rootScope, $http, $timeout) {
        $scope.car = {};

        $scope.onSubmit = () => {
            $http({
                method: 'POST',
                url: '/api/cars',
                data: $scope.car
            }).then(function (success) {
                $rootScope.$broadcast('REFRESH', {});
                alert(true);
            }, function (error) {
                alert(false);
            });
        }

        function alert(success) {
            $scope.alert = success
            $timeout(clearAlert, 5000);
        }

        function clearAlert() {
            $scope.alert = undefined;
        }
    });

app.controller('NewRentalController',
    function ($scope, $rootScope, $http, $timeout) {
        $scope.rental = {};

        $scope.$on('RENTAL', function (event, data) {
            $scope.rental.carId = data;
        });

        $scope.onSubmit = () => {
            $http({
                method: 'POST',
                url: '/api/rentals',
                data: $scope.rental
            }).then(function (success) {
                $rootScope.$broadcast('REFRESH', {});
                alert(true);
            }, function (error) {
                alert(false);
            });
        }

        function alert(success) {
            $scope.alert = success
            $timeout(clearAlert, 5000);
        }

        function clearAlert() {
            $scope.alert = undefined;
        }
    });

app.controller('CarsController',
    function ($scope, $rootScope, $http) {
        $scope.freeCars = [];
        $scope.rentedCars = [];

        $scope.onRent = (carId) => {
            $rootScope.$broadcast('RENTAL', carId);
        }

        $scope.$on('REFRESH', function(event, data) {
            init();
        });

        $scope.onDelete = (carIdx) => {
            let carId = $scope.freeCars[carIdx]._id;
            $http({
                method: 'DELETE',
                url: '/api/cars/' + carId
            }).then(function (response) {
                init();
            }, function (error) {
                $scope.error = true;
            });
        }

        $scope.onReturn = (carIdx) => {
            let carId = $scope.rentedCars[carIdx]._id;
            $http({
                method: 'POST',
                url: `/api/cars/${carId}/return`
            }).then(function (response) {
                init();
            }, function (error) {
                $scope.error = true;
            });
        }

        function init() {
            $http({
                method: 'GET',
                url: '/api/cars',
                params: {
                    rented: 'false'
                }
            }).then(function (response) {
                $scope.freeCars = response.data;
            }, function (error) {
                $scope.error = true;
            });

            $http({
                method: 'GET',
                url: '/api/rentedCars'
            }).then(function (response) {
                $scope.rentedCars = response.data;
            }, function (error) {
                $scope.error = true;
            });
        }

        init();
    });