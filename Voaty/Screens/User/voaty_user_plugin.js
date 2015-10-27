IR.plugin({
    "viewDidLoad" : function () {
        this.username = this.data;
        this.gaScreenName = 'voaty_user';

        this.title = this.username;

        this.currentContentType = this.ContentType.ContentTypeSubmission;

        this.userInfo = VoatyData.userMap[this.username];
        if (this.userInfo) {
            this.userInfo.timeAgoRegistration = VoatyUtil.calculateTimeAgo(new Date(this.userInfo.registrationDate));
            this.updateTableData();
        } else {
            this.hideViewWithId('user_info_wrapper');
            this.showGlobalProgressHUDWithTitle('Loading ...');
            this.loadUserData();
        }

        this.oldSubmissionDeleted = (function (e) {
            if (VoatyData.tokenData && this.username == VoatyData.tokenData.userName) {
                this.showGlobalProgressHUDWithTitle('Refreshing ...');
                VoatyNetwork.getUserSubmissions(this.username,
                    (function (result) {
                        this.userInfo.submissions = result.body.data;
                        if (this.userInfo.subscriptions) {
                            for (var i=0; i<this.userInfo.subscriptions.length; i++) {
                                anSubscription = this.userInfo.subscriptions[i];
                                anSubscription.cellId = 'subscription_cell';
                            }
                        }
                        var cellData = this.userInfo.submissions;
                        cellData = this.filterContent(cellData);
                        this.tableData[0].cells = cellData;
                        this.updateComponentsWithDataBindingKey('tableData');

                        this.dismissGlobalHUD();
                    }).bind(this),
                    (function (error) {
                        this.dismissGlobalHUD();
                        this.showAlertView(
                            'Error', 'User\'s submissions can not be loaded at the moment.\nPlease try again later.',
                            null,
                            'OK', [], null);
                    }).bind(this)
                );
            }
        }).bind(this);
        addEventListener(OLD_SUBMISSION_DELETED, this.oldSubmissionDeleted, false);

        IR.watch(this, 'searchText', (function () {
            this.updateTableData();
        }).bind(this));
    },
    "viewWillAppear" : function (animated) {
        ga('send', 'pageview', '/voaty_user');
    },
    "willMoveToParentViewController" : function (parent) {
        if (parent == null || parent[0] == null) {
            removeEventListener(OLD_SUBMISSION_DELETED, this.oldSubmissionDeleted, false);
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "filterContent": function (subverseNamesArray) {
        var result;
        var text = this.searchText.trim();
        var matchingText;
        if (text.length > 0) {
            result = [];
            for (var i=0; i<subverseNamesArray.length; i++) {
                if (this.currentContentType == this.ContentType.ContentTypeSubmission) {
                    matchingText = subverseNamesArray[i].title;
                } else if (this.currentContentType == this.ContentType.ContentTypeComments) {
                    matchingText = subverseNamesArray[i].content;
                } else if (this.currentContentType == this.ContentType.ContentTypeSubscriptions) {
                    matchingText = subverseNamesArray[i].name;
                } else {
                    matchingText = null;
                }
                if (matchingText != null && matchingText.toLowerCase().indexOf(text.toLowerCase()) != -1) {
                    result.push(subverseNamesArray[i]);
                }
            }
        } else {
            result = subverseNamesArray;
        }
        return result;
    },
    "clearSearchForContent": function () {
        this.searchText = "";
        this.viewWithId('searchTextField').resignFirstResponder();
    },
    "loadUserData": function () {
        VoatyNetwork.getUserInfo(this.username,
            (function (result) {
                this.userInfo = result.body.data;
                this.userInfo.timeAgoRegistration = VoatyUtil.calculateTimeAgo(new Date(this.userInfo.registrationDate));
                VoatyData.userMap[this.username] = this.userInfo;
                VoatyNetwork.getUserSubmissions(this.username,
                    (function (result) {
                        this.userInfo.submissions = result.body.data;
                        VoatyNetwork.getUserComments(this.username,
                            (function (result) {
                                this.userInfo.comments = result.body.data;
                                VoatyNetwork.getUserSubscriptions(this.username,
                                    (function (result) {
                                        this.userInfo.subscriptions = result.body.data;

                                        this.prepareUserData();
                                        this.updateTableData();

                                        this.showViewWithId('user_info_wrapper');

                                        this.dismissGlobalHUD();

                                        var refreshControl = this.viewWithId('refreshControl');
                                        refreshControl.endRefreshing();
                                    }).bind(this),
                                    (function (error) {
                                        this.dismissGlobalHUD();

                                        var refreshControl = this.viewWithId('refreshControl');
                                        refreshControl.endRefreshing();

                                        this.showAlertView(
                                            'Error', 'User\'s data can not be loaded at the moment.\nPlease try again later.',
                                            null,
                                            'OK', [], null);
                                    }).bind(this)
                                );
                            }).bind(this),
                            (function (error) {
                                this.dismissGlobalHUD();

                                var refreshControl = this.viewWithId('refreshControl');
                                refreshControl.endRefreshing();

                                this.showAlertView(
                                    'Error', 'User\'s data can not be loaded at the moment.\nPlease try again later.',
                                    null,
                                    'OK', [], null);
                            }).bind(this)
                        );
                    }).bind(this),
                    (function (error) {
                        this.dismissGlobalHUD();

                        var refreshControl = this.viewWithId('refreshControl');
                        refreshControl.endRefreshing();

                        this.showAlertView(
                            'Error', 'User\'s data can not be loaded at the moment.\nPlease try again later.',
                            null,
                            'OK', [], null);
                    }).bind(this)
                );
            }).bind(this),
            (function (error) {
                this.dismissGlobalHUD();

                var refreshControl = this.viewWithId('refreshControl');
                refreshControl.endRefreshing();

                this.showAlertView(
                    'Error', 'User\'s data can not be loaded at the moment.\nPlease try again later.',
                    null,
                    'OK', [], null);
            }).bind(this)
        );
    },
    "prepareUserData": function () {
        var anSubmission;
        var anComment;
        var anSubscription;
        if (this.userInfo.submissions) {
            for (var i=0; i<this.userInfo.submissions.length; i++) {
                anSubmission = this.userInfo.submissions[i];
                anSubmission.cellId = 'submission_cell';
                anSubmission.pointsString = (anSubmission.upVotes-anSubmission.downVotes)+' (+'+anSubmission.upVotes+'|-'+anSubmission.downVotes+')';
                anSubmission.commentCountString = anSubmission.commentCount + ' comment(s)';
                anSubmission.date = new Date(anSubmission.date);
                anSubmission.timeAgo = VoatyUtil.calculateTimeAgo(anSubmission.date);
                anSubmission.baseUrl = (anSubmission.url && anSubmission.url.length) ? url('domain', anSubmission.url) : '';
                anSubmission.hideUrlLabel = (anSubmission.url && anSubmission.url.length) ? false : true;
            }
        }
        if (this.userInfo.comments) {
            for (var i=0; i<this.userInfo.comments.length; i++) {
                anComment = this.userInfo.comments[i];
                anComment.cellId = 'comment_cell';
                anComment.pointsString = (anComment.upVotes-anComment.downVotes)+' (+'+anComment.upVotes+'|-'+anComment.downVotes+')';
                anComment.date = new Date(anComment.date);
                anComment.timeAgo = VoatyUtil.calculateTimeAgo(anComment.date);
            }
        }
        if (this.userInfo.subscriptions) {
            for (var i=0; i<this.userInfo.subscriptions.length; i++) {
                anSubscription = this.userInfo.subscriptions[i];
                anSubscription.cellId = 'subscription_cell';
            }
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "moreUserOptions": function () {
        this.showActionSheet(
            'Submission Options',
            'this.moreUserOptionsActionSheetButtonPressed(actionSheet, buttonIndex);',
            'Cancel', null, ['Open user in Safari'/*, 'Refresh content'*/], null);
    },
    "moreUserOptionsActionSheetButtonPressed": function (actionSheet, buttonIndex) {
        switch (buttonIndex) {
            case 0: // Open user in Safari
                var path = 'https://fakevout.azurewebsites.net/user/' + this.username;
                this.openLinkInSafari(path);
                break;
            //case 1: // Refresh content
            //    this.reloadUserData();
            //    break;
        }
    },
    "pullToRefreshData": function (control, event) {
        //control.endRefreshing();
        this.reloadUserData();
    },
    "reloadUserData": function () {
        //this.showGlobalProgressHUDWithTitle('Refreshing ...');
        this.loadUserData();
    },
    // ----------------------------------------------------------------------------------------------------------------
    "switchUserContent" : function (control) {
        switch (control.selectedSegmentIndex) {
            case 0:
                this.currentContentType = this.ContentType.ContentTypeSubmission;
                break;
            case 1:
                this.currentContentType = this.ContentType.ContentTypeComments;
                break;
            case 2:
                this.currentContentType = this.ContentType.ContentTypeSubscriptions;
                break;
        }
        this.updateTableData();

        ga('send', 'event', this.gaScreenName+'-segmentedControl', 'tap', this.currentContentType, this.segmentedControlCounter);
        this.segmentedControlCounter++;
    },
    "updateTableData" : function () {
        var cellData = null;
        if (this.currentContentType == this.ContentType.ContentTypeSubmission) {
            cellData = this.userInfo.submissions;
        } else if (this.currentContentType == this.ContentType.ContentTypeComments) {
            cellData = this.userInfo.comments;
        } else if (this.currentContentType == this.ContentType.ContentTypeSubscriptions) {
            cellData = this.userInfo.subscriptions;
        }
        if (cellData == null) {
            cellData = [];
        }
        cellData = this.filterContent(cellData);
        this.tableData[0].cells = cellData;
        this.updateComponentsWithDataBindingKey('tableData');
    },
    "showSubmission": function (data) {
        this.pushViewControllerWithScreenIdAnimatedWithData('voaty_submission', true, data);
    },
    "showSubmissionWithSelectedComment": function (data) {
        var submission = VoatyData.getSubmissionWithId(data.submissionID);
        if (submission == null) {
            this.showGlobalProgressHUDWithTitle('Loading ...');
            VoatyNetwork.getSubmission(data.subverse, data.submissionID,
                //VoatyNetwork.getSubmission_OLD(data.submissionID,
                (function (result) {
                    // -- update submission UI
                    var submission = result.body.data;
                    submission.commentCountString = submission.commentCount + ' comment(s)';
                    submission.date = new Date(submission.date);
                    submission.timeAgo = VoatyUtil.calculateTimeAgo(submission.date);
                    submission.baseUrl = (submission.url && submission.url.length) ? url('domain', submission.url) : '';
                    submission.hideUrlLabel = (submission.url && submission.url.length) ? false : true;
                    submission.formattedContent = VoatyUtil.extentFormattedContent(submission.formattedContent);
                    submission.hideFormattedContentButton = (submission.formattedContent && submission.formattedContent.length > 0) ? false : true;
                    // -- update global submission data
                    VoatyData.updateSubmissionWithId(submission.id, submission);

                    submission = JSON.parse(JSON.stringify(submission));
                    submission.date = new Date(submission.date);
                    submission.highlightCommentWithId = data.id;
                    this.pushViewControllerWithScreenIdAnimatedWithData('voaty_submission', true, submission);
                }).bind(this),
                (function (error) {
                    this.dismissGlobalHUD();
                    this.showAlertView(
                        'Error', 'Submission can not be loaded at the moment.\nPlease try again later.',
                        null,
                        'OK', [], null);
                }).bind(this));
        } else {
            submission = JSON.parse(JSON.stringify(submission));
            submission.date = new Date(submission.date);
            submission.highlightCommentWithId = data.id;
            this.pushViewControllerWithScreenIdAnimatedWithData('voaty_submission', true, submission);
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "moreSubmissionOptions": function (data) {
        var options = [];
        options.push('Open submission in Safari');
        if (data.url && data.url.length > 0) {
            options.push('Open external link in Safari');
        }
        this.showActionSheet(
            'Submission Options',
            'this.moreSubmissionOptionsActionSheetButtonPressed(actionSheet, buttonIndex, data);',
            'Cancel', null, options, data);
    },
    "moreSubmissionOptionsActionSheetButtonPressed" : function (actionSheet, buttonIndex, data) {
        var path;
        var url;
        if (data.url && data.url.length > 0) {
            switch (buttonIndex) {
                case 0: // Open submission in Safari
                    path = 'http://fakevout.azurewebsites.net/v/'+ data.subverse +'/comments/' + data.id;
                    this.openLinkInSafari(path);
                    break;
                case 1: // Show external link in Safari
                    path = data.url;
                    this.openLinkInSafari(path);
                    break;
            }
        } else {
            switch (buttonIndex) {
                case 0: // Open submission in Safari
                    path = 'http://fakevout.azurewebsites.net/v/'+ data.subverse +'/comments/' + data.id;
                    this.openLinkInSafari(path);
                    break;
            }
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "moreCommentOptions": function (data) {
        this.showActionSheet(
            'Comment Options',
            'this.moreCommentOptionsActionSheetButtonPressed(actionSheet, buttonIndex, data)',
            'Cancel', null, ['Open comment in Safari', 'Copy comment text'], data);
    },
    "moreCommentOptionsActionSheetButtonPressed": function (actionSheet, buttonIndex, data) {
        switch (buttonIndex) {
            case 0: // Open in Safari
                var path = 'http://fakevout.azurewebsites.net/v/' + data.subverse + '/comments/' + data.submissionID + '/' + data.id;
                this.openLinkInSafari(path);
                break;
            case 1: // Copy text
                this.copyToPasteboard(data.content);
                break;
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "moreSubscriptionOptions": function (data) {
        this.showActionSheet(
            'Subscription Options',
            'this.moreSubscriptionOptionsActionSheetButtonPressed(actionSheet, buttonIndex, data)',
            'Cancel', null, ['Open subscription in Safari'/*, 'Unsubscribe'*/], data);
    },
    "moreSubscriptionOptionsActionSheetButtonPressed": function (actionSheet, buttonIndex, data) {
        switch (buttonIndex) {
            case 0: // Open in Safari
                var path;
                if (data.type == 1) {
                    path = 'http://fakevout.azurewebsites.net/v/'+ data.name;
                } else {
                    path = 'https://fakevout.azurewebsites.net/mysets';
                }
                this.openLinkInSafari(path);
                break;
            case 1: // Unsubscribe

                break;
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "showSubscription": function (data) {
        var subverseName = data.name;
        if (data.type == 1) {
            this.pushViewControllerWithScreenIdAnimatedWithData('voaty_subverse', true, subverseName);
        } else {
            this.showAlertView(
                'Subscription', 'Set subscriptions are not supported!',
                null,
                'OK', [], null);
        }
    },
    "showSubverse": function (data) {
        var subverseName = data.subverse;
        this.pushViewControllerWithScreenIdAnimatedWithData('voaty_subverse', true, subverseName);
    },
    "openLinkInSafari": function (path) {
        var url = NSURL.URLWithString(path);
        UIApplication.sharedApplication().openURL(url);
    },
    "gaScreenName": null,
    "username": null,
    "userInfo": null,
    "currentContentType": null,
    "ContentType": {
        "ContentTypeSubmission": "ContentTypeSubmission",
        "ContentTypeComments": "ContentTypeComments",
        "ContentTypeSubscriptions": "ContentTypeSubscriptions",
        "ContentTypeSaved": "ContentTypeSaved"
    },
    "segmentedControlCounter": 1,
    "searchText" : "",
    "tableData" : [
        {
            "cells": [  ]
        }
    ]
});