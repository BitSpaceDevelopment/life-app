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

lifeApp.application.config(function($httpProvider, $authProvider, $stateProvider, $urlRouterProvider) {
  $httpProvider.defaults.withCredentials = true;

  $authProvider.configure({
    apiUrl: 'http://stage.lifeapp.bitspacedevelopment.com/api/v1'
  });

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
  .state('tabs.about', {
    url: 'about',
    views: {
      'about-tab': {
        templateUrl: 'templates/about.html'
      }
    }
  })
  .state('tabs.contact', {
    url: 'contact',
    views: {
      'contact-tab': {
        templateUrl: 'templates/contact.html'
      }
    }
  })
  .state('tabs.landing', {
    url: 'langding-page',
    views: {
      'home-tab': {
        templateUrl: 'templates/landing.html'
      }
    }
  })
  .state('tabs.intro-survey', {
    url: 'intro-survey',
    views: {
      'home-tab': {
        templateUrl: 'templates/surveys.html',
        controller: 'SurveyCtrl'
      }
    }
  })
  .state('tabs.life-survey', {
    url: 'life-survey/:survey',
    views: {
      'home-tab': {
        templateUrl: 'templates/life-survey.html',
        controller: 'LifeSurveyCtrl'
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
    }
  })
  .state('tabs.survey-index', {
    url: 'surveyindex',
    views: {
      'home-tab': {
        templateUrl: 'templates/survey-index.html',
        controller: 'SurveyIndexCtrl'
      }
    }
  })
  // Resources

  .state('tabs.resource-index', {
    url: 'resources-index',
    views: {
      'home-tab': {
        templateUrl: 'templates/resource-index.html',
        controller: 'ResourceCategoryCtrl'
      }
    }
  })
  .state('tabs.resources', {
    url: 'resources/:category',
    views: {
      'home-tab': {
        templateUrl: 'templates/resources.html',
        controller: 'ResourceCtrl'
      }
    }
  })
  //End Resources

  //Sessions
  .state('settings', {
    url: 'settings',
    templateUrl: 'templates/partial-settings.html'
  })
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
  $urlRouterProvider.otherwise('/');
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

lifeApp.controllers.controller('SurveyCtrl', function($scope, $state, FirstTierQuestion, FirstTierSurvey, Question, Answer, Category, Flag){
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
		questions = FirstTierQuestion.query({surveyId: surveyID});
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
lifeApp.controllers.controller('LifeSurveyCtrl', function($scope, $stateParams, $state, FirstTierSurvey, FirstTierQuestion, SecondTierSurvey, RecommendResources, Recommend, Question, Answer) {
	var index = 0;
	var id = $stateParams.survey;
	var questions = [];
	var surveys = [];
	var resources = [];
	var firstTierSurveyID = 0;

	//find first tier survey id which has a second tier survey
	SecondTierSurvey.query().$promise.then(function(results){
		//get first tier survey id
		firstTierSurveyID = results[0].survey_id;

		//load first tier survey data
		FirstTierSurvey.query().$promise.then(function(survey){
			//check if current id has an second tier survey	
			if(firstTierSurveyID == id){
				//toggle on LQuiz
					$scope.showLQuiz = true;
					//toggle off Quiz
					$scope.showLiFEQuiz = false;
					//load second tier survey
					surveys = SecondTierSurvey.query({surveyId: id});
					//binding second tier survey to $promise
					surveys.$promise.then(function(response){
						$scope.surveys = response;
					});
			}
			else{
				//toggle off LQuiz
				$scope.showLQuiz = false;
				//show Quiz
				$scope.showLiFEQuiz = true;
				//loading first tier questions
				questions = FirstTierQuestion.query({surveyId: id});
				questions.$promise.then(function(data){
					var qid = data[index].id;

					$scope.question = Question.get({id: qid});
					$scope.answers = Answer.query({questionId: qid});

					$scope.data = {answers: ""};

					$scope.next = function(answer){
						score = answer.score;
						//if user select no or other answers
						if(score > 0){
							//call recommend resource function
							recommendResources(qid);
						}
						//increments
						index += 1;
						//reset socre
						score = 0;

						if(index >= data.length){
							$state.go('tabs.resources');
							index = 0;
						}
						else{
							qid = data[index].id;
							$scope.question = Question.get({id: qid});
							$scope.answers = Answer.query({questionId: qid});
							$scope.data = {answers: ""};
						}
					}
				});
			}
		});	
	});

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
lifeApp.controllers.controller('ResourceCategoryCtrl', function($scope, resourceCategory) {
  resourceCategory.query().$promise.then(function(response){
    $scope.resourceCategorys = response;
  });
});

lifeApp.controllers.controller('ResourceCtrl', function($scope, $stateParams, $ionicPopup, $state, Resource, Recommend, $http) {
	var id = $stateParams.category;
    var resources = [];
    //get recommedn resources
    resources = Recommend.getRecommend();
    //if there are none recommend resources
    if(resources.length == 0){
        //do not show the title
        $scope.showRecommend = false;
        //get resources sort by category
        Resource.query({categoryId: id}).$promise.then(function(response){
            $scope.resources = response;
            //if there are none resources go back to resource index page
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
    }
    //if there are recommend resource
    else{
        //show title
        $scope.showRecommend = true;
        //scope binding recommend resources
        $scope.resources = resources;
        //clear Recommend service factory
        Recommend.setRecommend();
    }

	
    //add favourite resource
    $scope.favouritedResource = function favouritedResource(id) {     
        url = "http://stage.lifeapp.bitspacedevelopment.com/favourite/" + id + ".json";

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

lifeApp.controllers.controller('SignUpCtrl', function($scope, $state) {
  $scope.handleRegBtnClick = function() {
    $auth.submitRegistration($scope.registrationForm)
      .then(function(resp) {
        $state.go('tabs.signin');
      })
      .catch(function(error) {
        // handle error response
        var error = $ionicPopup.alert({
          title: 'Error',
          template: "An error occoured"
        })
      });
  };
});

lifeApp.controllers.controller('SurveyIndexCtrl', function($scope, $ionicPopup, FirstTierSurvey, Flag){	
	var ids = [];
	//retrieve first tier survey
	FirstTierSurvey.query().$promise.then(function(data){
		//scope binding first tier surveys
		$scope.surveys = data; 
		for(var i = 0; i < data.length; i++){
			ids.push(data[i].id);
		}

		//call function get flag
		var flag = Flag.getFlag();
		if(flag != ""){
			switch (flag){
				case 'L':
				$scope.highlightId = ids[1];
				break;
				case 'I':
				$scope.highlightId = ids[2];
				break;
				case 'F':
				$scope.highlightId = ids[3];
				break;
				case 'E':
				$scope.highlightId = ids[4];
				break;
				default:
				$scope.highlightId = ids[0];
			}

			$ionicPopup.alert({
				title: 'Detailed Quiz',
				template: 'We recommand you to take more detailed quiz'
			});
		}
		else{

		}
	});
});
lifeApp.controllers.controller('UserSessionCtrl', function($scope, $state, $window, UserSession, UserDestroy, $ionicPopup) {
  //check if user log in or not
  $scope.flag = false;
  if (window.localStorage['userId']) {
    $scope.flag = true;
  }
  //init sgin in form data
  $scope.data = {};
  
  $scope.signin = function(){
    //create new session with data user type in the sign in page
    var user_session = new UserSession({user: $scope.data});
    //attempt to save the session
    user_session.$save(
      function(data){
        //if success save the id and name into local storage
        window.localStorage.clear();  
        window.localStorage['userId'] = data.id;
        window.localStorage['userName'] = data.email;
        //refresh page to update the localstorage 
        $window.location.reload();
        $state.go('tabs.landing');
      },
      function(err){
        //if not success, show erro to user
        var error = err["data"]["error"] || err.data.join('. ')
        var confirmPopup = $ionicPopup.alert({
          title: 'Error',
          template: error
        });
      }
    );
  }

  $scope.signout = function(){ 
    var confirm = $ionicPopup.confirm({
      title: "Are you sure you want to logout?",
    });
    confirm.then(function(result){
      if(result){
        UserDestroy.get().$promise.then(function(){
          window.localStorage.clear();
          $window.location.reload();  
          $state.go('tabs.home');
        }); 
      }
    });
  }
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

lifeApp.services.factory('Answer', function($resource){
	return $resource('http://stage.lifeapp.bitspacedevelopment.com/:questionId/answers/:id', {questionId: '@questionId', id: '@id'});
});
lifeApp.services.factory('Category', function($resource){
	return $resource('http://stage.lifeapp.bitspacedevelopment.com/:questionId/categories/:id', {questionId: '@questionId', id: '@id'});
});
lifeApp.services.factory('FirstTierQuestion', function($resource){
	return $resource('http://stage.lifeapp.bitspacedevelopment.com/surveyQuestions/:surveyId', {surveyId: '@id'});
});

lifeApp.services.factory('FirstTierSurvey', function($resource){
	return $resource('http://stage.lifeapp.bitspacedevelopment.com/surveys/:id', {id: '@id'});
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
	return $resource('http://stage.lifeapp.bitspacedevelopment.com/questions/:id', {id: '@id'});
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
	return $resource('http://stage.lifeapp.bitspacedevelopment.com/recommendResources/:questionId', {questionId: '@id'});
});
lifeApp.services.factory('Resource', function($resource) {
  return $resource("http://stage.lifeapp.bitspacedevelopment.com/:categoryId", {categoryId: '@id'});
});
lifeApp.services.factory('resourceCategory', function($resource) {
  return $resource("http://stage.lifeapp.bitspacedevelopment.com/resources-list/:id.json");
});

lifeApp.services.factory('SecondTierQuestion', function($resource){
	return $resource('http://stage.lifeapp.bitspacedevelopment.com/secondTierQuestions/:secondtiersurveyId', {secondtiersurveyId: '@id'});
});
lifeApp.services.factory('SecondTierSurvey', function($resource){
	return $resource('http://stage.lifeapp.bitspacedevelopment.com/secondTierSurveys/:surveyId', {surveyId: '@id'});
});
lifeApp.services.factory('ThirdTierQuestion', function($resource){
	return $resource('http://stage.lifeapp.bitspacedevelopment.com/thirdTierQuestions/:thirdtiersurveyId', {thirdtiersurveyId: '@id'});
});
lifeApp.services.factory('ThirdTierSurvey', function($resource){
	return $resource('http://stage.lifeapp.bitspacedevelopment.com/thirdTierSurveys/:secondtiersurveyId', {secondtiersurveyId: '@id'});
});
lifeApp.services.factory('UserDestroy', function($resource) {
  return $resource("http://stage.lifeapp.bitspacedevelopment.com/users/sign_out.json");
});
lifeApp.services.factory('UserSession', function($resource) {
  return $resource("http://stage.lifeapp.bitspacedevelopment.com/users/sign_in.json");
});
