function createInstance(param)
{
  //<Intestazione>
  var xbrlIntestazione = createInstance_Intestazione(param);

  //<Comunicazione>
  var xbrlComunicazione = createInstance_Comunicazione(param);

  if (xbrlIntestazione.length<=0 || xbrlComunicazione.length<=0)
    return "@Cancel";

  //<Fornitura> root element
  var xbrlContent = '\n' + xbrlIntestazione + xbrlComunicazione;
  var attrsNamespaces = {};
  for (var j in param.namespaces) {
    var prefix = param.namespaces[j]['prefix'];
    var namespace = param.namespaces[j]['namespace'];
    if (prefix.length > 0)
      attrsNamespaces[prefix] = namespace;
  }
  for (var j in param.schemaRefs) {
    var schema = param.schemaRefs[j];
    if (schema.length > 0)
      attrsNamespaces['xsi:schemaLocation'] = schema;
  }
  xbrlContent = xml_createElement("iv:Fornitura", xbrlContent, attrsNamespaces);

  //Output
  var results = [];
  results.push("<?xml version='1.0' encoding='UTF-8'?>");
  results.push(xbrlContent);
  return results.join ('\n');

}

function createInstance_Comunicazione(param) 
{
  var xbrlCodiceFiscale = xml_createElement("iv:CodiceFiscale", createInstance_GetValueFromTableInfo("AccountingDataBase", "FiscalNumber")) + '\n';
  var xbrlAnnoImposta = xml_createElement("iv:AnnoImposta", createInstance_GetAccountingPeriod("y", param)) + '\n';
  var xbrlPartitaIva = xml_createElement("iv:PartitaIva", createInstance_GetValueFromTableInfo("AccountingDataBase", "VatNumber")) + '\n';
  var xbrlContent = '\n' + xbrlCodiceFiscale + xbrlAnnoImposta + xbrlPartitaIva;
  var xbrlFrontespizio = '\n' + xml_createElement("iv:Frontespizio", xbrlContent) + '\n';
  
  var xbrlMese = '';
  var xbrlTrimestre = '';
  if (createInstance_GetAccountingPeriod("m", param).length>0)
    xbrlMese = xml_createElement("iv:Mese", createInstance_GetAccountingPeriod("m", param)) + '\n';
  if (createInstance_GetAccountingPeriod("q", param).length>0)
    xbrlTrimestre = xml_createElement("iv:Trimestre", createInstance_GetAccountingPeriod("q", param)) + '\n';
  if (xbrlMese.length<=0 && xbrlTrimestre.length<=0){
      Banana.document.addMessage( "Periodo non valido. Selezionare un mese oppure un trimestre.", "Errore");
      return '';
  }
  var xbrlTotaleOperazioniAttive = xml_createElement("iv:TotaleOperazioniAttive", createInstance_GetVatTaxable("V", param)) + '\n';
  var xbrlTotaleOperazioniPassive = xml_createElement("iv:TotaleOperazioniPassive", createInstance_GetVatTaxable("A", param)) + '\n';
  xbrlContent = '\n' + xbrlMese + xbrlTrimestre + xbrlTotaleOperazioniAttive + xbrlTotaleOperazioniPassive;
  var xbrlModulo = '\n' + xml_createElement("iv:Modulo", xbrlContent) + '\n';
  var xbrlDatiContabili =  xml_createElement("iv:DatiContabili", xbrlModulo) + '\n';
  
  xbrlContent = xbrlFrontespizio + xbrlDatiContabili;

  var xbrlComunicazione =  xml_createElement("iv:Comunicazione", xbrlContent, {'identificativo':'1'}) + '\n';
  return xbrlComunicazione;
}

function createInstance_Intestazione(param) 
{
  var xbrlContent =  '\n' + xml_createElement("iv:CodiceFornitura", "IVP17") + '\n';
  var xbrlIntestazione =  xml_createElement("iv:Intestazione", xbrlContent) + '\n';
  return xbrlIntestazione;
}

function createInstance_GetAccountingPeriod(format, param) {
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

function createInstance_GetValueFromTableInfo(xmlSection, xmlId, param) {
  if (!Banana.document)
    return '';
  var xmlValue = Banana.document.info(xmlSection,xmlId);
  if (xmlValue === undefined)
    xmlValue = '';
  return xmlValue;
}

function createInstance_GetVatTaxable(vatCode, param) {
  if (vatCode.length<=0)
    return "";
  var amount = param.vatAmounts[vatCode].vatTaxable;
  amount = Banana.SDecimal.abs(amount);
  amount = Banana.SDecimal.roundNearest(amount, '1');
  return amount;
}