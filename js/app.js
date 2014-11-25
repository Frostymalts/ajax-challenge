"use strict";

//this is the base URL for all task objects managed by your application
//requesting this with a GET will get all tasks objects
//sending a POST to this will insert a new task object
//sending a PUT to this URL + '/' + task.objectId will update an existing task
//sending a DELETE to this URL + '/' + task.objectId will delete an existing task
var tasksUrl = 'https://api.parse.com/1/classes/reviews';
var formIsShown = false;

angular.module('CustomerReviewApp', ['ui.bootstrap'])
    .config(function($httpProvider) {
        $httpProvider.defaults.headers.common['X-Parse-Application-Id'] = '8KggxA5XW1zh5OoudfgNJLMHiwMjWenbfWOnjMUq';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = 'CZ5YUhxPMa8ObW9XU6W6dn39QdOCg9PvruwJ4rLc';
    })
    .controller('ReviewController', function($scope, $http) {
        $scope.submitted = false;
        $scope.showForm = function() {
            if(formIsShown) {
                $('form').slideUp(500);
                formIsShown = false;
            } else {
                $('form').slideDown(500);
                formIsShown = true;
            }
        };
        $scope.refreshTasks = function() {
            $http.get(tasksUrl + "?order=-votes")
                .success(function (data) {
                    $scope.reviews = data.results;
                });
        };
        $scope.refreshTasks();

        $scope.newReview = {};

        $scope.addReview = function() {
            $scope.inserting = true;
            $http.post(tasksUrl, $scope.newReview)
                .success(function(responseData) {
                    $scope.newReview.objectId = responseData.objectId;
                    $scope.reviews.push($scope.newReview);
                    $scope.submitted = true;
                })
                .finally (function () {
                    $scope.inserting = false;
                    $('#comAlert').show('slide',{direction: 'left'}, 1000);
            });
        };

        $scope.removeReview = function(review) {
            $http.delete(tasksUrl + '/' + review.objectId)
                .finally(function() {
                    $scope.refreshTasks();
                });
        }

        $scope.validated = function() {
            var form = document.getElementById('review-form');
            var requiredFields = ['name', 'title', 'review'];
            var idx;
            var valid = true;
            for (idx = 0; idx < requiredFields.length; idx++) {
                valid &= $scope.validate(form.elements[requiredFields[idx]]);
            }
            return valid;
        }

        $scope.validate = function(field) {
            var value = field.value;
            value = value.trim();
            var valid = value.length > 0;
            return valid;
        }

        $scope.incrementVotes = function(review, amount) {
            var postData = {
                votes: {
                    __op: 'Increment',
                    amount: amount
                }
            };

            $http.put(tasksUrl + '/' + review.objectId, postData)
                .success(function(respData) {
                    review.votes = respData.votes;
                })
                .error(function(err){
                    console.log(err);
                });
        };
    });