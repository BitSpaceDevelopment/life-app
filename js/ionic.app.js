// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

window.lifeApp = {
  application: angular.module('lifeApp', ['ionic', 'lifeApp.lib', 'lifeApp.controllers', 'lifeApp.services', 'ngResource', 'ng-token-auth', 'rails', 'ngRoute']),
  controllers: angular.module('lifeApp.controllers', []),
  services: angular.module('lifeApp.services', []),
  lib: angular.module('lifeApp.lib', [])
};

window.env = {

  /***Development***/
  apiUrl: 'http://localhost:3000/api/v1'

  /***Production***/
  //apiUrl: 'http://stage.lifeapp.bitspacedevelopment.com/api/v1'

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
        templateUrl: 'templates/surveys.html',
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
    url: 'survey/:survey',
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
  .state('tabs.living-quiz', {
    url: 'living-quiz/:survey',
    views: {
      'home-tab': {
        templateUrl: 'templates/living-quiz.html',
        controller: 'LivingQuizCtrl'
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
  .state('tabs.surveys', {
    url: 'survey/categories/:id',
    views: {
      'home-tab': {
        templateUrl: 'templates/surveys.html',
        controller: 'SurveysCtrl'
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

lifeApp.controllers.controller('IntroSurveyCtrl', function($scope, $state, SurveyQuestion, FirstTierSurvey, Question, Answer, Category, Flag){
	// set up variables
	var index = 0;
	var score = 0;
	var surveyID = 0;
	var questionID = 0;
	var categoryID = 0;
	var totalLScore = 0;
	var totalIScore = 0;
	var totalEScore = 0;
	var totalFScore = 0;
	var questions = [];
	var surveys = [];
	var answers = [];
	var flag = "";

	//load first tier survey
	surveys = FirstTierSurvey.query();
	//retrieve survey data
	surveys.$promise.then(function(data){
		//set up intro survey id by return first object's id
		surveyID = data[0].id;
		//load intro survey questions
		questions = SurveyQuestion.query({id: surveyID});
		//retrieve intro questions data
		questions.$promise.then(function(results){
			//set up intro question id
			questionID = results[index].id;
			categoryID = results[index].category.id;
			//scope binding question and answer data by question id
			$scope.question = Question.get({id: questionID});
			$scope.answers = Answer.query({questionId: questionID});


			//set init ng-model answers
			$scope.data = {answers: ''};

			//when user click answer
			$scope.next = function(answer){

				//get answer score
				score = answer.score;
				//depend on returned question category, accumlate socre by category
				switch (categoryID){
					case 2:
					totalLScore += score;
					break;
					case 3:
					totalIScore += score;
					break;
					case 4:
					totalFScore += score;
					break;
					case 5:
					totalEScore += score;
					break;
					default:
				}
				//increments
				index += 1;
				//reset socre
				score = 0;
				//if going to last question
				if (index >= results.length){
					//calculate highest score by category
					var maxScore = Math.max(totalLScore, totalIScore, totalFScore, totalEScore);
					//set up flag
					switch(maxScore){
						case totalLScore:
						flag = 'L';
						break;
						case totalIScore:
						flag = 'I';
						break;
						case totalFScore:
						flag = 'F';
						break;
						case totalEScore:
						flag = 'E';
						break;
						default:
					}
					//call function set flag by Flag service
					Flag.setFlag(flag);
					//redriect page to inex survey page
					$state.go('tabs.survey-index');
					//reset index number
					index = 0;
				}
				//next question
				else{
					questionID = results[index].id;
					categoryID = results[index].category.id;
					$scope.question = Question.get({id: questionID});
					$scope.answers = Answer.query({questionId: questionID});
					$scope.data = {answers: ''};
				}
			}
		});
	});
});

lifeApp.controllers.controller('LandingPropertiesCtrl', function($scope, $http){
  $http.get(env.apiUrl + '/property/about').then(function(resp) {
    $scope.about = resp.data;
  });
});

lifeApp.controllers.controller('LivingQuizCtrl', function($scope, $ionicActionSheet, $timeout, $state, $ionicPopup, $stateParams, Question, Answer, SecondTierSurvey, SecondTierQuestion, ThirdTierSurvey, ThirdTierQuestion, RecommendResources, Recommend){
	var id = $stateParams.survey;
	var number = 0;
	var index = 0;
	var score = 0;
	var questions = [];
	var surveys = [];
	var resources = [];
	var ids = [];
	var seconTierSurveyID = 0;
	var currentID = id;
	//load third tier survey
	ThirdTierSurvey.query().$promise.then(function(results){
		for(var i = 0; i < results.length; i++){
			seconTierSurveyID = results[i].second_tier_survey_id;
			ids.push(seconTierSurveyID);
		}

		//if current id match living survey id
		if(ids[0] == currentID){
			//show living quiz div
			$scope.showLiving = true;
			//off othes
			$scope.showTrans = false;
			$scope.showOther = false;
			$scope.livingQuiz = function(){
				showBranches();
			};
		}
		//if current id match transportation survey id
		else if(ids[ids.length - 1] == currentID){
			//show trans div
			$scope.showTrans = true;
			//off others
			$scope.showLiving = false;
			$scope.showOther = false;
			$scope.transQuiz = function(){
				showBranches();
			}
		}
		else{
			//show other div
			$scope.showOther = true;
			//off the rest
			$scope.showLiving = false;
			$scope.showTrans = false;
			questions = SecondTierQuestion.query({secondtiersurveyId: currentID});
			showSurvey(questions);
		}
	});

	function showSurvey(questions){
		questions.$promise.then(function(data){
			var qid = data[number].id;
			$scope.question = Question.get({id: qid});
			$scope.answers = Answer.query({questionId: qid});

			$scope.data = {answers: ''};

			$scope.next = function(answer){
				score = answer.score;
				//if user select no or other answers
				if(score > 0){
					//call recommend resource function
					recommendResources(qid);
				}
				//increament number
				number += 1;
				if (number >= data.length){
					if(ids[0] == currentID){
						//show other div
						$scope.showOther = true;
						//off the rest
						$scope.showLiving = false;
						$scope.showTrans = false;
						questions = SecondTierQuestion.query({secondtiersurveyId: currentID});
						showLSurvey(questions);
					}
					else{
						$state.go('tabs.resources');
						number = 0;
					}	
				}						
				else{
					qid = data[number].id;
					$scope.question = Question.get({id: qid});
					$scope.answers = Answer.query({questionId: qid});
					$scope.data = {answers: ''};
				}
			}
		});
	}

	function showBranches(){
		//load third tier surveys
		surveys = ThirdTierSurvey.query({secondtiersurveyId: currentID});
		//bind data to $promise
		surveys.$promise.then(function(survey){ 
			//create empty array for action sheet buttons
			var buttonsGroup = [];
			//loop through third tier survey add survey name as button name
			for(var i=0; i<survey.length; i++){
				var text = {'text': survey[i].name}
				buttonsGroup.push(text);
			}
			//create action sheet
			var hideSheet = $ionicActionSheet.show({
					buttons: buttonsGroup,
					buttonClicked: function(index){
						//toggle on 
						$scope.toggled = true;
						//get third tier survey id	
						var sid = survey[index].id;
						//load third tier questions by third tier survey id
						questions = ThirdTierQuestion.query({thirdtiersurveyId: sid});
						//call function to display question and answer
						showSurvey(questions);
						return true;
					}		
				});

			$timeout(function(){
					hideSheet();
				}, 5000);
		})
	}

	function showLSurvey(questions){
		questions.$promise.then(function(response){
			var quesid = response[index].id;
			$scope.question = Question.get({id: quesid});
			$scope.answers = Answer.query({questionId: quesid});

			$scope.data = {answers: ''};

			$scope.next = function(answer){
				score = answer.score;
				//if user select no or other answers
				if(score > 0){
					//call recommend resource function
					recommendResources(qid);
				}
				
				index += 1;
				if (index >= response.length){
						$state.go('tabs.resources');
					index = 0;	
				}						
				else{
					quesid = response[index].id;
					$scope.question = Question.get({id: quesid});
					$scope.answers = Answer.query({questionId: quesid});
					$scope.data = {answers: ''};
				}
			}
		});
	}

	function recommendResources(id){
		//load recommend resources by question id
		resources = RecommendResources.query({questionId: id});
		//loop through resources add to Recommend service
		resources.$promise.then(function(resources){
			for (var i = 0; i < resources.length; i++){
				Recommend.setRecommend(resources[i]);
			}
		});
	}
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

lifeApp.controllers.controller('SignInCtrl', function($scope, $state, UserSession, $ionicPopup) {
  $scope.data = {};

  $scope.signin = function(){
    var user_session = new UserSession({user: $scope.data});
    user_session.$save(
      function(data){
        window.localStorage.clear();  
        window.localStorage['userId'] = data.id;
        window.localStorage['userName'] = data.name;
        $state.go('tabs.about');
      },
      function(err){
        var error = err["data"]["error"] || err.data.join('. ')
        var confirmPopup = $ionicPopup.alert({
          title: 'Error',
          template: error
        });
      }
    );
  }
});
lifeApp.controllers.controller('SignUpCtrl', function($scope, $state) {
  $scope.handleRegBtnClick = function() {
    $auth.submitRegistration($scope.registrationForm).then(function(user) {
        $state.go('tabs.signin');
      }).catch(function(error) {
        // handle error response
        var error = $ionicPopup.alert({
          title: 'Error',
          template: "An error occurred."
        })
      });
  };
});

lifeApp.controllers.controller('SurveyCtrl', function($scope, $stateParams, $state, SurveyQuestion, RecommendResources) {
	var id = $stateParams.survey;

	SurveyQuestion.query({id: id}).$promise.then(function(response){
		$scope.questions = response;
		var question_index = 0;
    	$scope.question = response[question_index];

    	$scope.end = false;
    	$scope.showResources = false;

    	var resources = [];
    	var scoreArray = [];
    	var surveyLength = response.length;

		$scope.next = function(answer) {
			score = answer.score;
			scoreArray.push(score);

        	if (question_index >= $scope.questions.length -1) {
			    var totalNumber = 0;
			    $scope.end = true;

			    for(var i=0; i<scoreArray.length; i++){
			      totalNumber = totalNumber + scoreArray[i];
			    }

			    if(totalNumber > 0){
			    	$scope.showResources = true;
			    	$scope.showResources = resources;
			    }
        	} else {
        		if(score > 0){
        			//user answered 'wrong'
        			var id = response[question_index].id;
        			resources.push(RecommendResources.query({questionId: id}));
        		}
            	question_index ++;
            	$scope.question = response[question_index];
        	}
        };
	});
});

lifeApp.controllers.controller('SurveyIndexCtrl', function($scope, $ionicPopup, $http){
  $http.get(env.apiUrl + '/categories').then(function(resp) {
    $scope.categories = resp.data;
  });
});

lifeApp.controllers.controller('SurveysCtrl', function($scope, $stateParams, $http) {
  var id = $stateParams.id;

  $http.get(env.apiUrl + '/categories/' + id + '/surveys').then(function(resp) {
    $scope.surveys = resp.data;
    $scope.category = $scope.surveys[0].category.category;
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

lifeApp.services.factory('Answer', function($resource){
	return $resource(env.apiUrl + '/answers/:questionId', {questionId: '@questionId'});
});


lifeApp.services.factory('Category', function($resource) {
  return $resource(env.apiUrl + "/categories/:id");
});

lifeApp.services.factory('FirstTierQuestion', function($resource){
	return $resource('http://localhost:3000/surveyQuestions/:surveyId', {surveyId: '@id'});
});

lifeApp.services.factory('FirstTierSurvey', function($resource){
	return $resource(env.apiUrl + '/surveys/:id', {id: '@id'});
});

lifeApp.services.factory('Flag', function(){
	var flag = "";
	var setFlag = function(newFlag){
		if (arguments.length == 0){
			flag = "";
		}else{
			flag = newFlag;
		}
	}

	var getFlag = function(){
			return flag;
		}

	return{
		setFlag: setFlag,
		getFlag: getFlag
	};
});

lifeApp.services.factory('Question', function($resource){
	return $resource(env.apiUrl + '/questions/:id', {id: '@id'});
});

lifeApp.services.factory('Recommend', function(){
	var resources = [];
	var setRecommend = function(newResource){
		if (arguments.length == 0){
			resources = [];
		}
		else{
			resources.push(newResource);
		}	
	}

	var getRecommend = function(){
			return resources;
		}

	return{
		setRecommend: setRecommend,
		getRecommend: getRecommend
	};
});
lifeApp.services.factory('RecommendResources', function($resource){
	return $resource(env.apiUrl + '/recommendResources/:questionId', {questionId: '@id'});
});

lifeApp.services.factory('Resource', function($resource) {
  return $resource(env.apiUrl + "/categories/:categoryId/resources", {categoryId: '@id'});
});


lifeApp.services.factory('SecondTierQuestion', function($resource){
	return $resource(env.apiUrl + '/secondTierQuestions/:secondtiersurveyId', {secondtiersurveyId: '@id'});
});


lifeApp.services.factory('SecondTierSurvey', function($resource){
	return $resource(env.apiUrl + '/secondTierSurveys/:surveyId', {surveyId: '@id'});
});

lifeApp.services.factory('SurveyQuestion', function($resource){
	return $resource(env.apiUrl + '/surveyQuestions/:id');
});

lifeApp.services.factory('ThirdTierQuestion', function($resource){
	return $resource(env.apiUrl + '/thirdTierQuestions/:thirdtiersurveyId', {thirdtiersurveyId: '@id'});
});

lifeApp.services.factory('ThirdTierSurvey', function($resource){
	return $resource(env.apiUrl + '/thirdTierSurveys/:secondtiersurveyId', {secondtiersurveyId: '@id'});
});

lifeApp.services.factory('UserDestroy', function($resource) {
  return $resource("http://localhost:3000/users/sign_out.json");
});
lifeApp.services.factory('UserSession', function($resource) {
  return $resource("http://localhost:3000/users/sign_in.json");
});
