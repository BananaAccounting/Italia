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
// @description = Comunicazione periodica IVA 2017 formato xml
// @doctype = *;110
// @encoding = utf-8
// @exportfilename = IT99999999999__DF_00001
// @exportfiletype = xml
// @includejs = ch.banana.script.italianvatreport.2017.createinstance.js
// @includejs = ch.banana.script.italianvatreport.2017.xml.js
// @inputdatasource = none
// @pubdate = 2017-04-14
// @publisher = Banana.ch SA
// @task = export.file
// @timeout = -1

function exec(inData) {

  if (!Banana.document)
    return;

  var param = initParam();
  var savedParam = Banana.document.scriptReadSettings();
  if (savedParam.length > 0) {
    param = JSON.parse(savedParam);
  }
  param = verifyParam(param);
  
  // Ask period
  var selPeriod = Banana.Ui.getPeriod("Vat report period", Banana.document.startPeriod(), Banana.document.endPeriod(), param.repStartDate, param.repEndDate, true);
  if (!selPeriod)
    return;

  if (selPeriod.selectionChecked) {
    param.repStartDate = selPeriod.selectionStartDate;
    param.repEndDate = selPeriod.selectionEndDate;
  }
  else {
    param.repStartDate = selPeriod.startDate;
    param.repEndDate = selPeriod.endDate;
  }

  var paramToString = JSON.stringify(param);
  var value = Banana.document.scriptSaveSettings(paramToString);
  
  // Calculate vat amounts for each vat code
  param = loadVatCodes(param);

  //Test
  //Banana.Ui.showText(JSON.stringify(param.vatAmounts, null, 3));
  //var report = Banana.Report.newReport("Report title");
  //var stylesheet = Banana.Report.newStyleSheet();
  //printVatReport(report, stylesheet, param);
  //Banana.Report.preview(report, stylesheet);

  return createInstance(param);

}

function initParam()
{
  var param = {};
  param.repStartDate = '';
  param.repEndDate = '';
  if (Banana.document) {
    param.repStartDate = Banana.document.startPeriod();
    param.repEndDate = Banana.document.endPeriod();
  }
  param.schemaRefs = init_schemarefs();
  param.namespaces = init_namespaces();
  return param;
}

function init_namespaces()
{
  var ns = [
    {
      'namespace' : 'urn:www.agenziaentrate.gov.it:specificheTecniche:telent:v1',
      'prefix' : 'xmlns:tm',
    },
    {
      'namespace' : 'urn:www.agenziaentrate.gov.it:specificheTecniche:common',
      'prefix' : 'xmlns:cm',
    },
    {
      'namespace' : 'urn:www.agenziaentrate.gov.it:specificheTecniche:sco:common',
      'prefix' : 'xmlns:sc',
    },
    {
      'namespace' : 'urn:www.agenziaentrate.gov.it:specificheTecniche:sco:ivp',
      'prefix' : 'xmlns:iv',
    },
  ];
  return ns;
}
function init_schemarefs()
{
  var schemaRefs = [
    'telematico_v1.xsd',
    'fornitura_v3.xsd',
    'typesDati_v3.xsd',
    'typesProvincie_v3.xsd',
    'datiFiscali_v4.xsd',
    'typesFiscali_v4.xsd',
    'typeEventi_v4.xsd',
    'fornituraIvp_2017_v1.xsd',
    'typesIvp_2017_v1.xsd',
  ];
  return schemaRefs;
};

function loadVatCodes(param) 
{
  var vatCodes = [];
  param.vatAmounts = {};

  // V = Vendite
  var tableVatCodes = Banana.document.table("VatCodes");
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM");
  param.vatAmounts["V-IM"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM-BA");
  param.vatAmounts["V-IM-BA"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM-REV");
  param.vatAmounts["V-IM-REV"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM-EU");
  param.vatAmounts["V-IM-EU"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM-ES");
  param.vatAmounts["V-IM-ES"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-NI");
  param.vatAmounts["V-NI"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-NI-EU");
  param.vatAmounts["V-NI-EU"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-ES");
  param.vatAmounts["V-ES"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-NE");
  param.vatAmounts["V-NE"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-FC");
  param.vatAmounts["V-FC"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-ED");
  param.vatAmounts["V-ED"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);

  param.vatAmounts["V-IM"] = sumVatAmounts(param.vatAmounts, ["V-IM","V-IM-BA","V-IM-REV","V-IM-EU","V-IM-ES"]);
  param.vatAmounts["V-NI"] = sumVatAmounts(param.vatAmounts, ["V-NI"], ["V-NI-EU"]);
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
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM");
  param.vatAmounts["A-IM"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
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
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-NI");
  param.vatAmounts["A-NI"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-NI-X");
  param.vatAmounts["A-NI-X"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.repStartDate, param.repEndDate);
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

  // Get vat total from Banana
  param.vatAmounts["bananaTotal"] = getVatTotalFromBanana(param.repStartDate, param.repEndDate);

  // Calculate difference in totals between report and Banana
  param.vatAmounts["difference"] = substractVatAmounts(param.vatAmounts["V"], param.vatAmounts["bananaTotal"]);
  param.vatAmounts["difference"] = substractVatAmounts(param.vatAmounts["C"], param.vatAmounts["difference"]);
  param.vatAmounts["difference"] = substractVatAmounts(param.vatAmounts["A"], param.vatAmounts["difference"]);
  param.vatAmounts["difference"].vatTaxable = "";

  //Operazioni attive
  param.vatAmounts["OPATTIVE"] = sumVatAmounts(param.vatAmounts, ["V","C"]);

  //Operazioni passive
  param.vatAmounts["OPPASSIVE"] = sumVatAmounts(param.vatAmounts, ["A"]);

  return param;
}

function printVatReport(report, stylesheet, param) {
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
  pageHeader.addParagraph("Period: " + param.repStartDate + " - " + param.repEndDate, "period");

  var table = report.addTable();

  // Print header
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("Cod. IVA");
  headerRow.addCell("Imponibile", "amount-align");
  headerRow.addCell("Importo IVA", "amount-align");
  headerRow.addCell("IVA non deducibile", "amount-align");
  headerRow.addCell("IVA contabilizzata", "amount-align");

  // Print vat amounts
  for (var vatCode in param.vatAmounts) {
  var sum = '';
  sum = Banana.SDecimal.add(sum, param.vatAmounts[vatCode].vatTaxable);
  sum = Banana.SDecimal.add(sum, param.vatAmounts[vatCode].vatAmount);
  sum = Banana.SDecimal.add(sum, param.vatAmounts[vatCode].vatNotDeductible);
  sum = Banana.SDecimal.add(sum, param.vatAmounts[vatCode].vatPosted);
  if (Banana.SDecimal.isZero(sum) && vatCode!="difference")
    continue;
  var row = table.addRow();
  row.addCell(vatCode, "");
  row.addCell(Banana.Converter.toLocaleNumberFormat(param.vatAmounts[vatCode].vatTaxable), "amount-align");
  row.addCell(Banana.Converter.toLocaleNumberFormat(param.vatAmounts[vatCode].vatAmount), "amount-align");
  row.addCell(Banana.Converter.toLocaleNumberFormat(param.vatAmounts[vatCode].vatNotDeductible), "amount-align");
  row.addCell(Banana.Converter.toLocaleNumberFormat(param.vatAmounts[vatCode].vatPosted), "amount-align");
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

function verifyParam(param) {
   if (!param.repStartDate)
     param.repStartDate = '';
   if (!param.repEndDate)
     param.repEndDate = '';
   return param;
}