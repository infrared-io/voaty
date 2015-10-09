
IR.plugin({
    "viewDidLoad": function () {
        if (this.data) {
            this.reportTitle = this.data.fullTitle;
        }
    },
    "viewWillAppear": function (animated) {
        ga('send', 'pageview', '/voaty_report');
    },
    "putFocusOnMessage": function () {
        var messageTV = this.viewWithId('message_tv');
        messageTV.becomeFirstResponder();
    },
    "submitReport": function () {
        if (this.reportMessage.length > 0) {
            this.showAlertView(
                'Report', 'Are you sure you want to submit this report?',
                'this.submitReportConfirmation(alertView, buttonIndex);',
                'No', ['Yes'], null);
        } else {
            this.showAlertView(
                'Report', 'Please enter reason for reporting!',
                null,
                'OK', [], null);
        }
    },
    "submitReportConfirmation": function (alertView, buttonIndex) {
        var finalMessage;
        if (buttonIndex == 1) {
            finalMessage = this.reportMessage + this.data.dobyExtension;
            this.showGlobalProgressHUDWithTitle('Submitting report ...');
            VoatyNetwork.report(/*'v/'+this.data.subverse*/ 'voaty_app', this.data.title, finalMessage,
                (function (result) {
                    IR.Util.dismissGlobalHUD();
                    if (result.body.success) {
                        this.viewWithId('message_tv').resignFirstResponder();

                        this.showAlertView(
                            'Success', 'Report successfully submitted!',
                            'this.confirmReportSubmission();',
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
    "confirmReportSubmission": function () {
        this.popViewControllerAnimated(true);
    },
    "reportTitle": "",
    "reportMessage": ""
});