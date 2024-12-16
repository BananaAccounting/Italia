// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// @id = ch.banana.it.extension.attestatodonazioni.js
// @api = 1.0
// @pubdate = 2024-12-16
// @publisher = Banana.ch SA
// @description = 6. Attestato di donazione
// @doctype = 100.*;110.*;130.*
// @docproperties = 
// @task = app.command
// @outputformat = none
// @inputdatasource = none
// @timeout = -1

/*
*   This BananaApp prints a donation statement for all the selected donators and period.
*   Donators can be:
*   - a single donator (with or without ";") => (i.e. "10001" or  ";10011")
*   - more donators (with or without ";") separated by "," => (i.e. "10001, ;10011,;10012")
*   - all the donators (empty field) => (i.e. "")
*   
*   It works for a single donation or multiple donations during the selected period.
*   It works for simple and double accounting files.
*/

var mimimunAmountDonation = "";
var accountDonation = "";

/* Main function that is executed when starting the app */
function exec(inData, options) {
    
    if (!Banana.document) {
        return "@Cancel";
    }

    var texts = loadTexts();
    var userParam = initUserParam();

    // Retrieve saved param
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam && savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
    }

    // If needed show the settings dialog to the user
    if (!options || !options.useLastSettings) {
        userParam = settingsDialog(); // From properties
    }

    if (!userParam) {
        return "@Cancel";
    }

    // Get the minimum donation amount entered by the user
    mimimunAmountDonation = userParam.minimumAmount;

    // Get the account donation entered by the user
    accountDonation = userParam.accountDonation;

    // Add a transactions property to userParam object, and fill it with transactions data
    userParam.transactions = [];
    fillTransactionStructure(Banana.document, userParam, texts);

    // Retrieves all the donors to print
    var accounts = getListOfAccountsToPrint(userParam);

    // Creates the report
    if (accounts.length > 0) {
        var stylesheet = createStyleSheet(userParam);
        var report = printReport(Banana.document, userParam, accounts, texts, stylesheet);            
        Banana.Report.preview(report, stylesheet);
    } else {
        return "@Cancel";
    }
}



/** 
 * PRINT FUNCTIONS
 */

/* The report is created using the selected period and the data of the dialog */
function printReport(banDoc, userParam, accounts, texts, stylesheet) {

    var report = Banana.Report.newReport(texts.reportTitle);

    printReportHeader(report, banDoc, userParam, stylesheet);

    // Print the report elements for the inserted cc3 accounts (or all cc3 accounts if empty)
    for (var i = 0; i < accounts.length; i++) {

        printReportInfo(report, banDoc, userParam, accounts[i]);
        printReportAddress(report, banDoc, accounts[i]);
        printReportLetter(report, banDoc, userParam, accounts[i]);
        printReportDetailsTable(report, banDoc, userParam, accounts[i], texts);
        printReportSignature(report, banDoc, userParam);

        if (i < accounts.length-1) { // Page break at the end of all the pages (except the last)
            report.addPageBreak();
        }
    }

    return report;
}

function printReportHeader(report, banDoc, userParam, stylesheet) {
    
    // Logo
    var headerParagraph = report.getHeader().addSection();
    if (userParam.printHeaderLogo) {
        headerParagraph = report.addSection("");
        var logoFormat = Banana.Report.logoFormat(userParam.headerLogoName);
        if (logoFormat) {
            var logoElement = logoFormat.createDocNode(headerParagraph, stylesheet, "logo");
            report.getHeader().addChild(logoElement);
        }
    }

    // Address of the sender (Organization)
    var company = banDoc.info("AccountingDataBase","Company");
    var name = banDoc.info("AccountingDataBase","Name");
    var familyName = banDoc.info("AccountingDataBase","FamilyName");
    var address1 = banDoc.info("AccountingDataBase","Address1");
    var address2 = banDoc.info("AccountingDataBase","Address2");
    var zip = banDoc.info("AccountingDataBase","Zip");
    var city = banDoc.info("AccountingDataBase","City");
    var country = banDoc.info("AccountingDataBase","Country");
    var phone = banDoc.info("AccountingDataBase","Phone");
    var web = banDoc.info("AccountingDataBase","Web");
    var email = banDoc.info("AccountingDataBase","Email");
    var fiscalnumber = banDoc.info("AccountingDataBase","FiscalNumber");
    var vatnumber = banDoc.info("AccountingDataBase","VatNumber");

    if (company) {
        headerParagraph.addParagraph(company, "address");
    }
    if (name && familyName) {
        headerParagraph.addParagraph(name + " " + familyName, "address");
    } else if (!name && familyName) {
        headerParagraph.addParagraph(familyName, "address");
    } else if (name && !familyName) {
        headerParagraph.addParagraph(name, "address");
    }
    if (address1) {
        headerParagraph.addParagraph(address1, "address");
    }
    if (address2) {
        headerParagraph.addParagraph(address2, "address");
    }
    if (zip && city) {
        headerParagraph.addParagraph(zip + " " + city, "address");
    }

    var paragraph = headerParagraph.addParagraph("","address");
    if (phone) {
        paragraph.addText("Tel. " + phone);
    }
    if (web) {
        if (phone) {
            paragraph.addText(", ");
        } 
        paragraph.addText(web);
    }
    if (email) {
        if (phone || web) {
            paragraph.addText(", ");
        }
        paragraph.addText(email);
    }

    if (vatnumber && fiscalnumber) {
        headerParagraph.addParagraph("IVA: " +vatnumber + ", CF: " + fiscalnumber, "address");
    } else if (vatnumber && !fiscalnumber) {
        headerParagraph.addParagraph("IVA: " +vatnumber, "address");
    } else if (!vatnumber && fiscalnumber) {
        headerParagraph.addParagraph("CF: " + fiscalnumber, "address");
    }
}

function printReportInfo(report, banDoc, userParam, account) {
    
    // Info of the donor

    var texts = loadTexts();

    var tableInfo = report.addTable("tableInfo");
    var address = getAddress(banDoc, account);

    if (userParam.accountnumberRef && account) {
        var row = tableInfo.addRow();
        row.addCell(texts.accountnumber + ": ", "info", 1);
        row.addCell(account, "info", 1);
    }
    if (userParam.fiscalnumberRef && address.fiscalnumber) {
        var row = tableInfo.addRow();
        row.addCell(texts.fiscalnumber + ": ", "info", 1);
        row.addCell(address.fiscalnumber, "info", 1);
    }
    if (userParam.vatnumberRef && address.vatnumber) {
        var row = tableInfo.addRow();
        row.addCell(texts.vatnumber + ": ", "info", 1);
        row.addCell(address.vatnumber, "info", 1);
    }
}

function printReportAddress(report, banDoc, account) {
    
    // Address of the donor

    var tableAddress = report.addTable("tableAddress");
    var address = getAddress(banDoc, account);
    if (address.nameprefix) {
        var row = tableAddress.addRow();
        row.addCell(address.nameprefix, "address", 1);
    }

    if (address.firstname && address.familyname) {
        var row = tableAddress.addRow();
        row.addCell(address.firstname + " " + address.familyname, "address", 1);
    } else if (!address.firstname && address.familyname) {
        var row = tableAddress.addRow();
        row.addCell(address.familyname, "address", 1);
    }

    if (address.street) {
        var row = tableAddress.addRow();
        row.addCell(address.street, "address", 1);
    }

    if (address.postalcode && address.locality) {
        var row = tableAddress.addRow();
        row.addCell(address.postalcode + " " + address.locality, "address", 1);
    }

    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
}

function printReportLetter(report, banDoc, userParam, account) {
    
    // Letter text
    var titleText = "";
    var text = "";

    // Title, text and table details of donations
    titleText = convertFields(banDoc, userParam, account, userParam.titleText);
    report.addParagraph(titleText, "bold");
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    if (userParam.text1) {
        text = convertFields(banDoc, userParam, account, userParam.text1);
        addNewLine(report, text);
        report.addParagraph(" ", "");
    }   
    if (userParam.text2) {
        text = convertFields(banDoc, userParam, account, userParam.text2);
        addNewLine(report, text);
        report.addParagraph(" ", "");
    }
    if (userParam.text3) {
        text = convertFields(banDoc, userParam, account, userParam.text3);
        addNewLine(report, text);
        report.addParagraph(" ", "");
    }
    if (userParam.text4) {
        text = convertFields(banDoc, userParam, account, userParam.text4);
        addNewLine(report, text);
        report.addParagraph(" ", "");
    }
}

function printReportDetailsTable(report, banDoc, userParam, account, texts) {

    // Print a transactions detail with a list of all the donations
    
    if (userParam.details) {
        report.addParagraph(" ", "");

        var total = "";
        total = calculateTotalAmount(banDoc, userParam, account);
        var rowCnt = 0;
        account = account.substring(1); //remove first character ";"
    
        var table = report.addTable("table");
        if (userParam.description) {
            table.setStyleAttributes("width:80%");
        } else {
            table.setStyleAttributes("width:50%")
        }

        var transactionsLength = userParam.transactions.length;
        for (var i = 0; i < transactionsLength; i++) {

            var cc3 = userParam.transactions[i].cc3;
            var date = userParam.transactions[i].date;
            var desc = userParam.transactions[i].description;
            var amount = userParam.transactions[i].amount;
            
            if (account && account === cc3) {
                rowCnt++;
                tableRow = table.addRow();
                tableRow.addCell(rowCnt, "borderBottom", 1); //sequencial numbers
                tableRow.addCell(Banana.Converter.toLocaleDateFormat(date), "borderBottom", 1);
                tableRow.addCell(banDoc.info("AccountingDataBase", "BasicCurrency"), "borderBottom");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(amount), "right borderBottom", 1);
                if (userParam.description) {
                    tableRow.addCell(" ", "borderBottom");
                    tableRow.addCell(desc, "borderBottom");
                }
            }
        }
        
        // Total row of the table
        if (total > 0) {
            tableRow = table.addRow();
            tableRow.addCell("", "borderTop borderBottom", 1);
            tableRow.addCell(texts.total, "bold borderTop borderBottom", 1);
            tableRow.addCell(banDoc.info("AccountingDataBase", "BasicCurrency"), "bold borderTop borderBottom", 1);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total), "bold right borderTop borderBottom", 1);
            if (userParam.description) {
                tableRow.addCell("", "borderTop borderBottom", 1);
                tableRow.addCell("", "borderTop borderBottom", 1);
            }
        }

        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
    }
}

function printReportSignature(report, banDoc, userParam) {

    // Signature
    
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    
    var tableSignature = report.addTable("table04");
    tableSignature.setStyleAttributes("width:100%");
    var col1 = tableSignature.addColumn("col1").setStyleAttributes("width:60%");
    var col2 = tableSignature.addColumn("col2").setStyleAttributes("width:40%");

    tableRow = tableSignature.addRow();
    tableRow.addCell(userParam.localityAndDate, "", 1);
    tableRow.addCell(userParam.signature, "bold", 1);
    tableRow = tableSignature.addRow();
    tableRow.addCell();
    var company = banDoc.info("AccountingDataBase","Company");
    tableRow.addCell(company, "");

    if (userParam.printLogo) {
        tableRow = tableSignature.addRow();
        tableRow.addCell();
        tableRow.addCell().addImage(userParam.signatureImage, "imgSignature");
    }
}






/* This function returns an array of objects with all the donation transactions.
   Transactions are filtered by period, minimum donation amount and donation account entered by the user.
   Only the filtered transactions are taken. */
   function getTransactionsData(banDoc, userParam, account) {

    var transactions = userParam.transactions;
    var startDate = userParam.selectionStartDate;
    var endDate = userParam.selectionEndDate;
    var transTab = banDoc.table("Transactions");
    var tableLength = transTab.rowCount;
    var isCategories = banDoc.table('Categories');
    account = account.substring(1); //remove first character ;
    
    for (var i = 0; i < tableLength; i++) {
        var tRow = transTab.row(i);
        var date = tRow.value("Date");
        var cc3 = tRow.value("Cc3");
        var description = tRow.value("Description");
        var accountCheck = isCategories ? tRow.value("Category") : tRow.value("AccountCredit");
        var amount = isCategories ? tRow.value("Income") : tRow.value("Amount");
        if (cc3 && cc3 === account && date >= startDate && date <= endDate && Banana.SDecimal.compare(amount, userParam.minimumAmount) > -1) {
            if (!accountDonation || accountDonation === accountCheck) {
                transactions.push({
                    "cc3": cc3,
                    "date": date,
                    "description": description,
                    "amount": amount
                });
            }
        }
    }
}

/* This function returns true only if the row has the amount >= userParam.minimumAmount */
function onlyMinimunAmountTableCategories(row, rowNr, table) {
    if (!accountDonation || row.value('Category') === accountDonation) {
        if (Banana.SDecimal.compare(row.value('Income'), mimimunAmountDonation) > -1) {
            return true;
        }
    }
    return false;
}

/* This function returns true only if the row has the amount >= userParam.minimumAmount */
function onlyMinimunAmountTableAccounts(row, rowNr, table) {
    if (!accountDonation || row.value('AccountCredit') === accountDonation) {
        if (Banana.SDecimal.compare(row.value('Amount'), mimimunAmountDonation) > -1) {
            return true;
        }
    }
    return false;
}

/* This function fill the data structure with the transactions data taken with getTransactionsData() */
function fillTransactionStructure(banDoc, userParam, texts) {

    // Get the list of all the donors (CC3)
    var membershipList = getCC3Accounts(banDoc);
        
    if (userParam.costcenter) {
        var list = userParam.costcenter.split(",");
        for (var i = 0; i < list.length; i++) {
            list[i] = list[i].trim();
            
            // If user insert the Cc3 account without ";" we add it
            if (list[i].substring(0,1) !== ";") {
                list[i] = ";"+list[i];
            }

            // The inserted Cc3 exists
            if (membershipList.indexOf(list[i]) > -1) {
                getTransactionsData(banDoc, userParam, list[i]);
            }
            else { // The inserted Cc3 does not exists
                banDoc.addMessage(texts.warningMessage + ": <" + list[i] + ">");              
            }
        }
    }
    else if (userParam.useExtractTable || (!userParam.costcenter || userParam.costcenter === "" || userParam.costcenter === undefined)) {
        for (var i = 0; i < membershipList.length; i++) {
            getTransactionsData(banDoc, userParam, membershipList[i]);
        }
    }
}

/* This function renturns a list of all the cc3 accounts contained in data structure */
function getListOfAccountsToPrint(userParam) {
    
    var accounts = [];
    var transactionsLength = userParam.transactions.length;

    for (var i = 0; i < transactionsLength; i++) {
        var account = userParam.transactions[i].cc3;
        accounts.push(";"+account);
    }

    //Remove duplicates
    for (var i = 0; i < accounts.length; i++) {
        for (var x = i+1; x < accounts.length; x++) {
            if (accounts[x] === accounts[i]) {
                accounts.splice(x,1);
                --x;
            }
        }
    }

    return accounts;
}

/* This function returns the total amount for a specific account and period */
function calculateTotalAmount(banDoc, userParam, account) {

    var startDate = userParam.selectionStartDate;
    var endDate = userParam.selectionEndDate;
    if (banDoc.table('Categories')) {
        var totalAmount = banDoc.currentBalance(account,startDate,endDate,onlyMinimunAmountTableCategories).debit;
    } else {
        var totalAmount = banDoc.currentBalance(account,startDate,endDate,onlyMinimunAmountTableAccounts).debit;
    }
    
    return totalAmount;
}


/**
 * UTILITIES FUNCTIONS
 */

/* Function that retrieves the address of the given account */
function getAddress(banDoc, accountNumber) {
    var address = {};
    var table = banDoc.table("Accounts");
    var tableLength = table.rowCount;
    for (var i = 0; i < tableLength; i++) {
        var tRow = table.row(i);
        var account = tRow.value("Account");

        if (accountNumber === account) {

            address.nameprefix = tRow.value("NamePrefix");
            address.firstname = tRow.value("FirstName");
            address.familyname = tRow.value("FamilyName");
            address.street = tRow.value("Street");
            address.postalcode = tRow.value("PostalCode");
            address.locality = tRow.value("Locality");
            address.fiscalnumber = tRow.value("FiscalNumber");
            address.vatnumber = tRow.value("VatNumber");
        }
    }
    return address;
}

/* Function that retrieves the transaction date */
function getTransactionDate(userParam, costcenter) {
    costcenter = costcenter.substring(1); //remove first character ;
    var transactionsLength = userParam.transactions.length;
    for (var i = 0; i < transactionsLength; i++) {
        var cc3 = userParam.transactions[i].cc3;
        if (costcenter === cc3) {
            return userParam.transactions[i].date;
        }
    }
}

/* Function that retrieves in a list all the CC3 accounts */
function getCC3Accounts(banDoc) {
    var membershipList = [];
    var accountsTable = banDoc.table("Accounts");
    var tableLength = accountsTable.rowCount;
    for (var i = 0; i < tableLength; i++) {
        var tRow = accountsTable.row(i);
        var account = tRow.value("Account");
        if (account.substring(0,1) === ";" && account.substring(1,2)) {
            membershipList.push(account);
        }
    }
    return membershipList;
}

/* Function that converts a month to a readable string */
function getMonthText(date) {
    var texts = loadTexts();
    var monthDate = date.getMonth();
    var monthText = "";
    switch (monthDate) {
        case 0:
            monthText = texts.january;
            break;
        case 1:
            monthText = texts.february;
            break;
        case 2:
            monthText = texts.march;
            break;
        case 3:
            monthText = texts.april;
            break;
        case 4:
            monthText = texts.may;
            break;
        case 5:
            monthText = texts.june;
            break;
        case 6:
            monthText = texts.july;
            break;
        case 7:
            monthText = texts.august;
            break;
        case 8:
            monthText = texts.september;
            break;
        case 9:
            monthText = texts.october;
            break;
        case 10:
            monthText = texts.november;
            break;
        case 11:
            monthText = texts.december;
    }
    return monthText;
}

/* Function that converts quarters and semesters to a readable string */
function getPeriodText(period) {
    var texts = loadTexts();
    var periodText = "";
    switch (period) {
        case "Q1":
            periodText = texts.q1;
            break;
        case "Q2":
            periodText = texts.q2;
            break;
        case "Q3":
            periodText = texts.q3;
            break;
        case "Q4":
            periodText = texts.q4;
            break;
        case "S1":
            periodText = texts.s1;
            break;
        case "S2":
            periodText = texts.s2;
    }
    return periodText;
}

/* Function that converts a period defined by startDate and endDate to a readable string */
function getPeriod(banDoc, startDate, endDate) {

    var res = "";
    var year = Banana.Converter.toDate(startDate).getFullYear();
    var startDateDay = Banana.Converter.toDate(startDate).getDate(); //1-31
    var endDateDay = Banana.Converter.toDate(endDate).getDate(); //1-31
    var startDateMonth = Banana.Converter.toDate(startDate).getMonth(); //0=january ... 11=december
    var endDateMonth = Banana.Converter.toDate(endDate).getMonth(); //0=january ... 11=december

    /*
        CASE 1: all the year yyyy-01-01 - yyyy-12-31(i.e. "2018")
    */
    if (startDateMonth == 0 && startDateDay == 1 && endDateMonth == 11 && endDateDay == 31) {
        res = year;
    }

    /*
        CASE 2: single month (i.e. "January 2018")
    */
    else if (startDateMonth == endDateMonth) {
        res = getMonthText(Banana.Converter.toDate(startDate));
        res += " " + year;
    }

    /* 
        CASE 3: period in the year (i.e. "First quarter 2018", "Second semester 2018")
    */
    else if (startDateMonth != endDateMonth) {

        //1. Quarter (1.1 - 31.3)
        if (startDateMonth == 0 && endDateMonth == 2) {
            res = getPeriodText("Q1");
            res += " " + year;
        }   

        //2. Quarter (1.4 - 30.6)
        else if (startDateMonth == 3 && endDateMonth == 5) {
            res = getPeriodText("Q2");
            res += " " + year;          
        }

        //3. Quarter (1.7 - 30.9)
        else if (startDateMonth == 6 && endDateMonth == 8) {
            res = getPeriodText("Q3");
            res += " " + year;
        }

        //4. Quarter (1.10- 31.12)
        else if (startDateMonth == 9 && endDateMonth == 11) {
            res = getPeriodText("Q4");
            res += " " + year;
        }

        //1. Semester (1.1 - 30.6)
        else if (startDateMonth == 0 && endDateMonth == 5) {
            res = getPeriodText("S1");
            res += " " + year;
        }
        //2. Semester (1.7 - 31.12)
        else if (startDateMonth == 6 && endDateMonth == 11) {
            res = getPeriodText("S2");
            res += " " + year;
        }

        /* 
            CASE 4: other periods
        */
        else {
            res = Banana.Converter.toLocaleDateFormat(startDate) + " - " + Banana.Converter.toLocaleDateFormat(endDate);
        }
    }

    return res;
}

/* Function that replaces the tags with the respective data */
function convertFields(banDoc, userParam, account, text) {

    var startDate = userParam.selectionStartDate;
    var endDate = userParam.selectionEndDate;
    var address = getAddress(banDoc, account);

    if (text.indexOf("<Period>") > -1) {
        var period = getPeriod(banDoc, startDate, endDate);
        text = text.replace(/<Period>/g,period);
    }
    if (text.indexOf("<Account>") > -1) {
        text = text.replace(/<Account>/g,account);
    }
    if (text.indexOf("<FirstName>") > -1) {
        var firstname = address.firstname;
        text = text.replace(/<FirstName>/g,firstname);
    }
    if (text.indexOf("<FamilyName>") > -1) {
        var familyname = address.familyname;
        text = text.replace(/<FamilyName>/g,familyname);
    }    
    if (text.indexOf("<Address>") > -1) {
        var fulladdress = address.street + ", " + address.postalcode + " " + address.locality;
        text = text.replace(/<Address>/g,fulladdress);
    }
    if (text.indexOf("<FiscalNumber>") > -1) {
        var fiscalnumber = address.fiscalnumber;
        text = text.replace(/<FiscalNumber>/g,fiscalnumber);
    }
    if (text.indexOf("<VatNumber>") > -1) {
        var vatnumber = address.vatnumber;
        text = text.replace(/<VatNumber>/g,vatnumber);
    }
    if (text.indexOf("<TrDate>") > -1) {
        var trDate = getTransactionDate(userParam, account);
        var trdate = Banana.Converter.toLocaleDateFormat(trDate);
        text = text.replace(/<TrDate>/g,trdate);
    }
    if (text.indexOf("<StartDate>") > -1) {
        var startdate = Banana.Converter.toLocaleDateFormat(startDate);
        text = text.replace(/<StartDate>/g,startdate);
    }
    if (text.indexOf("<EndDate>") > -1) {
        var enddate = Banana.Converter.toLocaleDateFormat(endDate);
        text = text.replace(/<EndDate>/g,enddate);
    }
    if (text.indexOf("<Currency>") > -1) {
        var currency = banDoc.info("AccountingDataBase", "BasicCurrency");
        text = text.replace(/<Currency>/g,currency);
    }
    if (text.indexOf("<Amount>") > -1) {
        var totalOfDonations = calculateTotalAmount(banDoc, userParam, account);
        var amount = Banana.Converter.toLocaleNumberFormat(totalOfDonations);
        text = text.replace(/<Amount>/g,amount);
    }
    return text;
}

/* Function that add a new line to the paragraph */
function addNewLine(reportElement, text) {

    var str = text.split("\n");

    for (var i = 0; i < str.length; i++) {
        addMdParagraph(reportElement, str[i]);
    }
}

/* Function that add bold style to the text between '**' */
function addMdParagraph(reportElement, text) {
    
    /*
    * BOLD TEXT STYLE
    *
    * Use '**' characters where the bold starts and ends.
    *
    * - set bold all the paragraph => **This is bold text
    *                              => **This is bold text**
    *
    * - set bold single/multiple words => This is **bold** text
    *                                  => This **is bold** text
    *                                  => **This** is **bold** text
    */

    var p = reportElement.addParagraph();
    var printBold = false;
    var startPosition = 0;
    var endPosition = -1;

    do {
        endPosition = text.indexOf("**", startPosition);
        var charCount = endPosition === -1 ? text.length - startPosition : endPosition - startPosition;
        if (charCount > 0) {
            //Banana.console.log(text.substr(startPosition, charCount) + ", " + printBold);
            var span = p.addText(text.substr(startPosition, charCount), "");
            if (printBold)
                span.setStyleAttribute("font-weight", "bold");
        }
        printBold = !printBold;
        startPosition = endPosition >= 0 ? endPosition + 2 : text.length;
    } while (startPosition < text.length && endPosition >= 0);
}



/**
 * SCRIPT PARAMETERS
 */

/* Function that converts parameters of the dialog */
function convertParam(userParam) {

    var texts = loadTexts();

    var convertedParam = {};
    convertedParam.version = '1.0';
    convertedParam.data = []; /* array dei parametri dello script */

    //Cc3 (donor)
    var currentParam = {};
    currentParam.name = 'costcenter';
    currentParam.title = texts.accountNumber;
    currentParam.type = 'string';
    currentParam.value = userParam.costcenter ? userParam.costcenter : '';
    currentParam.readValue = function() {
        userParam.costcenter = this.value;
    }
    convertedParam.data.push(currentParam);

    //Account/Category to filter the transactions
    var currentParam = {};
    currentParam.name = 'accountDonation';
    currentParam.title = texts.accountDonation;
    currentParam.type = 'string';
    currentParam.value = userParam.accountDonation ? userParam.accountDonation : '';
    currentParam.readValue = function() {
        userParam.accountDonation = this.value;
    }
    convertedParam.data.push(currentParam);

    // minimun amount for cc3
    var currentParam = {};
    currentParam.name = 'minimumAmount';
    currentParam.title = texts.minimumAmount;
    currentParam.type = 'string';
    currentParam.value = userParam.minimumAmount ? userParam.minimumAmount : '1.00';
    currentParam.readValue = function() {
     userParam.minimumAmount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Info
    var currentParam = {};
    currentParam.name = 'info';
    currentParam.title = texts.info;
    currentParam.type = 'string';
    currentParam.value = userParam.info ? userParam.info : '';
    currentParam.readValue = function() {
        userParam.info = this.value;
    }
    convertedParam.data.push(currentParam);

    // Info accountnumber
    var currentParam = {};
    currentParam.name = 'accountnumberRef';
    currentParam.parentObject = 'info';
    currentParam.title = texts.accountnumberRef;
    currentParam.type = 'bool';
    currentParam.value = userParam.accountnumberRef ? true : false;
    currentParam.readValue = function() {
        userParam.accountnumberRef = this.value;
    }
    convertedParam.data.push(currentParam);

    // Info fiscalnumber
    var currentParam = {};
    currentParam.name = 'fiscalnumberRef';
    currentParam.parentObject = 'info';
    currentParam.title = texts.fiscalnumberRef;
    currentParam.type = 'bool';
    currentParam.value = userParam.fiscalnumberRef ? true : false;
    currentParam.readValue = function() {
        userParam.fiscalnumberRef = this.value;
    }
    convertedParam.data.push(currentParam);

    // Info vatnumber
    var currentParam = {};
    currentParam.name = 'vatnumberRef';
    currentParam.parentObject = 'info';
    currentParam.title = texts.vatnumberRef;
    currentParam.type = 'bool';
    currentParam.value = userParam.vatnumberRef ? true : false;
    currentParam.readValue = function() {
        userParam.vatnumberRef = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'infoPositionDX';
    currentParam.parentObject = 'info';
    currentParam.title = texts.infoPositionDX;
    currentParam.type = 'number';
    currentParam.value = userParam.infoPositionDX ? userParam.infoPositionDX : '0';
    currentParam.readValue = function() {
        userParam.infoPositionDX = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'infoPositionDY';
    currentParam.parentObject = 'info';
    currentParam.title = texts.infoPositionDY;
    currentParam.type = 'number';
    currentParam.value = userParam.infoPositionDY ? userParam.infoPositionDY : '0';
    currentParam.readValue = function() {
        userParam.infoPositionDY = this.value;
    }
    convertedParam.data.push(currentParam);

    // Address
    var currentParam = {};
    currentParam.name = 'address';
    currentParam.title = texts.address;
    currentParam.type = 'string';
    currentParam.value = userParam.address ? userParam.address : '';
    currentParam.readValue = function() {
        userParam.address = this.value;
    }
    convertedParam.data.push(currentParam);

    // Address align left
    var currentParam = {};
    currentParam.name = 'alignleft';
    currentParam.parentObject = 'address';
    currentParam.title = texts.alignleft;
    currentParam.type = 'bool';
    currentParam.value = userParam.alignleft ? true : false;
    currentParam.readValue = function() {
        userParam.alignleft = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'addressPositionDX';
    currentParam.parentObject = 'address';
    currentParam.title = texts.addressPositionDX;
    currentParam.type = 'number';
    currentParam.value = userParam.addressPositionDX ? userParam.addressPositionDX : '0';
    currentParam.readValue = function() {
        userParam.addressPositionDX = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'addressPositionDY';
    currentParam.parentObject = 'address';
    currentParam.title = texts.addressPositionDY;
    currentParam.type = 'number';
    currentParam.value = userParam.addressPositionDY ? userParam.addressPositionDY : '0';
    currentParam.readValue = function() {
        userParam.addressPositionDY = this.value;
    }
    convertedParam.data.push(currentParam);

    // Texts
    var currentParam = {};
    currentParam.name = 'texts';
    currentParam.title = texts.textsGroup;
    currentParam.type = 'string';
    currentParam.value = userParam.texts ? userParam.texts : '';
    currentParam.readValue = function() {
        userParam.texts = this.value;
    }
    convertedParam.data.push(currentParam);

    // Default text
    var currentParam = {};
    currentParam.name = 'useDefaultTexts';
    currentParam.parentObject = 'texts';
    currentParam.title = texts.useDefaultTexts;
    currentParam.type = 'bool';
    currentParam.value = userParam.useDefaultTexts ? true : false;
    currentParam.readValue = function() {
        userParam.useDefaultTexts = this.value;
    }
    convertedParam.data.push(currentParam);

    //Title
    var currentParam = {};
    currentParam.name = 'titleText';
    currentParam.parentObject = 'texts';
    currentParam.title = texts.titleText;
    currentParam.type = 'string';
    currentParam.value = userParam.titleText ? userParam.titleText : '';
    currentParam.readValue = function() {
        if (userParam.useDefaultTexts) {
            userParam.titleText = texts.title;
        } else {
            userParam.titleText = this.value;
        }
    }
    convertedParam.data.push(currentParam);

    //Free text 1
    var currentParam = {};
    currentParam.name = 'text1';
    currentParam.parentObject = 'texts';
    currentParam.title = texts.text1;
    currentParam.type = 'string';
    currentParam.value = userParam.text1 ? userParam.text1 : '';
    currentParam.readValue = function() {
        if (userParam.useDefaultTexts) {
            userParam.text1 = texts.multiTransactionText;
        } else {
            userParam.text1 = this.value;
        }
    }
    convertedParam.data.push(currentParam);

    //Free text 2
    var currentParam = {};
    currentParam.name = 'text2';
    currentParam.parentObject = 'texts';
    currentParam.title = texts.text2;
    currentParam.type = 'string';
    currentParam.value = userParam.text2 ? userParam.text2 : '';
    currentParam.readValue = function() {
        if (userParam.useDefaultTexts) {
            userParam.text2 = "";
        } else {
            userParam.text2 = this.value;
        }
    }
    convertedParam.data.push(currentParam);

    //Free text 3
    var currentParam = {};
    currentParam.name = 'text3';
    currentParam.parentObject = 'texts';
    currentParam.title = texts.text3;
    currentParam.type = 'string';
    currentParam.value = userParam.text3 ? userParam.text3 : '';
    currentParam.readValue = function() {
        if (userParam.useDefaultTexts) {
            userParam.text3 = "";
        } else {
            userParam.text3 = this.value;
        }
    }
    convertedParam.data.push(currentParam);

    //Free text 4
    var currentParam = {};
    currentParam.name = 'text4';
    currentParam.parentObject = 'texts';
    currentParam.title = texts.text4;
    currentParam.type = 'string';
    currentParam.value = userParam.text4 ? userParam.text4 : '';
    currentParam.readValue = function() {
        if (userParam.useDefaultTexts) {
            userParam.text4 = "";
        } else {
            userParam.text4 = this.value;
        }
    }
    convertedParam.data.push(currentParam);

    // donation details
    var currentParam = {};
    currentParam.name = 'details';
    currentParam.parentObject = 'texts';
    currentParam.title = texts.details;
    currentParam.type = 'bool';
    currentParam.value = userParam.details ? true : false;
    currentParam.readValue = function() {
     userParam.details = this.value;
    }
    convertedParam.data.push(currentParam);

    // donation details - description of transaction
    var currentParam = {};
    currentParam.name = 'description';
    currentParam.parentObject = 'details';
    currentParam.title = texts.description;
    currentParam.type = 'bool';
    currentParam.value = userParam.description ? true : false;
    currentParam.defaultvalue = false;
    currentParam.readValue = function() {
     userParam.description = this.value;
    }
    convertedParam.data.push(currentParam);

    // signature
    var currentParam = {};
    currentParam.name = 'signature';
    currentParam.title = texts.signature;
    currentParam.type = 'string';
    currentParam.value = userParam.signature ? userParam.signature : '';
    currentParam.readValue = function() {
        userParam.signature = this.value;
    }
    convertedParam.data.push(currentParam);

    // locality and date
    var currentParam = {};
    currentParam.name = 'localityAndDate';
    currentParam.parentObject = 'signature';
    currentParam.title = texts.localityAndDate;
    currentParam.type = 'string';
    currentParam.value = userParam.localityAndDate ? userParam.localityAndDate : '';
    currentParam.readValue = function() {
        userParam.localityAndDate = this.value;
    }
    convertedParam.data.push(currentParam);

    // image for signature
    var currentParam = {};
    currentParam.name = 'printLogo';
    currentParam.parentObject = 'signature';
    currentParam.title = texts.signature_image;
    currentParam.type = 'bool';
    currentParam.value = userParam.printLogo ? true : false;
    currentParam.readValue = function() {
     userParam.printLogo = this.value;
    }
    convertedParam.data.push(currentParam);

    // image for signature
    var currentParam = {};
    currentParam.name = 'signatureImage';
    currentParam.parentObject = 'signature';
    currentParam.title = texts.signatureImage;
    currentParam.type = 'string';
    currentParam.value = userParam.signatureImage ? userParam.signatureImage : 'documents:<image_id>';
    currentParam.readValue = function() {
     userParam.signatureImage = this.value;
    }
    convertedParam.data.push(currentParam);

    // image height
    var currentParam = {};
    currentParam.name = 'imageHeight';
    currentParam.parentObject = 'signature';
    currentParam.title = texts.imageHeight;
    currentParam.type = 'number';
    currentParam.value = userParam.imageHeight ? userParam.imageHeight : '10';
    currentParam.readValue = function() {
     userParam.imageHeight = this.value;
    }
    convertedParam.data.push(currentParam);

    // Styles
    var currentParam = {};
    currentParam.name = 'styles';
    currentParam.title = texts.styles;
    currentParam.type = 'string';
    currentParam.value = userParam.styles ? userParam.styles : '';
    currentParam.readValue = function() {
        userParam.styles = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'printHeaderLogo';
    currentParam.parentObject = 'styles';
    currentParam.title = texts.printHeaderLogo;
    currentParam.type = 'bool';
    currentParam.value = userParam.printHeaderLogo ? true : false;
    currentParam.readValue = function() {
    userParam.printHeaderLogo = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'headerLogoName';
    currentParam.parentObject = 'styles'
    currentParam.title = texts.headerLogoName;
    currentParam.type = 'string';
    currentParam.value = userParam.headerLogoName ? userParam.headerLogoName : 'Logo';
    currentParam.readValue = function() {
        userParam.headerLogoName = this.value;
    }
    convertedParam.data.push(currentParam);

    // Font type
    var currentParam = {};
    currentParam.name = 'fontFamily';
    currentParam.parentObject = 'styles'
    currentParam.title = texts.fontFamily;
    currentParam.type = 'string';
    currentParam.value = userParam.fontFamily ? userParam.fontFamily : 'Helvetica';
    currentParam.readValue = function() {
        userParam.fontFamily = this.value;
    }
    convertedParam.data.push(currentParam);

    // Font size
    var currentParam = {};
    currentParam.name = 'fontSize';
    currentParam.parentObject = 'styles'
    currentParam.title = texts.fontSize;
    currentParam.type = 'string';
    currentParam.value = userParam.fontSize ? userParam.fontSize : '10';
    currentParam.readValue = function() {
        userParam.fontSize = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

/* Function that initializes the user parameters */
function initUserParam() {
    var texts = loadTexts();
    var userParam = {};
    userParam.version = '1.0';
    userParam.costcenter = '';
    userParam.accountDonation = '';
    userParam.minimumAmount = '';
    userParam.info = '';
    userParam.accountRef = false;
    userParam.fiscalnumberRef = false;
    userParam.vatnumberRef = false;
    userParam.infoPositionDX = '0';
    userParam.infoPositionDY = '0';
    userParam.address = '';
    userParam.alignleft = false;
    userParam.addressPositionDX = '0';
    userParam.addressPositionDY = '0';
    userParam.texts = '';
    userParam.useDefaultTexts = false;
    userParam.titleText = texts.title;
    userParam.text1 = texts.multiTransactionText;
    userParam.text2 = '';
    userParam.text3 = '';
    userParam.text4 = '';
    userParam.details = true;
    userParam.description = true;
    userParam.signature = '';
    userParam.localityAndDate = '';
    userParam.printLogo = '';
    userParam.signatureImage = '';
    userParam.imageHeight = '';
    userParam.styles = '';
    userParam.printHeaderLogo = false;
    userParam.headerLogoName = 'Logo';
    userParam.fontFamily = '';
    userParam.fontSize = '';
    return userParam;
}

/* Function that shows the dialog window and let user to modify the parameters */
function parametersDialog(userParam) {
    var texts = loadTexts();
    if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
        var dialogTitle = texts.dialogTitle;
        var convertedParam = convertParam(userParam);
        var pageAnchor = 'dlgSettings';
        if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
            return null;
        }
        
        for (var i = 0; i < convertedParam.data.length; i++) {
            // Read values to userParam (through the readValue function)
            convertedParam.data[i].readValue();
        }
        
        //  Reset reset default values
        userParam.useDefaultTexts = false;
    }
    
    return userParam;
}

/* Function that shows a dialog window for the period and let user to modify the parameters */
function settingsDialog() {

    var texts = loadTexts();
    var scriptform = initUserParam();
    
    // Retrieve saved param
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam && savedParam.length > 0) {
        scriptform = JSON.parse(savedParam);
    }

    //We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
    var docStartDate = Banana.document.startPeriod();
    var docEndDate = Banana.document.endPeriod();   
    
    //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
    var selectedDates = Banana.Ui.getPeriod(texts.reportTitle, docStartDate, docEndDate, 
        scriptform.selectionStartDate, scriptform.selectionEndDate, scriptform.selectionChecked);
        
    //We take the values entered by the user and save them as "new default" values.
    //This because the next time the script will be executed, the dialog window will contains the new values.
    if (selectedDates) {
        scriptform["selectionStartDate"] = selectedDates.startDate;
        scriptform["selectionEndDate"] = selectedDates.endDate;
        scriptform["selectionChecked"] = selectedDates.hasSelection;    
    } else {
        //User clicked cancel
        return null;
    }

    scriptform = parametersDialog(scriptform); // From propertiess
    if (scriptform) {
        var paramToString = JSON.stringify(scriptform);
        Banana.document.setScriptSettings(paramToString);
    }

    return scriptform;
}



/**
 * STYLES
 */

/* Function that creates styles */
function createStyleSheet(userParam) {

    if (!userParam.fontFamily) {
        userParam.fontFamily = 'Helvetica';
    }
    if (!userParam.fontSize) {
        userParam.fontSize = '10';
    }

    var stylesheet = Banana.Report.newStyleSheet();

    if (userParam.printHeaderLogo) {
            stylesheet.addStyle("@page", "margin:10mm 10mm 10mm 20mm;");        
    } else {
        stylesheet.addStyle("@page", "margin:20mm 10mm 10mm 20mm;");
    }
    stylesheet.addStyle("body", "font-family:"+userParam.fontFamily+"; font-size:"+userParam.fontSize+"pt;");
    stylesheet.addStyle(".info", "font-family:"+userParam.fontFamily+"; font-size:"+userParam.fontSize+"pt;");
    stylesheet.addStyle(".address", "font-family:"+userParam.fontFamily+"; font-size:"+userParam.fontSize+"pt;");
    stylesheet.addStyle(".bold", "font-weight:bold;");
    stylesheet.addStyle(".borderLeft", "border-left:thin solid black");
    stylesheet.addStyle(".borderTop", "border-top:thin solid black");
    stylesheet.addStyle(".borderRight", "border-right:thin solid black");
    stylesheet.addStyle(".borderBottom", "border-bottom:thin solid black");
    stylesheet.addStyle(".right", "text-align:right;");
    stylesheet.addStyle(".center", "text-align:center;");
    
    style = stylesheet.addStyle(".imgSignature");
    style.setAttribute("height", userParam.imageHeight + "mm");

    
    // Info
    if (!userParam.infoPositionDX) {
        userParam.infoPositionDX = '0';
    }
    if (!userParam.infoPositionDY) {
        userParam.infoPositionDY = '0';
    }
    var infoMarginTop = parseFloat(4.35)+parseFloat(userParam.infoPositionDY);
    var infoMarginTopLogo = parseFloat(3.78)+parseFloat(userParam.infoPositionDY);
    var leftInfoMarginLeft = parseFloat(0.0)+parseFloat(userParam.infoPositionDX);
    var rightInfoMarginLeft = parseFloat(10.0)+parseFloat(userParam.infoPositionDX);

    if (userParam.printHeaderLogo) {
        if (userParam.alignleft) { //address left => info right
            stylesheet.addStyle(".tableInfo", "position:absolute; margin-top:"+infoMarginTop+"cm; margin-left:"+rightInfoMarginLeft+"cm");            
        } else {
            stylesheet.addStyle(".tableInfo", "position:absolute; margin-top:"+infoMarginTop+"cm; margin-left:"+leftInfoMarginLeft+"cm");
        }
    } else {
        if (userParam.alignleft) { //address left => info right
            stylesheet.addStyle(".tableInfo", "position:absolute; margin-top:"+infoMarginTopLogo+"cm; margin-left:"+rightInfoMarginLeft+"cm");
        } else {
            stylesheet.addStyle(".tableInfo", "position:absolute; margin-top:"+infoMarginTopLogo+"cm; margin-left:"+leftInfoMarginLeft+"cm");
        }
    }
    stylesheet.addStyle("table.tableInfo td", "padding:0px");


    // Address
    if (!userParam.addressPositionDX) {
        userParam.addressPositionDX = '0';
    }
    if (!userParam.addressPositionDY) {
        userParam.addressPositionDY = '0';
    }
    var addressMarginTop = parseFloat(2.0)+parseFloat(userParam.addressPositionDY);
    var addressMarginTopLogo = parseFloat(1.6)+parseFloat(userParam.addressPositionDY);
    var leftAddressMarginLeft = parseFloat(0.5)+parseFloat(userParam.addressPositionDX);
    var rightAddressMarginLeft = parseFloat(10.5)+parseFloat(userParam.addressPositionDX);

    if (userParam.printHeaderLogo) {
        if (userParam.alignleft) {
            stylesheet.addStyle(".tableAddress", "margin-top:"+addressMarginTop+"cm; margin-left:"+leftAddressMarginLeft+"cm");
        } else {
            stylesheet.addStyle(".tableAddress", "margin-top:"+addressMarginTop+"cm; margin-left:"+rightAddressMarginLeft+"cm");
        }
    } else {
        if (userParam.alignleft) {
            stylesheet.addStyle(".tableAddress", "margin-top:"+addressMarginTopLogo+"cm; margin-left:"+leftAddressMarginLeft+"cm");
        } else {
            stylesheet.addStyle(".tableAddress", "margin-top:"+addressMarginTopLogo+"cm; margin-left:"+rightAddressMarginLeft+"cm");
        }
    }
    stylesheet.addStyle("table.tableAddress td", "padding:0px");

    return stylesheet;
}



/** 
 * TEXTS
 */

/* Function that loads all the default texts used for the dialog and the report  */
function loadTexts() {

    var texts = {};
    
    texts.reportTitle = "Attestato di donazione";
    texts.dialogTitle = "Impostazioni";
    texts.title = "Attestato di donazione <Period>";
    texts.warningMessage = "Conto donatore non valido";
    texts.accountNumber = "Indicare il conto del donatore/socio (vuoto = stampa tutti)";
    texts.accountDonation = "Indicare il conto/categoria delle registrazioni da includere (vuoto = tutte le registrazioni)";
    texts.localityAndDate = "Località e data";
    texts.signature = "Firma";
    texts.signature_image = "Firma con immagine";
    texts.signatureImage = "Immagine";
    texts.imageHeight = "Altezza immagine (mm)";
    texts.memberAccount = "Conto del donatore";
    texts.donationDate = "Periodo";
    texts.titleText = "Titolo (opzionale)";
    texts.text1 = "Testo 1 (opzionale)";
    texts.text2 = "Testo 2 (opzionale)";
    texts.text3 = "Testo 3 (opzionale)";
    texts.text4 = "Testo 4 (opzionale)";
    texts.useDefaultTexts = "Usa i testi standard";
    texts.multiTransactionText = "Con la presente dichiariamo che **<FirstName> <FamilyName>, <Address>** nel periodo **<StartDate> - <EndDate>** ha donato **<Currency> <Amount>** alla nostra Associazione.";
    texts.textsGroup = "Testi";
    texts.details = "Includi dettagli donazioni";
    texts.description = "Includi descrizione";
    texts.total = "Totale";
    texts.minimumAmount = "Importo minimo della donazione";
    texts.styles = "Stili";
    texts.fontFamily = "Tipo di carattere";
    texts.fontSize = "Dimensione carattere";
    texts.printHeaderLogo = "Logo";
    texts.headerLogoName = "Nome logo";
    texts.info = "Informazioni donatore";
    texts.accountnumberRef = "Includi conto";
    texts.accountnumber = "Conto donatore";
    texts.fiscalnumberRef = "Includi codice fiscale";
    texts.fiscalnumber = "Codice fiscale";
    texts.vatnumberRef = "Includi numero IVA";
    texts.vatnumber = "Numero IVA";
    texts.infoPositionDX = 'Sposta orizzontalmente +/- (in cm, default 0)';
    texts.infoPositionDY = 'Sposta verticalmente +/- (in cm, default 0)';
    texts.address = "Indirizzo";
    texts.alignleft = "Allinea a sinistra";
    texts.addressPositionDX = 'Sposta orizzontalmente +/- (in cm, default 0)';
    texts.addressPositionDY = 'Sposta verticalmente +/- (in cm, default 0)';
    texts.january = "Gennaio";
    texts.february = "Febbraio";
    texts.march = "Marzo";
    texts.april = "Aprile";
    texts.may = "Maggio";
    texts.june = "Giugno";
    texts.july = "Luglio";
    texts.august = "Agosto";
    texts.september = "Settembre";
    texts.october = "Ottobre";
    texts.november = "Novembre";
    texts.december = "Dicembre";
    texts.q1 = "1. Trimestre";
    texts.q2 = "2. Trimestre";
    texts.q3 = "3. Trimestre";
    texts.q4 = "4. Trimestre";
    texts.s1 = "1. Semestre";
    texts.s2 = "2. Semestre";
    
    return texts;
}
