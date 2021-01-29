// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
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

var AMPERSAND = '&';
var APOS = "'"; 
var GREATERTHAN = ">"; 
var LOWERTHAN = "<"; 
var QUOTE = '"';
var ESCAPED_QUOTE = {  };
ESCAPED_QUOTE[AMPERSAND] = '&amp;';
ESCAPED_QUOTE[APOS] = '&apos;';
ESCAPED_QUOTE[GREATERTHAN] = '&gt;';
ESCAPED_QUOTE[LOWERTHAN] = '&lt;';
ESCAPED_QUOTE[QUOTE] = '&quot;';
   
// XML writer with attributes and smart attribute quote escaping 
function xml_createElement(name,content,attributes){
  var att_str = '';
  if (attributes) { // tests false if this arg is missing!
    att_str = xml_formatAttributes(attributes);
  }
  
  if (content === undefined)
    content = '';
  else
    content = content.toString()
  
  var xml='';
  if (content.length<=0){
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
  
  if (content === undefined)
    content = '';
  else
    content = content.toString()
  
  var xml='';
  if (content.length<=0) {
    if (mandatory>0) {
      xml='<' + name + att_str + '/>';
    }
  }
  else {
    xml='<' + name + att_str + '>' + content + '</'+name+'>';
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
    if (context)
      msg = context + ': ' +  msg;
    if (Banana.document)
      Banana.document.addMessage( msg, ID_ERR_XML_LUNGHEZZA_NONVALIDA);
  }
  else if (maxLen && content.length > maxLen && xml.length>0) {
    if (!content.length)
      content = '[vuoto]';
    msg = getErrorMessage(ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA);
    msg = msg.replace("%1", name );
    msg = msg.replace("%2", content );
    msg = msg.replace("%3", maxLen);
    if (context)
      msg = context + ': ' +  msg;
    if (Banana.document)
      Banana.document.addMessage( msg, ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA);
  }
  else if (minLen && content.length < minLen && xml.length>0) {
    if (!content.length)
      content = '[vuoto]';
    msg = getErrorMessage(ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA);
    msg = msg.replace("%1", name );
    msg = msg.replace("%2", content );
    msg = msg.replace("%3", minLen);
    if (context)
      msg = context + ': ' +  msg;
    if (Banana.document)
      Banana.document.addMessage( msg, ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA);
  }
  return xml;
}

function xml_escapeString(_string) {
  if (!_string)
    return "";
  var string = _string.toString()
  var re = new RegExp(AMPERSAND,'g');
  string = string.replace(re, ESCAPED_QUOTE[AMPERSAND]);
  re = new RegExp(GREATERTHAN,'g');
  string = string.replace(re, ESCAPED_QUOTE[GREATERTHAN]);
  re = new RegExp(LOWERTHAN,'g');
  string = string.replace(re, ESCAPED_QUOTE[LOWERTHAN]);
  re = new RegExp(APOS,'g');
  string = string.replace(re, ESCAPED_QUOTE[APOS]);
  re = new RegExp(QUOTE,'g');
  string = string.replace(re, ESCAPED_QUOTE[QUOTE]);
  string = string.trim();
  return string;
}

function xml_unescapeString(_string) {
  if (!_string)
    return "";
  var string = _string.toString()
  var re = new RegExp(ESCAPED_QUOTE[AMPERSAND],'g');
  string = string.replace(re, AMPERSAND);
  re = new RegExp(ESCAPED_QUOTE[GREATERTHAN],'g');
  string = string.replace(re, GREATERTHAN);
  re = new RegExp(ESCAPED_QUOTE[LOWERTHAN],'g');
  string = string.replace(re, LOWERTHAN);
  re = new RegExp(ESCAPED_QUOTE[APOS],'g');
  string = string.replace(re, APOS);
  re = new RegExp(ESCAPED_QUOTE[QUOTE],'g');
  string = string.replace(re, QUOTE);
  string = string.trim();
  return string;
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
  var result = ' ';
   
  for (var att in attributes) {
    att_value = attributes[att];
    if (att_value === undefined)
      continue;

    re = new RegExp(AMPERSAND,'g');
    att_value = att_value.replace(re, ESCAPED_QUOTE[AMPERSAND]);
    re = new RegExp(GREATERTHAN,'g');
    att_value = att_value.replace(re, ESCAPED_QUOTE[GREATERTHAN]);
    re = new RegExp(LOWERTHAN,'g');
    att_value = att_value.replace(re, ESCAPED_QUOTE[LOWERTHAN]);
    
    // Find first quote marks if any
    apos_pos = att_value.indexOf(APOS);
    quot_pos = att_value.indexOf(QUOTE);
     
    // Determine which quote type to use around 
    // the attribute value
    if (apos_pos === -1 && quot_pos === -1) {
      //att_str = att + "='" + att_value +  "'";
      att_str = att + '="' + att_value +  '"';
      result += att_str + ' ';
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
    att_str = att + '=' + use_quote + 
      att_value.replace(re, escape) + use_quote;
    result += att_str + ' ';
  }
  if (result.endsWith(' '))
    result = result.substr(0, result.length-1);
  return result;
}

function formatXml(xml) {
    var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;

    xml = xml.split('\r\n');
    for(var index = 0; index < xml.length; index++){
      var node = xml[index]; // element
      var indent = 0;
      if (node.match( /.+<\/\w[^>]*>$/ )) {
          indent = 0;
      } else if (node.match( /^<\/\w/ )) {
          if (pad != 0) {
              pad -= 1;
          }
      } else if (node.match( /^<\w([^>]*[^\/])?>.*$/ )) {
          indent = 1;
      } else {
          indent = 0;
      }

      var padding = '';
      for (var i = 0; i < pad; i++) {
          padding += '  ';
      }

      formatted += padding + node + '\r\n';
      pad += indent;
    }
    return formatted;
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
