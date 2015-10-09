
IR.plugin({
    "viewDidLoad" : function () {
        this.currentSortOption = this.SortOption.SortOptionHot;
        this.updateCurrentSortOptionString();

        this.nextPageNumber = 2;

        IR.watch(this, 'loadMoreEnabled', function () {
            IR.callWatchers(this, 'loadMoreMessage');
        });

        if (this.data) {
            this.subverseName = this.data;
            this.subverseTitle = this.data;
            this.isStartingSubverseScreen = false;
            this.disableSubverseListSelection = true;
        } else {
            //this.subverseName = FRONT_SUBVERSE;
            //this.subverseTitle = "Front page";
            this.subverseName = ALL_SUBVERSE;
            this.subverseTitle = "All";
        }

        if (this.isStartingSubverseScreen) {
            this.subverseSelected = (function (e) {
                this.title = e.detail.title;
                this.previousSubverseName = this.subverseName;
                this.previousSubverseTitle = this.subverseTitle;
                this.subverseName = e.detail.key;
                this.subverseTitle = e.detail.title;
                this.searchText = "";
                this.loadSubverseData(false, true, 1, 'Loading ...');
            }).bind(this);
            addEventListener(SUBVERSE_SELECTED, this.subverseSelected, false);
            
            this.userAgreementAccepted = (function (e) {
                VoatyData.setUserAgreementToAccepted();
                this.loadAndPrepareDataForScreen();
            }).bind(this);
            addEventListener(USER_AGREEMENT_ACCEPTED, this.userAgreementAccepted, false);
        }

        if (VoatyData.isUserAgreementAccepted()) {
            this.loadAndPrepareDataForScreen();
        } else {
            this.showUserAgreement();
        }

        //var titleViewButton = this.viewWithId('titleViewButton');
        //titleViewButton.titleLabel.numberOfLines = 1;
        //titleViewButton.titleLabel.lineBreakMode = 4;
        //titleViewButton.titleLabel.adjustsFontSizeToFitWidth = true;
        //titleViewButton.titleLabel.minimumScaleFactor = 0.7;
    },
    "viewWillAppear" : function (animated) {
        if (this.data) {
            this.title = this.data;
            this.navigationItem.leftBarButtonItem = null;
        }
        ga('send', 'pageview', '/voaty_subverse');
    },
    "willMoveToParentViewController" : function (parent) {
        if (parent == null || parent[0] == null) {
            if (this.isStartingSubverseScreen) {
                removeEventListener(SUBVERSE_SELECTED, this.subverseSelected, false);
                removeEventListener(USER_AGREEMENT_ACCEPTED, this.userAgreementAccepted, false);
            }
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "loadAndPrepareDataForScreen": function () {
        if (VoatyData.hasStoredAccount()
            && VoatyData.isAuthenticated() == false)
        {
            this.showGlobalProgressHUDWithTitle('Signing In ...');
            var usernameAndPassword = VoatyData.getUsernameAndPasswordFromSecureStorage();
            VoatyNetwork.authenticate(usernameAndPassword.username, usernameAndPassword.password,
                (function (result) {
                    VoatyData.saveTokenDataWithPassword(result.body, usernameAndPassword.password);
                    var uid = IR.md5(VoatyData.tokenData.userName);
                    ga('set', '&uid', uid); // Set the user ID using signed-in user_id.
                    this.showGlobalProgressHUDWithTitle('Loading ...');
                    VoatyNetwork.getUserInfo(VoatyData.tokenData.userName,
                        (function (result) {
                            VoatyData.tokenData.profilePicture = result.body.data.profilePicture;
                            VoatyData.tokenData.bio = result.body.data.bio;

                            this.loadSubverseNames();
                        }).bind(this),
                        (function (error) {
                            this.dismissGlobalHUD();
                            this.showAlertView(
                                'Error', 'Data can not be loaded at the moment.\nPlease try again later.',
                                null,
                                'OK', [], null);
                        }).bind(this)
                    );
                }).bind(this),
                (function (error) {
                    this.showAlertView(
                        'Error', 'Sign In failed.\nPlease try again later.',
                        null,
                        'OK', [], null);
                    // -- load data
                    this.showGlobalProgressHUDWithTitle('Loading ...');
                    this.loadSubverseNames();
                }).bind(this)
            );
        } else {
            if (VoatyData.subverseNamesArray) {
                this.loadSubverseData(false, true, 1, 'Loading ...');
            } else {
                this.showGlobalProgressHUDWithTitle('Loading ...');
                this.loadSubverseNames();
            }
        }

        this.viewWithId('subverse_table_view').setContentOffsetAnimated({x: 0, y: 40}, true);
    },
    // ----------------------------------------------------------------------------------------------------------------
    "showSubverseList": function () {
        if (this.disableSubverseListSelection == false) {
            this.presentViewControllerWithScreenIdAnimatedWithData('voaty_subverse_list', true, null);
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "loadSubverseNames" : function (force, loadingMessage) {
        VoatyNetwork.listOfSubverseNames(
            (function (result) {
                var subverseNames = [];
                var subverseData;
                var subverseDataArray;
                for (var i=0; i<result.body.length; i++) {
                    subverseData = result.body[i];
                    subverseDataArray = subverseData.split(",");
                    for (var j=0; j<subverseDataArray.length; j++) {
                        if (subverseDataArray[j].indexOf('Name: ') === 0) {
                            subverseNames.push(subverseDataArray[j].substring('Name: '.length, subverseDataArray[j].length));
                        }
                    }
                }
                VoatyData.subverseNamesArray = subverseNames;
                this.loadSubverseData(false, true, 1, null);
            }).bind(this),
            (function (error) {
                this.dismissGlobalHUD();
                this.showAlertView(
                    'Error', 'Data can not be loaded at the moment.\nPlease try again later.',
                    null,
                    'OK', [], null);
            }).bind(this)
        );
    },
    // ----------------------------------------------------------------------------------------------------------------
    "updateCurrentSortOptionString" : function () {
        if (this.currentSortOption == this.SortOption.SortOptionHot) {
            this.currentSortOptionString = 'Hot';
        } else if (this.currentSortOption == this.SortOption.SortOptionNew) {
            this.currentSortOptionString = 'New';
        } else {
            this.currentSortOptionString = 'Top';
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "loadSubverseData" : function (force, scrollToTop, pageIndex, loadingMessage) {
        var subverseInfo;

        var cacheSearchOptions = {'sort': this.currentSortOption, 'search': this.searchText};
        var searchOptions = {'sort': this.currentSortOption, 'page': pageIndex, 'search': this.searchText};

        var subverse = VoatyData.subverseMap[this.subverseName+JSON.stringify(cacheSearchOptions)];

        if (subverse && force == false) {
            this.nextPageNumber = Math.floor(subverse.length/25)+1;
            this.updateSubverseTableData(subverse);

            if (scrollToTop) {
                var tableView = this.viewWithId('subverse_table_view');
                //tableView.setContentOffsetAnimated(CGPointZero, false);
                tableView.setContentOffsetAnimated({x: 0, y: 40}, false);
            }

            this.loadMoreButtonStatusUpdate(subverse);
        } else {
            if (this.subverseName == FRONT_SUBVERSE) {
                subverseInfo = 'Front page';
            } else if (this.subverseName == ALL_SUBVERSE) {
                subverseInfo = 'All submissions';
            } else if (this.subverseName == DEFAULT_SUBVERSE) {
                subverseInfo = 'Default';
            } else {
                subverseInfo = 'Subverse "'+this.subverseName+'"';
            }

            if (loadingMessage) {
                this.showGlobalProgressHUDWithTitle(loadingMessage);
            }
            VoatyNetwork.getSubverse(this.subverseName, searchOptions,
                (function (result) {
                    this.searchTextLastInUse = this.searchText;
                    var currentData;
                    if (pageIndex == 1) {
                        currentData = result.body.data;
                        VoatyData.subverseMap[this.subverseName+JSON.stringify(cacheSearchOptions)] = currentData;

                        this.nextPageNumber = 2;
                    } else {
                        currentData = VoatyData.subverseMap[this.subverseName+JSON.stringify(cacheSearchOptions)];
                        currentData = currentData.concat(result.body.data);
                        VoatyData.subverseMap[this.subverseName+JSON.stringify(cacheSearchOptions)] = currentData;
                    }

                    this.updateSubverseTableData(currentData/*result.body.data*/);

                    var refreshControl = this.viewWithId('refreshControl');
                    refreshControl.endRefreshing();

                    if (scrollToTop) {
                        var tableView = this.viewWithId('subverse_table_view');
                        tableView.setContentOffsetAnimated({x: 0, y: 40}, false);
                    }

                    this.loadMoreButtonStatusUpdate(result.body.data);

                    this.dismissGlobalHUD();
                }).bind(this),
                (function (error) {
                    IR.Util.dismissGlobalHUD();

                    var refreshControl = this.viewWithId('refreshControl');
                    refreshControl.endRefreshing();

                    if (this.previousSubverseName && this.previousSubverseName.length > 0) {
                        this.subverseName = this.previousSubverseName;
                        this.subverseTitle = this.previousSubverseTitle;
                        this.title = this.previousSubverseTitle;
                    }

                    this.showAlertView(
                        'Error', subverseInfo + ' can not be loaded at the moment.\nPlease try again later.',
                        null,
                        'OK', [], null);
                }).bind(this)
            );
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "moreOptions": function () {
        var destructiveTitle = null;
        if (this.isNamedSubverse()){
            destructiveTitle = 'Block subverse';
        }
        var options = [];
        options.push('Share a link');
        options.push('Discuss');
        this.showActionSheet(
            null,
            'this.moreOptionsActionSheetButtonPressed(actionSheet, buttonIndex);',
            'Cancel', destructiveTitle, options, null);
    },
    "moreOptionsActionSheetButtonPressed" : function (actionSheet, buttonIndex) {
        var presetSubverse = null;
        var startingIndex = 0;
        if (this.isNamedSubverse()){
            presetSubverse = this.subverseName;
            startingIndex = 1;
        }
        switch (buttonIndex) {
            case startingIndex-1: // Block subverse
                this.showAlertView(
                    'Block subverse', 'Are you sure you want to block "'+presetSubverse+'" subverse?',
                    'this.blockSubverseConfirmation(alertView, buttonIndex, data);',
                    'No', ['Yes'], presetSubverse);
                break;
            case startingIndex: // Share a link
                if (VoatyData.isAuthenticated() == false) {
                    this.showAlertView(
                        'Info', 'Please Sign In to be able to share a link!',
                        null,
                        'OK', [], null);
                    return;
                }
                this.pushViewControllerWithScreenIdAnimatedWithData('voaty_share_a_link', true, { 'submissionSubverse': presetSubverse });
                break;
            case startingIndex+1: // Discuss
                if (VoatyData.isAuthenticated() == false) {
                    this.showAlertView(
                        'Info', 'Please Sign In to be able to start a discussion!',
                        null,
                        'OK', [], null);
                    return;
                }
                this.pushViewControllerWithScreenIdAnimatedWithData('voaty_discuss', true, { 'submissionSubverse': presetSubverse });
                break;
        }
    },
    "isNamedSubverse": function () {
        var isNamedSubverse;
        if (this.subverseName != FRONT_SUBVERSE
            && this.subverseName != DEFAULT_SUBVERSE
            && this.subverseName != ALL_SUBVERSE)
        {
            isNamedSubverse = true;
        } else {
            isNamedSubverse = false;
        }
        return isNamedSubverse;
    },
    "showMyAccount": function () {
        this.pushViewControllerWithScreenIdAnimatedWithData('voaty_my_account', true, null);
    },
    "showSortingOptions" : function () {
        var options = [];
        if (this.currentSortOption == this.SortOption.SortOptionHot) {
            options.push('     Hot ✓');
        } else {
            options.push('Hot');
        }
        if (this.currentSortOption == this.SortOption.SortOptionNew) {
            options.push('     New ✓');
        } else {
            options.push('New');
        }
        if (this.currentSortOption == this.SortOption.SortOptionTop) {
            options.push('     Top ✓');
        } else {
            options.push('Top');
        }
        this.showActionSheet(
            'Sorting',
            'this.sortingActionSheetButtonPressed(actionSheet, buttonIndex);',
            'Cancel', null, options, null);
    },
    "sortingActionSheetButtonPressed" : function (actionSheet, buttonIndex) {
        switch (buttonIndex) {
            case 0: // Hot
                if (this.currentSortOption == this.SortOption.SortOptionHot) {
                    return;
                }
                this.currentSortOption = this.SortOption.SortOptionHot;
                this.updateCurrentSortOptionString();
                this.loadSubverseData(true, true, 1, 'Refreshing ...');
                break;
            case 1: // New
                if (this.currentSortOption == this.SortOption.SortOptionNew) {
                    return;
                }
                this.currentSortOption = this.SortOption.SortOptionNew;
                this.updateCurrentSortOptionString();
                this.loadSubverseData(true, true, 1, 'Refreshing ...');
                break;
            case 2: // Top
                if (this.currentSortOption == this.SortOption.SortOptionTop) {
                    return;
                }
                this.currentSortOption = this.SortOption.SortOptionTop;
                this.updateCurrentSortOptionString();
                this.loadSubverseData(true, true, 1, 'Refreshing ...');
                break;
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "pullToRefreshData": function (control, event) {
        this.loadSubverseData(true, false, 1);
    },
    "updateDefaultSubverseTableData": function () {
        var cacheSearchOptions = {'sort': this.currentSortOption, 'search': this.searchText};
        var subverse = VoatyData.subverseMap[this.subverseName+JSON.stringify(cacheSearchOptions)];
        if (subverse) {
            this.loadMoreButtonStatusUpdate(subverse);
            this.updateSubverseTableData(subverse);
        }
    },
    "updateSubverseTableData": function (submissionArray) {
        var filteredSubmissions = [];
        if (submissionArray) {
            var anSubmission;
            for (var i = 0; i < submissionArray.length; i++) {
                anSubmission = submissionArray[i];
                anSubmission.commentCountString = anSubmission.commentCount + ' comment(s)';
                anSubmission.date = new Date(anSubmission.date);
                anSubmission.timeAgo = VoatyUtil.calculateTimeAgo(anSubmission.date);
                anSubmission.pointsString = (anSubmission.upVotes-anSubmission.downVotes)+' (+'+anSubmission.upVotes+'|-'+anSubmission.downVotes+')';
                anSubmission.baseUrl = (anSubmission.url && anSubmission.url.length) ? url('domain', anSubmission.url) : '';
                anSubmission.hideUrlLabel = (anSubmission.url && anSubmission.url.length) ? false : true;
                anSubmission.userNameUnderlineHidden = (anSubmission.subverse == 'Anon') ? true : false;
                if (anSubmission.thumbnail && anSubmission.thumbnail.length > 0) {
                    anSubmission.cellId = 'subverse_cell';
                } else {
                    anSubmission.cellId = 'subverse_cell_without_image';
                }
                if (this.isNamedSubverse() == true
                    || (this.isNamedSubverse() == false && this.isBlockedSubverse(anSubmission.subverse) == false))
                {
                    filteredSubmissions.push(anSubmission);
                }
            }
        }
        this.tableData[0].cells = JSON.parse(JSON.stringify(filteredSubmissions));
        this.updateComponentsWithDataBindingKey('tableData');
    },
    "isBlockedSubverse": function (subverse) {
        var isBlockedSubverse = false;
        for (var i=0; i<VoatyData.blockedSubverses.length; i++) {
            if (subverse == VoatyData.blockedSubverses[i]) {
                isBlockedSubverse = true;
                break;
            }
        }
        return isBlockedSubverse;
    },
    // ----------------------------------------------------------------------------------------------------------------
    "showSubverse": function (data) {
        var subverseName = data.subverse;
        this.pushViewControllerWithScreenIdAnimatedWithData('voaty_subverse', true, subverseName);
    },
    "showSubmission": function (data) {
        this.pushViewControllerWithScreenIdAnimatedWithData('voaty_submission', true, data);
    },
    "openUrl": function (data) {
        var path = data.url;
        var url = NSURL.URLWithString(path);
        if (UIApplication.sharedApplication().canOpenURL(url)) {
            UIApplication.sharedApplication().openURL(url);
        }
    },
    "showUser": function (data) {
        if (data.userNameUnderlineHidden == false) {
            this.pushViewControllerWithScreenIdAnimatedWithData('voaty_user', true, data.userName);
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "loadNextPage": function () {
        this.loadMoreHidden = true;
        this.viewWithId('activityIndicator').startAnimating();
        this.loadSubverseData(true, false, this.nextPageNumber);
        this.nextPageNumber++;
    },
    "loadMoreButtonStatusUpdate": function (data) {
        this.loadMoreHidden = false;
        this.viewWithId('activityIndicator').stopAnimating();
        if (data && data.length >= 25) {
            this.loadMoreEnabled = true;
        } else {
            this.loadMoreEnabled = false;
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "searchCurrentSubverse": function () {
        if (this.searchText != this.searchTextLastInUse) {
            this.viewWithId('searchTextField').resignFirstResponder();
            this.loadSubverseData(true, false, 1, 'Searching ...');
        } else {

        }
    },
    "clearSearchForCurrentSubverse": function () {
        this.searchText = "";
        if (this.searchText != this.searchTextLastInUse) {
            this.viewWithId('searchTextField').resignFirstResponder();
            this.loadSubverseData(true, false, 1, 'Refreshing ...');
        } else {

        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "moreSubverseOptions": function (data) {
        var options = [];
        options.push('Up vote submission');
        options.push('Down vote submission');
        options.push('Save');
        options.push('Open submission in Safari');
        this.showActionSheet(
            'Submission Options',
            'this.moreSubverseOptionsActionSheetButtonPressed(actionSheet, buttonIndex, data);',
            'Cancel', 'Report/Block', options, data);
    },
    "moreSubverseOptionsActionSheetButtonPressed" : function (actionSheet, buttonIndex, data) {
        var path;
        switch (buttonIndex) {
            case 0: // Report/Block
                this.showActionSheet(
                    'Report/Block',
                    'this.moreReportBlockOptionsActionSheetButtonPressed(actionSheet, buttonIndex, data);',
                    'Cancel', null, ['Report submission', 'Report user', 'Block "'+data.subverse+'" subverse'], data);
                break;
            case 1: // Up vote
                if (VoatyData.isAuthenticated() == false) {
                    this.showAlertView(
                        'Info', 'Please Sign In to be able to up-vote submission!',
                        null,
                        'OK', [], null);
                    return;
                }
                this.upVote(data);
                break;
            case 2: // Down vote
                if (VoatyData.isAuthenticated() == false) {
                    this.showAlertView(
                        'Info', 'Please Sign In to be able to down-vote submission!',
                        null,
                        'OK', [], null);
                    return;
                }
                this.downVote(data);
                break;
            case 3: // Save submission
                if (VoatyData.isAuthenticated() == false) {
                    this.showAlertView(
                        'Info', 'Please Sign In to be able to save submission!',
                        null,
                        'OK', [], null);
                    return;
                }
                this.showGlobalProgressHUDWithTitle('Saving ...');
                VoatyNetwork.saveSubmission(data.id,
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
                break;
            case 4: // Open in Safari
                path = 'http://fakevout.azurewebsites.net/v/'+ data.subverse +'/comments/' + data.id;
                this.openLinkInSafari(path);
                break;
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
    "blockSubverseConfirmation_": function (alertView, buttonIndex, subverse) {
        if (buttonIndex == 1) {
            this.showGlobalProgressHUDWithTitle('Blocking subverse ...');
            VoatyNetwork.blockSubverse(subverse,
                (function (result) {
                    IR.Util.dismissGlobalHUD();
                    if (result.body.success) {
                        this.showAlertView(
                            'Success', 'Subverse successfully blocked!',
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
                        'Error', subverse + ' can not be blocked at the moment.\nPlease try again later.',
                        null,
                        'OK', [], null);
                }).bind(this)
            );
        }
    },
    "upVote": function (data) {
        this.showGlobalProgressHUDWithTitle('Up voting ...');
        VoatyNetwork.vote('submission', data.id, 1,
            (function (result) {
                IR.Util.dismissGlobalHUD();
                if (result.body.data.success) {
                    this.updateUIAfterSubmissionUpVote(data);
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
    "updateUIAfterSubmissionUpVote": function (data) {
        var submissionList = VoatyData.getAllSubmissionsWithId(data.id);
        var anSubmission;
        for (var i=0; i<submissionList.length; i++) {
            anSubmission = submissionList[i];
            anSubmission.upVotes++;
            anSubmission.pointsString = (anSubmission.upVotes-anSubmission.downVotes)+' (+'+anSubmission.upVotes+'|-'+anSubmission.downVotes+')';
        }
        var cacheSearchOptions = {'sort': this.currentSortOption, 'search': this.searchText};
        var subverse = VoatyData.subverseMap[this.subverseName+JSON.stringify(cacheSearchOptions)];
        this.updateSubverseTableData(subverse);
    },
    "downVote": function (data) {
        this.showGlobalProgressHUDWithTitle('Down voting ...');
        VoatyNetwork.vote('submission', data.id, -1,
            (function (result) {
                IR.Util.dismissGlobalHUD();
                if (result.body.data.success) {
                    this.updateUIAfterSubmissionDownVote(data);
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
    "updateUIAfterSubmissionDownVote": function (data) {
        var submissionList = VoatyData.getAllSubmissionsWithId(data.id);
        var anSubmission;
        for (var i=0; i<submissionList.length; i++) {
            anSubmission = submissionList[i];
            anSubmission.downVotes++;
            anSubmission.pointsString = (anSubmission.upVotes-anSubmission.downVotes)+' (+'+anSubmission.upVotes+'|-'+anSubmission.downVotes+')';
        }
        var cacheSearchOptions = {'sort': this.currentSortOption, 'search': this.searchText};
        var subverse = VoatyData.subverseMap[this.subverseName+JSON.stringify(cacheSearchOptions)];
        this.updateSubverseTableData(subverse);
    },
    "openLinkInSafari": function (path) {
        var url = NSURL.URLWithString(path);
        if (UIApplication.sharedApplication().canOpenURL(url)) {
            UIApplication.sharedApplication().openURL(url);
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    // Getters/Setters
    get loadMoreMessage() {
        var message;
        if (this.loadMoreEnabled) {
            message = 'Load more ...';
        } else {
            message = 'No more submissions';
        }
        return message;
    },
    // ----------------------------------------------------------------------------------------------------------------
    "titleLabel_numberOfLines" : 1,
    "titleLabel_lineBreakMode" : 4,
    "titleLabel_adjustsFontSizeToFitWidth" : true,
    "titleLabel_minimumScaleFactor" : 0.7,
    "searchText": "",
    "searchTextLastInUse": "",
    "isStartingSubverseScreen": true,
    "subverseName": "",
    "subverseTitle": "",
    "previousSubverseName": null,
    "previousSubverseTitle": null,
    "currentSortOption": null,
    "currentSortOptionString": null,
    "SortOption": {
        "SortOptionNew": 0,
        "SortOptionTop": 1,
        "SortOptionHot": 2
    },
    "disableSubverseListSelection": false,
    "loadMoreHidden": true,
    "loadMoreEnabled": true,
    "nextPageNumber": 2,
    "tableData" : [
        {
            "cells": [  ]
        }
    ]
});