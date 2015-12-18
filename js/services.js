angular.module('starter.services', [])

// .factory('ISurvey', function() {
//   var i = 0;
//   var questions = [{
//       id: 0,
//       question: 'Who am I? Have I thought about getting a more thorough understanding of who I am?'
//     }, {
//       id: 1,
//       question: 'Is there anything in my past (trauma or significant losses) that will impact my studies?'
//     }, {
//       id: 2,
//       question: 'Am I bondable?'
//     }, {
//       id: 3,
//       question: 'Do I have a criminal record (and have not gotten a pardon) that may exclude me from certain jobs? (ie. working with children, nursing, financial, etc.)'
//     }, {
//       id: 4,
//       question: 'Do I have any allergies that may prevent me from working in a chosen career?'
//     }, {
//       id: 5,
//       question: 'Are there any careers that for religious, ethical, or moral reasons that you would not be willing to choose?'
//     }, {
//       id: 6,
//       question: 'Am I still unsure about what I want to do or study?'
//   }];

//   var answers = [{
//       id: 0,
//       answer: "Personality Tests"
//     }, {
//       id: 1,
//       answer: "Link to resources that encourage counseling"
//     }, {
//       id: 2,
//       answer: "Link to resource that provides information on ensuring that a person is bondable"
//     }, {
//       id: 3,
//       answer: "Link to resource that provides information on how a person can obtain a pardon"
//     }, {
//       id: 4,
//       answer: "Link to allergy resources"
//     }, {
//       id: 5,
//       answer: "List of suggestions"
//     }, {
//       id: 6,
//       answer: "Link to career exploration sites"
//   }];

//   return {
//   };

// });

.factory('question', function($resource) {
  return $resource("http://stage.lifeapp.bitspacedevelopment.com/api/v1/quiz/:id.json");
})

.factory('resource', function($resource) {
  return $resource("http://stage.lifeapp.bitspacedevelopment.com/api/v1/resource/:id.json")
})

.factory('UserSession', function($resource) {
  return $resource("http://stage.lifeapp.bitspacedevelopment.com/api/v1/users/sign_in.json");
})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});


