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

/*
* metodo principale che genera il file xml
*/
function createInstance(param)
{
  //<DatiFatturaHeader>
  var xbrlDatiFatturaHeader = createInstance_DatiFatturaHeader(param);

  //<DTE>
  var xbrlContent = '';
  if (param.blocco == 'DTE') {
    xbrlContent = createInstance_blocco_DTE(param);
  }
  else if (param.blocco == 'DTR') {
    xbrlContent = createInstance_blocco_DTR(param);
  }

  //<DatiFattura> root element
  xbrlContent = xbrlDatiFatturaHeader + xbrlContent;
  var attrsNamespaces = {};
  for (var j in param.namespaces) {
    var prefix = param.namespaces[j]['prefix'];
    var namespace = param.namespaces[j]['namespace'];
    if (prefix.length > 0)
      attrsNamespaces[prefix] = namespace;
  }
  for (var j in param.schemaRefs) {
    var schema = param.schemaRefs[j];
    if (schema.length > 0) {
      if (!attrsNamespaces['xsi:schemaLocation'])
        attrsNamespaces['xsi:schemaLocation'] = '';
      if (attrsNamespaces['xsi:schemaLocation'].length>0)
        attrsNamespaces['xsi:schemaLocation'] += " ";
      attrsNamespaces['xsi:schemaLocation'] = attrsNamespaces['xsi:schemaLocation'] + schema;
    }
  }
  attrsNamespaces['versione'] = "DAT10";
  xbrlContent = xml_createElement("df:DatiFattura", xbrlContent, attrsNamespaces);

  //Output
  var results = [];
  results.push("<?xml version='1.0' encoding='UTF-8'?>");
  results.push(xbrlContent);
  return results.join ('\n');

}

/*
* Dati relativi a fatture  EMESSE. Da valorizzare per trasmettere i dati delle fatture emesse.
* Non devono essere riportati in questo blocco i dati delle così dette autofatture, cioè fatture 
* emesse dall'acquirente nei casi in cui non le abbia ricevute oppure, pur avendole ricevute, 
* abbia rilevato in esse delle irregolarità. Tali dati devono essere riportati come dati delle fatture ricevute.
* Se questo blocco è valorizzato, non dovranno essere valorizzati i blocchi 3 <DTR> e 4 <ANN>
* Occorrenze: <0.1>
*/
function createInstance_blocco_DTE(param) 
{
  var xbrlContent = createInstance_CedentePrestatoreDTE(param);
  for (var i in param.customers) {
    var customerObj = param.customers[i];
    if (customerObj)
      xbrlContent += createInstance_CessionarioCommittenteDTE(customerObj, param);
  }
  if (xbrlContent.length>0) {
    xbrlContent += '\n';
  }
  var xbrlDTE =  '\n' + xml_createElement("DTE", xbrlContent) + '\n';
  return xbrlDTE;
}

function createInstance_blocco_DTR(param) 
{
  var xbrlDTR=  '\n' + xml_createElement("DTR", '') + '\n';
  return xbrlDTR;
}

/*
* Blocco contenente le informazioni relative al cedente/prestatore (fornitore).
* Occorrenze: <1.1>
*/
function createInstance_CedentePrestatoreDTE(param) 
{
  var xbrlContent = '';
  var msgContext = '<CedentePrestatoreDTE>';
  
  //2.1.1   <IdentificativiFiscali>
  xbrlContent = '\n' + xml_createElementWithValidation("IdPaese", getCountryCode(param.fileInfo["Address"]["Country"]),1,'2',msgContext);
  xbrlContent += '\n' + xml_createElementWithValidation("IdCodice", param.fileInfo["Address"]["FiscalNumber"],1,'1...28',msgContext) +'\n';
  xbrlContent = '\n' + xml_createElementWithValidation("IdFiscaleIVA",xbrlContent,1);
  xbrlContent += '\n' + xml_createElementWithValidation("CodiceFiscale", param.fileInfo["Address"]["FiscalNumber"],0,'11...16',msgContext) +'\n';
  xbrlContent =  '\n' + xml_createElementWithValidation("IdentificativiFiscali",xbrlContent,1) +'\n';
  
  //2.1.2   <AltriDatiIdentificativi>
  var xbrlContent2 = '';
  if (param.fileInfo["Address"]["Company"].length) {
    xbrlContent2 = '\n' + xml_createElementWithValidation("Denominazione", param.fileInfo["Address"]["Company"],0,'1...80',msgContext);
  }
  else {
    xbrlContent2 = '\n' + xml_createElementWithValidation("Nome", param.fileInfo["Address"]["Name"],0,'1...60',msgContext);
    xbrlContent2 += '\n' + xml_createElementWithValidation("Cognome", param.fileInfo["Address"]["FamilyName"],0,'1...60',msgContext);
  }
  var xbrlContent3 = '\n' + xml_createElementWithValidation("Indirizzo", param.fileInfo["Address"]["Address1"],1,'1...60',msgContext) +'\n';
  //xbrlContent3 += xml_createElementWithValidation("NumeroCivico") +'\n';
  xbrlContent3 += xml_createElementWithValidation("CAP", param.fileInfo["Address"]["Zip"],1,'5',msgContext) +'\n';
  xbrlContent3 += xml_createElementWithValidation("Comune", param.fileInfo["Address"]["City"],1,'1...60',msgContext) +'\n';
  xbrlContent3 += xml_createElementWithValidation("Provincia", param.fileInfo["Address"]["State"],0,'2',msgContext) +'\n';
  xbrlContent3 += xml_createElementWithValidation("Nazione", getCountryCode(param.fileInfo["Address"]["Country"]),1,'2',msgContext) +'\n';
  xbrlContent2 += '\n' + xml_createElementWithValidation("Sede", xbrlContent3,1) +'\n';
  xbrlContent +=  xml_createElementWithValidation("AltriDatiIdentificativi",xbrlContent2,1) +'\n';

  xbrlContent =  '\n' + xml_createElementWithValidation("CedentePrestatoreDTE",xbrlContent,1);
  return xbrlContent;
}

/*
* Blocco contenente le informazioni relative al cessionario/committente (cliente) e ai dati fattura a lui riferiti.
* Può essere replicato per trasmettere dati di fatture relative a clienti diversi
* Occorrenze: <1.1000>
*/
function createInstance_CessionarioCommittenteDTE(customerObj, param) 
{
  var xbrlContent = '';
  var msgContext = '<CessionarioCommittenteDTE> cliente: ' + customerObj["Account"] + ' ' + customerObj["Description"];
  if (customerObj) {
    //2.2.1   <IdentificativiFiscali>
    xbrlContent = '\n' + xml_createElementWithValidation("IdPaese", getCountryCode(customerObj["Country"]),1,'2',msgContext);
    xbrlContent += '\n' + xml_createElementWithValidation("IdCodice", customerObj["FiscalNumber"],1,'1...28',msgContext) +'\n';
    xbrlContent = '\n' + xml_createElementWithValidation("IdFiscaleIVA",xbrlContent,1);
    xbrlContent += '\n' + xml_createElementWithValidation("CodiceFiscale", customerObj["FiscalNumber"],0,'11...16',msgContext) +'\n';
    xbrlContent =  '\n' + xml_createElementWithValidation("IdentificativiFiscali",xbrlContent,1) +'\n';

    //2.2.2   <AltriDatiIdentificativi>
    var xbrlContent2 = '';
    if (customerObj["OrganisationName"].length) {
      xbrlContent2 = '\n' + xml_createElementWithValidation("Denominazione", customerObj["OrganisationName"],0,'1...80',msgContext);
    }
    else {
      xbrlContent2 = '\n' + xml_createElementWithValidation("Nome", customerObj["FirstName"],0,'1...60',msgContext);
      xbrlContent2 += '\n' + xml_createElementWithValidation("Cognome", customerObj["FamilyName"],0,'1...60',msgContext);
    }
    var xbrlContent3 = '\n' + xml_createElementWithValidation("Indirizzo", customerObj["Street"],1,'1...60',msgContext) +'\n';
    xbrlContent3 += xml_createElementWithValidation("CAP", customerObj["PostalCode"],1,'5',msgContext) +'\n';
    xbrlContent3 += xml_createElementWithValidation("Comune", customerObj["Locality"],1,'1...60',msgContext) +'\n';
    xbrlContent3 += xml_createElementWithValidation("Provincia", customerObj["Region"],0,'2',msgContext) +'\n';
    xbrlContent3 += xml_createElementWithValidation("Nazione", getCountryCode(customerObj["Country"]),1,'2',msgContext) +'\n';
    xbrlContent2 += '\n' + xml_createElementWithValidation("Sede", xbrlContent3,1) +'\n';
    xbrlContent +=  xml_createElementWithValidation("AltriDatiIdentificativi", xbrlContent2,1) +'\n';

    /*
    * Blocco obbligatorio. Può essere replicato per trasmettere dati di più fatture relative allo stesso cliente
    */
    //2.2.3   <DatiFatturaBodyDTE>
    for (var i in customerObj.invoices) {
      if (customerObj.invoices[i]) {
        msgContext = '<DatiFatturaBodyDTE> no fattura: ' + customerObj.invoices[i]["DocInvoice"];
        var data = customerObj.invoices[i]["JInvoiceIssueDate"];
        //2.2.3.1  <DatiGenerali>
        xbrlContent3 = '\n' + xml_createElementWithValidation("TipoDocumento", customerObj.invoices[i]["TipoDocumento"],1,'4',msgContext);
        xbrlContent3 += '\n' + xml_createElementWithValidation("Data", data,1,'10',msgContext);
        xbrlContent3 += '\n' + xml_createElementWithValidation("Numero", customerObj.invoices[i]["DocInvoice"],1,'1...20',msgContext) + '\n';
        xbrlContent2 = '\n' + xml_createElementWithValidation("DatiGenerali", xbrlContent3,1);
        //2.2.3.1  <DatiRiepilogo>
        var vatAmounts = createInstance_GetVatAmounts(customerObj.invoices[i]);
        xbrlContent3 = '\n' + xml_createElementWithValidation("ImponibileImporto", vatAmounts.imponibile,1,'4...15',msgContext);
        var xbrlContent4 = '\n' + xml_createElementWithValidation("Imposta", vatAmounts.imposta,1,'4...15',msgContext);
        xbrlContent4 += '\n' + xml_createElementWithValidation("Aliquota", vatAmounts.aliquota,1,'4...6',msgContext) + '\n';
        xbrlContent3 += '\n' + xml_createElementWithValidation("DatiIVA",xbrlContent4,1) ;
        if (vatAmounts.natura.length)
          xbrlContent3 += '\n' + xml_createElementWithValidation("Natura", vatAmounts.natura,0,'2');
        if (vatAmounts.detraibile.length)
          xbrlContent3 += '\n' + xml_createElementWithValidation("Detraibile", vatAmounts.detraibile,0,'4...6');
        if (vatAmounts.deducibile.length)
          xbrlContent3 += '\n' + xml_createElementWithValidation("Deducibile",vatAmounts.deducibile,0,'2');
        if (vatAmounts.natura.length || vatAmounts.detraibile.length || vatAmounts.deducibile.length)
          xbrlContent3 += '\n';
        xbrlContent2 += '\n' + xml_createElementWithValidation("DatiRiepilogo", xbrlContent3,1) +'\n';
        xbrlContent +=  xml_createElementWithValidation("DatiFatturaBodyDTE", xbrlContent2,1) +'\n';
      }
    }
  }
  xbrlContent =  '\n' + xml_createElement("CessionarioCommittenteDTE", xbrlContent);
  return xbrlContent;
}

/*
* Blocco da valorizzare solo se si intende identificare con un progressivo il file che si sta trasmettendo.
* L'elemento 1.3 <IdSistema> non va mai valorizzato in quanto riservato al sistema
* Occorrenze: <0.1>
*/
function createInstance_DatiFatturaHeader(param) 
{
  return '';
}

function createInstance_GetVatAmounts(row) {
  var amounts = {};
  amounts.aliquota = '0.00';
  amounts.deducibile = '';
  amounts.detraibile = '0.00';
  amounts.imponibile = '0.00';
  amounts.imposta = '0.00';
  amounts.natura = '';
  
  if (!row)
    return amounts;

  //aliquota
  amounts.aliquota = row["VatRate"];
  if (Banana.SDecimal.isZero(amounts.aliquota))
    amounts.aliquota = '0.00';
  else
    amounts.aliquota = Banana.SDecimal.abs(amounts.aliquota);

  //iva deducibile
  
  //iva detraibile

  //iva imponibile
  amounts.imponibile = row["JVatTaxable"];
  if (Banana.SDecimal.isZero(amounts.imponibile))
    amounts.imponibile = '0.00';
  else
    amounts.imponibile = Banana.SDecimal.abs(amounts.imponibile);

  //iva imposta
  amounts.imposta = row["VatPosted"];
  if (Banana.SDecimal.isZero(amounts.imposta))
    amounts.imposta = '0.00';
  else
    amounts.imposta = Banana.SDecimal.abs(amounts.imposta);

  //natura
  amounts.natura = row["Natura"];
  
  return amounts;
}
