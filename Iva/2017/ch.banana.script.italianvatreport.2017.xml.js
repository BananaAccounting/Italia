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

var APOS = "'"; 
QUOTE = '"';
var ESCAPED_QUOTE = {  };
ESCAPED_QUOTE[QUOTE] = '&quot;';
ESCAPED_QUOTE[APOS] = '&apos;';
   
// XML writer with attributes and smart attribute quote escaping 
function xml_createElement(name,content,attributes){
  var att_str = '';
  if (attributes) { // tests false if this arg is missing!
    att_str = xml_formatAttributes(attributes);
  }
  var xml='';
  if (!content){
    xml='<' + name + att_str + '/>';
  }
  else {
    xml='<' + name + att_str + '>' + content + '</'+name+'>';
  }
  return xml;
}

//XML writer with attributes and smart attribute quote escaping 
//xml_createElement('CodiceFiscale', '1345453', {}, '11...16', 0)
//Len una sola cifra lunghezza fissa, due cifre separate da ... lunghezza min e max, nessuna cifra non controlla
//mandatory 0=non obbligatorio 1=obbligatorio
//context: dà ulteriori informazioni nella stringa del messaggio d'errrore
function xml_createElementWithValidation(name,content,mandatory,len,context,attributes){
  var att_str = '';
  if (attributes) { // tests false if this arg is missing!
    att_str = xml_formatAttributes(attributes);
  }
  var xml='';
  if (content) {
    xml='<' + name + att_str + '>' + content + '</'+name+'>';
  }
  else {
    content = '';
    if (mandatory>0) {
      xml='<' + name + att_str + '/>';
    }
  }
  var fixedLen = 0;
  var minLen = 0;
  var maxLen = 0;
  var msg = '';
  if (len && len.indexOf("...")>0) {
    var lenStrings = len.split("...");
    minLen = parseInt(lenStrings[0]);
    maxLen = parseInt(lenStrings[1]);
  }
  else if (len && len.length>0) {
    fixedLen = parseInt(len);
  }
  if (fixedLen > 0 && content.length != fixedLen && xml.length>0) {
    if (!content.length)
      content = '[vuoto]';
    msg = getErrorMessage(ID_ERR_XML_LUNGHEZZA_NONVALIDA);
    msg = msg.replace("%1", name );
    msg = msg.replace("%2", content );
    msg = msg.replace("%3", fixedLen);
  }
  else if (maxLen && content.length > maxLen && xml.length>0) {
    if (!content.length)
      content = '[vuoto]';
    msg = getErrorMessage(ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA);
    msg = msg.replace("%1", name );
    msg = msg.replace("%2", content );
    msg = msg.replace("%3", maxLen);
  }
  else if (minLen && content.length < minLen && xml.length>0) {
    if (!content.length)
      content = '[vuoto]';
    msg = getErrorMessage(ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA);
    msg = msg.replace("%1", name );
    msg = msg.replace("%2", content );
    msg = msg.replace("%3", minLen);
  }
  if (msg) {
    if (context)
      msg = context + ': ' +  msg;
    Banana.document.addMessage( msg, "Errore");
    //Banana.document.table('Transactions').addMessage(msg, -1, "Transactions", ID_ERR_XML_LUNGHEZZA_NONVALIDA);
  }
  return xml;
}

/*
   Format a dictionary of attributes into a string suitable
   for inserting into the start tag of an element.  Be smart
   about escaping embedded quotes in the attribute values.
*/
function xml_formatAttributes(attributes) {
  var att_value;
  var apos_pos, quot_pos;
  var use_quote, escape, quote_to_escape;
  var att_str;
  var re;
  var result = '';
   
  for (var att in attributes) {
    att_value = attributes[att];
    if (att_value === undefined)
      continue;
    
    // Find first quote marks if any
    apos_pos = att_value.indexOf(APOS);
    quot_pos = att_value.indexOf(QUOTE);
     
    // Determine which quote type to use around 
    // the attribute value
    if (apos_pos === -1 && quot_pos === -1) {
      att_str = ' ' + att + "='" + att_value +  "'";
      result += att_str + '\n';
      continue;
    }
    
    // Prefer the single quote unless forced to use double
    if (quot_pos != -1 && quot_pos < apos_pos) {
      use_quote = APOS;
    }
    else {
      use_quote = QUOTE;
    }
   
    // Figure out which kind of quote to escape
    // Use nice dictionary instead of yucky if-else nests
    escape = ESCAPED_QUOTE[use_quote];
    
    // Escape only the right kind of quote
    re = new RegExp(use_quote,'g');
    att_str = ' ' + att + '=' + use_quote + 
      att_value.replace(re, escape) + use_quote;
    result += att_str + '\n';
  }
  if (result.endsWith('\n'))
    result = result.substr(0, result.length-1);
  return result;
}

//  Checks that string starts with the specific string
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
}

//  Checks that string ends with the specific string...
if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str) {
        return this.slice(-str.length) == str;
    };
}
