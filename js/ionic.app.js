// LiFE App!

window.lifeApp = {
  application: angular.module('lifeApp', ['ionic', 'lifeApp.lib', 'lifeApp.controllers', 'lifeApp.services', 'ngResource', 'ng-token-auth', 'rails', 'ngRoute', 'ngSanitize']),
  controllers: angular.module('lifeApp.controllers', []),
  services: angular.module('lifeApp.services', []),
  lib: angular.module('lifeApp.lib', [])
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
    resolve: {
      auth: function($auth) {
        return $auth.validateUser();
      },
      introQuestions: function(IntroQuestion) {
        return IntroQuestion.query();
      }
    },
    views: {
      'home-tab': {
        templateUrl: 'templates/intro-question.html',
        controller: 'IntroQuestionCtrl'
      }
    }
  })
  .state('tabs.survey', {
    url: 'survey/{id:int}',
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

lifeApp.controllers.controller('CategoryIndexCtrl', function($scope, Category) {
  Category.query().$promise.then(function(response){
    $scope.categorys = response;
  });
});

lifeApp.controllers.controller('HomePropertiesCtrl',
  function($scope, Property) {

    var homeProps   = ['home', 'home_logged_in', 'home_logged_out'];

    homeProps.forEach(function(name) {
      Property.get({ name: name }, function(prop) {
        $scope[name] = prop;
      });
    });
  }
);

lifeApp.controllers.controller('IntroQuestionCtrl', function($scope, $state, introQuestions, IntroQuestion, IntroResponse, User){

	$scope.intro_questions = introQuestions;
	$scope.questionIndex   = 0;

	$scope.respondWith = function(introAnswer) {

		IntroResponse.create({ intro_answer_id: introAnswer.id }, {}, function(introResponse) {

			$scope.questionIndex += 1;

			if ($scope.questionIndex >= $scope.intro_questions.length) {
				$scope.introCompleted();
			}
		});
	};

	$scope.introCompleted = function() {

		IntroQuestion.complete(function(complete) {

			User.get(function(user) {

				$scope.user = user; // reload user and go to survey index
				$state.go('tabs.survey-index');
			});
		});
	}
});

lifeApp.controllers.controller('LandingPropertiesCtrl', function($scope, Property){
  Property.get({ name: 'about' }, function(prop) {
    $scope.about = prop;
  });
});

lifeApp.controllers.controller('ResourceCtrl', function($scope, $stateParams, $ionicPopup, $state, Resource, AllResources, $http, $auth) {
	var id = $stateParams.categoryId;

  var resourceProvider = !id ? AllResources.query() : Resource.query({category_id: id});

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
    $scope.favouritedResource = function favouritedResource(resource) {

				var url = env.apiUrl;
				if (resource.favourite) {
					 url += '/resources/' + id + '/unfavourite';
				} else {
					url += '/resources/' + id + '/favourite';
				}

        $http.put(url)
					// resource updated successfully
					.then(function(response) {
						resource.favourite = response.data.favourite;
					})
					// an error happened, probably a 401
					.catch(function(error) {
						if (error.status != 401) { return; }

						var errorMsg = error.data.errors[0],
						        show = $ionicPopup.confirm({
							title: errorMsg,
							buttons: [
								{
									text: 'Cancel',
									type: 'button-default',
								}, {
									text: 'Log In',
									type: 'button-positive',
									onTap: function(e) { $state.go('tabs.signin'); }
								}
							]
						});
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

lifeApp.controllers.controller('SurveyCtrl', function($scope, $stateParams, $auth, $http, SecondTierQuestion, RecommendResources, Survey, SurveyQuestion, IntroResponse) {
	var category_id = $stateParams.id;

  var score      = 0,
			index      = 0,
			totalScore = 0,
			resources  = [],
			scores     = [];

	$scope.user = $auth.user;
	var user_id = $auth.user.id;

	// evaluate response
	IntroResponse.query().$promise.then(function(responses) {

		if (responses.length) { buildQuestion(index); }

		function buildQuestion(index) {

			SecondTierQuestion.query({ intro_answer_id: responses[index].answer_id, category_id: category_id }).$promise.then(function(results) {

				if (results.length != 0) {
					$scope.end = false;
			    $scope.showResources = false;

					$scope.questions = results;
					var question_index = 0;
					$scope.data = {answers: ''};
					$scope.question = results[question_index];
					$scope.answers = results[question_index].answers;


					$scope.next = function(answer) {
						score = answer.score;
						scores.push(score);

						// set recommend resources
						if (score > 0) {
		        	// need resources
		        	resources.push(RecommendResources.query({question_id: results[question_index].id}));
		      	}

		        question_index ++;

						if (question_index >results.length - 1) {
							checkNext(index);
						} else {
							$scope.data = {answers: ''};
							$scope.question = results[question_index];
							$scope.answers = results[question_index].answers;
						}
					}
				} else {
					checkNext(index);
				}
			});
		}

		function checkNext(index) {

			index ++;

			if (index > responses.length -1) {

				// universal condition question
				Survey.query({ category_id: category_id }).$promise.then(function(survey) {

					if (survey.length != 0) {

						var s_id = survey[0].id;

						SurveyQuestion.query({ survey_id: s_id }).$promise.then(function(questions) {

							if (questions.length !=0) {

								$scope.questions = questions
								var q_index = 0;
								$scope.data = {answers: ''};
								$scope.question = questions[q_index];
								$scope.answers = questions[q_index].answers;

								$scope.next =function(answer) {

									score = answer.score;
									scores.push(score);

									//set recommend resources
									if (score > 0) {
					        	//need resources
					        	resources.push(RecommendResources.query({ question_id: questions[q_index].id}));
					        }

					        q_index ++;

									if (q_index > questions.length - 1) {
										showResources()
									} else {
										$scope.data = {answers: ''};
										$scope.question = questions[q_index];
										$scope.answers = questions[q_index].answers;
									}
								}
							} else {
								showResources();
							}
						});
					} else {
						showResources();
					}
				});
			} else {
				buildQuestion(index);
			}
		}

		function showResources() {
			$scope.end = true;

			for (var i = 0; i < scores.length - 1; i ++) {
				totalScore += scores[i];
			}

			if (totalScore > 0) {
				$scope.showResources = true;
				$scope.showResources = resources;
			}
		}
	});
});

lifeApp.controllers.controller('SurveyEndPropertiesCtrl', function($scope, Property){
  Property.get({ name: 'survey_end' }, function(prop) {
    $scope.surveyend = prop;
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

lifeApp.application.config(function($authProvider) {
  $authProvider.configure({
    apiUrl:   env.apiUrl,
    storage: 'localStorage'
  });
});

lifeApp.services.factory('AllResources', function($resource) {
  return $resource(env.apiUrl + "/resources");
});

lifeApp.services.factory('Category', function($resource) {
  return $resource(env.apiUrl + "/categories/:id");
});

lifeApp.services.factory('IntroQuestion', function($resource){
	return $resource(
			env.apiUrl + '/intro_questions',
			null,
			// NOTE: There must be a better way than this... relative url path?
			{ complete: { method: 'PUT', url: env.apiUrl + '/intro_questions/complete' } }
	);
});

lifeApp.services.factory('IntroResponse', function($resource) {
  return $resource(
    env.apiUrl + '/intro_responses',
    null,
    { create: { method: 'POST', url: env.apiUrl + '/intro_answers/:intro_answer_id/intro_responses' } }
  );
});

lifeApp.services.factory('Property', function($resource){
	return $resource(env.apiUrl + '/properties/:name');
});

lifeApp.services.factory('Question', function($resource){
	return $resource(env.apiUrl + '/questions/:id', {id: '@id'});
});

lifeApp.services.factory('RecommendResources', function($resource){
	return $resource(env.apiUrl + '/questions/:question_id/resources', { question_id: '@id'});
});

lifeApp.services.factory('Resource', function($resource) {
  return $resource(
      env.apiUrl + "/categories/:category_id/resources",
      { category_id: '@id' }
  );
});

lifeApp.services.factory('Response', function($resource) {
  return $resource(env.apiUrl + '/responses');
});

lifeApp.services.factory('SecondTierQuestion', function($resource){
	return $resource(env.apiUrl + '/categories/:category_id/questions', { category_id: '@category_id', intro_answer_id: '@intro_answer_id' });
});

lifeApp.services.factory('Survey', function($resource){
	return $resource(env.apiUrl + '/categories/:category_id/surveys', { category_id: '@category_id'});
});

lifeApp.services.factory('SurveyQuestion', function($resource){
	return $resource(env.apiUrl + '/surveys/:survey_id/questions', { survey_id: '@survey_id' });
});

lifeApp.services.factory('User', function($resource){
	return $resource(env.apiUrl + '/auth/user');
});

lifeApp.services.factory('UserSession', function($resource) {
  return $resource("http://localhost:3000/users/sign_in.json");
});
