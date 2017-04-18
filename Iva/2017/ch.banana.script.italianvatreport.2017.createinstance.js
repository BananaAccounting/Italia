function createInstance(param)
{
  var xbrlContent = '';

  for (var vatCode in param.vatAmounts) {
    var sum = '';
    sum = Banana.SDecimal.add(sum, param.vatAmounts[vatCode].vatTaxable);
    sum = Banana.SDecimal.add(sum, param.vatAmounts[vatCode].vatAmount);
    sum = Banana.SDecimal.add(sum, param.vatAmounts[vatCode].vatNotDeductible);
    sum = Banana.SDecimal.add(sum, param.vatAmounts[vatCode].vatPosted);
    if (Banana.SDecimal.isZero(sum) || vatCode === 'bananaTotal')
      continue;
    var xbrlCode =  '\n' + xml_createElement("iv:vatTaxable", param.vatAmounts[vatCode].vatTaxable) + '\n';
    xbrlCode += xml_createElement("iv:vatAmount", param.vatAmounts[vatCode].vatAmount) + '\n';
    xbrlCode += xml_createElement("iv:vatNotDeductible", param.vatAmounts[vatCode].vatNotDeductible) + '\n';
    xbrlCode += xml_createElement("iv:vatPosted", param.vatAmounts[vatCode].vatPosted) + '\n';
    xbrlContent += '\n' + xml_createElement("iv:vatCode", xbrlCode, {'id':vatCode});
  }
  xbrlContent += '\n';
  
  var results = [];
  results.push("<?xml version='1.0' encoding='UTF-8'?>");
  
  var attrsNamespaces = {};
  for (var j in param.namespaces)
  {
    var prefix = param.namespaces[j]['prefix'];
    var namespace = param.namespaces[j]['namespace'];
    if (prefix.length > 0)
      attrsNamespaces[prefix] = namespace;
  }
  for (var j in param.schemaRefs)
  {
    var schema = param.schemaRefs[j];
    if (schema.length > 0)
      attrsNamespaces['xsi:schemaLocation'] = schema;
  }
  results.push(xml_createElement("Fornitura", xbrlContent, attrsNamespaces));
  return results.join ('\n');
   
}

