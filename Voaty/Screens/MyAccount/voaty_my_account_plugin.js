
IR.plugin({
    "viewDidLoad" : function () {
        this.showRightVersionOfUI();
    },
    "viewWillAppear" : function (animated) {
        ga('send', 'pageview', '/voaty_my_account');
    },
    "showRightVersionOfUI": function () {
        var barButtonItem;
        if (VoatyData.isAuthenticated()) {
            this.hideViewWithId('sing_in_scroll_view');
            barButtonItem = IR.BarButtonItem.createWithTitleComponentId('Sign Out', 'signOutBarButton');
            barButtonItem.actions = "this.signOut();";
            this.navigationItem.rightBarButtonItem = barButtonItem;

            var usernameAndPassword = VoatyData.getUsernameAndPasswordFromSecureStorage();
            this.username = usernameAndPassword.username;

            if (VoatyData.tokenData.profilePicture) {
                this.profilePicture = VoatyData.tokenData.profilePicture;
                this.bio = VoatyData.tokenData.bio;
                this.dismissGlobalHUD();
                this.showViewWithId('user_info_wrapper');
            } else {
                this.hideViewWithId('user_info_wrapper');
                this.showGlobalProgressHUDWithTitle('Loading ...');
                VoatyNetwork.getUserInfo(this.username,
                    (function (result) {
                        VoatyData.tokenData.profilePicture = result.body.data.profilePicture;
                        this.profilePicture = VoatyData.tokenData.profilePicture;
                        VoatyData.tokenData.bio = result.body.data.bio;
                        this.bio = VoatyData.tokenData.bio;
                        this.dismissGlobalHUD();
                        this.showViewWithId('user_info_wrapper');
                    }).bind(this),
                    (function (error) {
                        this.dismissGlobalHUD();
                        this.showAlertView(
                            'Error', 'User\'s data can not be loaded at the moment.\nPlease try again later.',
                            null,
                            'OK', [], null);
                    }).bind(this)
                );
            }
        } else {
            this.dismissGlobalHUD();
            this.hideViewWithId('user_info_wrapper');
            this.showViewWithId('sing_in_scroll_view');
            barButtonItem = IR.BarButtonItem.createWithTitleComponentId('Sign in', 'signinBarButton');
            barButtonItem.actions = "this.signIn();";
            this.navigationItem.rightBarButtonItem = barButtonItem;
        }
    },
    "signOut": function () {
        this.showAlertView(
            'Sign Out', 'Are you sure you want to sing out.',
            'this.signOutConfirmation(alertView, buttonIndex);',
            'No', ['Yes'], null);
    },
    "signOutConfirmation": function (alertView, buttonIndex) {
        if (buttonIndex == 1) {
            VoatyData.cleanSignedInUserAndUsernameAndPasswordFromSecureStorage();

            this.username = "";
            this.password = "";

            this.showRightVersionOfUI();
        }
    },
    "signIn": function () {
        if (this.username != null && this.username.length > 0
            && this.password != null && this.password.length > 0 )
        {
            // - hide keyboard for email or message
            this.viewWithId('content_wrapper').endEditing(false);

            this.signInWithUsernameAndPassword(this.username, this.password);
        } else {
            this.showAlertView(
                'Sign In', 'Please enter username and password.',
                null,
                'OK', [], null);
        }
    },
    "signInWithUsernameAndPassword" : function (username, password) {
        this.showGlobalProgressHUDWithTitle('Signing In ...');
        VoatyNetwork.authenticate(username, password,
            (function (result) {
                VoatyData.saveUserData(username, password, result.body);
                // Google Analytics - set user id
                var uid = IR.md5(VoatyData.tokenData.userName);
                ga('set', '&uid', uid);
                this.showRightVersionOfUI();
            }).bind(this),
            (function (error) {
                this.dismissGlobalHUD();
                this.showAlertView(
                    'Error', 'Sign In failed.\nPlease try again later.',
                    null,
                    'OK', [], null);
            }).bind(this)
        );
    },
    "showUser": function () {
        this.pushViewControllerWithScreenIdAnimatedWithData('voaty_user', true, this.username);
    },
    "showBlockedSubverses": function () {
        this.pushViewControllerWithScreenIdAnimatedWithData('voaty_blocked_subverses', true, null);
    },
    "showAbout": function () {
        var aboutHtml =
            "<h3 style='text-align: center;'>Voaty 1.2</h3>" +
            "Application's web page: <a href='http://infrared.io/voaty'>infrared.io/voaty</a><br/><br/>" +
            "Support email: <a href='mailto:voaty@infrared.io?Subject=Voaty%20Feedback'>voaty@infrared.io</a><br/><br/>" +
            "Voaty on voat.co: <a href='https://voat.co/v/voatyapp/'>voat.co/v/voatyapp/</a><br/><br/>" +
            "Source code available on GitHub: (<a href='https://github.com/infrared-io/voaty'>github.com/infrared-io/voaty</a>)<br/><br/>" +
            "Development:<br/>" +
            "- Built with Infrared.io library (<a href='https://github.com/infrared-io/infrared_ios'>github.com/infrared-io/infrared_ios</a>)<br/>" +
            "- Icons from <a href='http://icons8.com'>icons8.com</a><br/><br/><br/><br/>" +
            "<div style='text-align: center;'>" +
            "<a href='https://itunes.apple.com/us/app/voaty/id1019165838?ls=1&mt=8'>Rate Us in the App Store</a><br/>" +
            "</div><br/><br/><br/>" +
            "<div style='text-align: center;'>" +
            "Build number: "+IR.appVersion+"<br/>" +
            "Copyright 2015 Infrared.io" +
            "</div>";
        var htmlData = {
            "title": "About",
            "html": VoatyUtil.extentFormattedContent(aboutHtml, true)
        };
        this.pushViewControllerWithScreenIdAnimatedWithData('voaty_submission_content', true, htmlData);
    },
    "username" : "",
    "password" : "",
    "profilePicture" : "",
    "bio" : ""
});