
IR.plugin({
    "viewDidLoad": function () {
        var barButtonItem;
        var customView;
        var saveButton;
        var moreButton;
        if (this.data.commentId) {
            this.title = "Comment";

            barButtonItem = IR.BarButtonItem.createWithComponentId('saveBarButton');
            customView = IR.View.createWithComponentId('customView');
            customView.frame = {
                "x": -4,
                "y": -4,
                "width": 80,
                "height": 30
            };
            // -- save button
            saveButton = IR.Button.createWithComponentId('saveButton');
            saveButton.normalTitle = "Save";
            saveButton.frame = {
                "x": 0,
                "y": 0,
                "width": 50,
                "height": 30
            };
            saveButton.touchUpInsideActions = "this.updateComment();";
            // -- more button
            moreButton = IR.Button.createWithComponentId('moreButton');
            moreButton.normalTitle = "⋮";
            moreButton.frame = {
                "x": 50,
                "y": 0,
                "width": 30,
                "height": 30
            };
            moreButton.font = UIFont.boldSystemFontOfSize(30);
            moreButton.touchUpInsideActions = "this.moreCommentOptions();";
            // -- adding to custom view and barButton
            customView.addSubview(saveButton);
            customView.addSubview(moreButton);
            barButtonItem.customView = customView;
            this.navigationItem.rightBarButtonItem = barButtonItem;
        } else {
            this.title = "New comment";

            barButtonItem = IR.BarButtonItem.createWithTitleComponentId('Submit', 'submitBarButton');
            barButtonItem.actions = "this.submitComment();";
            this.navigationItem.rightBarButtonItem = barButtonItem;
        }

        this.currentCommentType = this.CommentType.CommentTypeMine;

        if (this.data.commentText) {
            this.myCommentText = this.data.commentText;
        }
        if (this.data.parentCommentText) {
            this.parentCommentText = this.data.parentCommentText;
        }

        IR.watch(this, 'parentCommentHidden', function () {
            IR.callWatchers(this, 'myCommentHidden');
        });
    },
    "viewWillAppear": function (animated) {
        ga('send', 'pageview', '/voaty_submission_new_comment');
    },
    "viewDidAppear": function (animated) {
        this.viewWithId('myComment_tv').becomeFirstResponder();
    },
    "switchComment": function (control) {
        switch (control.selectedSegmentIndex) {
            case 0:
                this.currentCommentType = this.CommentType.CommentTypeParent;
                this.parentCommentHidden = false;
                this.viewWithId('myComment_tv').resignFirstResponder();
                break;
            case 1:
                this.currentCommentType = this.CommentType.CommentTypeMine;
                this.parentCommentHidden = true;
                this.viewWithId('myComment_tv').becomeFirstResponder();
                break;
        }
    },
    "submitComment": function () {
        if (this.myCommentText == null || this.myCommentText.length == 0) {
            this.showAlertView(
                'Error', 'Comment can not be empty!',
                null,
                'OK', [], null);
            return;
        }
        this.showGlobalProgressHUDWithTitle('Submitting comment ...');
        var parentCommentId = null;
        if (typeof this.data.parentCommentId !== 'undefined') {
            parentCommentId = this.data.parentCommentId;
        }
        VoatyNetwork.newComment(this.data.subverse, this.data.submissionId, parentCommentId, this.myCommentText,
            (function (result) {
                IR.Util.dismissGlobalHUD();
                if (result.body.success) {
                    this.viewWithId('myComment_tv').resignFirstResponder();

                    this.showAlertView(
                        'Success', 'Comment successfully submitted!',
                        'this.confirmSubmittedComment();',
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
    },
    "confirmSubmittedComment": function () {
        dispatchEvent(new CustomEvent(NEW_COMMENT_SUBMITTED));

        this.popViewControllerAnimated(true);
    },
    // ----------------------------------------------------------------------------------------------------------------
    "updateComment": function () {
        if (this.myCommentText == null || this.myCommentText.length == 0) {
            this.showAlertView(
                'Error', 'Comment can not be empty!',
                null,
                'OK', [], null);
            return;
        }
        this.showGlobalProgressHUDWithTitle('Updating comment ...');
        VoatyNetwork.updateComment(this.data.commentId, this.myCommentText,
            (function (result) {
                IR.Util.dismissGlobalHUD();
                if (result.body.success) {
                    this.viewWithId('myComment_tv').resignFirstResponder();

                    this.showAlertView(
                        'Success', 'Comment successfully updated!',
                        'this.confirmUpdatedComment();',
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
    },
    "confirmUpdatedComment": function () {
        dispatchEvent(new CustomEvent(OLD_COMMENT_UPDATED));

        this.popViewControllerAnimated(true);
    },
    // ----------------------------------------------------------------------------------------------------------------
    "moreCommentOptions": function () {
        this.viewWithId('myComment_tv').resignFirstResponder();
        this.showActionSheet(
            'Comment Options',
            'this.moreCommentOptionsActionSheetButtonPressed(actionSheet, buttonIndex)',
            'Cancel', 'Delete', [], null);
    },
    "moreCommentOptionsActionSheetButtonPressed": function (actionSheet, buttonIndex) {
        switch (buttonIndex) {
            case 0: // Delete
                this.showAlertView(
                    'Delete comment', 'Are you sure you want to delete this comment?',
                    'this.deleteCommentConfirmation(alertView, buttonIndex);',
                    'No', ['Yes'], null);
                break;
            case 1: // Cancel
                if (this.currentCommentType == this.CommentType.CommentTypeMine) {
                    this.viewWithId('myComment_tv').becomeFirstResponder();
                }
                break;
        }
    },
    "deleteCommentConfirmation": function (alertView, buttonIndex) {
        if (buttonIndex == 1) {
            this.showGlobalProgressHUDWithTitle('Deleting comment ...');
            VoatyNetwork.deleteComment(this.data.commentId,
                (function (result) {
                    IR.Util.dismissGlobalHUD();
                    if (result.body.success) {
                        this.viewWithId('myComment_tv').resignFirstResponder();

                        this.showAlertView(
                            'Success', 'Comment successfully deleted!',
                            'this.confirmUpdatedComment();',
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
        } else {
            if (this.currentCommentType == this.CommentType.CommentTypeMine) {
                this.viewWithId('myComment_tv').becomeFirstResponder();
            }
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    // Getters/Setters
    get myCommentHidden() {
        return ! this.parentCommentHidden;
    },
    // ----------------------------------------------------------------------------------------------------------------
    "currentCommentType": null,
    "CommentType": {
        "CommentTypeParent": "CommentTypeParent",
        "CommentTypeMine": "CommentTypeMine"
    },
    "parentCommentHidden": true,
    "parentCommentText": "",
    "myCommentText": ""
});