
var API_KEY = 'QAsQBe9jCESz0ApFzkQ5Rg==';

var ALL_DATA_LOADED = "ALL_DATA_LOADED";

var DEFAULT_SUBVERSE = "_default";
var ALL_SUBVERSE = "_all";
var FRONT_SUBVERSE = "_front";
//var DEFAULT_SUBVERSE = "front";

(function (factory) {
    window.VoatyNetwork = factory();
    window.addEventListener('ir_load', function (){
        VoatyNetwork.init();
    });
}(function () {
    var VoatyNetworkClass = function () {
        this.init = function () {
            //NSLog('VoatyNetwork - init');

            // Setup Google Analytics
            window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
            var clientId = VoatyUtil.uuidForGoogleAnalytics();
            ga('create', 'UA-66159117-2', {
                'storage': 'none',
                'clientId': clientId
            });
            ga('set', 'checkProtocolTask', null);

        };
        // ------------------------------------------------------------------------------------------------------------
        // ------------------------------------------------------------------------------------------------------------
        // Authenticate
        this.authenticate = function (username, password, successFn, errorFn) {
            superagent
                .post('https://fakevout.azurewebsites.net/api/token')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('Voat-ApiKey', API_KEY)
                .send(' grant_type=password&username='+username+'&password='+password)
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        // ------------------------------------------------------------------------------------------------------------
        // ------------------------------------------------------------------------------------------------------------
        // User
        this.getUserInfo = function (username, successFn, errorFn) {
            var request = superagent
                .get('https://fakevout.azurewebsites.net/api/v1/u/'+username+'/info')
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.getUserSubmissions = function (username, successFn, errorFn) {
            var request = superagent
                .get('https://fakevout.azurewebsites.net/api/v1/u/'+username+'/submissions')
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.getUserComments = function (username, successFn, errorFn) {
            var request = superagent
                .get('https://fakevout.azurewebsites.net/api/v1/u/'+username+'/comments')
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.getUserSubscriptions = function (username, successFn, errorFn) {
            var request = superagent
                .get('https://fakevout.azurewebsites.net/api/v1/u/'+username+'/subscriptions')
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        // ------------------------------------------------------------------------------------------------------------
        // ------------------------------------------------------------------------------------------------------------
        // Available Subverses
        this.listOfSubverseNames = function (successFn, errorFn) {
            superagent
                .get('http://fakevout.azurewebsites.net/api/top200subverses')
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.listOfSubverseNames_OLD = function (successFn, errorFn) {
            superagent
                .get('http://voat.co/api/defaultsubverses')
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        // ------------------------------------------------------------------------------------------------------------
        // ------------------------------------------------------------------------------------------------------------
        // Subvers
        this.getSubverse = function (name, paramsMap, successFn, errorFn) {
            var searchOptions = '';
            if (paramsMap) {
                for (var key in paramsMap) {
                    if (paramsMap.hasOwnProperty(key)) {
                        searchOptions += key+'='+paramsMap[key]+'&';
                    }
                }
            }
            var request = superagent
                .get('https://fakevout.azurewebsites.net/api/v1/v/'+name+'?'+searchOptions)
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.blockSubverse = function (name, successFn, errorFn) {
            var request = superagent
                .post('https://fakevout.azurewebsites.net/api/v1/v/'+name+'/block')
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.getSubverse_OLD = function (name, successFn, errorFn) {
            superagent
                .get('http://voat.co/api/subversefrontpage?subverse='+name)
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    var processedRes;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        processedRes = processOldSubverse(res.body);
                        res.body = processedRes;
                        successFn(res);
                    }
                });
        };
        var processOldSubverse = function (oldSubverse) {
            var newSubverse = {
                "success": true,
                "data": []
            };
            if (oldSubverse) {
                for (var i=0; i<oldSubverse.length; i++) {
                    newSubverse.data.push(processOldSubmission(oldSubverse[i]))
                }
            }
            return newSubverse;
        };
        var processOldSubmission = function (oldSubmission) {
            var newSubmission = {};
            var title;
            var linkDescription;
            var thumbnail;
            newSubmission['id'] = oldSubmission['Id'];
            title = oldSubmission['Title'];
            linkDescription = oldSubmission['Linkdescription'];
            if (title && title.length > 0) {
                newSubmission['title'] = title;
            } else if (linkDescription && linkDescription.length > 0) {
                newSubmission['title'] = linkDescription;
            } else {
                newSubmission['title'] = '';
            }
            newSubmission['upVotes'] = oldSubmission['Likes'];
            newSubmission['downVotes'] = oldSubmission['Dislikes'];
            newSubmission['commentCount'] = oldSubmission['CommentCount'];
            thumbnail = oldSubmission['Thumbnail'];
            if (thumbnail && thumbnail.length > 0) {
                newSubmission['thumbnail'] = 'https://cdn.voat.co/thumbs/' + thumbnail;
            } else {
                newSubmission['thumbnail'] = '';
            }
            newSubmission['subverse'] = oldSubmission['Subverse'];
            newSubmission['userName'] = oldSubmission['Name'];
            newSubmission['date'] = oldSubmission['Date'];
            var messageContent = oldSubmission['MessageContent'];
            if (VoatyUtil.isValidUrl(messageContent)) {
                newSubmission['url'] = messageContent;
                newSubmission['content'] = '';
                newSubmission['formattedContent'] = '';
            } else {
                newSubmission['url'] = '';
                newSubmission['content'] = messageContent;
                newSubmission['formattedContent'] = messageContent;
            }
            return newSubmission;
        };
        // ------------------------------------------------------------------------------------------------------------
        // ------------------------------------------------------------------------------------------------------------
        // Submission
        this.getSubmission = function (subverse, submissionId, successFn, errorFn) {
            var request = superagent
                .get('https://fakevout.azurewebsites.net/api/v1/v/'+subverse+'/'+submissionId)
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.getSubmission_OLD = function (submissionId, successFn, errorFn) {
            superagent
                .get('http://voat.co/api/singlesubmission?id='+submissionId)
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        processedRes = processOldSubmission(res.body);
                        res.body = processedRes;
                        successFn(res);
                    }
                });
        };
        this.submissionTitleSuggestion = function (url, successFn, errorFn) {
            // IMPORTANT:
            //  - request url only works from browser with valid cookie
            var request = superagent
                .get('http://fakevout.azurewebsites.net/ajaxhelpers/titlefromuri?uri='+url)
                //.set('Content-Type', 'application/json')
                //.set('Voat-ApiKey', API_KEY)
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.newSubmission = function (title, subverse, url, content, successFn, errorFn) {
            var submissionData = {};
            submissionData['title'] = title;
            if (url && url.length > 0) {
                submissionData['url'] = url;
            }
            submissionData['content'] = content;
            var request = superagent
                .post('https://fakevout.azurewebsites.net/api/v1/v/'+subverse)
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY)
                .send(submissionData);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.updateSubmission = function (submissionId, title, subverse, url, content, successFn, errorFn) {
            var submissionData = {};
            submissionData['title'] = title;
            if (url && url.length > 0) {
                submissionData['url'] = url;
            }
            submissionData['content'] = content;
            var request = superagent
                .put('https://fakevout.azurewebsites.net/api/v1/v/'+subverse+'/'+submissionId)
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY)
                .send(submissionData);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.deleteSubmission = function (submissionId, subverse, successFn, errorFn) {
            var request = superagent
                .del('https://fakevout.azurewebsites.net/api/v1/v/'+subverse+'/'+submissionId)
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.saveSubmission = function (submissionId, successFn, errorFn) {
            var request = superagent
                .post('https://fakevout.azurewebsites.net/api/v1/submissions/'+submissionId+'/save')
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.unSaveSubmission = function (submissionId, successFn, errorFn) {
            var request = superagent
                .del('https://fakevout.azurewebsites.net/api/v1/submissions/'+submissionId+'/save')
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        // ------------------------------------------------------------------------------------------------------------
        // ------------------------------------------------------------------------------------------------------------
        // Report
        this.report = function (recipient, subject, message, successFn, errorFn) {
            var request = superagent
                .post('https://fakevout.azurewebsites.net/api/v1/u/messages')
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY)
                .send({'recipient': recipient, 'subject': subject, 'message': message});
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        // ------------------------------------------------------------------------------------------------------------
        // ------------------------------------------------------------------------------------------------------------
        // Comments
        this.getComments = function (subverse, submission, successFn, errorFn) {
            var request = superagent
                .get('https://fakevout.azurewebsites.net/api/v1/v/'+subverse+'/'+submission+'/comments')
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.getComments_OLD = function (submissionId, successFn, errorFn) {
            superagent
                .get('http://voat.co/api/submissioncomments?submissionId='+submissionId)
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.newComment = function (subverse, submissionId, parentCommentId, message, successFn, errorFn) {
            var url;
            if (parentCommentId) {
                url = 'https://fakevout.azurewebsites.net/api/v1/v/'+subverse+'/'+submissionId+'/comment/'+parentCommentId;
            } else {
                url = 'https://fakevout.azurewebsites.net/api/v1/v/'+subverse+'/'+submissionId+'/comment';
            }
            var request = superagent
                .post(url)
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY)
                .send({'value': message});
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.updateComment = function (commentId, message, successFn, errorFn) {
            var request = superagent
                .put('https://fakevout.azurewebsites.net/api/v1/comments/'+commentId)
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY)
                .send({'value': message});
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.deleteComment = function (commentId, successFn, errorFn) {
            var request = superagent
                .del('https://fakevout.azurewebsites.net/api/v1/comments/'+commentId)
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.saveComment = function (commentId, successFn, errorFn) {
            var request = superagent
                .post('https://fakevout.azurewebsites.net/api/v1/comments/'+commentId+'/save')
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        this.unSaveComment = function (commentId, successFn, errorFn) {
            var request = superagent
                .del('https://fakevout.azurewebsites.net/api/v1/comments/'+commentId+'/save')
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
        // ------------------------------------------------------------------------------------------------------------
        // ------------------------------------------------------------------------------------------------------------
        // Voting
        this.vote = function (type, id, vote, successFn, errorFn) {
            var request = superagent
                .post('https://fakevout.azurewebsites.net/api/v1/vote/'+type+'/'+id+'/'+vote)
                .set('Content-Type', 'application/json')
                .set('Voat-ApiKey', API_KEY);
            if (VoatyData.isAuthenticated()) {
                request
                    .set('Authorization', VoatyData.authorizationString());
            }
            request
                .timeout(20*1000)
                .on('error', function(err) {
                    console.log(err);
                })
                .end(function(err, res){
                    var hasError = false;
                    if (err) {
                        hasError = true;
                    }
                    if (res && res.ok) {
                        //successFn(res);
                    } else {
                        hasError = true;
                    }
                    if (hasError) {
                        errorFn(err);
                    } else {
                        successFn(res);
                    }
                });
        };
    };

    return new VoatyNetworkClass();
}));

