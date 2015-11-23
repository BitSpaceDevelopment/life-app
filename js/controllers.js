angular.module('starter.controllers', [])

.controller('ResourceCtrl', function($scope, resource) {
  resource.query().$promise.then(function(response){
    $scope.resources = response;
  });
})

.controller('SurveyCtrl', function($scope, question) {
  question.query().$promise.then(function(response){
    $scope.questions = response;
  });
})

.controller('SignInCtrl', function($scope, $state, UserSession, $ionicPopup, $rootScope) {
$scope.data = {};

  $scope.login = function() {
    var user_session = new UserSession({ user: $scope.data });
    user_session.$save(
      function(data){
        window.localStorage['userId'] = data.id;
        window.localStorage['userName'] = data.name;
        $state.go('tabs.surveys');
      },
      function(err){
        var error = err["data"]["error"] || err.data.join('. ')
        var confirmPopup = $ionicPopup.alert({
          title: 'An error occured',
          template: error
        });
      }
    );
  }
})

.controller('SignUpCtrl', function($scope, $state, $auth) {
    $scope.handleRegBtnClick = function() {
      $auth.submitRegistration($scope.registrationForm)
        .then(function(resp) {
          // handle success response
          alert("success");
          $state.go('tabs.signin');
        })
        .catch(function(error) {
          // handle error response
          alert("error");
        });
    };
  })

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
