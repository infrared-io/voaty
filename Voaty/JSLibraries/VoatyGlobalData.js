

var INFRARED_DATA_KEY_PREFIX = "eokdnvjck9458ntv7rygfuiw0pkfojw";
var USERNAME_KEY = "username";
var PASSWORD_KEY = "password";
var KEYCHAIN_ACCOUNT_KEY = ".voaty.infrared.io";

(function (factory) {
    window.VoatyData = factory();
    window.addEventListener('ir_load', function (){
        VoatyData.init();
    });
}(function () {
    var VoatyDataClass = function () {
        this.init = function () {
            //NSLog('VoatyData - init');
            this.initBlockedSubverses();
        };
        // ------------------------------------------------------------------------------------------------------------
        this.initBlockedSubverses = function () {
            var blockedSubverses = localStorage.getItem('blockedSubverses');
            var blockedSubversesArray;
            var defaultBlockedSubverses;
            if (blockedSubverses == null) {
                defaultBlockedSubverses = 'fatpeoplehate,niggers';
                localStorage.setItem('blockedSubverses', defaultBlockedSubverses);
                this.blockedSubverses = defaultBlockedSubverses.split(',');
            } else {
                blockedSubversesArray = blockedSubverses.split(",");
                this.blockedSubverses = blockedSubversesArray;
            }
        };
        this.addBlockedSubverse = function (subverse) {
            // -- update data structure
            if (this.blockedSubverses.indexOf(subverse) == -1) {
                this.blockedSubverses.push(subverse);
            }
            // -- update local storage
            var blockedSubverses = this.blockedSubverses.toString();
            localStorage.setItem('blockedSubverses', blockedSubverses);
        };
        this.removeBlockedSubverse = function (subverse) {
            // -- update data structure
            this.blockedSubverses = this.blockedSubverses.filter(function (el) {
                return el !== subverse;
            });
            // -- update local storage
            var blockedSubverses = this.blockedSubverses.toString();
            localStorage.setItem('blockedSubverses', blockedSubverses);
        };
        // ------------------------------------------------------------------------------------------------------------
        this.isUserAgreementAccepted = function () {
            var isUserAgreementAccepted = localStorage.getItem('userAgreementAccepted');
            return (isUserAgreementAccepted === 'true');
        };
        this.setUserAgreementToAccepted = function () {
            localStorage.setItem('userAgreementAccepted', true);
        };
        // ------------------------------------------------------------------------------------------------------------
        this.saveUserData = function (username, password, tokenData) {
            // -- set username in NSUserDefaults
            IR.Util.setUserDefaultsValueForKey(username, INFRARED_DATA_KEY_PREFIX+USERNAME_KEY);
            // -- set pass in Keychain
            IR.Util.setKeychainPasswordForKeyAndAccount(password, INFRARED_DATA_KEY_PREFIX+PASSWORD_KEY, INFRARED_DATA_KEY_PREFIX+KEYCHAIN_ACCOUNT_KEY);
            // -- token data
            this.tokenData = tokenData;
            this.tokenData.password = password;
        };
        this.saveTokenDataWithPassword = function (tokenData, password) {
            this.tokenData = tokenData;
            this.tokenData.password = password;
        };
        this.hasStoredAccount = function () {
            var hasStoredAccount = false;
            var usernameAndPassword = this.getUsernameAndPasswordFromSecureStorage();
            if (usernameAndPassword.username && usernameAndPassword.username.length > 0
                && usernameAndPassword.password && usernameAndPassword.password.length > 0)
            {
                hasStoredAccount = true;
            }
            return hasStoredAccount;
        };
        this.getUsernameAndPasswordFromSecureStorage = function () {
            var username = IR.Util.userDefaultsValueForKey(INFRARED_DATA_KEY_PREFIX+USERNAME_KEY);
            var password = IR.Util.keychainPasswordForKeyAndAccount(INFRARED_DATA_KEY_PREFIX+PASSWORD_KEY, INFRARED_DATA_KEY_PREFIX+KEYCHAIN_ACCOUNT_KEY);
            return {
                username : username,
                password : password
            };
        };
        this.isAuthenticated = function () {
            var isAuthenticated = false;
            if (this.tokenData && this.tokenData.access_token && this.tokenData.access_token.length > 0) {
                isAuthenticated = true;
            }
            return isAuthenticated;
        };
        this.authorizationString = function () {
            return VoatyData.tokenData.token_type+' '+VoatyData.tokenData.access_token;
        };
        this.cleanSignedInUserAndUsernameAndPasswordFromSecureStorage = function () {
            this.tokenData = null;
            IR.Util.removeDefaultsValueForKey(INFRARED_DATA_KEY_PREFIX+USERNAME_KEY);
            IR.Util.removeKeychainPasswordForKeyAndAccount(INFRARED_DATA_KEY_PREFIX+PASSWORD_KEY, INFRARED_DATA_KEY_PREFIX+KEYCHAIN_ACCOUNT_KEY);
        };
        // ------------------------------------------------------------------------------------------------------------
        this.getAllCommentsWithId = function (commentId, submissionId) {
            var commentList = [];
            var anComment;
            var submissionList = this.getAllSubmissionsWithId(submissionId);
            for (var i=0; i<submissionList.length; i++) {
                anComment = this.getCommentWithIdInSubmission(commentId, submissionList[i]);
                if (anComment) {
                    commentList.push(anComment);
                }
            }
            return commentList;
        };
        this.getCommentWithIdInSubmission = function (commentId, submission) {
            var comment = null;
            if (submission && submission.comments) {
                for (var i=0; i<submission.comments.length; i++) {
                    if (submission.comments[i].id == commentId) {
                        comment = submission.comments[i];
                        break;
                    }
                }
            }
            return comment;
        };
        this.setCommentsForSubmissionWithId = function (comments, submissionId) {
            var submission = this.getSubmissionWithId(submissionId);
            if (submission) {
                submission.comments = comments;
            }
        };
        this.getAllSubmissionsWithId = function (submissionId) {
            var allSubmissions = [];
            var anSubmissions;
            var subverse;
            if (this.subverseMap) {
                for (var key in this.subverseMap) {
                    if (this.subverseMap.hasOwnProperty(key)) {
                        subverse = this.subverseMap[key];
                        anSubmissions = this.submissionWithIdInSubverse(submissionId, subverse);
                        if (anSubmissions) {
                            allSubmissions.push(anSubmissions);
                        }
                    }
                }
            }
            return allSubmissions;
        };
        this.getSubmissionWithId = function (submissionId) {
            var submission = null;
            var subverse;
            if (this.subverseMap) {
                for (var key in this.subverseMap) {
                    if (this.subverseMap.hasOwnProperty(key)) {
                        subverse = this.subverseMap[key];
                        submission = this.submissionWithIdInSubverse(submissionId, subverse);
                        if (submission) {
                            break;
                        }
                    }
                }
            }
            return submission;
        };
        this.submissionWithIdInSubverse = function (submissionId, subverse) {
            var submission = null;
            if (subverse) {
                for (var i = 0; i < subverse.length; i++) {
                    if (subverse[i].id == submissionId) {
                        submission = subverse[i];
                        break;
                    }
                }
            }
            return submission;
        };
        this.setSubmissionWithIdInSubverse = function (submissionId, submission, subverse) {
            if (subverse) {
                for (var i = 0; i < subverse.length; i++) {
                    if (subverse[i].id == submissionId) {
                        subverse[i] = submission;
                        break;
                    }
                }
            }
        };
        this.updateSubmissionWithId = function (submissionId, submission) {
            var subverse;
            var oldSubmission;
            if (this.subverseMap) {
                for (var key in this.subverseMap) {
                    if (this.subverseMap.hasOwnProperty(key)) {
                        subverse = this.subverseMap[key];
                        oldSubmission = this.submissionWithIdInSubverse(submissionId, subverse);
                        if (oldSubmission) {
                            this.setSubmissionWithIdInSubverse(submissionId, submission, subverse);
                            break;
                        }
                    }
                }
            }
        };
        this.tokenData = null;
        //{
        //    ".issued": "Tue, 14 Jul 2015 12:35:49 GMT",
        //    "token_type": "bearer",
        //    "userName": "urosmil",
        //    "access_token": null,
        //    "expires_in": 1295999,
        //    ".expires": "Wed, 29 Jul 2015 12:35:49 GMT"
        //};
        this.subverseNamesArray = null;
        this.subverseMap = {};
        this.userMap = {};
        this.blockedSubverses = [];
    };

    return new VoatyDataClass();
}));