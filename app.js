 var app = angular.module("blogApp", ["ui.router", "ngToast", "textAngular"]);



 app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

    $locationProvider.hashPrefix(''); 

    
    
    Stamplay.init("blogit07");
    
   $stateProvider
        .state('home',{
                url : '/',
            templateUrl : 'templates/home.html',
            controller : "HomeCtrl"
   })
     
     .state('signup',{
                url : '/signup',
            templateUrl : 'templates/signup.html',
            controller : "SignupCtrl"
   })
     
     .state('create',{
                url : '/create',
            templateUrl : 'templates/create.html',
            controller : "CreateCtrl",
            authenticate: true
            
   })
     
      .state('myBlogs',{
                url : '/myBlogs',
            templateUrl : 'templates/myblogs.html',
            controller : "MyBlogsCtrl",
            authenticate: true
            
   })
     .state('edit',{
                url : '/edit/:id',
            templateUrl : 'templates/edit.html',
            controller : "EditCtrl",
            authenticate: true
            
   })
     
      .state('view',{
                url : '/view/:id',
            templateUrl : 'templates/view.html',
            controller : "ViewCtrl"
            
   })
     
        .state('login',{
                url : '/login',
            templateUrl : 'templates/login.html',
            controller : "LoginCtrl"
   });
     
     $urlRouterProvider.otherwise("/");
   
});


app.filter('htmlToPlainText', function(){
    return function(text){
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    }
})



app.run(function($rootScope, AuthService, $state, $transitions){
    // $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    //     if(toState.authenticate == true)
    //     {
    //         AuthService.isAuthenticated()
    //         .then(function(res){
    //             console.log(res);
    //             if(res == false)
    //             {
    //                 $state.go('login');
    //             }
    //         });
    //     }
    // })
    
    $transitions.onStart({}, function(transition){
        if(transition.$to().self.authenticate == true){
            AuthService.isAuthenticated()
            .then(function(res){
                console.log(res);
                if(res == false)
                {
                    $state.go('login');
                }
            });
        }
    })
});


app.factory('AuthService', function($q, $rootScope){
    return{
        isAuthenticated : function(){
            var defer = $q.defer();
            Stamplay.User.currentUser(function(err, res){
                if(err){
                    defer.resolve(false);
                    $rootScope.loggedIn = false;
                }
                if(res){
                    defer.resolve(true);
                    $rootScope.loggedIn = true;
                }
                else{
                    defer.resolve(false);
                    $rootScope.loggedIn = false;
                }
            })
            
            return defer.promise;
        }
    }
})










  

    app.controller('MainCtrl', function($scope, $rootScope, $timeout, ngToast) {
    
        $scope.logout = function(){
            console.log("logout called");
            Stamplay.User.logout(true, function(){
                
                console.log("logged out");
                $timeout(function(){
                         ngToast.create("You have been Logged out !");
                            });
                $timeout(function(){
                    $rootScope.loggedIn = false;
                })
            })
        }
        
    
    });
    
    app.controller('HomeCtrl', function($scope, $state){
        
        Stamplay.Object("blogs").get({sort : "-dt_create"})
        .then(function(res){
            console.log(res);
            $scope.latestBlogs = res.data;
            $scope.$apply();
            console.log($scope.latestBlogs);
            
        }, function(err){
            console.log("err");            
        })
        
        
    })
    
    app.controller('LoginCtrl', function($scope, $state, $timeout, $rootScope, ngToast){
        
        $scope.login = function(){
            Stamplay.User.currentUser()
            .then(function(response){
                console.log(response);
                if(response.user){
                    $rootScope.loggedIn = true;
                    $timeout(function(){
                         ngToast.create("Login Successful !");
                            });
                    $rootScope.displayName = response.firstName+" "+response.lastName;
                    $timeout(function(){
                    $state.go( "myBlogs" );
                        });
                }
                else{
                 
                    Stamplay.User.login($scope.user)
                    .then(function(response){
                        $rootScope.loggedIn = true;
                        console.log("logged in"+ response);
                        $timeout(function(){
                         ngToast.create("Login Successful !");
                            });
                         $rootScope.displayName = response.firstName+" "+response.lastName;
                        
                          $timeout(function(){
                    $state.go( "myBlogs" );
                        });
                        
                    }, function(error){
                        console.log(error);
                        $timeout(function(){
                         ngToast.create("Login Failed !");
                            });
                        $rootScope.loggedIn = false;
                    })
                }
                
            }, function(error){
                $timeout(function(){
                         ngToast.create("Login Failed !");
                            });
                console.log(error);
            });
        }
        
        
    })
    app.controller('SignupCtrl', function($scope, $state, $timeout, ngToast){
        $scope.newUser ={};
        $scope.signup = function(){
            
            $scope.newUser.displayName =$scope.newUser.firstName + " " + $scope.newUser.lastName;
            
            if($scope.newUser.firstName && $scope.newUser.lastName && $scope.newUser.email && $scope.newUser.password && $scope.newUser.confirmPassword){
                console.log("All fields are valid");
                if($scope.newUser.password == $scope.newUser.confirmPassword){
                    console.log("all good")
                    Stamplay.User.signup($scope.newUser)
                    .then(function(response){
                        console.log(response);
                        $timeout(function(){
                         ngToast.create("Your Account has been created ! Please Login");
                            });
                        $rootScope.loggedIn = false;
                    }, function(error){
                        console.log(error);
                        $timeout(function(){
                         ngToast.create("Email Already Exists");
                            });
                    }
                         );
                }
                else{
                    console.log("password dont match");
                    $timeout(function(){
                         ngToast.create("Passwords do not match ! Try Again");
                            });
                }
            }
            
            else{
                console.log("some fields are invalid")
                $timeout(function(){
                         ngToast.create("Enter Information Correctly");
                            });
            }
        }
    });


    

app.controller("CreateCtrl", function(taOptions, $scope, ngToast, $state, $timeout){
    
    $scope.newPost = {};
    
    
     taOptions.toolbar = [
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
      ['html', 'insertImage','insertLink', 'insertVideo', 'wordcount', 'charcount']
  ];
    
    $scope.create = function(){
        Stamplay.User.currentUser()
        .then(function(response){
            if(response.user){
                Stamplay.Object("blogs").save($scope.newPost)
                .then(function(response){
                    $timeout(function(){
                ngToast.create("Blog Created Successfully");    
                })
                    $timeout(function(){
                $state.go("myBlogs");    
                })
                    
                }, function(error){
                    $timeout(function(){
                ngToast.create("An error has occured while writing, Please try again later.");    
                })
                    console.log(error);
                })
            }
            else{
                $timeout(function(){
                ngToast.create("You are not Logged in");    
                })
                $timeout(function(){
                $state.go("login");    
                })
                
            }
        }, function(error){
            $timeout(function(){
                ngToast.create("An error has occured");    
                })
            console.log(error);
        })
    }
    
    
});

    app.controller("MyBlogsCtrl", function($scope, $state){
        
       
  
        Stamplay.User.currentUser()
        .then(function(response){
            
            if(response.user){
                Stamplay.Object("blogs").get({owner: response.user._id, sort : "-dt_create"})
                .then(function(res){
                    console.log(res);
                    $scope.userBlogs = res.data;
                    $scope.$apply();
                    console.log($scope.userBlogs.title);
                    console.log($scope.userBlogs.content);
                }, function(error){
                    console.log(error);
                    
                })
            }
            
            else{
                $state.go("login");
            }
            
            
        }, function(error){
            console.log(error);
        })
        
    })
      

app.controller("EditCtrl", function($scope, $timeout, $stateParams, $state, ngToast, taOptions){
    
    
      $scope.Post = {};
    
    
     taOptions.toolbar = [
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
      ['html', 'insertImage','insertLink', 'insertVideo', 'wordcount', 'charcount']
  ];
    
  Stamplay.Object("blogs").get({_id : $stateParams.id})
    .then(function(res){
      console.log(res);
      
      $scope.Post = res.data[0];
      $scope.$apply();
      console.log($scope.Post);
      
      
      
  }, function(err){
      console.log(err);
  })
    
    $scope.update = function(){
        Stamplay.User.currentUser().then(function(res){
            
            if(res.user){
                if(res.user._id == $scope.Post.owner){
                    Stamplay.Object("blogs").update($stateParams.id, $scope.Post)
                    .then(function(response){
                        console.log(response);
                        $state.go("myBlogs");
                    }, function(error){
                        console.log(error);
                        
                    })
                }
                else{
                    $state.go("login");
                }
            }
            else{
                $state.go("login");
            }
            
        }, function(err){
            console.log(err);
        })
    }
    
    
    
})


app.controller("ViewCtrl", function($scope, $stateParams, $timeout, $state, ngToast, $rootScope){
   $scope.upVote = function(){
       Stamplay.Object("blogs").upVote($stateParams.id)
       .then(function(res){
           console.log(res);
           $scope.blog= res;
           $scope.comment= "";
           $scope.upVoteCount = $scope.blog.actions.votes.users_upvote.length;
           $scope.downVoteCount = $scope.blog.actions.votes.users_downvote.length;
           $scope.$apply();
           
       }, function(err){
           console.log(err);
           if(err.code == 403){
               console.log("Login First");
               $timeout(function(){
                   ngToast.create('<a href="#/login" class="">Please Login before voting!</a>');
               })
           }
           if(err.code == 406){
               console.log("Already Voted!");
               $timeout(function(){
                   ngToast.create("You have Already Voted on this Post!");
               })
           }
           
       })
   }
   
   $scope.downVote = function(){
       Stamplay.Object("blogs").downVote($stateParams.id)
       .then(function(res){
           console.log(res);
           $scope.blog= res;
           $scope.comment= "";
           $scope.upVoteCount = $scope.blog.actions.votes.users_upvote.length;
           $scope.downVoteCount = $scope.blog.actions.votes.users_downvote.length;
           $scope.$apply();
           
       }, function(err){
           console.log(err);
           if(err.code == 403){
               console.log("Login First");
               $timeout(function(){
                   ngToast.create('<a href="#/login" class="">Please Login before voting!</a>');
               })
           }
           if(err.code == 406){
               console.log("Already Voted!");
               $timeout(function(){
                   ngToast.create("You have Already Voted on this Post!");
               })
           }
           
       })
   }
    
   
   
   
   
   
   
   Stamplay.Object("blogs").get({_id: $stateParams.id})
    .then(function(response){
        console.log(response);
        $scope.blog = response.data[0];
       
        $scope.upVoteCount = $scope.blog.actions.votes.users_upvote.length;
        $scope.downVoteCount = $scope.blog.actions.votes.users_downvote.length;
        $scope.$apply();
        
    }, function(error){
        console.log(error);   
    })
    
    $scope.postComment = function(){
        Stamplay.Object("blogs").comment($stateParams.id, $scope.comment)
        .then(function(res){
              console.log(res);
            $scope.blog = res;
            $scope.comment = "";
            $scope.$apply();
              }, function(err){
            console.log(err);
            if(err.code == 403){
                console.log("login first");
                $timeout(function(){
                    ngToast.create('<a href="#/login" class="">Please Login before posting comments!</a>');
                });
            }
        })
    }
    
    
})