// Copyright [2019] [Banana.ch SA - Lugano Switzerland]
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
// @id = creator
// @api = 1.0
// @pubdate = 2021-05-18
// @publisher = Banana.ch SA
// @description = Converter script
// @task = none
// @doctype = *

function exec(inData) {

var jsonData = {
	"fileType": {
		"accountingType" : {
			"docGroup" : "100",
			"docApp" : "110",
			"decimals" : "2"
			
		},
		"template" : "",
	},
	"scriptImport": {
		"function": "exec",
		"uri": "ch.banana.it.audit.fattura.pa.v12.sbaa/ch.banana.it.audit.fattura.pa.v12"
	},		
	"scriptSetup": {
		"function": "setup",
		"uri": "ch.banana.it.audit.fattura.pa.v12.sbaa/ch.banana.it.audit.fattura.pa.v12"
	},		
};
	
return jsonData;

}
