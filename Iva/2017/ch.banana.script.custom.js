// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.script.versamenti.js
// @description = Versamenti IVA...
// @doctype = 100.110;110.110;130.110;100.130
// @encoding = utf-8
// @includejs = ch.banana.script.italy_vat_2017.sbaa/ch.banana.script.italy_vat_2017.report.registri.js
// @inputdatasource = none
// @pubdate = 2019-01-29
// @publisher = Banana.ch SA
// @task = app.command
// @timeout = -1

function exec(inData, options) {

  if (!Banana.document)
    return "@Cancel";

  var param = initParam();

  var registri = new Registri(Banana.document);
  registri.setParam(param);
  registri.loadData();

  var report = Banana.Report.newReport("Liquidazione IVA");
  var stylesheet = Banana.Report.newStyleSheet();
  registri.printDocument(report, stylesheet);
  
  stampaVersamenti(report, stylesheet, param);
  
  Banana.Report.preview(report, stylesheet);
  return;
}

function initParam() {

  var param = {};

  param.tipoRegistro = 3;
  param.colonnaProtocollo = 'DocProtocol';
  param.visualizzaDataOra = false;
  param.numerazioneAutomatica = false;
  param.stampaDefinitiva = false;
  param.inizioNumerazionePagine = 1;
  param.testoRegistriComboBoxIndex = 0;
  param.stampaTestoRegistroAcquisti = false;
  param.stampaTestoRegistroVendite = false;
  param.stampaTestoRegistroCorrispettivi = false;
  param.stampaOrizzontale = false;
  param.testoRegistroAcquisti = '';
  param.testoRegistroVendite = '';
  param.testoRegistroCorrispettivi = '';

  param.annoSelezionato = '';
  param.periodoSelezionato = 'y';
  param.periodoValoreMese = '';
  param.periodoValoreTrimestre = '';
  param.periodoValoreSemestre = '';
  param.periodoDataDal = '';
  param.periodoDataAl = '';
  
  return param;
}

function stampaVersamenti(report, stylesheet, param) {
  if (!report || !Banana.document)
    return;
  
  //Legge dati della contabilità  
  var accountingData = {};
  accountingData = new Utils(Banana.document).readAccountingData(accountingData);
  
  //Prepara i dati
  var vatAmounts = {};
  var tableVatCodes = Banana.document.table("VatCodes");
  if (tableVatCodes) {
    vatAmounts["L-PA1"] = Banana.document.vatCurrentBalance("L-PA1", accountingData.openingYear, accountingData.closureYear);
    vatAmounts["L-PA2"] = Banana.document.vatCurrentBalance("L-PA2", accountingData.openingYear, accountingData.closureYear);
    vatAmounts["L-PA3"] = Banana.document.vatCurrentBalance("L-PA3", accountingData.openingYear, accountingData.closureYear);
    vatAmounts["L-PA4"] = Banana.document.vatCurrentBalance("L-PA4", accountingData.openingYear, accountingData.closureYear);
  }

  //Tabella versamenti IVA
  report.addParagraph(" ");
  report.addParagraph(" ");
  report.addParagraph(" ");
  report.addParagraph("Riepilogo versamenti IVA anno " + accountingData.openingYear, "h1");
  report.addParagraph(" ");
  report.addParagraph(" ");
  var table = report.addTable("tabella_versamenti");
  var headerRow = table.addRow();
  headerRow.addCell("", "description title");
  headerRow.addCell("Importo", "amount title");
  
  
  //Totale L-PA1
  //Banana.console.log(JSON.stringify(vatAmounts));
  var sum = '';
  var amount = vatAmounts["L-PA1"].vatAmount;
  sum = Banana.SDecimal.add(sum, amount);
  var row = table.addRow();
  row.addCell("L-PA1 Pagamento IVA I trim.", "description");
  row.addCell(formattaImporto(amount), "amount");

  amount = vatAmounts["L-PA2"].vatAmount;
  sum = Banana.SDecimal.add(sum, amount);
  var row = table.addRow();
  row.addCell("L-PA2 Pagamento IVA II trim.", "description");
  row.addCell(formattaImporto(amount), "amount");

  amount = vatAmounts["L-PA3"].vatAmount;
  sum = Banana.SDecimal.add(sum, amount);
  var row = table.addRow();
  row.addCell("L-PA3 Pagamento IVA III trim.", "description");
  row.addCell(formattaImporto(amount), "amount");

  amount = vatAmounts["L-PA4"].vatAmount;
  sum = Banana.SDecimal.add(sum, amount);
  var row = table.addRow();
  row.addCell("L-PA4 Pagamento IVA IV trim.", "description");
  row.addCell(formattaImporto(amount), "amount");
  
  var row = table.addRow();
  row.addCell("Totale versato", "description total");
  row.addCell(formattaImporto(sum), "amount total");
  
  //Stile tabella
  stylesheet.addStyle("table.tabella_versamenti td", "padding:5px;");
  stylesheet.addStyle(".title", "font-weight:bold;");
  stylesheet.addStyle(".total", "font-weight:bold;");

}

function formattaImporto(amount) {

  var amountFormatted = amount;
  if (amountFormatted)
    amountFormatted = Banana.Converter.toLocaleNumberFormat(amountFormatted);
  else
      amountFormatted = "";
  if (Banana.SDecimal.isZero(amountFormatted))
    return "";
  return amountFormatted;
}

