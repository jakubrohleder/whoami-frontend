!function(){"use strict";angular.module("whoamiFrontend",["ngAnimate","ngTouch","ngMessages","ngAria","ui.router","angular-jsonapi","angular-jsonapi-local","angular-jsonapi-rest","ngCable"])}(),function(){"use strict";function e(e,t,n,s){function a(){function s(s){console.log("resolved",s),localStorage.setItem("userId",e.user.data.id),n(function(){t.go("in.menu")},1500)}function a(e){console.log("rejected",e)}e.user.save().then(s,a),console.log(e.user),e.welcomeMessageShow=!0}e.user=s.initialize(),e.letsGo=a,e.welcomeMessageShow=!1}e.$inject=["$scope","$state","$timeout","Users"],angular.module("whoamiFrontend").controller("StartController",e)}(),function(){"use strict";function e(e){return e.getResource("users")}e.$inject=["$jsonapi"],angular.module("whoamiFrontend").run(["$jsonapi","apiURL",function(e,t){var n={type:"users",id:"uuid4",attributes:{name:{presence:!0}},relationships:{messages:{type:"hasMany",reflection:"author"},conversations:{type:"hasMany",reflection:!1}},functions:{toString:function(){return this.data.attributes.name?this.data.attributes.name:this.data.id}}},s=e.sourceLocal.create("LocalStore synchronization","AngularJsonAPI"),a=e.sourceRest.create("Rest synchronization",t+"/users"),o=e.synchronizerSimple.create([s,a]);e.addResource(n,o)}]).factory("Users",e)}(),function(){"use strict";function e(e){return e.getResource("messages")}e.$inject=["$jsonapi"],angular.module("whoamiFrontend").run(["$jsonapi","apiURL",function(e,t){var n={type:"messages",id:"uuid4",attributes:{text:{presence:!0}},relationships:{conversation:{type:"hasOne"},author:{type:"hasOne",model:"users",include:!0}},functions:{toString:function(){return this.data.attributes.name?this.data.attributes.name:this.data.id}}},s=e.sourceRest.create("Rest synchronization",t+"/messages"),a=e.synchronizerSimple.create([s]);e.addResource(n,a)}]).factory("Messages",e)}(),function(){"use strict";function e(e,t,n){var s=e.getResource("conversations");return s.channel=t.subscriptions.create({channel:"ConversationsChannel"},["created","joined"]),console.log(s.channel),s.channel.on("connected",function(){console.log("Connected to Conversations!")}),s.channel.on("update",function(e){console.log("updated conversation",e)}),s}e.$inject=["$jsonapi","$cable","$rootScope"],angular.module("whoamiFrontend").run(["$jsonapi","apiURL",function(e,t){var n={type:"conversations",id:"uuid4",attributes:{status:{},respondent:{},answer:{},length:{}},relationships:{messages:{included:!0,type:"hasMany"},author:{included:!0,type:"hasOne",model:"users"},whoami:{included:!0,type:"hasOne",model:"users"}},include:{get:["messages.author"]},functions:{toString:function(){return this.data.attributes.name?this.data.attributes.name:this.data.id}}},s=e.sourceRest.create("Rest synchronization",t+"/conversations"),a=e.synchronizerSimple.create([s]);e.addResource(n,a)}]).factory("Conversations",e)}(),function(){"use strict";function e(e,t,n,s,a,o,i){function r(){if(0===e.open.length)return void console.log("No free conversations");var n=e.open[Math.floor(Math.random()*e.open.length)];a.channel.send({action:"joined",conversation:n.data.id,user:o.data.id}),t.go("in.conversation",{id:n.data.id})}function c(){console.log("start");var n=a.initialize();n.form.link("author",o),n.form.data.attributes.length=e.length,n.save().then(function(){t.go("in.conversation",{id:n.data.id})},function(e){console.log(e)})}e.conversations=i,e.user=o,e.join=r,e.start=c,e.length=10,a.channel.on("created",function(){e.conversations=a.all()}),e.$watchCollection("conversations.data",function(t){void 0!==t&&(e.open=t.filter(function(e){return"open"===e.data.attributes.status&&e.relationships.author!==o}))})}e.$inject=["$scope","$state","$cable","cableURL","Conversations","user","conversations"],angular.module("whoamiFrontend").controller("MainController",e)}(),function(){"use strict";function e(e){e.channel.send({action:"index"})}e.$inject=["Conversations"],angular.module("whoamiFrontend").controller("CableController",e)}(),function(){"use strict";function e(e,t,n,s,a,o,i,r,c){function l(e){i.form.data.attributes.answer=e,i.save().then(function(){console.log("YOUR ANSWER WAS ",e)})}function u(){return void 0===i.relationships.messages||"open"===i.data.attributes.status||"finished"===i.data.attributes.status||r===i.relationships.whoami&&i.relationships.messages.length%2===0||r===i.relationships.whoami&&"bot"===i.data.attributes.respondent||r===i.relationships.author&&i.relationships.messages.length%2===1}function d(){return r===i.relationships.author&&"finished"===i.data.attributes.status&&null===i.data.attributes.answer}function h(){return r!==i.relationships.author&&"finished"===i.data.attributes.status&&null===i.data.attributes.answer}function g(e,t){var n=a.defer();return t=void 0===t?1:t,t>2?n.reject():c.ask(e,function(a,o){a===!0?(console.log("Error nb",t,o),s(function(){g(e,t+1).then(function(e){n.resolve(e)},n.reject)},500)):s(function(){n.resolve(o)},500)}),n.promise}function v(t){var n=o.initialize();console.log(i),n.form.data.attributes.text=t,n.link("author",r),n.form.link("author",r),n.link("conversation",i),n.form.link("conversation",i),n.save().then(function(){},function(e){console.log(e)}),e.text=""}e.conversation=i,e.user=r,e.text="",e.post=v,e.conversation.refresh();var m=n.subscriptions.create({channel:"ConversationChannel",id:i.data.id},["updated","newMessage"]);console.log(e.conversation),m.on("connected",function(){console.log("Connected to Conversation "+i.data.id)}),m.on("updated",function(t){console.log("Updated ",t),s(function(){e.conversation.refresh().then(function(){console.log(e.conversation.data.attributes.respondent)})},20)}),m.on("newMessage",function(t){console.log("New message ",t),s(function(){e.conversation.refresh()},20)}),e.disabled=u,e.showSurvey=d,e.showDisabledSurvey=h,e.answer=l,e.$watch("conversation.relationships.messages.length",function(e){if(r===i.relationships.whoami&&"bot"===i.data.attributes.respondent&&e%2===1){console.log("Clever response");var t=i.relationships.messages[i.relationships.messages.length-1],n=t.data.attributes.text;console.log(n),g(n).then(v)}})}e.$inject=["$scope","$state","$cable","$timeout","$q","Messages","conversation","user","cleverbot"],angular.module("whoamiFrontend").controller("ConversationController",e)}(),function(){"use strict";function e(e){e.debug("runBlock end")}e.$inject=["$log"],angular.module("whoamiFrontend").run(e)}(),function(){"use strict";function e(e,t,n){e.state("cable",{url:"/cable",templateUrl:"app/cable/cable.html",controller:"CableController"}).state("start",{url:"/start",templateUrl:"app/start/start.html",controller:"StartController",resolve:{user:["$state","$q","$timeout",function(e,t,n){var s=localStorage.getItem("userId");return null!==s?(n(function(){e.go("in.menu")}),t.reject()):void 0}]}}).state("in",{url:"","abstract":!0,template:"<ui-view></ui-view>",resolve:{user:["$state","$q","$timeout","Users",function(e,t,n,s){function a(){n(function(){e.go("start")}),i.reject()}var o=localStorage.getItem("userId"),i=t.defer();null===o&&a();var r=s.get(o);return r.promise.then(function(){i.resolve(r)},function(){localStorage.removeItem("userId"),a()}),i.promise}]}}).state("in.menu",{url:"/",templateUrl:"app/main/main.html",controller:"MainController",resolve:{conversations:["Conversations",function(e){return e.all()}]}}).state("in.conversation",{url:"/{id:"+n+"}",templateUrl:"app/conversation/conversation.html",controller:"ConversationController",resolve:{conversation:["Conversations","$stateParams",function(e,t){return e.get(t.id)}]}}),t.otherwise("/")}e.$inject=["$stateProvider","$urlRouterProvider","uuid4Regex"],angular.module("whoamiFrontend").config(e)}(),function(){"use strict";var e="[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}",t=require("cleverbot");angular.module("whoamiFrontend").constant("uuid4Regex",e).constant("apiURL","//whoami-backend.herokuapp.com").constant("cableURL","ws://whoami-backend.herokuapp.com/cable").constant("Cable",window.ActionCableReact.Cable).constant("$cable",window.ActionCableReact.ActionCable.createConsumer("ws://whoami-backend.herokuapp.com/cable")).constant("cleverbot",new t("HlgZbIBb8jpa7HxE","PLhnwSBIeuGvDRPQWi0jlpHgwKwfVnwS"))}(),function(){"use strict";function e(e){e.debugEnabled(!0)}e.$inject=["$logProvider"],angular.module("whoamiFrontend").config(e)}(),angular.module("whoamiFrontend").run(["$templateCache",function(e){e.put("app/cable/cable.html","<h1>CABLE</h1>"),e.put("app/conversation/conversation.html",'<div class="container"><div class="header"><h1 class="header__heading">Conversation {{conversation.data.attributes.length}}</h1><h4>{{conversation.data.attributes.length * 2 - conversation.relationships.messages.length}} messages till the judgment</h4><a class="header__subheading" href="" ui-sref="in.menu">Back</a></div><div class="chat"></div><div class="wait-message message" ng-hide="conversation.relationships.whoami"><h4 class="wait-message__text">Wait for someone to join.</h4><i class="fa fa-hourglass-o wait-message__icon"></i></div><div class="bot-message message" ng-show="conversation.data.attributes.respondent === \'bot\' && conversation.relationships.whoami === user"><h4 class="bot-message__text">Cleverbot will answer for you this time!</h4></div><div class="finished-message message" ng-show="conversation.data.attributes.status === \'finished\'"><h2 class="finished-message__text">Chat finished</h2><div class="finished-message__survey" ng-show="showSurvey()"><h4 class="finished-message__text">Who were you talking with?</h4><div class="finished-message__survey__buttons"><button class="finished-message__survey__buttons__button" ng-click="answer(\'bot\')">Bot</button> <button class="finished-message__survey__buttons__button" ng-click="answer(\'human\')">Human</button></div></div><div class="finished-message__survey" ng-show="showDisabledSurvey()"><h4 class="finished-message__text">Now the user is guessing who were he talking to.</h4></div><div class="finished-message__answer" ng-show="conversation.data.attributes.answer"><span ng-show="conversation.data.attributes.answer === conversation.data.attributes.respondent">Right, it was a {{conversation.data.attributes.respondent}}</span> <span ng-hide="conversation.data.attributes.answer === conversation.data.attributes.respondent">Wrong, it was a {{conversation.data.attributes.respondent}}</span><br><br><button class="button" ui-sref="in.menu"><i class="fa fa-arrow-left"></i> Back</button></div></div><div class="chat__messages"><div class="chat__messages__message" ng-class="{right: message.relationships.author === user}" ng-repeat="message in conversation.relationships.messages"><div class="chat__messages__message__text">{{message.data.attributes.text}}</div></div></div><div class="chat__input" ng-class="{disabled: disabled()}"><input class="chat__input__input" type="text" ng-model="text" ng-disabled="disabled()"> <button class="button chat__input__button" ng-click="post(text)" ng-disabled="disabled()">Send <i class="fa fa-arrow-right"></i></button></div></div>'),e.put("app/main/main.html",'<div class="container"><div class="content"><div class="icon-buttons"><div class="icon-buttons__button" ng-click="join()" ng-class="{\'icon-buttons__button--disabled\': !open.length}"><i class="fa fa-arrow-right icon-buttons__icon"></i><h2 class="icon-buttons__text">Join conversation</h2></div><div class="icon-buttons__button" ng-click="start()"><i class="fa fa-arrow-right icon-buttons__icon"></i><h2 class="icon-buttons__text">Start new conversation</h2></div></div></div></div>'),e.put("app/start/start.html",'<div class="container" ng-hide="welcomeMessageShow"><div class="content"><span class="input input__name input--hoshi"><input class="input__field input__field--hoshi" type="text" id="input-4" ng-model="user.form.data.attributes.name"> <label class="input__label input__label--hoshi input__label--hoshi-color-1" for="input-4" ng-hide="user.data.attributes.name"><span class="input__label-content input__label-content--hoshi">Your Name</span></label> <i class="fa fa-arrow-right input__icon--hoshi" ng-click="letsGo()"></i></span></div></div><div class="container" ng-show="welcomeMessageShow"><div class="content"><div class="profile"><h1 class="profile__name">Hi {{user.data.attributes.name}}</h1><img class="profile__image" ng-src="http://robohash.org/{{user.data.attributes.name}}" alt=""></div></div></div>')}]);
//# sourceMappingURL=../maps/scripts/app-c1d1fa1604.js.map
