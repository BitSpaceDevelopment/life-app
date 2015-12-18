// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

window.lifeApp = {
  application: angular.module('lifeApp', ['ionic', 'lifeApp.lib', 'lifeApp.controllers', 'lifeApp.services', 'ngResource', 'ng-token-auth', 'rails', 'ngRoute', 'ngSanitize']),
  controllers: angular.module('lifeApp.controllers', []),
  services: angular.module('lifeApp.services', []),
  lib: angular.module('lifeApp.lib', [])
};

window.env = {

  /***Development***/
  //apiUrl: 'http://localhost:3000/api/v1'

  /***Production***/
  apiUrl: 'http://stage.lifeapp.bitspacedevelopment.com/api/v1'

};

lifeApp.application.config(function($httpProvider, $authProvider, $stateProvider, $urlRouterProvider) {
  $httpProvider.defaults.withCredentials = true;

  // States
  $stateProvider

  .state('tabs', {
    url: '/',
    templateUrl: 'templates/tabs.html',
    controller: 'UserSessionCtrl'
  })
  .state('tabs.home', {
    url: 'home',
    views: {
      'home-tab': {
        templateUrl: 'templates/home.html',
        controller: 'UserSessionCtrl'
      }
    }
  })
  .state('tabs.landing', {
    url: 'landing-page',
    views: {
      'home-tab': {
        templateUrl: 'templates/landing.html'
      }
    },
    resolve: {
      auth: function($auth) {
        return $auth.validateUser();
      }
    }
  })
  .state('tabs.intro-survey', {
    url: 'intro-survey',
    views: {
      'home-tab': {
        templateUrl: 'templates/intro-survey.html',
        controller: 'IntroSurveyCtrl'
      }
    },
    resolve: {
      auth: function($auth) {
        return $auth.validateUser();
      }
    }
  })
  .state('tabs.survey', {
    url: 'survey/:id',
    views: {
      'home-tab': {
        templateUrl: 'templates/survey.html',
        controller: 'SurveyCtrl'
      }
    },
    resolve: {
      auth: function($auth) {
        return $auth.validateUser();
      }
    }
  })
  .state('tabs.survey-index', {
    url: 'survey/categories',
    views: {
      'home-tab': {
        templateUrl: 'templates/survey-index.html',
        controller: 'SurveyIndexCtrl'
      }
    },
    resolve: {
      auth: function($auth) {
        return $auth.validateUser();
      }
    }
  })
  // Resources

  .state('tabs.resource-index', {
    url: 'resourcesindex',
    views: {
      'home-tab': {
        templateUrl: 'templates/resource-index.html',
        controller: 'CategoryIndexCtrl'
      }
    }
  })
  .state('tabs.resources', {
    url: 'resources/:categoryId',
    views: {
      'home-tab': {
        templateUrl: 'templates/resources.html',
        controller: 'ResourceCtrl'
      }
    }
  })
  //End Resources

  //Sessions
   .state('tabs.signin', {
    url: 'signin',
    views: {
      'home-tab': {
        templateUrl: 'templates/SignIn.html',
        controller: 'UserSessionCtrl'
      }
    }
  })
   .state('tabs.signup', {
    url: 'signup',
    views: {
      'home-tab': {
        templateUrl: 'templates/SignUp.html',
        controller: 'SignUpCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('home');
});

lifeApp.application.run(function($ionicPlatform) {
  return $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      return StatusBar.styleLightContent();
    }
  });
});

lifeApp.controllers.controller('CategoryIndexCtrl', function($scope, Category) {
  Category.query().$promise.then(function(response){
    $scope.categorys = response;
  });
});

lifeApp.controllers.controller('HomePropertiesCtrl', function($scope, $http){
  $http.get(env.apiUrl + '/property/home').then(function(resp) {
    $scope.home = resp.data;
  });
});

lifeApp.controllers.controller('IntroSurveyCtrl', function($scope, $state, $auth, IntroSurvey, User, Response){
	// set up variables
	var index = 0;
	var userID = 0;
	
	$scope.user = $auth.user;
	userID = $auth.user.id;
	var user = User.get({id: userID});
	//load intro survey
	IntroSurvey.query().$promise.then(function(results){
		$scope.questions = results;
		if(user.question_id != null){
			for(var i = 0; i < results.length - 1; i ++){
				if(user.question_id == results[i].id){
					index = i;
				}
			}
			showIntroSurvey(index);
		}else{
			index = 0;
			showIntroSurvey(index);
		}
		
		function showIntroSurvey(index){
			//scope binding question and answer data by question id
			$scope.question = results[index];
			$scope.answers = results[index].intro_answers;

			//set init ng-model answers
			$scope.data = {answers: ''};

			//when user click answer
			$scope.next = function(answer){
				//create response
				var response = new Response();
				response.answer_id = answer.id;
				response.user_id = userID;
				response.$save();
				//update user info
				user.question_id = results[index].id;
				user.intro_quiz = false;
				User.update({id: userID}, user);
				//increments
				index ++;
				//reset socre
				score = 0;
				//if going to last question
				if (index > results.length - 1){		
					user.intro_quiz = true;
					User.update({id: userID}, user);
					//redriesct page to inex survey page
					$state.go('tabs.survey-index');
					//reset index number
					index = 0;
				}
				//next question
				else{
					$scope.question = results[index];
					$scope.answers = results[index].intro_answers;
					$scope.data = {answers: ''};
				}
			}
		}
	});
});
lifeApp.controllers.controller('LandingPropertiesCtrl', function($scope, $http){
  $http.get(env.apiUrl + '/property/about').then(function(resp) {
    $scope.about = resp.data;
  });
});

lifeApp.controllers.controller('ResourceCtrl', function($scope, $stateParams, $ionicPopup, $state, Resource, AllResources, $http, $auth) {
	var id = $stateParams.categoryId;

  var resourceProvider = !id ? AllResources.query() : Resource.query({categoryId: id});

    //get resources
    resourceProvider.$promise.then(function(response){
        $scope.resources = response;
        //if there are no resources go back to resource index page
        if(response.length == 0) {
            errormsg = "Sorry, there doesn't seem to be any resources at this time";
            var confirm = $ionicPopup.confirm({
                    title: errormsg,
                });
            confirm.then(function(res){
                if(res){
                    $state.go('tabs.resource-index');
                } else {
                    $state.go('tabs.resource-index');
                }
            });
        }
    });

    //add favourite resource
    $scope.favouritedResource = function favouritedResource(id) {
        url = env.apiUrl + "/favourite/" + id;

        $http.get(url).success( function(response) {
            if(response.length > 1) {
                errormsg = response[0];
                var show = $ionicPopup.confirm({
                    title: errormsg,
                    buttons: [{
                        text: 'Cancel',
                        type: 'button-default',
                      }, {
                        text: 'Log In',
                        type: 'button-positive',
                        onTap: function(e) {
                            $state.go('tabs.signin');
                        }
                      }]
                });
            }else {
                if(response == 'true'){
                    document.getElementById(id).className = "button button-assertive";
                    document.getElementById(id+'icon').className = "icon ion-ios-heart";
                } else {
                    document.getElementById(id).className = "button button-energized";
                    document.getElementById(id+'icon').className = "icon ion-ios-star";
                }
            }
        });
    }
});

lifeApp.controllers.controller('SignUpCtrl', function($scope, $state, $ionicPopup, $auth, $ionicHistory) {
  $scope.submitReg = function(data) {
    $auth.submitRegistration(data).then(function(user) {
      $auth.submitLogin(data).then(function(user) {
        $ionicHistory.nextViewOptions({disableBack: true});

        if (!user.intro_quiz)
          $state.go('tabs.landing');
        else
          $state.go('tabs.survey-index');
      });
    }).catch(function(error) {
      $ionicPopup.alert({
        title: 'Error',
        template: "An error occurred."
      })
    });
  };
});

lifeApp.controllers.controller('SurveyCtrl', function($scope, $stateParams, $auth, $http, SecondTierQuestion, RecommendResources, Survey, SurveyQuestion) {
	var category_id = $stateParams.id;

    var score = 0;
    var index = 0;
    var totalScore = 0;

    var resources = [];
    var scores = [];

	$scope.user = $auth.user;
	var user_id = $auth.user.id;
	//evaluate response
	$http.get(env.apiUrl + '/responses/' + user_id).then(function(resp){
		buildQuestion(index);

		function buildQuestion(index){
			SecondTierQuestion.query({introAnswerId: resp.data[index].answer_id, categoryId: category_id}).$promise.then(function(results){
				if(results.length != 0){
					$scope.end = false;
			    	$scope.showResources = false;

					$scope.questions = results;
					var question_index = 0;
					$scope.data = {answers: ''};
					$scope.question = results[question_index];
					$scope.answers = results[question_index].answers;
					

					$scope.next = function(answer){
						score = answer.score;
						scores.push(score);
						//set recommend resources
						if(score > 0){
		        			//need resources
		        			resources.push(RecommendResources.query({questionId: results[question_index].id}));
		        		}
		        		question_index ++;
						if(question_index >results.length - 1){
							checkNext(index);
						}else{
							$scope.data = {answers: ''};
							$scope.question = results[question_index];
							$scope.answers = results[question_index].answers;
						}	
					}
				}else{
					checkNext(index);
				}
			});
		}

		function checkNext(index){
			index ++;
			if(index > resp.data.length -1){
				//universal condition question
				Survey.query({id: category_id}).$promise.then(function(survey){
					if(survey.length != 0){
						var s_id = survey[0].id;
						SurveyQuestion.query({id: s_id}).$promise.then(function(questions){
						if(questions.length !=0){
							$scope.questions = questions
							var q_index = 0;
							$scope.data = {answers: ''};
							$scope.question = questions[q_index];
							$scope.answers = questions[q_index].answers;

							$scope.next =function(answer){
								score = answer.score;
								scores.push(score);
								//set recommend resources
								if(score > 0){
				        			//need resources
				        			resources.push(RecommendResources.query({questionId: questions[q_index].id}));
				        		}
				        		q_index ++;
								if(q_index > questions.length - 1){
									showResources()
								}else{
									$scope.data = {answers: ''};
									$scope.question = questions[q_index];
									$scope.answers = questions[q_index].answers;
								}	
							}
						}else{
							showResources();
						}
						});
					}else{
						showResources();
					}
				});	
			}else{
				buildQuestion(index);
			}
		}

		function showResources(){
			$scope.end = true;
			for(var i = 0; i < scores.length - 1; i ++){
				totalScore += scores[i];
			}
			if(totalScore > 0){
				$scope.showResources = true;
				$scope.showResources = resources;
			}
		}
	});
});

lifeApp.controllers.controller('SurveyEndPropertiesCtrl', function($scope, $http){
  $http.get(env.apiUrl + '/property/surveyend').then(function(resp) {
    $scope.surveyend = resp.data;
  });
});

lifeApp.controllers.controller('SurveyIndexCtrl', function($scope, $ionicPopup, $http){
  $http.get(env.apiUrl + '/categories').then(function(resp) {
    $scope.categories = resp.data;
  });
});

lifeApp.controllers.controller('UserSessionCtrl', function($scope, $state, $window, $ionicPopup, $auth, $ionicHistory) {
  $scope.user = $auth.user;

  //init sign in form data
  $scope.data = {};

  $scope.signin = function(){
    $auth.submitLogin($scope.data).then(function(user) {
      $ionicHistory.nextViewOptions({disableBack: true});

      if (!user.intro_quiz)
        $state.go('tabs.landing');
      else
        $state.go('tabs.survey-index');
    }).catch(function(data) {
      console.log(data);

      $ionicPopup.alert({
        title: 'Error!',
        template: data.errors
      });
    });
  };

  $scope.signout = function() {
    var confirm = $ionicPopup.confirm({
      title: "Are you sure you want to logout?"
    });
    confirm.then(function(result){

      // Stopping further execution
      if (!result)
        return;

      // Signing the user out
      $auth.signOut()
        // Redirecting to home page
        .then(function() {
          $ionicHistory.nextViewOptions({disableBack: true});
          $state.go('tabs.home');
        })

        // telling the user there was an error
        .catch(function(resp) {
          console.error(resp);

          $ionicPopup.alert({
            title: 'Error!',
            template: 'There was an error logging you out.'
          });
      });
    });
  };
});

var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

lifeApp.lib.constant('Module', function() {
  var Module;
  return Module = (function() {
    function Module() {}

    Module.KEYOWRDS = ['extended', 'included'];

    Module.extend = function(obj) {
      var key, ref, value;
      for (key in obj) {
        value = obj[key];
        if (indexOf.call(Module.KEYOWRDS, key) < 0) {
          this[key] = value;
        }
      }
      if ((ref = obj.extended) != null) {
        ref.apply(this);
      }
      return this;
    };

    Module.include = function(obj) {
      var key, ref, value;
      for (key in obj) {
        value = obj[key];
        if (indexOf.call(Module.KEYOWRDS, key) < 0) {
          this.prototype[key] = value;
        }
      }
      if ((ref = obj.included) != null) {
        ref.apply(this);
      }
      return this;
    };

    return Module;

  })();
});

lifeApp.application.config(function($authProvider) {
  $authProvider.configure({
    apiUrl: env.apiUrl,
    storage: 'localStorage'
  });
});

lifeApp.services.factory('AllResources', function($resource) {
  return $resource(env.apiUrl + "/resources");
});

lifeApp.services.factory('Category', function($resource) {
  return $resource(env.apiUrl + "/categories/:id");
});

lifeApp.services.factory('User', function($resource){
	return $resource(env.apiUrl + '/user/:id', {id: '@id'}, 
		{
			'update': {method: 'PUT'}
		});
});
lifeApp.services.factory('IntroSurvey', function($resource){
	return $resource(env.apiUrl + '/introQuestions');
});
lifeApp.services.factory('Question', function($resource){
	return $resource(env.apiUrl + '/questions/:id', {id: '@id'});
});

lifeApp.services.factory('RecommendResources', function($resource){
	return $resource(env.apiUrl + '/recommendResources/:questionId', {questionId: '@id'});
});

lifeApp.services.factory('Resource', function($resource) {
  return $resource(env.apiUrl + "/categories/:categoryId/resources", {categoryId: '@id'});
});


lifeApp.services.factory('Response', function($resource) {
  return $resource(env.apiUrl + "/response");
});
lifeApp.services.factory('SecondTierQuestion', function($resource){
	return $resource(env.apiUrl + '/secondTierQuestions/:introAnswerId/:categoryId', {introAnswerId: '@intro_answer_id', categoryId: '@category_id'});
});


lifeApp.services.factory('Survey', function($resource){
	return $resource(env.apiUrl + '/universalSurveys/:id', {id: '@id'});
});

lifeApp.services.factory('SurveyQuestion', function($resource){
	return $resource(env.apiUrl + '/surveyQuestions/:id');
});

lifeApp.services.factory('UserSession', function($resource) {
  return $resource("http://localhost:3000/users/sign_in.json");
});
