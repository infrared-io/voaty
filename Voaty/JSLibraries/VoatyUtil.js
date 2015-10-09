
var USER_AGREEMENT_ACCEPTED = "USER_AGREEMENT_ACCEPTED";
var SUBVERSE_SELECTED = "SUBVERSE_SELECTED";
var SUBVERSE_SELECTED_FOR_NEW_SUBMISSION = "SUBVERSE_SELECTED_FOR_NEW_SUBMISSION";
var NEW_COMMENT_SUBMITTED = "NEW_COMMENT_SUBMITTED";
var OLD_COMMENT_UPDATED = "OLD_COMMENT_UPDATED";
var OLD_SUBMISSION_UPDATED = "OLD_SUBMISSION_UPDATED";
var OLD_SUBMISSION_DELETED = "OLD_SUBMISSION_DELETED";

(function (factory) {
    window.VoatyUtil = factory();
}(function () {
    var VoatyUtilClass = function () {
        this.isValidUrl = function (str) {
            var pattern = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
            if (!pattern.test(str)) {
                return false;
            } else {
                return true;
            }
        };
        this.calculateTimeAgo = function (date) {
            var timeAgo;
            var difference;
            var now = new Date();
            if (date.getFullYear() == now.getFullYear()
                && date.getMonth() == now.getMonth()
                && date.getDate() == now.getDate())
            {
                timeAgo = (now.getHours() - date.getHours()) + ' h'; // ' hours ago';
            } else if (date.getFullYear() == now.getFullYear()
                       && date.getMonth() == now.getMonth())
            {
                difference = Math.round(Math.abs((now.getTime() - date.getTime())/(24*60*60*1000)));
                timeAgo = difference + ' d';
            } else if (date.getFullYear() == now.getFullYear()) {
                difference = Math.abs((now.getMonth() - date.getMonth()));
                timeAgo = difference + ' m';
            } else {
                difference = Math.abs((now.getMonth() - date.getMonth()));
                if (difference >= 1000) {
                    difference = Math.round(difference/1000.0)+ 'k'
                }
                timeAgo = difference + ' y';
            }
            return timeAgo;
        };
        this.isMoreThen10MinOld = function (date) {
            var isMoreThen10MinOld;
            var now = new Date();
            if (date && date.getFullYear() == now.getFullYear()
                && date.getMonth() == now.getMonth()
                && date.getDate() == now.getDate()
                && date.getHours() == now.getHours()
                && date.getHours() == now.getHours()
                && date.getMinutes()-now.getMinutes() < 10)
            {
                isMoreThen10MinOld = false;
            } else {
                isMoreThen10MinOld = true;
            }
            return isMoreThen10MinOld;
        };
        this.extentFormattedContent = function (formattedContent, noPhone) {
            var result;
            if (formattedContent && formattedContent.length > 0) {
                result =
                    '<html> ' +
                    '<head>' +
                        (noPhone ? '<meta name="format-detection" content="telephone=no" />' : '') +
                        '<style type="text/css" media="screen"> ' +
                        'html * ' +
                        '{ ' +
                            'color: #fff !important; ' +
                            'font-family: HelveticaNeue-Thin !important; ' +
                        '} ' +
                        'code ' +
                        '{ ' +
                            'font-family: monospace !important; ' +
                        '} ' +
                        '</style>' +
                    '</head>' +
                    '<body style="background-color: transparent;">' + formattedContent + '</body>' +
                    '</html>';
            } else {
                result = formattedContent;
            }
            return result;
        };
        this.uuidForGoogleAnalytics = function () {
            var uuidKey;
            uuidKey = localStorage.getItem("VoatyGoogleAnalyticsClientId");
            if (uuidKey == null) {
                uuidKey = uuid.v4();
                localStorage.setItem("VoatyGoogleAnalyticsClientId", uuidKey);
            }
            return uuidKey;
        };
    };

    return new VoatyUtilClass();
}));