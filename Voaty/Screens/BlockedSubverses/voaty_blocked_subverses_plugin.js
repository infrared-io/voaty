
IR.plugin({
    "viewDidLoad" : function () {
        this.updateTableData();
    },
    "viewWillAppear" : function (animated) {
        ga('send', 'pageview', '/voaty_blocked_subverses');
    },
    "updateTableData": function () {
        var blockedSubverses = []; // = VoatyData.blockedSubverses;
        for (var i=0; i<VoatyData.blockedSubverses.length; i++) {
            blockedSubverses.push({
                "title": VoatyData.blockedSubverses[i]
            });
        }
        blockedSubverses = blockedSubverses.sort( function (a,b) {
            return (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : ((a.title.toLowerCase() < b.title.toLowerCase()) ? -1 : 0);
        });
        this.tableData[0].cells = blockedSubverses;
        this.updateComponentsWithDataBindingKey('tableData');
    },
    // ----------------------------------------------------------------------------------------------------------------
    "showAddBlockedSubverseHolder": function () {
        this.newSubverseName = "";
        this.showViewWithId('addBlockedSubverseHolder');
        this.putFocusOnName();
    },
    "cancelAddingBlockedSubverse" : function () {
        this.viewWithId('content_wrapper').endEditing(false);
        this.hideViewWithId('addBlockedSubverseHolder');
    },
    "putFocusOnName": function () {
        var subverseTF = this.viewWithId('addBlockedSubverseTextField');
        subverseTF.becomeFirstResponder();
    },
    "addBlockedSubverse": function () {
        if (this.newSubverseName.length > 0) {
            VoatyData.addBlockedSubverse(this.newSubverseName);
            this.updateTableData();
            this.cancelAddingBlockedSubverse();
        } else {
            this.showAlertView(
                'Add Blocked Subverse', 'Please enter subverse name!',
                null,
                'OK', [], null);
        }
    },
    // ----------------------------------------------------------------------------------------------------------------
    "unblockedSubverse": function (data) {
        this.showAlertView(
            'Unblock subverse', 'Are you sure you want to unblock "'+data.title+'" subverse?',
            'this.unblockedSubverseConfirmation(alertView, buttonIndex, data);',
            'No', ['Yes'], data.title);
    },
    "unblockedSubverseConfirmation": function (alertView, buttonIndex, data) {
        if (buttonIndex == 1) {
            VoatyData.removeBlockedSubverse(data);
            this.updateTableData();
        }
    },
    "newSubverseName": '',
    "tableData" : [
        {
            "cells": [  ]
        }
    ]
});