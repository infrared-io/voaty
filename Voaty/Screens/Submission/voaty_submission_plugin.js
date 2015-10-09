
IR.plugin({
    "viewDidLoad": function () {
        this.submission = JSON.parse(JSON.stringify(this.data));
        var globalData = VoatyData.getSubmissionWithId(this.submission.id);
        if (globalData) {
            this.submission = globalData;
        }
        this.submission.userNameUnderlineHidden = (this.submission.subverse == 'Anon') ? true : false;
        this.submission.formattedContent = VoatyUtil.extentFormattedContent(this.submission.formattedContent);
        this.submission.hideFormattedContentButton = (this.submission.formattedContent && this.submission.formattedContent.length > 0) ? false : true;
        this.updateComponentsWithDataBindingKey('submission');

        if (this.submission) {
            if (this.submission.comments) {
                // -- update UI
                this.commentsArray = this.submission.comments;
                this.updateCellBackground(this.commentsArray);
                this.tableData[0].cells = this.commentsArray;
                this.updateComponentsWithDataBindingKey('tableData');
                setTimeout(this.scrollToHighlightedCell, 200);
            } else if (this.submission.commentCount > 0) {
                this.showGlobalProgressHUDWithTitle('Loading ...');
                VoatyNetwork.getComments(this.submission.subverse, this.submission.id,
                    (function (result) {
                        // -- process data and set to global object
                        this.commentsArray = result.body.data;
                        this.commentsArray = this.processComments(this.commentsArray);
                        VoatyData.setCommentsForSubmissionWithId(this.commentsArray, this.submission.id);
                        // -- update UI
                        this.tableData[0].cells = this.commentsArray;
                        this.updateComponentsWithDataBindingKey('tableData');
                        setTimeout(this.scrollToHighlightedCell, 200);

                        this.dismissGlobalHUD();
                    }).bind(this),
                    (function (error) {
                        this.dismissGlobalHUD();
                        this.showAlertView(
                            'Error', 'Comments can not be loaded at the moment.\nPlease try again later.',
                            null,
                            'OK', [], null);
                    }).bind(this)
                );
            }
        }

        this.newCommentSubmitted = (function (e) {
            this.showGlobalProgressHUDWithTitle('Refreshing ...');
            this.reloadSubmissionAndCommentsData(true);
        }).bind(this);
        addEventListener(NEW_COMMENT_SUBMITTED, this.newCommentSubmitted, false);

        this.oldCommentUpdated = (function (e) {
            this.showGlobalProgressHUDWithTitle('Refreshing ...');
            this.reloadSubmissionAndCommentsData(true);
        }).bind(this);
        addEventListener(OLD_COMMENT_UPDATED, this.oldCommentUpdated, false);

        this.oldSubmissionUpdated = (function (e) {
            this.showGlobalProgressHUDWithTitle('Refreshing ...');
            this.reloadSubmissionAndCommentsData(false);
        }).bind(this);
        addEventListener(OLD_SUBMISSION_UPDATED, this.oldSubmissionUpdated, false);

        IR.watch(this, 'searchText', (function () {
            this.filterComments();
            this.updateComponentsWithDataBindingKey('tableData');
        }).bind(this));

        this.viewWithId('comments_table_view').setContentOffsetAnimated({x: 0, y: 42}, true);
    },
    "viewWillAppear": function (animated) {
        ga('send', 'pageview', '/voaty_submission');
    },
    "willMoveToParentViewController" : function (parent) {
        if (parent == null || parent[0] == null) {
            removeEventListener(NEW_COMMENT_SUBMITTED, this.newCommentSubmitted, false);
            removeEventListener(OLD_COMMENT_UPDATED, this.oldCommentUpdated, false);
            removeEventListener(OLD_SUBMISSION_UPDATED, this.oldSubmissionUpdated, false);
        }
    },
    "processComments": function (comments) {
        if (comments) {
            var anComment;
            var parentComment;
            var parentCommentIndex;
            var anDate;
            for (var i=0; i<comments.length; i++) {
                anDate = new Date(comments[i].date);
                comments[i].date = anDate;
                //comments[i].dateString = anDate.toLocaleDateString("en-US");
                comments[i].timeAgo = VoatyUtil.calculateTimeAgo(anDate);
                comments[i].pointsString = (comments[i].upVotes-comments[i].downVotes)+' (+'+comments[i].upVotes+'|-'+comments[i].downVotes+')';
                if (comments[i].id == this.data.highlightCommentWithId) {
                    comments[i].cellBackground = '#ffffff50';
                } else {
                    comments[i].cellBackground = '#ffffff00';
                }
                if (comments[i].userName == 'deleted') {
                    comments[i].alpha = 0.5;
                } else {
                    comments[i].alpha = 1;
                }
                if (this.data.subverse == 'Anon' || comments[i].userName == 'deleted') {
                    comments[i].userNameUnderlineHidden = true;
                } else {
                    comments[i].userNameUnderlineHidden = false;
                }
            }
            // -- sort by date
            comments = comments.sort( function (a,b) {
                return (a.date > b.date) ? 1 : ((a.date < b.date) ? -1 : 0);
            });
            // -- sort by upVotes for same date
            comments = comments.sort( function (a,b) {
                var compare;
                if (a.date.getFullYear() == b.date.getFullYear()
                    && a.date.getDate() == b.date.getDate()
                    && a.date.getMonth() == b.date.getMonth())
                {
                    compare = (a.upVotes > b.upVotes) ? -1 : ((a.upVotes < b.upVotes) ? 1 : 0);
                } else {
                    compare = 0;
                }
                return compare;
            });
            // -- reorder children below parent
            for (var i = 0; i < comments.length; i++) {
                anComment = comments[i];
                if (anComment.parentID) {
                    parentComment = this.commentWithId(comments, anComment.parentID);
                    parentCommentIndex = comments.indexOf(parentComment);
                    if (parentComment.cellIndentationLevel) {
                        anComment.cellIndentationLevel = parentComment.cellIndentationLevel + 1;
                    } else {
                        anComment.cellIndentationLevel = 1;
                    }
                    // -- remove at current position
                    comments.splice(i, 1);
                    // -- add below parent
                    comments.splice(parentCommentIndex+1, 0, anComment);
                }
            }
        }
        return comments;
    },
    "commentWithId": function (comments, commentId) {
        var anComment = null;
        if (comments) {
            for (var i = 0; i < comments.length; i++) {
                if (comments[i].id == commentId) {
                    anComment = comments[i];
                    break;
                }
            }
        }
        return anComment;
    },
    "updateCellBackground": function (comments) {
        if (comments) {
            for (var i=0; i<comments.length; i++) {
                if (comments[i].id == this.data.highlightCommentWithId) {
                    comments[i].cellBackground = '#ffffff50';
                } else {
                    comments[i].cellBackground = '#ffffff00';
                }
            }
        }
    },
    "scrollToHighlightedCell": function () {
        var indexOfCell = -1;
        var tableView;
        var indexPath;
        var cell;
        if (this.data.highlightCommentWithId && this.tableData[0].cells) {
            for (var i=0; i<this.tableData[0].cells.length; i++) {
                cell = this.tableData[0].cells[i];
                if (cell.id == this.data.highlightCommentWithId) {
                    indexOfCell = i;
                    break;
                }
            }
            if (indexOfCell > 0) {
                tableView = this.viewWithId('comments_table_view');
                indexPath = NSIndexPath.indexPathForRowInSection(indexOfCell, 0);
                tableView.scrollToRowAtIndexPathAtScrollPositionAnimated(indexPath, UITableViewScrollPositionMiddle, true);
            }
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "moreSubmissionOptions": function () {
        var actionSheetData = {};
        actionSheetData.names = [];
        actionSheetData.actionKeys = [];
        // -- up vote submission
        actionSheetData.names.push('Up vote submission');
        actionSheetData.actionKeys.push('upVote');
        // -- down vote submission
        actionSheetData.names.push('Down vote submission');
        actionSheetData.actionKeys.push('downVote');
        // -- save submission
        actionSheetData.names.push('Save');
        actionSheetData.actionKeys.push('save');
        // -- write a comment
        actionSheetData.names.push('Write a comment');
        actionSheetData.actionKeys.push('newComment');
        // -- edit submission
        if (VoatyData.tokenData && this.submission.userName == VoatyData.tokenData.userName) {
            actionSheetData.names.push('Edit submission');
            actionSheetData.actionKeys.push('editSubmission');
        }
        // -- open in safari
        actionSheetData.names.push('Open submission in Safari');
        actionSheetData.actionKeys.push('openInSafari');
        this.showActionSheet(
            'Submission Options',
            'this.moreSubmissionOptionsActionSheetButtonPressed(actionSheet, buttonIndex, data)',
            'Cancel', 'Report/Block', actionSheetData.names, actionSheetData);
    },
    "moreSubmissionOptionsActionSheetButtonPressed" : function (actionSheet, buttonIndex, actionSheetData) {
        var path;
        var commentData;
        var submissionData;
        var actionSheetButtonKey;
        if (buttonIndex == 0) {
            this.showActionSheet(
                'Report/Block',
                'this.moreReportBlockOptionsActionSheetButtonPressed(actionSheet, buttonIndex, data);',
                'Cancel', null, ['Report submission', 'Report user', 'Block "'+this.data.subverse+'" subverse'], this.data);
        } else {
            actionSheetButtonKey = actionSheetData.actionKeys[buttonIndex-1];
            if (actionSheetButtonKey == "upVote") {
                if (VoatyData.isAuthenticated() == false) {
                    this.showAlertView(
                        'Info', 'Please Sign In to be able to up-vote submission!',
                        null,
                        'OK', [], null);
                    return;
                }
                this.upVoteSubmission();
            } else if (actionSheetButtonKey == "downVote") {
                if (VoatyData.isAuthenticated() == false) {
                    this.showAlertView(
                        'Info', 'Please Sign In to be able to down-vote submission!',
                        null,
                        'OK', [], null);
                    return;
                }
                this.downVoteSubmission();
            } else if (actionSheetButtonKey == "save") {
                if (VoatyData.isAuthenticated() == false) {
                    this.showAlertView(
                        'Info', 'Please Sign In to be able to save submission!',
                        null,
                        'OK', [], null);
                    return;
                }
                this.showGlobalProgressHUDWithTitle('Saving ...');
                VoatyNetwork.saveSubmission(this.data.id,
                    (function (result) {
                        IR.Util.dismissGlobalHUD();
                        if (result.body.success) {
                            this.showAlertView(
                                'Success', 'Submission successfully saved!',
                                null,
                                'OK', [], null);
                        } else {
                            this.showAlertView(
                                'Error', result.body.error.message,
                                null,
                                'OK', [], null);
                        }
                    }).bind(this),
                    (function (error) {
                        IR.Util.dismissGlobalHUD();
                        this.showAlertView(
                            'Error', error.message,
                            null,
                            'OK', [], null);
                    }).bind(this));
            } else if (actionSheetButtonKey == "newComment") {
                if (VoatyData.isAuthenticated() == false) {
                    this.showAlertView(
                        'Info', 'Please Sign In to be able to write a comment!',
                        null,
                        'OK', [], null);
                    return;
                }
                commentData = {
                    'subverse': this.submission.subverse,
                    'submissionId': this.submission.id
                };
                this.pushViewControllerWithScreenIdAnimatedWithData('voaty_submission_comment', true, commentData);
            } else if (actionSheetButtonKey == "editSubmission") {
                if (VoatyData.isAuthenticated() == false) {
                    this.showAlertView(
                        'Info', 'Please Sign In to be able to edit submission!',
                        null,
                        'OK', [], null);
                    return;
                }
                if (this.submission.url && this.submission.url.length > 0) {
                    submissionData = {
                        'submissionId': this.submission.id,
                        'submissionUrl': this.submission.url,
                        'submissionTitle': this.submission.title,
                        'submissionSubverse': this.submission.subverse,
                        'submissionDate': new Date(this.submission.date)
                    };
                    this.pushViewControllerWithScreenIdAnimatedWithData('voaty_share_a_link', true, submissionData);
                } else {
                    submissionData = {
                        'submissionId': this.submission.id,
                        'submissionTitle': this.submission.title,
                        'submissionSubverse': this.submission.subverse,
                        'submissionMessage': this.submission.content,
                        'submissionDate': new Date(this.submission.date)
                    };
                    this.pushViewControllerWithScreenIdAnimatedWithData('voaty_discuss', true, submissionData);
                }
            } else if (actionSheetButtonKey == "openInSafari") {
                path = 'http://fakevout.azurewebsites.net/v/' + this.submission.subverse + '/comments/' + this.submission.id;
                this.openLinkInSafari(path);
            }
        }
    },
    "moreReportBlockOptionsActionSheetButtonPressed" : function (actionSheet, buttonIndex, data) {
        var reportData = {};
        switch (buttonIndex) {
            case 0: // Report submission
                if (VoatyData.isAuthenticated() == false) {
                    this.showAlertView(
                        'Info', 'Please Sign In to be able to report a submission!',
                        null,
                        'OK', [], null);
                    return;
                }
                reportData['fullTitle'] = 'Report submission: '+data.title;
                reportData['title'] = 'Report submission';
                reportData['subverse'] = data.subverse;
                reportData['dobyExtension'] = '\n\n\nSubmission link: http://fakevout.azurewebsites.net/v/'+data.subverse +'/comments/'+data.id;
                this.pushViewControllerWithScreenIdAnimatedWithData('voaty_report', true, reportData);
                break;
            case 1: // Report user
                if (VoatyData.isAuthenticated() == false) {
                    this.showAlertView(
                        'Info', 'Please Sign In to be able to report a user!',
                        null,
                        'OK', [], null);
                    return;
                }
                reportData['fullTitle'] = 'Report user: '+data.userName;
                reportData['title'] = 'Report user';
                reportData['subverse'] = data.subverse;
                reportData['dobyExtension'] =
                    '\n\n\nSubmission link: http://fakevout.azurewebsites.net/v/'+data.subverse +'/comments/'+data.id +
                    '\n\nUser link: https://fakevout.azurewebsites.net/user/' + data.userName;
                this.pushViewControllerWithScreenIdAnimatedWithData('voaty_report', true, reportData);
                break;
            case 2: // Block subverse
                this.showAlertView(
                    'Block subverse', 'Are you sure you want to block "'+data.subverse+'" subverse?',
                    'this.blockSubverseConfirmation(alertView, buttonIndex, data);',
                    'No', ['Yes'], data.subverse);

                break;
        }
    },
    "blockSubverseConfirmation": function (alertView, buttonIndex, subverse) {
        if (buttonIndex == 1) {
            VoatyData.addBlockedSubverse(subverse);
        }
    },
    "pullToRefreshData": function (control, event) {
        //control.endRefreshing();
        this.reloadSubmissionAndCommentsData(true);
    },
    // ----------------------------------------------------------------------------------------------------------------
    "upVoteSubmission": function () {
        this.showGlobalProgressHUDWithTitle('Up voting ...');
        VoatyNetwork.vote('submission', this.data.id, 1,
            (function (result) {
                IR.Util.dismissGlobalHUD();
                if (result.body.data.success) {
                    this.updateUIAfterSubmissionUpVote();
                } else {
                    this.showAlertView(
                        'Error', result.body.data.message,
                        null,
                        'OK', [], null);
                }
            }).bind(this),
            (function (error) {
                IR.Util.dismissGlobalHUD();
                this.showAlertView(
                    'Error', '',
                    null,
                    'OK', [], null);
            }).bind(this));
    },
    "updateUIAfterSubmissionUpVote": function () {
        var currentUpVotes = this.submission.upVotes;
        var submissionList = VoatyData.getAllSubmissionsWithId(this.data.id);
        var anSubmission;
        for (var i=0; i<submissionList.length; i++) {
            anSubmission = submissionList[i];
            anSubmission.upVotes++;
            anSubmission.pointsString = (anSubmission.upVotes-anSubmission.downVotes)+' (+'+anSubmission.upVotes+'|-'+anSubmission.downVotes+')';
        }
        if (currentUpVotes == this.submission.upVotes) {
            this.submission.upVotes++;
            this.submission.pointsString = (this.submission.upVotes - this.submission.downVotes) + ' (+' + this.submission.upVotes + '|-' + this.submission.downVotes + ')';
        }
        this.updateComponentsWithDataBindingKey('submission');
    },
    "downVoteSubmission": function () {
        this.showGlobalProgressHUDWithTitle('Down voting ...');
        VoatyNetwork.vote('submission', this.data.id, -1,
            (function (result) {
                IR.Util.dismissGlobalHUD();
                if (result.body.data.success) {
                    this.updateUIAfterSubmissionDownVote();
                } else {
                    this.showAlertView(
                        'Error', result.body.data.message,
                        null,
                        'OK', [], null);
                }
            }).bind(this),
            (function (error) {
                IR.Util.dismissGlobalHUD();
                this.showAlertView(
                    'Error', '',
                    null,
                    'OK', [], null);
            }).bind(this));
    },
    "updateUIAfterSubmissionDownVote": function () {
        var currentDownVotes = this.submission.downVotes;
        var submissionList = VoatyData.getAllSubmissionsWithId(this.data.id);
        var anSubmission;
        for (var i=0; i<submissionList.length; i++) {
            anSubmission = submissionList[i];
            anSubmission.downVotes++;
            anSubmission.pointsString = (anSubmission.upVotes-anSubmission.downVotes)+' (+'+anSubmission.upVotes+'|-'+anSubmission.downVotes+')';
        }
        if (currentDownVotes == this.submission.downVotes) {
            this.submission.downVotes++;
            this.submission.pointsString = (this.submission.upVotes - this.submission.downVotes) + ' (+' + this.submission.upVotes + '|-' + this.submission.downVotes + ')';
        }
        this.updateComponentsWithDataBindingKey('submission');
    },
    "reloadSubmissionAndCommentsData": function (updateComments) {
        VoatyNetwork.getSubmission(this.submission.subverse, this.submission.id,
            (function (result) {
                // -- update submission UI
                var submission = result.body.data;
                submission.commentCountString = submission.commentCount + ' comment(s)';
                submission.date = new Date(submission.date);
                submission.timeAgo = VoatyUtil.calculateTimeAgo(submission.date);
                submission.pointsString = (submission.upVotes-submission.downVotes)+' (+'+submission.upVotes+'|-'+submission.downVotes+')';
                submission.baseUrl = (submission.url && submission.url.length) ? url('domain', submission.url) : '';
                submission.hideUrlLabel = (submission.url && submission.url.length) ? false : true;
                submission.userNameUnderlineHidden = (submission.subverse == 'Anon') ? true : false;
                submission.formattedContent = VoatyUtil.extentFormattedContent(submission.formattedContent);
                submission.hideFormattedContentButton = (submission.formattedContent && submission.formattedContent.length > 0) ? false : true;
                this.submission = submission;
                this.updateComponentsWithDataBindingKey('submission');
                // -- update global submission data
                VoatyData.updateSubmissionWithId(this.submission.id, this.submission);
                // -- load comments
                if (updateComments) {
                    if (this.submission && this.submission.commentCount > 0) {
                        VoatyNetwork.getComments(this.submission.subverse, this.submission.id,
                            (function (result) {
                                var refreshControl = this.viewWithId('refreshControl');
                                refreshControl.endRefreshing();

                                // -- process data and set to global object
                                this.commentsArray = result.body.data;
                                this.commentsArray = this.processComments(this.commentsArray);
                                VoatyData.setCommentsForSubmissionWithId(this.commentsArray, this.submission.id);
                                this.filterComments();
                                // -- update UI
                                this.tableData[0].cells = this.commentsArray;
                                this.updateComponentsWithDataBindingKey('tableData');

                                this.dismissGlobalHUD();
                            }).bind(this),
                            (function (error) {
                                this.dismissGlobalHUD();

                                var refreshControl = this.viewWithId('refreshControl');
                                refreshControl.endRefreshing();

                                this.showAlertView(
                                    'Error', 'Comments can not be loaded at the moment.\nPlease try again later.',
                                    null,
                                    'OK', [], null);
                            }).bind(this)
                        );
                    } else {
                        var refreshControl = this.viewWithId('refreshControl');
                        refreshControl.endRefreshing();
                    }
                } else {
                    this.dismissGlobalHUD();
                }
            }).bind(this),
            (function (error) {
                this.dismissGlobalHUD();

                var refreshControl = this.viewWithId('refreshControl');
                refreshControl.endRefreshing();

                this.showAlertView(
                    'Error', 'Comments can not be loaded at the moment.\nPlease try again later.',
                    null,
                    'OK', [], null);
            }).bind(this));
    },
    "showSubverse": function () {
        var subverseName = this.submission.subverse;
        this.pushViewControllerWithScreenIdAnimatedWithData('voaty_subverse', true, subverseName);
    },
    "showUser": function () {
        if (this.submission.userNameUnderlineHidden == false) {
            this.pushViewControllerWithScreenIdAnimatedWithData('voaty_user', true, this.submission.userName);
        }
    },
    "showFullScreenSubmissionContent": function () {
        var htmlData = {
            "title": "Submission Content",
            "html": this.submission.formattedContent
        };
        this.pushViewControllerWithScreenIdAnimatedWithData('voaty_submission_content', true, htmlData);
    },
    // ----------------------------------------------------------------------------------------------------------------
    "filterComments": function () {
        var text = this.searchText.trim();
        for (var i=0; i<this.commentsArray.length; i++) {
            if (text.length == 0
                || this.commentsArray[i].content.toLowerCase().indexOf(text.toLowerCase()) != -1
                || this.commentsArray[i].userName.toLowerCase().indexOf(text.toLowerCase()) != -1)
            {
                if (this.commentsArray[i].userName == 'deleted') {
                    this.commentsArray[i].alpha = 0.5;
                } else {
                    this.commentsArray[i].alpha = 1;
                }
            } else {
                this.commentsArray[i].alpha = 0.3;
            }
        }
    },
    "clearSearchForComments": function () {
        this.searchText = "";
        this.viewWithId('searchTextField').resignFirstResponder();
    },
    // ----------------------------------------------------------------------------------------------------------------
    "showUserForComment": function (data) {
        if (data.userNameUnderlineHidden == false) {
            this.pushViewControllerWithScreenIdAnimatedWithData('voaty_user', true, data.userName);
        }
    },
    "moreCommentOptions": function (data) {
        var actionSheetData = {};
        actionSheetData.data = data;
        actionSheetData.names = [];
        actionSheetData.actionKeys = [];
        if (data.userName != 'deleted') {
            actionSheetData.names.push('Up vote comment');
            actionSheetData.actionKeys.push('upVote');
        }
        if (data.userName != 'deleted') {
            actionSheetData.names.push('Down vote comment');
            actionSheetData.actionKeys.push('downVote');
        }
        if (data.userName != 'deleted') {
            actionSheetData.names.push('Save');
            actionSheetData.actionKeys.push('save');
        }
        if (data.userName != 'deleted') {
            actionSheetData.names.push('Reply to comment');
            actionSheetData.actionKeys.push('replyToComment');
        }
        if (data.userName != 'deleted'
            && VoatyData.tokenData && data.userName == VoatyData.tokenData.userName)
        {
            actionSheetData.names.push('Edit comment');
            actionSheetData.actionKeys.push('editComment');
        }
        //actionSheetData.names.push('Copy comment text');
        //actionSheetData.actionKeys.push('copyText');
        actionSheetData.names.push('Open comment in Safari');
        actionSheetData.actionKeys.push('openInSafari');
        this.showActionSheet(
            'Comment Options',
            'this.moreCommentOptionsActionSheetButtonPressed(actionSheet, buttonIndex, data)',
            'Cancel', null, actionSheetData.names, actionSheetData);
    },
    "moreCommentOptionsActionSheetButtonPressed": function (actionSheet, buttonIndex, actionSheetData) {
        var commentData;
        var actionSheetButtonKey = actionSheetData.actionKeys[buttonIndex];
        if (actionSheetButtonKey == "upVote") {
            if (VoatyData.isAuthenticated() == false) {
                this.showAlertView(
                    'Info', 'Please Sign In to be able to up-vote comment!',
                    null,
                    'OK', [], null);
                return;
            }
            this.upVoteComment(actionSheetData.data);
        } else if (actionSheetButtonKey == "downVote") {
            if (VoatyData.isAuthenticated() == false) {
                this.showAlertView(
                    'Info', 'Please Sign In to be able to down-vote comment!',
                    null,
                    'OK', [], null);
                return;
            }
            this.downVoteComment(actionSheetData.data);
        } else if (actionSheetButtonKey == "save") {
            if (VoatyData.isAuthenticated() == false) {
                this.showAlertView(
                    'Info', 'Please Sign In to be able to save comment!',
                    null,
                    'OK', [], null);
                return;
            }
            this.showGlobalProgressHUDWithTitle('Saving ...');
            VoatyNetwork.saveComment(actionSheetData.data.id,
                (function (result) {
                    IR.Util.dismissGlobalHUD();
                    if (result.body.success) {
                        this.showAlertView(
                            'Success', 'Comment successfully saved!',
                            null,
                            'OK', [], null);
                    } else {
                        this.showAlertView(
                            'Error', result.body.error.message,
                            null,
                            'OK', [], null);
                    }
                }).bind(this),
                (function (error) {
                    IR.Util.dismissGlobalHUD();
                    this.showAlertView(
                        'Error', error.message,
                        null,
                        'OK', [], null);
                }).bind(this));
        } else if (actionSheetButtonKey == "replyToComment") {
            if (VoatyData.isAuthenticated() == false) {
                this.showAlertView(
                    'Info', 'Please Sign In to be able to reply to a comment!',
                    null,
                    'OK', [], null);
                return;
            }
            commentData = {
                'subverse': this.submission.subverse,
                'submissionId': this.submission.id,
                'parentCommentId': actionSheetData.data.id,
                'parentCommentText': actionSheetData.data.content
            };
            this.pushViewControllerWithScreenIdAnimatedWithData('voaty_submission_comment', true, commentData);
        } else if (actionSheetButtonKey == "editComment") {
            commentData = {
                'subverse': this.submission.subverse,
                'submissionId': this.submission.id,
                'commentId': actionSheetData.data.id,
                'commentText': actionSheetData.data.content,
                'parentCommentText': actionSheetData.data.content
            };
            this.pushViewControllerWithScreenIdAnimatedWithData('voaty_submission_comment', true, commentData);
        } else if (actionSheetButtonKey == "openInSafari") {
            var path = 'http://fakevout.azurewebsites.net/v/' + this.submission.subverse + '/comments/' + this.submission.id + '/' + actionSheetData.data.id;
            this.openLinkInSafari(path);
        }
    },
    "upVoteComment": function (data) {
        this.showGlobalProgressHUDWithTitle('Up voting ...');
        VoatyNetwork.vote('comment', data.id, 1,
            (function (result) {
                IR.Util.dismissGlobalHUD();
                if (result.body.data.success) {
                    this.updateUIAfterCommentUpVote(data);
                } else {
                    this.showAlertView(
                        'Error', result.body.data.message,
                        null,
                        'OK', [], null);
                }
            }).bind(this),
            (function (error) {
                IR.Util.dismissGlobalHUD();
                this.showAlertView(
                    'Error', '',
                    null,
                    'OK', [], null);
            }).bind(this));
    },
    "updateUIAfterCommentUpVote": function (data) {
        var theComment = VoatyData.getCommentWithIdInSubmission(data.id, this.submission);
        var currentUpVotes = theComment.upVotes;
        var commentList = VoatyData.getAllCommentsWithId(data.id, this.submission.id);
        var anComment;
        for (var i=0; i<commentList.length; i++) {
            anComment = commentList[i];
            anComment.upVotes++;
            anComment.pointsString = (anComment.upVotes-anComment.downVotes)+' (+'+anComment.upVotes+'|-'+anComment.downVotes+')';
        }
        if (currentUpVotes == theComment.upVotes) {
            theComment.upVotes++;
            theComment.pointsString = (theComment.upVotes - theComment.downVotes) + ' (+' + theComment.upVotes + '|-' + theComment.downVotes + ')';
        }
        this.updateComponentsWithDataBindingKey('tableData');
    },
    "downVoteComment": function (data) {
        this.showGlobalProgressHUDWithTitle('Down voting ...');
        VoatyNetwork.vote('comment', data.id, -1,
            (function (result) {
                IR.Util.dismissGlobalHUD();
                if (result.body.data.success) {
                    this.updateUIAfterCommentDownVote(data);
                } else {
                    this.showAlertView(
                        'Error', result.body.data.message,
                        null,
                        'OK', [], null);
                }
            }).bind(this),
            (function (error) {
                IR.Util.dismissGlobalHUD();
                this.showAlertView(
                    'Error', '',
                    null,
                    'OK', [], null);
            }).bind(this));
    },
    "updateUIAfterCommentDownVote": function (data) {
        var theComment = VoatyData.getCommentWithIdInSubmission(data.id, this.submission);
        var currentDownVotes = theComment.downVotes;
        var commentList = VoatyData.getAllCommentsWithId(data.id, this.submission.id);
        var anComment;
        for (var i=0; i<commentList.length; i++) {
            anComment = commentList[i];
            anComment.downVotes++;
            anComment.pointsString = (anComment.upVotes-anComment.downVotes)+' (+'+anComment.upVotes+'|-'+anComment.downVotes+')';
        }
        if (currentDownVotes == theComment.downVotes) {
            theComment.downVotes++;
            theComment.pointsString = (theComment.upVotes - theComment.downVotes) + ' (+' + theComment.upVotes + '|-' + theComment.downVotes + ')';
        }
        this.updateComponentsWithDataBindingKey('tableData');
    },
    "openLinkInSafari": function (path) {
        var url = NSURL.URLWithString(path);
        UIApplication.sharedApplication().openURL(url);
    },
    "searchText" : "",
    "submission": {},
    "commentsArray": [],
    "tableData": [
        {
            "cells": []
        }
    ]
});