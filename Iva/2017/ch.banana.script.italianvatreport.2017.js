// Copyright [2016] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.script.italianvatreport.2017.js
// @api = 1.0
// @pubdate = 2017-04-14
// @publisher = Banana.ch SA
// @description = Comunicazione periodica IVA 2017 formato xml
// @task = app.command
// @doctype = *;110
// @inputdatasource = none
// @timeout = -1 

function exec(inData) {

    if (!Banana.document)
        return;

    // Ask period
    var accStartDate = Banana.document.startPeriod();
    var accEndDate = Banana.document.endPeriod();
    var selPeriod = Banana.Ui.getPeriod("Vat report period", accStartDate, accEndDate);
    if (!selPeriod)
        return;

    var repStartDate = selPeriod.startDate;
    var repEndDate = selPeriod.endDate;

    // Calculate vat amounts for each vat report codes
    var vatCodes = [];
    var vatAmounts = {};

    // V = Vendite
    var tableVatCodes = Banana.document.table("VatCodes");
    vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM");
    vatAmounts["V-IM"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM-BA");
    vatAmounts["V-IM-BA"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM-REV");
    vatAmounts["V-IM-REV"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM-EU");
    vatAmounts["V-IM-EU"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM-ES");
    vatAmounts["V-IM-ES"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "V-NI");
    vatAmounts["V-NI"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "V-NI-EU");
    vatAmounts["V-NI-EU"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "V-ES");
    vatAmounts["V-ES"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "V-NE");
    vatAmounts["V-NE"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "V-FC");
    vatAmounts["V-FC"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "V-ED");
    vatAmounts["V-ED"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);

    vatAmounts["V-IM"] = sumVatAmounts(vatAmounts, ["V-IM","V-IM-BA","V-IM-REV","V-IM-EU","V-IM-ES"]);
    vatAmounts["V-NI"] = sumVatAmounts(vatAmounts, ["V-NI"], ["V-NI-EU"]);
    vatAmounts["V"] = sumVatAmounts(vatAmounts, ["V-IM","V-NI","V-ES","V-NE","V-FC","V-ED"]);

    // C = Corrispettivi
    vatCodes = findVatCodes(tableVatCodes, "Gr", "C-NVE");
    vatAmounts["C-NVE"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "C-VEN");
    vatAmounts["C-VEN"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "C-REG");
    vatAmounts["C-REG"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatAmounts["C"] = sumVatAmounts(vatAmounts, ["C-NVE","C-VEN","C-REG"]);

    // A = Acquisti
    vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM");
    vatAmounts["A-IM"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-RI");
    vatAmounts["A-IM-RI"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-BA");
    vatAmounts["A-IM-BA"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-BN");
    vatAmounts["A-IM-BN"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-AL");
    vatAmounts["A-IM-AL"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-RI-REV");
    vatAmounts["A-IM-RI-REV"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-RI-EU");
    vatAmounts["A-IM-RI-EU"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "A-NI");
    vatAmounts["A-NI"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "A-NI-X");
    vatAmounts["A-NI-X"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "A-ES");
    vatAmounts["A-ES"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "A-NE");
    vatAmounts["A-NE"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "A-FC");
    vatAmounts["A-FC"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);
    vatCodes = findVatCodes(tableVatCodes, "Gr", "A-ED");
    vatAmounts["A-ED"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), repStartDate,  repEndDate);

    vatAmounts["A-IM"] = sumVatAmounts(vatAmounts, ["A-IM","A-IM-RI","A-IM-BA","A-IM-BN","A-IM-AL","A-IM-RI-REV","A-IM-RI-EU"]);
    vatAmounts["A-NI"] = sumVatAmounts(vatAmounts, ["A-NI","A-NI-X"]);
    vatAmounts["A"] = sumVatAmounts(vatAmounts, ["A-IM","A-NI","A-ES","A-NE","A-FC","A-ED"]);

    // Get vat total from Banana
    vatAmounts["bananaTotal"] = getVatTotalFromBanana(repStartDate, repEndDate);

    // Calculate difference in totals between report and Banana
    vatAmounts["difference"] = substractVatAmounts(vatAmounts["V"], vatAmounts["bananaTotal"]);
    vatAmounts["difference"] = substractVatAmounts(vatAmounts["C"], vatAmounts["difference"]);
    vatAmounts["difference"] = substractVatAmounts(vatAmounts["A"], vatAmounts["difference"]);
    vatAmounts["difference"].vatTaxable = "";

    //Banana.Ui.showText(JSON.stringify(vatAmounts, null, 3));

    var report = Banana.Report.newReport("Report title");
    var stylesheet = Banana.Report.newStyleSheet();
    printVatReport(report, stylesheet, vatAmounts, repStartDate, repEndDate);
    Banana.Report.preview(report, stylesheet);
}

function printVatReport(report, stylesheet, vatAmounts, startDate, endDate) {
    // Styles
    stylesheet.addStyle("phead", "font-size: 12px, font-weight: bold; margin-bottom: 1em");
    stylesheet.addStyle("thead", "font-weight: bold");
    stylesheet.addStyle("td", "padding-right: 1em");
    stylesheet.addStyle(".amount-align", "text-align: right");
    stylesheet.addStyle(".period", "font-size: 11px; padding-top: 1em;padding-bottom: 1em;");

    // Page header
    var pageHeader = report.getHeader();
    pageHeader.addParagraph(Banana.document.info("AccountingDataBase","Company") + ", " +
                        Banana.document.info("AccountingDataBase","City"));
    pageHeader.addParagraph("Vat number: " + Banana.document.info("AccountingDataBase","VatNumber"));
    pageHeader.addParagraph("Period: " + startDate + " - " + endDate, "period");

    var table = report.addTable();

    // Print header
    var headerRow = table.getHeader().addRow();
    headerRow.addCell("Cod. IVA");
    headerRow.addCell("Imponibile", "amount-align");
    headerRow.addCell("Importo IVA", "amount-align");
    headerRow.addCell("IVA non deducibile", "amount-align");
    headerRow.addCell("IVA contabilizzata", "amount-align");

    // Print vat amounts
    for (var vatCode in vatAmounts) {
        var sum = '';
        sum = Banana.SDecimal.add(sum, vatAmounts[vatCode].vatTaxable);
        sum = Banana.SDecimal.add(sum, vatAmounts[vatCode].vatAmount);
        sum = Banana.SDecimal.add(sum, vatAmounts[vatCode].vatNotDeductible);
        sum = Banana.SDecimal.add(sum, vatAmounts[vatCode].vatPosted);
        if (Banana.SDecimal.isZero(sum) && vatCode!="difference")
          continue;
        var row = table.addRow();
        row.addCell(vatCode, "");
        row.addCell(Banana.Converter.toLocaleNumberFormat(vatAmounts[vatCode].vatTaxable), "amount-align");
        row.addCell(Banana.Converter.toLocaleNumberFormat(vatAmounts[vatCode].vatAmount), "amount-align");
        row.addCell(Banana.Converter.toLocaleNumberFormat(vatAmounts[vatCode].vatNotDeductible), "amount-align");
        row.addCell(Banana.Converter.toLocaleNumberFormat(vatAmounts[vatCode].vatPosted), "amount-align");
    }
}

function findVatCodes(table, column, code) {
    var vatCodes = [];
    for (var rowNr=0; rowNr < table.rowCount; rowNr++) {
        var gr1Codes = table.value(rowNr, column).split(";");
        if (gr1Codes.indexOf(code) >= 0) {
            var vatCode = table.value(rowNr, "VatCode").split(";");
            vatCodes.push(vatCode);
        }
    }
    return vatCodes;
}

function sumVatAmounts(vatAmounts, codesToSum) {
    var sum = {
        vatAmount : "",
        vatTaxable : "",
        vatNotDeductible : "",
        vatPosted : ""
    };

    for (var i=0; i<codesToSum.length; i++) {
        codeAmounts = vatAmounts[codesToSum[i]];
        if (codeAmounts === undefined) {
          Banana.document.addMessage( "Gruppo(i) " + codesToSum + " non trovato(i)", "Errore");
          continue;
        }
        // Javascript note: the sign '+' in '+codeAmounts.vatAmount' is used to convert a string in a number
        sum.vatAmount = (+sum.vatAmount + +codeAmounts.vatAmount).toFixed(2);
        sum.vatTaxable = (+sum.vatTaxable + +codeAmounts.vatTaxable).toFixed(2);
        sum.vatNotDeductible = (+sum.vatNotDeductible + +codeAmounts.vatNotDeductible).toFixed(2);
        sum.vatPosted = (+sum.vatPosted + +codeAmounts.vatPosted).toFixed(2);
    }

    return sum;
}

function substractVatAmounts(vatAmounts1, vatAmounts2) {
    var sum = {
        vatAmount : "",
        vatImposable : "",
        vatNotDeductible : "",
        vatPosted : ""
    };

    sum.vatAmount = (+vatAmounts1.vatAmount - +vatAmounts2.vatAmount).toFixed(2);
    sum.vatTaxable = (+vatAmounts1.vatTaxable - +vatAmounts2.vatTaxable).toFixed(2);
    sum.vatNotDeductible = (+vatAmounts1.vatNotDeductible - +vatAmounts2.vatNotDeductible).toFixed(2);
    sum.vatPosted = (+vatAmounts1.vatPosted - +vatAmounts2.vatPosted).toFixed(2);

    return sum;
}

function getVatTotalFromBanana(startDate, endDate) {
    var total =  {
        vatAmount : "",
        vatImposable : "",
        vatNotDeductible : "",
        vatPosted : ""
    };

    var tableVatReport = Banana.document.vatReport(startDate, endDate);
    var totalRow = tableVatReport.findRowByValue("Group", "_tot_");
    total.vatAmount = totalRow.value("VatAmount");
    total.vatTaxable = totalRow.value("VatTaxable");
    total.vatNotDeductible = totalRow.value("VatNonDeductible");
    total.vatPosted = totalRow.value("VatPosted");

    return total;
}
