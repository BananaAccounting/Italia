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
// @api = 1.0
// @id = ch.banana.script.italianvatreport.2017.js
// @description = Comunicazione periodica IVA (file xml)
// @doctype = *;110
// @encoding = utf-8
// @exportfilename = IT99999999999_LI_00001
// @exportfiletype = xml
// @includejs = ch.banana.script.italianvatreport.2017.createinstance.js
// @includejs = ch.banana.script.italianvatreport.2017.xml.js
// @includejs = ch.banana.script.italianvatreport.2017.errors.js
// @inputdatasource = none
// @pubdate = 2017-05-23
// @publisher = Banana.ch SA
// @task = export.file
// @timeout = -1

/*
 * Update script's parameters
*/
function settingsDialog() {

  var param = initParam();
  var savedParam = Banana.document.scriptReadSettings();
  if (savedParam.length > 0) {
    param = JSON.parse(savedParam);
  }
  param = verifyParam(param);
  
  var accountingData = readAccountingData();
  if (accountingData.accountingYear.length<=0) {
    return false;
  }
  
  var dialog = Banana.Ui.createUi("ch.banana.script.italianvatreport.2017.dialog.ui");
  dialog.periodoGroupBox.title += ' ' + accountingData.accountingYear;
  if (param.selezioneTrimestre) {
    dialog.periodoGroupBox.trimestreRadioButton.checked = true;
    dialog.periodoGroupBox.meseRadioButton.checked = false;
  }
  else {
    dialog.periodoGroupBox.trimestreRadioButton.checked = false;
    dialog.periodoGroupBox.meseRadioButton.checked = true;
  }
  dialog.periodoGroupBox.trimestreComboBox.currentIndex = param.valoreTrimestre;
  dialog.periodoGroupBox.meseComboBox.currentIndex = param.valoreMese;
  if (param.interestRate.length>0)
    dialog.interesseSpinBox.value = parseInt(param.interestRate);
  dialog.firmaContribuenteCheckBox.checked = param.firmaContribuente;
  var progressivo = parseInt(param.progressivoInvio, 10);
  if (!progressivo)
    progressivo = 1;
  else
    progressivo += 1;
  progressivo = zeroPad(progressivo, 5);
  dialog.intestazioneGroupBox.progressivoInvioLineEdit.text = progressivo;
  dialog.intestazioneGroupBox.cfDichiaranteLineEdit.text = param.codicefiscaleDichiarante;
  dialog.intestazioneGroupBox.codiceCaricaComboBox.currentIndex = param.codiceCarica;

  //dialog functions
  dialog.checkdata = function () {
    dialog.accept();
  }
  dialog.enableButtons = function () {
    if (dialog.periodoGroupBox.trimestreRadioButton.checked) {
        dialog.periodoGroupBox.trimestreComboBox.enabled = true;
        dialog.periodoGroupBox.trimestreComboBox.update();
        dialog.periodoGroupBox.meseComboBox.enabled = false;
        dialog.periodoGroupBox.meseComboBox.update();
    }
    else if (dialog.periodoGroupBox.meseRadioButton.checked) {
        dialog.periodoGroupBox.trimestreComboBox.enabled = false;
        dialog.periodoGroupBox.trimestreComboBox.update();
        dialog.periodoGroupBox.meseComboBox.enabled = true;
        dialog.periodoGroupBox.meseComboBox.update();
    }
  }
  dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.script.italianvatreport.2017.js");
  }
  dialog.buttonBox.accepted.connect(dialog, "checkdata");
  dialog.buttonBox.helpRequested.connect(dialog, "showHelp");
  dialog.periodoGroupBox.trimestreRadioButton.clicked.connect(dialog, "enableButtons");
  dialog.periodoGroupBox.meseRadioButton.clicked.connect(dialog, "enableButtons");
  
  Banana.application.progressBar.pause();
  dialog.enableButtons();
  var dlgResult = dialog.exec();
  Banana.application.progressBar.resume();

  if (dlgResult !== 1)
    return false;

  param.valoreTrimestre = dialog.periodoGroupBox.trimestreComboBox.currentIndex.toString();
  param.valoreMese = dialog.periodoGroupBox.meseComboBox.currentIndex.toString();
  if (dialog.periodoGroupBox.trimestreRadioButton.checked) {
    param.selezioneTrimestre = true;
    param.selezioneMese = false;
    if (param.valoreTrimestre === "0") {
      param.repStartDate = accountingData.accountingYear.toString() + "0101";
      param.repEndDate = accountingData.accountingYear.toString() + "0331";
    }
    else if (param.valoreTrimestre === "1") {
      param.repStartDate = accountingData.accountingYear.toString() + "0401";
      param.repEndDate = accountingData.accountingYear.toString() + "0630";
    }
    else if (param.valoreTrimestre === "2") {
      param.repStartDate = accountingData.accountingYear.toString() + "0701";
      param.repEndDate = accountingData.accountingYear.toString() + "0930";
    }
    else {
      param.repStartDate = accountingData.accountingYear.toString() + "1001";
      param.repEndDate = accountingData.accountingYear.toString() + "1231";
    }
  }
  else {
    param.selezioneTrimestre = false;
    param.selezioneMese = true;
    var month = parseInt(param.valoreMese) + 1;
    //months with 30 days
    if (month === 11 || month === 4 || month === 6 || month === 9) {
      param.repStartDate = accountingData.accountingYear.toString() + zeroPad(month, 2) + "01";
      param.repEndDate = accountingData.accountingYear.toString() + zeroPad(month, 2) + "30";
    }
    //month with 28 or 29 days
    else if (month === 2) {
      var day = 28;
      if (accountingData.accountingYear % 4 == 0 && (accountingData.accountingYear % 100 != 0 || accountingData.accountingYear % 400 == 0)) {
        day = 29;
      }
      param.repStartDate = accountingData.accountingYear.toString() + "0201" ;
      param.repEndDate = accountingData.accountingYear.toString() + "02" + day.toString();
    }
    //months with 31 days
    else {
      param.repStartDate = accountingData.accountingYear.toString() + zeroPad(month, 2) + "01" ;
      param.repEndDate = accountingData.accountingYear.toString() + zeroPad(month, 2) + "31" ;
    }
  }
  param.interestRate = dialog.interesseSpinBox.value.toString();
  param.firmaContribuente = dialog.firmaContribuenteCheckBox.checked;
  progressivo = dialog.intestazioneGroupBox.progressivoInvioLineEdit.text;
  progressivo = parseInt(progressivo, 10);
  if (!progressivo)
    progressivo = 1;
  param.progressivoInvio = zeroPad(progressivo, 5);
  param.codicefiscaleDichiarante = dialog.intestazioneGroupBox.cfDichiaranteLineEdit.text;
  param.codiceCarica = dialog.intestazioneGroupBox.codiceCaricaComboBox.currentIndex.toString();

  var paramToString = JSON.stringify(param);
  Banana.document.scriptSaveSettings(paramToString);
  return true;
}

function exec(inData) {

  if (!Banana.document)
    return "@Cancel";

  if (!settingsDialog())
    return "@Cancel";

  var param = JSON.parse(Banana.document.scriptReadSettings());
  
  // Calculate vat amounts for each vat code
  param = vatCodesLoad(param);
  param = vatCodesAddStyle(param);
  param.schemaRefs = init_schemarefs();
  param.namespaces = init_namespaces();

  var output = createInstance(param)

  if (output != "@Cancel") {
    //Banana.Ui.showText(JSON.stringify(param.vatAmounts, null, 3));
    var report = Banana.Report.newReport("Report title");
    var stylesheet = Banana.Report.newStyleSheet();
    printVatReport1(report, stylesheet, param);
    printVatReport2(report, stylesheet, param);
    Banana.Report.preview(report, stylesheet);
  }

  return output;

}

function calculateInterestAmount(param) {
  //calcolato solo per stampe trimestrali
  if (getPeriod("q", param).length<=0)
    return '';
  
  var vatTotalWithoutInterest = substractVatAmounts(param.vatAmounts["Total"], param.vatAmounts["L-INT"]);
  if (Banana.SDecimal.sign(vatTotalWithoutInterest.vatPosted)<=0) {
    var interestRate = Banana.SDecimal.round(param.interestRate, {'decimals':2});
    var interestAmount = Banana.SDecimal.abs(vatTotalWithoutInterest.vatPosted) * interestRate /100;
    interestAmount = Banana.SDecimal.roundNearest(interestAmount, '0.01');
    return interestAmount.toString();
  }
  return '';
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

function getPeriod(format, param) {
  var fromDate = Banana.Converter.toDate(param.repStartDate);
  var toDate = Banana.Converter.toDate(param.repEndDate);
  var firstDayOfPeriod = 1;
  var lastDayOfPeriod = new Date(toDate.getFullYear(),toDate.getMonth()+1,0).getDate().toString();
  if (fromDate.getDate() != firstDayOfPeriod)
    return "";
  if (toDate.getDate() != lastDayOfPeriod)
    return "";
  if (format === "y") {
    if (fromDate.getFullYear() === toDate.getFullYear())
      return fromDate.getFullYear();
  }
  else if (format === "m") {
    if (fromDate.getMonth() === toDate.getMonth())
      return (fromDate.getMonth()+1).toString();
  }
  else if (format === "q") {
    var q = [1,2,3,4];
    var q1 = q[Math.floor(fromDate.getMonth() / 3)];  
    var q2 = q[Math.floor(toDate.getMonth() / 3)];  
    if (q1 === q2)
      return q1.toString();
  }
  return "";
}

function getVatTotalFromBanana(startDate, endDate) {
  var total =  {
  vatAmount : "",
  vatTaxable : "",
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

function initParam()
{
  var param = {};
  param.selezioneTrimestre = true;
  param.selezioneMese = false;
  param.valoreTrimestre = '';
  param.valoreMese = '';
  param.repStartDate = '';
  param.repEndDate = '';
  if (Banana.document) {
    param.repStartDate = Banana.document.startPeriod();
    param.repEndDate = Banana.document.endPeriod();
  }
  param.interestRate = '';
  param.firmaContribuente = true;
  param.invioProgressivo = '';
  param.codicefiscaleDichiarante = '';
  param.codiceCarica = '';
  return param;
}

function init_namespaces()
{
  var ns = [
    {
      'namespace' : 'urn:www.agenziaentrate.gov.it:specificheTecniche:sco:ivp',
      'prefix' : 'xmlns:iv'
    },
    {
      'namespace' : 'http://www.w3.org/2000/09/xmldsig#',
      'prefix' : 'xmlns:ds'
    },
  ];
  return ns;
}
function init_schemarefs()
{
  var schemaRefs = [
    //'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v2.0 fornituraIvp_2017_v1.xsd',
   ];
  return schemaRefs;
};

function printVatReport1(report, stylesheet, param) {
  // Styles
  stylesheet.addStyle("phead", "font-size: 12px, font-weight: bold; margin-bottom: 1em");
  stylesheet.addStyle("thead", "font-weight: bold");
  stylesheet.addStyle("td", "padding-right: 1em");
  stylesheet.addStyle(".amount", "text-align: right");
  stylesheet.addStyle(".period", "font-size: 10px; padding-top: 1em;padding-bottom: 1em;");
  stylesheet.addStyle(".vatNumber", "font-size: 10px");
  stylesheet.addStyle(".warning", "color: red;font-size:8px;");
  stylesheet.addStyle(".total1", "border-bottom:1px double black;font-weight:bold;padding-top:10px;");
  stylesheet.addStyle(".total2", "border-bottom:1px double black;font-weight:bold;padding-top:10px;");
  stylesheet.addStyle(".total3", "border-bottom:1px solid black;padding-top:10px");
  stylesheet.addStyle(".total4", "");

  // Page header
  var pageHeader = report.getHeader();
  pageHeader.addParagraph(Banana.document.info("AccountingDataBase","Company") + " " + Banana.document.info("AccountingDataBase","City"));
  pageHeader.addParagraph("Partita IVA: " + Banana.document.info("AccountingDataBase","VatNumber"), "vatNumber");
  pageHeader.addParagraph("Periodo: " + Banana.Converter.toLocaleDateFormat(param.repStartDate) + " - " + Banana.Converter.toLocaleDateFormat(param.repEndDate), "period");

  var table = report.addTable("table1");

  // Print header
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("Cod. IVA");
  headerRow.addCell("Imponibile", "amount");
  headerRow.addCell("Importo IVA", "amount");
  headerRow.addCell("IVA non deducibile", "amount");
  headerRow.addCell("IVA contabilizzata", "amount");

  // Print vat amounts
  for (var vatCode in param.vatAmounts) {
    var sum = '';
    sum = Banana.SDecimal.add(sum, param.vatAmounts[vatCode].vatTaxable);
    sum = Banana.SDecimal.add(sum, param.vatAmounts[vatCode].vatAmount);
    sum = Banana.SDecimal.add(sum, param.vatAmounts[vatCode].vatNotDeductible);
    sum = Banana.SDecimal.add(sum, param.vatAmounts[vatCode].vatPosted);
    if (Banana.SDecimal.isZero(sum) || !param.vatAmounts[vatCode].style)
      continue;
    var row = table.addRow();
    row.addCell(vatCode, "description " + param.vatAmounts[vatCode].style);
    if (vatCode == "difference" || vatCode == "BananaTotal")
      row.addCell("","amount " + param.vatAmounts[vatCode].style);
    else
      row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(param.vatAmounts[vatCode].vatTaxable)), "amount " + param.vatAmounts[vatCode].style);
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(param.vatAmounts[vatCode].vatAmount)), "amount " + param.vatAmounts[vatCode].style);
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(param.vatAmounts[vatCode].vatNotDeductible)), "amount " + param.vatAmounts[vatCode].style);
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(param.vatAmounts[vatCode].vatPosted)), "amount " + param.vatAmounts[vatCode].style);
  }
}

function printVatReport2(report, stylesheet, param) {

  // Styles
  stylesheet.addStyle("table.table2", "margin-top:5em;");

  //Print table
  var table = report.addTable("table2");

  // Print header
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("");
  headerRow.addCell("");
  headerRow.addCell("");
  headerRow.addCell("");

  // Print vat amounts
  var row = table.addRow();
  row.addCell("VP2");
  row.addCell("Totale operazioni attive (al netto dell'IVA)", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param.vatAmounts["OPATTIVE"].vatTaxable)), "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP3");
  row.addCell("Totale operazioni passive (al netto dell'IVA)", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param.vatAmounts["OPPASSIVE"].vatTaxable)), "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP4");
  row.addCell("IVA esigibile", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param.vatAmounts["OPATTIVE"].vatPosted)), "amount");
  row.addCell("");
  
  row = table.addRow();
  row.addCell("VP5");
  row.addCell("IVA detratta", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param.vatAmounts["OPPASSIVE"].vatPosted)), "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP6");
  if (Banana.SDecimal.sign(param.vatAmounts["OPDIFFERENZA"].vatPosted)<=0)
    row.addCell("IVA dovuta", "description");
  else
    row.addCell("IVA a credito", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param.vatAmounts["OPDIFFERENZA"].vatPosted)), "amount");
  row.addCell("");
  
  row = table.addRow();
  row.addCell("VP7");
  row.addCell("Debito periodo precedente", "description");
  if (Banana.SDecimal.sign(param.vatAmounts["L-CI"].vatPosted)<=0)
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param.vatAmounts["L-CI"].vatPosted)), "amount");
  else
    row.addCell("", "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP8");
  row.addCell("Credito periodo precedente", "description");
  if (Banana.SDecimal.sign(param.vatAmounts["L-CI"].vatPosted)>=0)
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param.vatAmounts["L-CI"].vatPosted)), "amount");
  else
    row.addCell("", "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP9");
  row.addCell("Credito anno precedente", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param.vatAmounts["L-CIA"].vatPosted)), "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP10");
  row.addCell("Versamenti auto UE", "description");
  row.addCell("", "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP11");
  row.addCell("Crediti d'imposta", "description");
  row.addCell("", "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP12");
  row.addCell("Interessi dovuti per liquidazioni trimestrali", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param.vatAmounts["L-INT"].vatPosted)), "amount");
  /*propone interessi se importo è diverso da quello visualizzato*/
  var calculatedAmount = calculateInterestAmount(param);
  if (Banana.SDecimal.abs(param.vatAmounts["L-INT"].vatPosted) != calculatedAmount && !Banana.SDecimal.isZero(calculatedAmount))
    row.addCell("Interessi dovuti per liquidazione trimestrale (" + param.interestRate + "% EUR " + Banana.Converter.toLocaleNumberFormat(calculatedAmount) + ") non registrati correttamente", "amount warning");
  else
    row.addCell("");

  row = table.addRow();
  row.addCell("VP13");
  row.addCell("Acconto dovuto", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param.vatAmounts["L-AC"].vatPosted)), "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP14");
  if (Banana.SDecimal.sign(param.vatAmounts["Total"].vatPosted)<=0)
    row.addCell("IVA da versare", "description");
  else
    row.addCell("IVA a credito", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param.vatAmounts["Total"].vatPosted)), "amount");
  row.addCell("");

}

function readAccountingData() {
  var param = {};
  param.accountingYear = '';
  
  var accountingOpeningDate = Banana.document.info("AccountingDataBase", "OpeningDate");
  var accountingClosureDate = Banana.document.info("AccountingDataBase", "ClosureDate");

  var openingYear = 0;
  var closureYear = 0;
  if (accountingOpeningDate.length >= 10)
    openingYear = accountingOpeningDate.substring(0, 4);
  if (accountingClosureDate.length >= 10)
    closureYear = accountingClosureDate.substring(0, 4);
  if (openingYear > 0 && openingYear === closureYear)
    param.accountingYear = openingYear;

  return param;
}

function substractVatAmounts(vatAmounts1, vatAmounts2) {
  var sum = {
  vatAmount : "",
  vatTaxable : "",
  vatNotDeductible : "",
  vatPosted : ""
  };

  sum.vatAmount = (+vatAmounts1.vatAmount - +vatAmounts2.vatAmount).toFixed(2);
  sum.vatTaxable = (+vatAmounts1.vatTaxable - +vatAmounts2.vatTaxable).toFixed(2);
  sum.vatNotDeductible = (+vatAmounts1.vatNotDeductible - +vatAmounts2.vatNotDeductible).toFixed(2);
  sum.vatPosted = (+vatAmounts1.vatPosted - +vatAmounts2.vatPosted).toFixed(2);

  return sum;
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
    var msg = getErrorMessage(ID_ERR_CODICI_ND);
    msg = msg.replace("%1", codesToSum );
    Banana.document.addMessage( msg, ID_ERR_CODICI_ND);
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

function vatCodesAddStyle(param) 
{
  /* just for printing */
  param.vatAmounts["V-IM-BA"].style = "total4";
  param.vatAmounts["V-IM-REV"].style = "total4";
  param.vatAmounts["V-IM-EU"].style = "total4";
  param.vatAmounts["V-IM-ES"].style = "total4";
  param.vatAmounts["V-IM"].style = "total3";
  param.vatAmounts["V-NI-EU"].style = "total4";
  param.vatAmounts["V-NI"].style = "total3";
  param.vatAmounts["V-ES"].style = "total4";
  param.vatAmounts["V-NE"].style = "total4";
  param.vatAmounts["V-FC"].style = "total4";
  param.vatAmounts["V-ED"].style = "total4";
  param.vatAmounts["V"].style = "total2";

  param.vatAmounts["C-NVE"].style = "total3";
  param.vatAmounts["C-VEN"].style = "total3";
  param.vatAmounts["C-REG"].style = "total3";
  param.vatAmounts["C"].style = "total2";
  
  param.vatAmounts["A-IM-RI"].style = "total4";
  param.vatAmounts["A-IM-BA"].style = "total4";
  param.vatAmounts["A-IM-BN"].style = "total4";
  param.vatAmounts["A-IM-AL"].style = "total4";
  param.vatAmounts["A-IM-RI-REV"].style = "total4";
  param.vatAmounts["A-IM-RI-EU"].style = "total4";
  param.vatAmounts["A-IM"].style = "total3";
  param.vatAmounts["A-NI-X"].style = "total4";
  param.vatAmounts["A-NI"].style = "total3";
  param.vatAmounts["A-ES"].style = "total4";
  param.vatAmounts["A-NE"].style = "total4";
  param.vatAmounts["A-FC"].style = "total4";
  param.vatAmounts["A-ED"].style = "total4";
  param.vatAmounts["A"].style = "total2";

  param.vatAmounts["L-AC"].style = "total3";
  param.vatAmounts["L-CI"].style = "total3";
  param.vatAmounts["L-CIA"].style = "total3";
  param.vatAmounts["L-INT"].style = "total3";
  param.vatAmounts["L"].style = "total2";

  param.vatAmounts["Total"].style = "total1";
  param.vatAmounts["BananaTotal"].style = "total1";
  param.vatAmounts["difference"].style = "total1";
  
  return param;
}

function vatCodesLoad(param) 
{
  var vatCodes = [];
  param.vatAmounts = {};

  // V = Vendite
  var tableVatCodes = Banana.document.table("VatCodes");
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM-BA");
  param.vatAmounts["V-IM-BA"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM-REV");
  param.vatAmounts["V-IM-REV"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM-EU");
  param.vatAmounts["V-IM-EU"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM-ES");
  param.vatAmounts["V-IM-ES"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM");
  param.vatAmounts["V-IM"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-NI-EU");
  param.vatAmounts["V-NI-EU"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-NI");
  param.vatAmounts["V-NI"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-ES");
  param.vatAmounts["V-ES"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-NE");
  param.vatAmounts["V-NE"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-FC");
  param.vatAmounts["V-FC"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-ED");
  param.vatAmounts["V-ED"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);

  param.vatAmounts["V-IM"] = sumVatAmounts(param.vatAmounts, ["V-IM","V-IM-BA","V-IM-REV","V-IM-EU","V-IM-ES"]);
  param.vatAmounts["V-NI"] = sumVatAmounts(param.vatAmounts, ["V-NI","V-NI-EU"]);
  param.vatAmounts["V"] = sumVatAmounts(param.vatAmounts, ["V-IM","V-NI","V-ES","V-NE","V-FC","V-ED"]);

  // C = Corrispettivi
  vatCodes = findVatCodes(tableVatCodes, "Gr", "C-NVE");
  param.vatAmounts["C-NVE"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "C-VEN");
  param.vatAmounts["C-VEN"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "C-REG");
  param.vatAmounts["C-REG"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  param.vatAmounts["C"] = sumVatAmounts(param.vatAmounts, ["C-NVE","C-VEN","C-REG"]);
  
  // A = Acquisti
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-RI");
  param.vatAmounts["A-IM-RI"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-BA");
  param.vatAmounts["A-IM-BA"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-BN");
  param.vatAmounts["A-IM-BN"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-AL");
  param.vatAmounts["A-IM-AL"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-RI-REV");
  param.vatAmounts["A-IM-RI-REV"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-RI-EU");
  param.vatAmounts["A-IM-RI-EU"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM");
  param.vatAmounts["A-IM"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-NI-X");
  param.vatAmounts["A-NI-X"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-NI");
  param.vatAmounts["A-NI"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-ES");
  param.vatAmounts["A-ES"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-NE");
  param.vatAmounts["A-NE"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-FC");
  param.vatAmounts["A-FC"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-ED");
  param.vatAmounts["A-ED"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);

  param.vatAmounts["A-IM"] = sumVatAmounts(param.vatAmounts, ["A-IM","A-IM-RI","A-IM-BA","A-IM-BN","A-IM-AL","A-IM-RI-REV","A-IM-RI-EU"]);
  param.vatAmounts["A-NI"] = sumVatAmounts(param.vatAmounts, ["A-NI","A-NI-X"]);
  param.vatAmounts["A"] = sumVatAmounts(param.vatAmounts, ["A-IM","A-NI","A-ES","A-NE","A-FC","A-ED"]);
  
  //Liquidazione
  param.vatAmounts["L-AC"] = Banana.document.vatCurrentBalance("L-AC", param.repStartDate, param.repEndDate);
  param.vatAmounts["L-CI"] = Banana.document.vatCurrentBalance("L-CI", param.repStartDate, param.repEndDate);
  param.vatAmounts["L-CIA"] = Banana.document.vatCurrentBalance("L-CIA", param.repStartDate, param.repEndDate);
  param.vatAmounts["L-INT"] = Banana.document.vatCurrentBalance("L-INT", param.repStartDate, param.repEndDate);
  param.vatAmounts["L"] = sumVatAmounts(param.vatAmounts, ["L-AC","L-CI","L-CIA","L-INT"]);
  
  // Get vat total from report
  param.vatAmounts["Total"] = sumVatAmounts(param.vatAmounts, ["V","C","A","L"]);

  // Get vat total from Banana
  param.vatAmounts["BananaTotal"] = getVatTotalFromBanana(param.repStartDate, param.repEndDate);

  // Calculate difference in totals between report and Banana
  param.vatAmounts["difference"] = substractVatAmounts(param.vatAmounts["Total"], param.vatAmounts["BananaTotal"]);

  //Operazioni attive
  param.vatAmounts["OPATTIVE"] = sumVatAmounts(param.vatAmounts, ["V","C"]);

  //Operazioni passive
  param.vatAmounts["OPPASSIVE"] = sumVatAmounts(param.vatAmounts, ["A"]);

  //Differenza operazioni
  param.vatAmounts["OPDIFFERENZA"] = sumVatAmounts(param.vatAmounts, ["OPATTIVE","OPPASSIVE"]);

  return param;
}

function verifyParam(param) {
  if (!param.selezioneTrimestre && !param.selezioneMese) {
    param.selezioneTrimestre  = true;
    param.selezioneMese  = false;
  }
  if (!param.valoreTrimestre)
    param.valoreTrimestre  = '';
  if (!param.valoreMese)
    param.valoreMese  = '';
   if (!param.repStartDate)
     param.repStartDate = '';
   if (!param.repEndDate)
     param.repEndDate = '';
   if(!param.interestRate)
     param.interestRate = '';
   if(!param.firmaContribuente)
     param.firmaContribuente = false;
   if(!param.progressivoInvio)
     param.progressivoInvio = '';
   if(!param.codicefiscaleDichiarante)
     param.codicefiscaleDichiarante = '';
   if(!param.codiceCarica)
     param.codiceCarica = '';
   return param;
}

/**
* output integers with leading zeros
*/
function zeroPad(num, places) {
    if (num.toString().length > places)
        num = 0;
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}
