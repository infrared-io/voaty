
IR.plugin({
    "viewDidLoad" : function () {
        this.updateTableData();

        if (this.data != null) {
            this.title = "Select subverse";
        } else {
            var barButtonItem = IR.BarButtonItem.createWithTitleComponentId('Other', 'customSubverseBarButton');
            barButtonItem.actions = "this.subverseByName();";
            this.navigationItem.rightBarButtonItem = barButtonItem;
        }

        IR.watch(this, 'searchText', (function () {
            this.updateTableData();
        }).bind(this));
    },
    "viewWillAppear" : function (animated) {
        ga('send', 'pageview', '/voaty_subverse_list');
    },
    // ----------------------------------------------------------------------------------------------------------------
    "subverseByName": function () {
        this.hideViewWithId('subverse_table_view');
        this.showViewWithId('subverse_by_name');

        var barButtonItem = IR.BarButtonItem.createWithTitleComponentId('List', 'listSubverseBarButton');
        barButtonItem.actions = "this.subverseFromList();";
        this.navigationItem.rightBarButtonItem = null;
        this.navigationItem.rightBarButtonItem = barButtonItem;

        this.viewWithId('subverse_tf').becomeFirstResponder();

        this.title = "Subverse by Name";
    },
    "subverseFromList": function () {
        this.hideViewWithId('subverse_by_name');
        this.showViewWithId('subverse_table_view');

        var barButtonItem = IR.BarButtonItem.createWithTitleComponentId('Other', 'customSubverseBarButton');
        barButtonItem.actions = "this.subverseByName();";
        this.navigationItem.rightBarButtonItem = null;
        this.navigationItem.rightBarButtonItem = barButtonItem;

        this.viewWithId('subverse_tf').resignFirstResponder();

        this.title = "Top 200";
    },
    // ----------------------------------------------------------------------------------------------------------------
    "putFocusOnName": function () {
        var subverseTF = this.viewWithId('subverse_tf');
        subverseTF.becomeFirstResponder();
    },
    // ----------------------------------------------------------------------------------------------------------------
    "updateTableData": function () {
        var subverseNamesData = [];
        var subverseNamesArray = this.filterSubverseList(VoatyData.subverseNamesArray);
        if (subverseNamesArray) {
            for (var i = 0; i < subverseNamesArray.length; i++) {
                subverseNamesData.push({
                    "title": subverseNamesArray[i],
                    "key": subverseNamesArray[i]
                });
            }
        }
        subverseNamesData = subverseNamesData.sort( function (a,b) {
            return (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : ((a.title.toLowerCase() < b.title.toLowerCase()) ? -1 : 0);
        });
        if (this.data == null) {
            var text = this.searchText.trim();
            if ("Front page".toLowerCase().indexOf(text.toLowerCase()) != -1) {
                subverseNamesData.splice(0, 0, {
                    "title": "Front page",
                    "key": FRONT_SUBVERSE
                });
            }
            if ("Default".toLowerCase().indexOf(text.toLowerCase()) != -1) {
                subverseNamesData.splice(0, 0, {
                    "title": "Default",
                    "key": DEFAULT_SUBVERSE
                });
            }
            if ("All".toLowerCase().indexOf(text.toLowerCase()) != -1) {
                subverseNamesData.splice(0, 0, {
                    "title": "All",
                    "key": ALL_SUBVERSE
                });
            }
        }
        this.tableData[0].cells = subverseNamesData;
        this.updateComponentsWithDataBindingKey('tableData');
    },
    "close": function () {
        this.viewWithId('searchTextField').resignFirstResponder();
        this.dismissViewControllerAnimated(true);
    },
    "filterSubverseList": function (subverseNamesArray) {
        var result;
        var text = this.searchText.trim();
        if (text.length > 0) {
            result = [];
            for (var i=0; i<subverseNamesArray.length; i++) {
                if (subverseNamesArray[i].toLowerCase().indexOf(text.toLowerCase()) != -1) {
                    result.push(subverseNamesArray[i]);
                }
            }
        } else {
            result = subverseNamesArray;
        }
        return result;
    },
    "clearSearchForSubverseList": function () {
        this.searchText = "";
        this.viewWithId('searchTextField').resignFirstResponder();
    },
    "pullToRefreshData": function (control, event) {
        this.reloadSubverseList();
    },
    "reloadSubverseList": function () {
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

                this.updateTableData();

                var refreshControl = this.viewWithId('refreshControl');
                refreshControl.endRefreshing();

                this.dismissGlobalHUD();
            }).bind(this),
            (function (error) {
                this.dismissGlobalHUD();

                var refreshControl = this.viewWithId('refreshControl');
                refreshControl.endRefreshing();

                this.showAlertView(
                    'Error', 'Subverse list can not be loaded at the moment.\nPlease try again later.',
                    null,
                    'OK', [], null);
            }).bind(this)
        );
    },
    "openSubverse": function () {
        if (this.subverseName && this.subverseName.length > 0) {
            dispatchEvent(new CustomEvent(SUBVERSE_SELECTED, {"detail": { "title": this.subverseName, "key": this.subverseName }}));
            this.viewWithId('subverse_tf').resignFirstResponder();
            this.dismissViewControllerAnimated(true);
        } else {
            this.showAlertView(
                'Error', 'Please enter Subverse name!',
                null,
                'OK', [], null);
        }
    },
    "selectSubverse": function (data) {
        if (this.data != null) {
            dispatchEvent(new CustomEvent(SUBVERSE_SELECTED_FOR_NEW_SUBMISSION, {"detail": data}));
        } else {
            dispatchEvent(new CustomEvent(SUBVERSE_SELECTED, { "detail": data }));
        }
        this.viewWithId('searchTextField').resignFirstResponder();
        this.dismissViewControllerAnimated(true);
    },
    "searchText" : "",
    "subverseName" : "",
    "tableData" : [
        {
            "cells": [  ]
        }
    ]
});