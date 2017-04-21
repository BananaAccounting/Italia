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

function createInstance(param)
{
  //<DatiFatturaHeader>
  var xbrlDatiFatturaHeader = createInstance_DatiFatturaHeader(param);

  //<DTE>
  var xbrlDTE = createInstance_DTE(param);

  //<DatiFattura> root element
  var xbrlContent = xbrlDatiFatturaHeader + xbrlDTE;
  var attrsNamespaces = {};
  attrsNamespaces['xsi:schemaLocation'] = '';
  for (var j in param.namespaces) {
    var prefix = param.namespaces[j]['prefix'];
    var namespace = param.namespaces[j]['namespace'];
    if (prefix.length > 0)
      attrsNamespaces[prefix] = namespace;
  }
  for (var j in param.schemaRefs) {
    var schema = param.schemaRefs[j];
    if (schema.length > 0)
      attrsNamespaces['xsi:schemaLocation'] = attrsNamespaces['xsi:schemaLocation'] + " " + schema;
  }
  if (xbrlContent.length>0) {
    xbrlContent = '\n' + xbrlContent;
  }
  xbrlContent = xml_createElement("ns2:DatiFattura", xbrlContent, attrsNamespaces);

  //Output
  var results = [];
  results.push("<?xml version='1.0' encoding='UTF-8'?>");
  results.push(xbrlContent);
  return results.join ('\n');

}

function createInstance_CedentePrestatoreDTE(param) 
{
  var xbrlContent = '';
  
  //2.1.1   <IdentificativiFiscali>
  var countryCode = param.fileInfo["Address"]["Country"];
  if (countryCode.length<=0 || countryCode.length>2)
    countryCode = 'IT';
  xbrlContent = '\n' + xml_createElement("IdPaese", countryCode);
  xbrlContent += '\n' + xml_createElement("IdCodice", param.fileInfo["Address"]["FiscalNumber"]) +'\n';
  xbrlContent = '\n' + xml_createElement("IdFiscaleIVA", xbrlContent);
  xbrlContent += '\n' + xml_createElement("CodiceFiscale", param.fileInfo["Address"]["FiscalNumber"]) +'\n';
  xbrlContent =  '\n' + xml_createElement("IdentificativiFiscali", xbrlContent) +'\n';
  
  //2.1.2   <AltriDatiIdentificativi>
  var xbrlContent2 = '\n' + xml_createElement("Denominazione", param.fileInfo["Address"]["Company"]);
  xbrlContent2 += '\n' + xml_createElement("Nome", param.fileInfo["Address"]["Name"]);
  xbrlContent2 += '\n' + xml_createElement("Cognome", param.fileInfo["Address"]["FamilyName"]);
  var xbrlContent3 = '\n' + xml_createElement("Indirizzo", param.fileInfo["Address"]["Address1"]) +'\n';
  xbrlContent3 += xml_createElement("NumeroCivico") +'\n';
  xbrlContent3 += xml_createElement("CAP", param.fileInfo["Address"]["ZIP"]) +'\n';
  xbrlContent3 += xml_createElement("Comune", param.fileInfo["Address"]["City"]) +'\n';
  xbrlContent3 += xml_createElement("Provincia", param.fileInfo["Address"]["State"]) +'\n';
  xbrlContent3 += xml_createElement("Nazione", countryCode) +'\n';
  xbrlContent2 += '\n' + xml_createElement("Sede", xbrlContent3) +'\n';
  xbrlContent +=  xml_createElement("AltriDatiIdentificativi", xbrlContent2) +'\n';

  xbrlContent =  '\n' + xml_createElement("CedentePrestatoreDTE", xbrlContent);
  return xbrlContent;
}

function createInstance_CessionarioCommittenteDTE(customerAccount, param) 
{
  var xbrlContent = '';
  if (customerAccount.length>0) {
    var customerObj = JSON.parse(getAccount(customerAccount));
    if (customerObj) {

      //2.2.1   <IdentificativiFiscali>
      var countryCode = customerObj["CountryCode"];
      if (countryCode.length<=0 || countryCode.length>2)
        countryCode = 'IT';
      xbrlContent = '\n' + xml_createElement("IdPaese", countryCode);
      xbrlContent += '\n' + xml_createElement("IdCodice", customerObj["FiscalNumber"]) +'\n';
      xbrlContent = '\n' + xml_createElement("IdFiscaleIVA", xbrlContent);
      xbrlContent += '\n' + xml_createElement("CodiceFiscale", customerObj["FiscalNumber"]) +'\n';
      xbrlContent =  '\n' + xml_createElement("IdentificativiFiscali", xbrlContent) +'\n';

      //2.2.2   <AltriDatiIdentificativi>
      var xbrlContent2 = '\n' + xml_createElement("Denominazione", customerObj["OrganisationName"]);
      xbrlContent2 += '\n' + xml_createElement("Nome", customerObj["FirstName"]);
      xbrlContent2 += '\n' + xml_createElement("Cognome", customerObj["FamilyName"]);
      var xbrlContent3 = '\n' + xml_createElement("Indirizzo", customerObj["Street"]) +'\n';
      xbrlContent3 += xml_createElement("NumeroCivico") +'\n';
      xbrlContent3 += xml_createElement("CAP", customerObj["PostalCode"]) +'\n';
      xbrlContent3 += xml_createElement("Comune", customerObj["Locality"]) +'\n';
      xbrlContent3 += xml_createElement("Provincia", customerObj["Region"]) +'\n';
      xbrlContent3 += xml_createElement("Nazione", countryCode) +'\n';
      xbrlContent2 += '\n' + xml_createElement("Sede", xbrlContent3) +'\n';
      xbrlContent +=  xml_createElement("AltriDatiIdentificativi", xbrlContent2) +'\n';

      //2.2.3   <DatiFatturaBodyDTE>
      xbrlContent3 = '\n' + xml_createElement("TipoDocumento", "");
      xbrlContent3 += '\n' + xml_createElement("Data", "");
      xbrlContent3 += '\n' + xml_createElement("Numero", "");
      xbrlContent2 = '\n' + xml_createElement("DatiGenerali", xbrlContent3) +'\n';
      xbrlContent +=  xml_createElement("DatiFatturaBodyDTE", xbrlContent2) +'\n';
  
    }
  }
  xbrlContent =  '\n' + xml_createElement("CessionarioCommittenteDTE", xbrlContent);
  return xbrlContent;
}

function createInstance_DatiFatturaHeader(param) 
{
  return '';
}

/*
* Dati relativi a fatture  EMESSE.
*/
function createInstance_DTE(param) 
{
  var xbrlDTE = '';
  var xbrlContent = createInstance_CedentePrestatoreDTE(param);
  for (var i = 0; i < param.journal.rows.length; i++) {
    var jsonObj = param.journal.rows[i];
    var isCustomer = jsonObj["JInvoiceRowCustomerSupplier"];
    if (isCustomer != '1')
      continue;
    var customerAccount = jsonObj["JAccount"];
    if (customerAccount.length>0)
      xbrlContent += createInstance_CessionarioCommittenteDTE(customerAccount, param);
  }
  if (xbrlContent.length>0) {
    xbrlContent += '\n';
    xbrlDTE =  xml_createElement("DTE", xbrlContent) + '\n';
  }
  return xbrlDTE;
}
