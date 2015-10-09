
IR.plugin({
    "viewDidLoad": function () {
        this.title = this.data.title;

        if (this.data.rightBarButtonTitle && this.data.rightBarButtonTitle.length > 0) {
            var barButtonItem = IR.BarButtonItem.createWithTitleComponentId(this.data.rightBarButtonTitle, 'rightBarButton');
            barButtonItem.actions = "this.rightBarButtonTapped();";
            this.navigationItem.rightBarButtonItem = barButtonItem;
        }

        //var webView = this.viewWithId('submission_content_web_view');
        //webView.scrollView.indicatorStyle = UIScrollViewIndicatorStyleWhite;
    },
    "viewWillAppear": function (animated) {
        ga('send', 'pageview', '/voaty_submission_content');
    },
    "rightBarButtonTapped": function () {
        dispatchEvent(new CustomEvent(USER_AGREEMENT_ACCEPTED));
        this.dismissViewControllerAnimated(true);
    }
});