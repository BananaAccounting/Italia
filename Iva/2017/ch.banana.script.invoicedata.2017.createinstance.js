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
  var xbrlContent = '\n' + xbrlDatiFatturaHeader + xbrlDTE;
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
  xbrlContent = xml_createElement("ns2:DatiFattura", xbrlContent, attrsNamespaces);

  //Output
  var results = [];
  results.push("<?xml version='1.0' encoding='UTF-8'?>");
  results.push(xbrlContent);
  return results.join ('\n');

}

function createInstance_DatiFatturaHeader(param) 
{
  var xbrlContent =  '\n' + xml_createElement("Dichiarante", "") + '\n';
  var xbrlHeader =  xml_createElement("DatiFatturaHeader", xbrlContent) + '\n';
  return xbrlHeader;
}

function createInstance_DTE(param) 
{
  return '';
}
