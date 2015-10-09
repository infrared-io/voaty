
IR.plugin({
    "viewDidLoad": function () {
        // http://fakevout.azurewebsites.net/ajaxhelpers/autocompletesubversename?term=Te
        // http://fakevout.azurewebsites.net/ajaxhelpers/titlefromuri?uri=http://google.com
        var barButtonItem;
        var customView;
        var saveButton;
        var moreButton;
        if (this.data) {
            if (this.data.submissionId && this.data.submissionId > 0) {
                this.submissionId = this.data.submissionId;
                if (VoatyUtil.isMoreThen10MinOld(this.data.submissionDate)) {
                    this.submissionTitleTextColor = "#c0c0c0";
                    this.submissionTitleEnabled = false;
                }
                this.submissionUrlTextColor = "#c0c0c0";
                this.submissionUrlEnabled = false;
                this.submissionSubverseTextColor = "#c0c0c0";
                this.submissionSubverseEnabled = false;

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
                saveButton.touchUpInsideActions = "this.updateSubmission();";
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
                moreButton.touchUpInsideActions = "this.moreSubmissionOptions();";
                // -- adding to custom view and barButton
                customView.addSubview(saveButton);
                customView.addSubview(moreButton);
                barButtonItem.customView = customView;
                this.navigationItem.rightBarButtonItem = barButtonItem;
            } else {
                barButtonItem = IR.BarButtonItem.createWithTitleComponentId('Submit', 'submitBarButton');
                barButtonItem.actions = "this.submitSubmission();";
                this.navigationItem.rightBarButtonItem = barButtonItem;
            }
            if (this.data.submissionUrl && this.data.submissionUrl.length > 0) {
                this.submissionUrl = this.data.submissionUrl;
            }
            if (this.data.submissionTitle && this.data.submissionTitle.length > 0) {
                this.submissionTitle = this.data.submissionTitle;
            }
            this.submissionSubverse = this.data.submissionSubverse;
        }

        this.subverseSelected = (function (e) {
            this.submissionSubverse = e.detail.key;
        }).bind(this);
        addEventListener(SUBVERSE_SELECTED_FOR_NEW_SUBMISSION, this.subverseSelected, false);
    },
    "viewWillAppear": function (animated) {
        if (this.data.submissionId && this.data.submissionId > 0
            && VoatyUtil.isMoreThen10MinOld(this.data.submissionDate))
        {
            this.showAlertView(
                'Info', 'Submission is more then 10 minutes old. Editing is not allowed!\nYou can only delete this submission.',
                null,
                'OK', [], null);
        }
        ga('send', 'pageview', '/voaty_share_a_link');
    },
    "willMoveToParentViewController" : function (parent) {
        if (parent == null || parent[0] == null) {
            removeEventListener(SUBVERSE_SELECTED_FOR_NEW_SUBMISSION, this.subverseSelected, false);
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "putFocusOnUrl": function () {
        var urlTF = this.viewWithId('url_tf');
        urlTF.becomeFirstResponder();
    },
    "putFocusOnTitle": function () {
        var titleTF = this.viewWithId('title_tf');
        titleTF.becomeFirstResponder();
    },
    "putFocusOnSubverse": function () {
        var subverseTF = this.viewWithId('subverse_tf');
        subverseTF.becomeFirstResponder();
    },
    "suggestTitle": function () {
        this.showAlertView(
            'Suggest title', 'Do you want title suggested for entered URL?',
            'this.suggestTitleConfirmation(alertView, buttonIndex);',
            'NO', ['YES'], null);
    },
    "suggestTitleConfirmation": function (alertView, buttonIndex) {
        if (buttonIndex == 1) { // "Suggest title" selected
            if (this.submissionUrl && this.submissionUrl.length > 0 && VoatyUtil.isValidUrl(this.submissionUrl)) {
                this.showGlobalProgressHUDWithTitle('Getting suggestion ...');
                VoatyNetwork.submissionTitleSuggestion(this.submissionUrl,
                    (function (result) {
                        IR.Util.dismissGlobalHUD();
                        if (result && result.length > 0) {
                            this.submissionTitle = result[0];
                        } else {
                            this.showAlertView(
                                'Error', 'No suggestion available!',
                                null,
                                'OK', [], null);
                        }
                    }).bind(this),
                    (function (error) {
                        IR.Util.dismissGlobalHUD();
                        this.showAlertView(
                            'Error', 'No suggestion available!',
                            null,
                            'OK', [], null);
                    }).bind(this));
            } else {
                this.showAlertView(
                    'Error', 'URL can not be empty and should be valid http/https/ftp link!',
                    null,
                    'OK', [], null);
            }
        }
    },
    "selectSubverse": function () {
        this.presentViewControllerWithScreenIdAnimatedWithData('voaty_subverse_list', true, "new_submission");
    },
    "submitSubmission": function () {
        if (this.submissionUrl == null || this.submissionUrl.length == 0 || VoatyUtil.isValidUrl(this.submissionUrl) == false) {
            this.showAlertView(
                'Error', 'URL can not be empty and should be valid http/https/ftp link!',
                null,
                'OK', [], null);
            return;
        }
        if (this.submissionTitle == null || this.submissionTitle.length < 5 || this.submissionTitle.length > 200) {
            this.showAlertView(
                'Error', 'Title can not be empty and should have between 5 and 200 characters!',
                null,
                'OK', [], null);
            return;
        }
        if (this.submissionSubverse == null || this.submissionSubverse.length == 0) {
            this.showAlertView(
                'Error', 'Subverse can not be empty!',
                null,
                'OK', [], null);
            return;
        }
        this.showGlobalProgressHUDWithTitle('Creating submission ...');
        VoatyNetwork.newSubmission(this.submissionTitle, this.submissionSubverse, this.submissionUrl, null,
            (function (result) {
                IR.Util.dismissGlobalHUD();
                if (result.body.success) {
                    this.showAlertView(
                        'Success', 'Link successfully shared!',
                        'this.confirmSubmittedSubmission();',
                        'OK', [], null);
                } else {
                    this.showAlertView(
                        'Error', ''+result.body.data,
                        null,
                        'OK', [], null);
                }
            }).bind(this),
            (function (error) {
                IR.Util.dismissGlobalHUD();
                var errorMessage = '';
                if (typeof error.response.body.data !== 'undefined') {
                    errorMessage = error.response.body.data;
                } else if (typeof error.response.body.error.message !== 'undefined') {
                    errorMessage = error.response.body.error.message;
                }
                this.showAlertView(
                    'Error', ''+errorMessage,
                    null,
                    'OK', [], null);
            }).bind(this));
    },
    "confirmSubmittedSubmission": function () {
        this.popViewControllerAnimated(true);
    },
    "updateSubmission": function () {
        if (VoatyUtil.isMoreThen10MinOld(this.data.submissionDate)) {
            this.showAlertView(
                'Info', 'Submission is more then 10 minutes old. Editing is not allowed!',
                null,
                'OK', [], null);
            return;
        }
        if (this.submissionTitle == null || this.submissionTitle.length < 5 || this.submissionTitle.length > 200) {
            this.showAlertView(
                'Error', 'Title can not be empty and should have between 5 and 200 characters!',
                null,
                'OK', [], null);
            return;
        }
        this.showGlobalProgressHUDWithTitle('Updating submission ...');
        VoatyNetwork.updateSubmission(this.submissionId, this.submissionTitle, this.submissionSubverse, this.submissionUrl, null,
            (function (result) {
                IR.Util.dismissGlobalHUD();
                if (result.body.success) {
                    this.viewWithId('title_tf').resignFirstResponder();

                    this.showAlertView(
                        'Success', 'Submission successfully updated!',
                        'this.confirmUpdatedSubmission();',
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
    "confirmUpdatedSubmission": function () {
        dispatchEvent(new CustomEvent(OLD_SUBMISSION_UPDATED));

        this.popViewControllerAnimated(true);
    },
    "moreSubmissionOptions": function () {
        this.viewWithId('title_tf').resignFirstResponder();
        this.showActionSheet(
            'Comment Options',
            'this.moreSubmissionOptionsActionSheetButtonPressed(actionSheet, buttonIndex)',
            'Cancel', 'Delete', [], null);
    },
    "moreSubmissionOptionsActionSheetButtonPressed": function (actionSheet, buttonIndex) {
        switch (buttonIndex) {
            case 0: // Delete
                this.showAlertView(
                    'Delete submission', 'Are you sure you want to delete this submission?',
                    'this.deleteSubmissionConfirmation(alertView, buttonIndex);',
                    'No', ['Yes'], null);
                break;
        }
    },
    "deleteSubmissionConfirmation": function (alertView, buttonIndex) {
        if (buttonIndex == 1) {
            this.showGlobalProgressHUDWithTitle('Deleting submission ...');
            VoatyNetwork.deleteSubmission(this.submissionId, this.submissionSubverse,
                (function (result) {
                    IR.Util.dismissGlobalHUD();
                    if (result.body.success) {
                        this.viewWithId('title_tf').resignFirstResponder();

                        this.showAlertView(
                            'Success', 'Submission successfully deleted!',
                            'this.confirmDeletedSubmission();',
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
        }
    },
    "confirmDeletedSubmission": function () {
        dispatchEvent(new CustomEvent(OLD_SUBMISSION_DELETED));

        var viewController;
        var viewControllerList = this.navigationController.viewControllers;
        if (viewControllerList.length >= 3) {
            viewController = viewControllerList[(viewControllerList.length - 1) - 2];
            this.popToViewControllerAnimated(viewController, true);
        } else {
            this.popToRootViewControllerAnimated(true);
        }
    },
    "submissionId": "",
    "submissionUrl": "http://",
    "submissionUrlTextColor": "#ffffff",
    "submissionUrlEnabled": true,
    "submissionTitle": "",
    "submissionTitleTextColor": "#ffffff",
    "submissionTitleEnabled": true,
    "submissionSubverse": "",
    "submissionSubverseTextColor": "#ffffff",
    "submissionSubverseEnabled": true
});