// Copyright [2020] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2021-02-19
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

var texts;

/* Main function that is executed when starting the app */
function exec(inData, options) {
    
    if (!Banana.document) {
        return "@Cancel";
    }

    var lang = getLang(Banana.document);
    if (!lang) {
        lang = "en";
    }

    texts = loadTexts(Banana.document,lang);
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

    // Retrieves all the donors to print
    var accounts = getAccountsToPrint(Banana.document, userParam.selectionStartDate, userParam.selectionEndDate, userParam);

    // Creates the report
    if (accounts.length > 0) {
    	var stylesheet = createStyleSheet(userParam);
        var report = createReport(Banana.document, userParam.selectionStartDate, userParam.selectionEndDate, userParam, accounts, "", stylesheet);            
        Banana.Report.preview(report, stylesheet);
    } else {
        return "@Cancel";
    }
}

/* The report is created using the selected period and the data of the dialog */
function createReport(banDoc, startDate, endDate, userParam, accounts, lang, stylesheet) {

    if (lang) {
        texts = loadTexts(banDoc,lang);
    }

    var report = Banana.Report.newReport(texts.reportTitle);

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

    if (phone) {
        headerParagraph.addParagraph("Tel. " + phone, "address");
    }

    if (web) {
        headerParagraph.addParagraph("Web: " + web, "address");
    }

    if (email) {
        headerParagraph.addParagraph("Email: " + email, "address");
    }


    // Create the report for the inserted cc3 accounts (or all cc3 accounts if empty)
    for (var k = 0; k < accounts.length; k++) {

        var transactionsObj = calculateTotalTransactions(banDoc, accounts[k], startDate, endDate);
        var totalOfDonations = transactionsObj.total;
        var numberOfDonations = transactionsObj.numberOfTransactions;
        var trDate = getTransactionDate(banDoc, accounts[k], startDate, endDate);
        var titleText = "";
        var text = "";

        // Address of the membership (donor)
        var tableAddress = report.addTable("tableAddress");
        var address = getAddress(banDoc, accounts[k]);
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

        if (address.fiscalnumber) {
            var row = tableAddress.addRow();
            row.addCell("CF: " + address.fiscalnumber, "", 1);
        }

        if (address.vatnumber) {
            var row = tableAddress.addRow();
            row.addCell("IVA: " + address.vatnumber, "", 1);
        }

        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");

        // Title, text and table details of donations
        titleText = convertFields(banDoc, userParam.titleText, address, trDate, startDate, endDate, totalOfDonations, accounts[k]);
        report.addParagraph(titleText, "bold");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        if (userParam.text1) {
            text = convertFields(banDoc, userParam.text1, address, trDate, startDate, endDate, totalOfDonations, accounts[k]);
            addNewLine(report, text);
            report.addParagraph(" ", "");
        }   
        if (userParam.text2) {
            text = convertFields(banDoc, userParam.text2, address, trDate, startDate, endDate, totalOfDonations, accounts[k]);
            addNewLine(report, text);
            report.addParagraph(" ", "");
        }
        if (userParam.text3) {
            text = convertFields(banDoc, userParam.text3, address, trDate, startDate, endDate, totalOfDonations, accounts[k]);
            addNewLine(report, text);
            report.addParagraph(" ", "");
        }
        if (userParam.text4) {
            text = convertFields(banDoc, userParam.text4, address, trDate, startDate, endDate, totalOfDonations, accounts[k]);
            addNewLine(report, text);
            report.addParagraph(" ", "");
        }

        // Print a transactions detail in case there is more than one donation
        if (userParam.details) {
            report.addParagraph(" ", "");
            printTransactionTable(banDoc, report, accounts[k], startDate, endDate);
            report.addParagraph(" ", "");
            report.addParagraph(" ", "");
        }

        // Signature
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        
        var tableSignature = report.addTable("table04");
        tableSignature.setStyleAttributes("width:100%");
        var col1 = tableSignature.addColumn("col1").setStyleAttributes("width:60%");
        var col2 = tableSignature.addColumn("col2").setStyleAttributes("width:40%");

        tableRow = tableSignature.addRow();
        tableRow.addCell(userParam.localityAndDate, "bold", 1);
        tableRow.addCell(userParam.signature, "bold", 1);
        tableRow = tableSignature.addRow();
        tableRow.addCell();
        tableRow.addCell(company, "");

        if (userParam.printLogo) {
            tableRow = tableSignature.addRow();
            tableRow.addCell();
            tableRow.addCell().addImage(userParam.signatureImage, "imgSignature");
        }

        // Page break at the end of all the pages (except the last)
        if (k < accounts.length-1) {
            report.addPageBreak();
        }
    }

    return report;
}

/* Function that retrieves the donors account to print.
   As default, accounts with donation amount 0 are not taken.
   User can choose to include them or not */
function getAccountsToPrint(banDoc, startDate, endDate, userParam) {

    // Get the list of all the donors (CC3)
    var membershipList = getCC3Accounts(banDoc);
    var accounts = [];
    var transactionsObj = "";
    var totalOfDonations = "";

    if (userParam.costcenter) {
        var list = userParam.costcenter.split(",");
        for (var i = 0; i < list.length; i++) {
            list[i] = list[i].trim();
            
            // If user insert the Cc3 account without ";" we add it
            if (list[i].substring(0,1) !== ";") {
                list[i] = ";"+list[i];
            }

            // The inserted Cc3 exists
            // Check the minimum amount of the donation
            if (membershipList.indexOf(list[i]) > -1) {
                transactionsObj = calculateTotalTransactions(banDoc, list[i], startDate, endDate);
                totalOfDonations = transactionsObj.total;
                if (Banana.SDecimal.compare(totalOfDonations, userParam.minimumAmount) > -1) { //totalOfDonation >= mimimunAmount
                    accounts.push(list[i]);
                }
            }
            else { // The inserted Cc3 does not exists
                Banana.document.addMessage(texts.warningMessage + ": <" + list[i] + ">");              
            }
        }
    }
    // Empty field = take all the Cc3
    // Check the mimimun amount of the donation
    else if (!userParam.costcenter || userParam.costcenter === "" || userParam.costcenter === undefined) {
        for (var i = 0; i < membershipList.length; i++) {
            transactionsObj = calculateTotalTransactions(banDoc, membershipList[i], startDate, endDate);
            totalOfDonations = transactionsObj.total;
            if (Banana.SDecimal.compare(totalOfDonations, userParam.minimumAmount) > -1) { //totalOfDonation >= mimimunAmount
                accounts.push(membershipList[i]);
            }
        }
    }
    return accounts;
}

/* Function that converts a month to a readable string */
function getMonthText(date, lang) {
    var month = "";
    if (lang === "it") {
        switch (date.getMonth()) {
            case 0:
                month = "Gennaio";
                break;
            case 1:
                month = "Febbraio";
                break;
            case 2:
                month = "Marzo";
                break;
            case 3:
                month = "Aprile";
                break;
            case 4:
                month = "Maggio";
                break;
            case 5:
                month = "Giugno";
                break;
            case 6:
                month = "Luglio";
                break;
            case 7:
                month = "Agosto";
                break;
            case 8:
                month = "Settembre";
                break;
            case 9:
                month = "Ottobre";
                break;
            case 10:
                month = "Novembre";
                break;
            case 11:
                month = "Dicembre";
        }
    }
    return month;
}

/* Function that converts quarters and semesters to a readable string */
function getPeriodText(period, lang) {
    var periodText = "";
    if (lang === "it") {
        switch (period) {
            case "Q1":
                periodText = "1. Trimestre";
                break;
            case "Q2":
                periodText = "2. Trimestre";
                break;
            case "Q3":
                periodText = "3. Trimestre";
                break;
            case "Q4":
                periodText = "4. Trimestre";
                break;
            case "S1":
                periodText = "1. Semestre";
                break;
            case "S2":
                periodText = "2. Semestre";
        }
    }
    return periodText;
}

/* Function that converts a period defined by startDate and endDate to a readable string */
function getPeriod(banDoc, startDate, endDate) {

    var lang = getLang(banDoc);
    if (!lang) {
        lang = "en";
    }

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
        res = getMonthText(Banana.Converter.toDate(startDate), lang);
        res += " " + year;
    }

    /* 
        CASE 3: period in the year (i.e. "First quarter 2018", "Second semester 2018")
    */
    else if (startDateMonth != endDateMonth) {

        //1. Quarter (1.1 - 31.3)
        if (startDateMonth == 0 && endDateMonth == 2) {
            res = getPeriodText("Q1",lang);
            res += " " + year;
        }   

        //2. Quarter (1.4 - 30.6)
        else if (startDateMonth == 3 && endDateMonth == 5) {
            res = getPeriodText("Q2",lang);
            res += " " + year;          
        }

        //3. Quarter (1.7 - 30.9)
        else if (startDateMonth == 6 && endDateMonth == 8) {
            res = getPeriodText("Q3",lang);
            res += " " + year;
        }

        //4. Quarter (1.10- 31.12)
        else if (startDateMonth == 9 && endDateMonth == 11) {
            res = getPeriodText("Q4",lang);
            res += " " + year;
        }

        //1. Semester (1.1 - 30.6)
        else if (startDateMonth == 0 && endDateMonth == 5) {
            res = getPeriodText("S1",lang);
            res += " " + year;
        }
        //2. Semester (1.7 - 31.12)
        else if (startDateMonth == 6 && endDateMonth == 11) {
            res = getPeriodText("S2",lang);
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
function convertFields(banDoc, text, address, trDate, startDate, endDate, totalOfDonations, account) {

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
        var address = address.street + ", " + address.postalcode + " " + address.locality;
        text = text.replace(/<Address>/g,address);
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

/* Function that retrieves the address of the given account */
function getAddress(banDoc, accountNumber) {
    var address = {};
    var table = banDoc.table("Accounts");
    for (var i = 0; i < table.rowCount; i++) {
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
function getTransactionDate(banDoc, costcenter, startDate, endDate) {
    var transTab = banDoc.table("Transactions");
    costcenter = costcenter.substring(1); //remove first character ;
    
    for (var i = 0; i < transTab.rowCount; i++) {
        var tRow = transTab.row(i);
        var date = tRow.value("Date");
        var cc3 = tRow.value("Cc3");

        if (date >= startDate && date <= endDate) {
            if (costcenter && costcenter === cc3) {
                return date;
            }
        }
    }
}

/* Function that calculates the total of the transactions for the given account and period */
function calculateTotalTransactions(banDoc, costcenter, startDate, endDate) {
    var transTab = banDoc.table("Transactions");
    var date = "";
    var total = "";
    var numberOfTransactions = 0;
    var transactionsObj = {};
    costcenter = costcenter.substring(1); //remove first character ;

    for (var i = 0; i < transTab.rowCount; i++) {
        var tRow = transTab.row(i);
        date = tRow.value("Date");
        transactionsObj.date = date;
        var cc3 = tRow.value("Cc3");

        if (date >= startDate && date <= endDate) {

            if (costcenter && costcenter === cc3) {

                /*  If simple accounting, amount=Income column of transaction
                    If double accounting, amount=Amount column of transaction */
                if (banDoc.table('Categories')) {
                    var amount = tRow.value("Income");
                } else {
                    var amount = tRow.value("Amount");
                }

                total = Banana.SDecimal.add(total, amount);
                numberOfTransactions++;
            }
        }
    }

    transactionsObj.total = total;
    transactionsObj.numberOfTransactions = numberOfTransactions;
    
    return transactionsObj;
}

/* Function that prints the transaction table */
function printTransactionTable(banDoc, report, costcenter, startDate, endDate) {

    var transTab = banDoc.table("Transactions");
    var total = "";
    costcenter = costcenter.substring(1); //remove first character ";"

    var table = report.addTable("table02");
    if (banDoc.info("AccountingDataBase","Company")) {
        table.setStyleAttributes("width:70%");
    } else {
        table.setStyleAttributes("width:50%");
    }

    var rowCnt = 0;
    for (var i = 0; i < transTab.rowCount; i++) {
        var tRow = transTab.row(i);
        tableRow = table.addRow();

        var date = tRow.value("Date");
        var cc3 = tRow.value("Cc3");

        if (date >= startDate && date <= endDate) {

            if (costcenter && costcenter === cc3) {

                /*  If simple accounting, amount=Income column of transaction
                    If double accounting, amount=Amount column of transaction */
                if (banDoc.table('Categories')) {
                    var amount = tRow.value("Income");
                } else {
                    var amount = tRow.value("Amount");
                }

                rowCnt++;
                tableRow.addCell(rowCnt, "borderBottom", 1); //sequencial numbers
                tableRow.addCell(Banana.Converter.toLocaleDateFormat(tRow.value("Date")), "borderBottom", 1);
                tableRow.addCell(banDoc.info("AccountingDataBase", "BasicCurrency"), "borderBottom");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(amount), "right borderBottom", 1);
                if (banDoc.info("AccountingDataBase","Company")) {
                    tableRow.addCell(banDoc.info("AccountingDataBase","Company"), "borderBottom right");
                } else {
                    tableRow.addCell();
                }
                total = Banana.SDecimal.add(total, amount);
            }
        }
    }

    if (total > 0) {
        tableRow = table.addRow();
        tableRow.addCell("", "borderTop borderBottom", 1);
        tableRow.addCell("", "borderTop borderBottom", 1);
        tableRow.addCell(texts.text06, "bold borderTop borderBottom", 1);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total), "bold right borderTop borderBottom", 1);
        tableRow.addCell("", "borderTop borderBottom", 1);
    }
}

/* Function that retrieves in a list all the CC3 accounts */
function getCC3Accounts(banDoc) {
    var membershipList = [];
    var accountsTable = banDoc.table("Accounts");
    for (var i = 0; i < accountsTable.rowCount; i++) {
        var tRow = accountsTable.row(i);
        var account = tRow.value("Account");
        if (account.substring(0,1) === ";") {
            membershipList.push(account);
        }
    }
    return membershipList;
}

/* Function that converts parameters of the dialog */
function convertParam(userParam) {

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
    var userParam = {};
    userParam.version = '1.0';
    userParam.costcenter = '';
    userParam.minimumAmount = '';
    userParam.texts = '';
    userParam.useDefaultTexts = false;
    userParam.titleText = texts.title;
    userParam.text1 = texts.multiTransactionText;
    userParam.text2 = '';
    userParam.text3 = '';
    userParam.text4 = '';
    userParam.details = true;
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

    var lang = getLang(Banana.document);
    if (!lang) {
        lang = "en";
    }
    texts = loadTexts(Banana.document,lang);
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

/* Function that takes the locale language of Banana */
function getLang(banDoc) {
    var lang = banDoc.locale;
    if (lang && lang.length > 2)
        lang = lang.substr(0, 2);
    return lang;
}

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

    if (userParam.printHeaderLogo) {
		stylesheet.addStyle(".tableAddress", "margin-top:20mm; margin-left:105mm");
	} else {
		stylesheet.addStyle(".tableAddress", "margin-top:16mm; margin-left:105mm");
	}
	//stylesheet.addStyle("table.tableAddress td", "border: thin solid black");

    return stylesheet;
}

/* Function that loads all the default texts used for the dialog and the report  */
function loadTexts(banDoc,lang) {

    var texts = {};

    if (lang === "de") {
        texts.reportTitle = "Spendenbescheinigung";
        texts.dialogTitle = "Einstellungen";
        texts.title = "Spendenbescheinigung <Period>";
        texts.warningMessage = "Ungültiges Mitgliedkonto Konto";
        texts.accountNumber = "Mitgliedskonto eingeben (leer = alle ausdrucken)";
        texts.localityAndDate = "Ort und Datum";
        texts.signature = "Unterschrift";
        texts.signature_image = "Unterschrift mit Bild";
        texts.signatureImage = "Bild";
        texts.imageHeight = "Bildhöhe (mm)";
        texts.memberAccount = "Mitgliedskonto";
        texts.donationDate = "Periode";
        texts.titleText = "Titel (optional)";
        texts.text1 = "Text 1 (optional)";
        texts.text2 = "Text 2 (optional)";
        texts.text3 = "Text 3 (optional)";
        texts.text4 = "Text 4 (optional)";
        texts.useDefaultTexts = "DefaultTexte verwenden";
        texts.multiTransactionText = "Hiermit bestätigen wir, dass **<FirstName> <FamilyName>, <Address>** in der Zeit vom **<StartDate> - <EndDate>** **<Currency> <Amount>** unserem Verein gespendet hat.";
        texts.textsGroup = "Texte";
        texts.details = "Geben Sie die Spendendaten an";
        texts.minimumAmount = "Mindestspendenbetrag";
        texts.styles = "Stilarten";
        texts.fontFamily = "Schriftarttyp";
        texts.fontSize = "Schriftgrad";
		texts.printHeaderLogo = "Logo";
		texts.headerLogoName = "Logo-Name";
    }
    else if (lang === "fr") {
        texts.reportTitle = "Certificat de don";
        texts.dialogTitle = "Paramètres";
        texts.title = "Certificat de don <Period>";
        texts.warningMessage = "Compte de membre non valide";
        texts.accountNumber = "Entrer le compte du membre (vide = imprimer tout)";
        texts.localityAndDate = "Lieu et date";
        texts.signature = "Signature";
        texts.signature_image = "Signature avec image";
        texts.signatureImage = "Image";
        texts.imageHeight = "Hauteur de l'image (mm)";
        texts.memberAccount = "Compte de membre";
        texts.donationDate = "Période";
        texts.titleText = "Titre (optionnel)";
        texts.text1 = "Texte 1 (optionnel)";
        texts.text2 = "Texte 2 (optionnel)";
        texts.text3 = "Texte 3 (optionnel)";
        texts.text4 = "Texte 4 (optionnel)";
        texts.useDefaultTexts = "Utiliser des textes standard";
        texts.multiTransactionText = "Nous déclarons par la présente que **<FirstName> <FamilyName>, <Address>** dans la période **<StartDate> - <EndDate>** a fait don de **<Currency> <Amount>** à notre Association.";
        texts.textsGroup = "Textes";
        texts.details = "Inclure les détails du don";
        texts.minimumAmount = "Montant minimum du don";
        texts.styles = "Styles";
        texts.fontFamily = "Type de police";
        texts.fontSize = "Taille de police";
		texts.printHeaderLogo = "Logo";
		texts.headerLogoName = "Logo nom";
    }
    else if (lang === "it") {
        texts.reportTitle = "Attestato di donazione";
        texts.dialogTitle = "Impostazioni";
        texts.title = "Attestato di donazione <Period>";
        texts.warningMessage = "Conto membro non valido";
        texts.accountNumber = "Indicare il conto del membro (vuoto = stampa tutti)";
        texts.localityAndDate = "Località e data";
        texts.signature = "Firma";
        texts.signature_image = "Firma con immagine";
        texts.signatureImage = "Immagine";
        texts.imageHeight = "Altezza immagine (mm)";
        texts.memberAccount = "Conto del membro";
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
        texts.minimumAmount = "Importo minimo della donazione";
        texts.styles = "Stili";
        texts.fontFamily = "Tipo di carattere";
        texts.fontSize = "Dimensione carattere";
		texts.printHeaderLogo = "Logo";
		texts.headerLogoName = "Nome logo";
    }
    else if (lang === "nl") {
        texts.reportTitle = "Kwitantie voor giften";
        texts.dialogTitle = "Instellingen";
        texts.title = "Kwitantie voor giften <Period>";
        texts.warningMessage = "Ongeldige rekening gever";
        texts.accountNumber = "Rekening gever invoeren (leeg = alles afdrukken)";
        texts.localityAndDate = "Plaats en datum";
        texts.signature = "Handtekening";
        texts.signature_image = "Handtekening met afbeelding";
        texts.signatureImage = "Afbeelding";
        texts.imageHeight = "Hoogte afbeelding (mm)";
        texts.memberAccount = "Rekening gever";
        texts.donationDate = "Periode";
        texts.titleText = "Titel (facultatief)";
        texts.text1 = "Tekst 1 (facultatief)";
        texts.text2 = "Tekst 2 (facultatief)";
        texts.text3 = "Tekst 3 (facultatief)";
        texts.text4 = "Tekst 4 (facultatief)";
        texts.useDefaultTexts = "Gebruik standaard teksten";
        texts.multiTransactionText = "Wij verklaren hierbij dat **<FirstName> <FamilyName>, <Address>** tussen **<StartDate>** en **<EndDate>** het bedrag van **<Currency> <Amount>** geschonken heeft aan onze instelling.";
        texts.textsGroup = "Teksten";
        texts.details = "Giften detail opnemen";
        texts.minimumAmount = "Minimumbedrag van de gift";
        texts.styles = "Stijl";
        texts.fontFamily = "Type lettertype";
        texts.fontSize = "Lettergrootte";
		texts.printHeaderLogo = "Logo";
		texts.headerLogoName = "Logo naam";
    }
    else if (lang === "pt") {
        texts.reportTitle = "Certificado de doação";
        texts.dialogTitle = "Configurações";
        texts.title = "Certificado de doação <Period>";
        texts.warningMessage = "Conta de membro inválida";
        texts.accountNumber = "Inserir conta de membro (vazio = imprimir todos)";
        texts.localityAndDate = "Localidade e data";
        texts.signature = "Assinatura";
        texts.signature_image = "Assinatura com imagem";
        texts.signatureImage = "Imagem";
        texts.imageHeight = "Altura da imagem (mm)";
        texts.memberAccount = "Conta de membro";
        texts.donationDate = "Período";
        texts.titleText = "Título (opcional)";
        texts.text1 = "Texto 1 (opcional)";
        texts.text2 = "Texto 2 (opcional)";
        texts.text3 = "Texto 3 (opcional)";
        texts.text4 = "Texto 4 (opcional)";
        texts.useDefaultTexts = "Use textos padrão";
        texts.multiTransactionText = "Declaramos pela presente que **<FirstName> <FamilyName>, <Address>** entre **<StartDate>** e **<EndDate>**doou **<Currency> <Amount>** para nossa Associação.";
        texts.textsGroup = "Textos";
        texts.details = "Incluir detalhes da doação";
        texts.minimumAmount = "Valor mínimo da doação";
        texts.styles = "Estilos";
        texts.fontFamily = "Tipo de letra";
        texts.fontSize = "Tamanho da letra";
        texts.printHeaderLogo = "Logo";
        texts.headerLogoName = "Nome logótipo";
    }
    else { //lang == en
        texts.reportTitle = "Statement of donation";
        texts.dialogTitle = "Settings";
        texts.title = "Statement of donation <Period>";
        texts.warningMessage = "Invalid member account";
        texts.accountNumber = "Insert account member (empty = print all)";
        texts.localityAndDate = "Locality and date";
        texts.signature = "Signature";
        texts.signature_image = "Signature with image";
        texts.signatureImage = "Image";
        texts.imageHeight = "Image height (mm)";
        texts.memberAccount = "Member account";
        texts.donationDate = "Period";
        texts.titleText = "Title (optional)";
        texts.text1 = "Text 1 (optional)";
        texts.text2 = "Text 2 (optional)";
        texts.text3 = "Text 3 (optional)";
        texts.text4 = "Text 4 (optional)";
        texts.useDefaultTexts = "Use standard texts";
        texts.multiTransactionText = "We hereby declare that **<FirstName> <FamilyName>, <Address>** between **<StartDate>** and **<EndDate>**donated **<Currency> <Amount>** to our Association.";
        texts.textsGroup = "Texts";
        texts.details = "Include donation details";
        texts.minimumAmount = "Minimum amount of the donation";
        texts.styles = "Styles";
        texts.fontFamily = "Font type";
        texts.fontSize = "Font size";
		texts.printHeaderLogo = "Logo";
		texts.headerLogoName = "Logo name";
    }

    return texts;
}
