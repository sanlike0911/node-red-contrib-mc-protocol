var mc = require('./mcprotocol');
var conn_r = new mc;
var conn_w = new mc;

var testID          = 1;
var testRepeatCount = 1;
var testOKCount     = 0;
var testNGCount     = 0;

var WrittenValue = {};
var ReadyValue = {};
var resTest = {};

var sqno = 0;
var evtReauestValuesWritten = false;
var evtReauestValuesReady = false;

var randomNumber = function(minValue, maxValue) {
    return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
}

var randomPercentForTrue = function(_percentag) {
    return (randomNumber(1, 100) <= _percentag ? true : false );
}

var testsettings = [
	{ device: 'dummy', enable:false,repeatCount:0,test:[] },
	{
		device: 'X',
		enable:false,
		repeatCount:1,
		test:[
		   { enable:true,  case:'min',  code:'X0,1',      written:randomPercentForTrue(50) 						}
		  ,{ enable:true,  case:'mid',  code:'X3AB,1',    written:randomPercentForTrue(50) 						}
		  ,{ enable:true,  case:'max',  code:'X7FF,1',    written:randomPercentForTrue(50) 						}
		]
    },
	{
		device: 'Y',
		enable:false,
		repeatCount:1,
		test:[
			 { enable:true,  case:'min',  code:'Y0,1',      written:randomPercentForTrue(50) 						}
			,{ enable:true,  case:'mid',  code:'Y3AB,1',    written:randomPercentForTrue(50) 						}
			,{ enable:true,  case:'max',  code:'Y7FF,1',    written:randomPercentForTrue(50) 						}
		  ]
    },
	{
		device: 'SM',
		enable:false,
		repeatCount:10,
		test:[
		   { enable:true,  case:'min',  code:'SM1000,1',    written:randomPercentForTrue(50) 						}
		  ,{ enable:true,  case:'mid',  code:'SM1100,1',    written:randomPercentForTrue(50) 						}
		  ,{ enable:true,  case:'max',  code:'SM1254,1',    written:randomPercentForTrue(50) 						}
		]
    },
	{
		device: 'M',
		enable:false,
		repeatCount:3,
		test:[
		   { enable:true,  case:'min1',  code:'M0,1',       written:randomPercentForTrue(50) 						}
		  ,{ enable:true,  case:'max1',  code:'M8191,1',    written:randomPercentForTrue(50) 						}
		  ,{ enable:true,  case:'min2',  code:'M9000,1',    written:randomPercentForTrue(50) 						}
		  ,{ enable:true,  case:'max2',  code:'M9255,1',    written:randomPercentForTrue(50) 						}
		]
    },
	{
		device: 'CS',
		enable:false,
		repeatCount:3,
		test:[
		   { enable:true,  case:'min',   code:'CS0,1',      written:randomPercentForTrue(50) 						}
		  ,{ enable:true,  case:'mid',   code:'CS512,1',    written:randomPercentForTrue(50) 						}
		  ,{ enable:true,  case:'max',   code:'CS1022,1',   written:randomPercentForTrue(50) 						}
		]
    },
	{
		device: 'CN',
		enable:false,
		repeatCount:3,
		test:[
		   { enable:true,  case:'min',   code:'CN0,1',       written:-32768 										}
		  ,{ enable:true,  case:'mid',   code:'CN512,1',     written:0      										}
		  ,{ enable:true,  case:'max',   code:'CN1023,1',    written:32767	  										}
		  ,{ enable:true,  case:'1word', code:'CN100,1',     written:Math.floor( Math.random () * 32767) - 32768	}
		  ,{ enable:true,  case:'nword', code:'CN300,5',     written:[Math.floor( Math.random () * 32767) - 32768,Math.floor( Math.random () * 32767) - 32768,Math.floor( Math.random () * 32767) - 32768,Math.floor( Math.random () * 32767) - 32768,Math.floor( Math.random () * 32767) - 32768]}
		  ,{ enable:false, case:'1bit',  code:'CN400.1',     written:randomPercentForTrue(50)						}
		  ,{ enable:false, case:'nbit',  code:'CN500.1,20',  written:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]		}
		]
    },
	{
		device: 'TS',
		enable:false,
		repeatCount:3,
		test:[
		   { enable:true,  case:'min',   code:'TS0,1',       written:randomPercentForTrue(50)						}
		  ,{ enable:true,  case:'mid',   code:'TS1000,1',    written:randomPercentForTrue(50)						}
		  ,{ enable:true,  case:'max',   code:'TS2047,1',    written:randomPercentForTrue(50)						}
		]
    },
	{
		device: 'TN',
		enable:false,
		repeatCount:3,
		test:[
		   { enable:true,  case:'min',   code:'TN0,1',       written:-32768 										}
		  ,{ enable:true,  case:'mid',   code:'TN1000,1',    written:0      										}
		  ,{ enable:true,  case:'max',   code:'TN2047,1',    written:32767  										}
		  ,{ enable:true,  case:'1word', code:'TN100,1',     written:Math.floor( Math.random () * 32767) - 32768	}
		  ,{ enable:true,  case:'nword', code:'TN300,5',     written:[Math.floor( Math.random () * 32767) - 32768,Math.floor( Math.random () * 32767) - 32768,Math.floor( Math.random () * 32767) - 32768,Math.floor( Math.random () * 32767) - 32768,Math.floor( Math.random () * 32767) - 32768] }
		  ,{ enable:false, case:'1bit',  code:'TN400.1',     written:randomPercentForTrue(50)						}
		  ,{ enable:false, case:'nbit',  code:'TN500.1,20',  written:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]		}	
		]
   },
   {
		 device: 'D',
		 enable:false,
		 repeatCount:3,
		 test:[
			{ enable:true,  case:'min',   code:'D0,1',       written:-32768 										}
		   ,{ enable:true,  case:'mid',   code:'D3000,1',    written:0      										}
		   ,{ enable:true,  case:'max',   code:'D6143,1',    written:32767  										}
		   ,{ enable:true,  case:'1word', code:'D1000,1',    written:Math.floor( Math.random () * 32767) - 32768	}
		   ,{ enable:true,  case:'nword', code:'D3000,5',    written:[Math.floor( Math.random () * 32767) - 32768,Math.floor( Math.random () * 32767) - 32768,Math.floor( Math.random () * 32767) - 32768,Math.floor( Math.random () * 32767) - 32768,Math.floor( Math.random () * 32767) - 32768] }
		   ,{ enable:false, case:'1bit',  code:'D4000.1',    written:randomPercentForTrue(50)						}
		   ,{ enable:false, case:'nbit',  code:'D5000.1,20', written:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]		}
		 ]
	},
	{
		device: 'W',
		enable:false,
		repeatCount:3,
		test:[
		   { enable:true,  case:'min',   code:'W0,1',       written:-32768 											}
		  ,{ enable:true,  case:'mid',   code:'W100,1',     written:0      											}
		  ,{ enable:true,  case:'max',   code:'WFFF,1',     written:32767  											}
		  ,{ enable:true,  case:'1word', code:'W10,1',      written:Math.floor( Math.random () * 32767) - 32768		}
		  ,{ enable:true,  case:'nword', code:'W30,5',      written:[Math.floor( Math.random () * 32767) - 32768,Math.floor( Math.random () * 32767) - 32768,Math.floor( Math.random () * 32767) - 32768,Math.floor( Math.random () * 32767) - 32768,Math.floor( Math.random () * 32767) - 32768] }
		  ,{ enable:false, case:'1bit',  code:'W40.1',      written:randomPercentForTrue(50)						}
		  ,{ enable:false, case:'nbit',  code:'W50.1,20',   written:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]		}
		]
   }
];

/*
var variables = { 
      //TEST1: 'D0,5',             // 5 words starting at D0
      //TEST2: 'M6990,28', 			// 28 bits at M6990
	  //TEST3: 'CN199,2',			    // ILLEGAL as CN199 is 16-bit, CN200 is 32-bit, must request separately
	  //TEST4: 'R2000,2',			    // 2 words at R2000
	  //TEST4: 'D2000,2',			    // 2 words at R2000
	  //TEST5: 'D2000.1',			    // 2 words at R2000
	  TEST1: 'X0',		    		    // input
	  TEST2: 'Y0',		    		    // output
	  TEST3M: 'M1200',	    		    // Auxiliary Relay
	  TEST3L: 'L907',	    		    // Lacth Relay
	  //TEST3S: 'S200',	    		    // Step Relay
	  TEST4: 'B0',		    		    // Link Relay
	  TEST5: 'F0',		    		    // annunciator
	  TEST12A: 'R0,1',				// 1 words at R0
	  //TEST8: 'S4,2',				// 2 bits at S4
	  //TEST9: 'RFLOAT5000,40'		// 40 floating point numbers at R5000	
};							        // See setTranslationCB below for more examples
*/
conn_r.initiateConnection({port: 9501, host: '172.17.0.85', ascii: false}, connected); 
conn_w.initiateConnection({port: 9601, host: '172.17.0.85', ascii: false}, connected); 

var connected = function(err) {
	if (typeof(err) !== "undefined") {
		// We have an error.  Maybe the PLC is not reachable.  
		console.log(err);
		process.exit();
	}
}

var compare = function(_write,_read){
	let _tmp;
	let _res = 1;
	for(let _key in _write) {
		_tmp = _read[_key];
		if(typeof(_tmp) !== "undefined"){
			let _resKey = testsettings[testID]['device']+'_TestCnt'+String(testRepeatCount);
			resTest[_resKey] = {};
			resTest[_resKey]['device'     ] = testsettings[testID]['device'];
			resTest[_resKey]['repeatCount'] = testRepeatCount;
			resTest[_resKey]['compare'    ] = "compare key:" + _key + " write:"+JSON.stringify(_write[_key]) + " read:"+JSON.stringify(_tmp);
			console.log(resTest[_resKey]['compare']);
			if(JSON.stringify(_write[_key]) !== JSON.stringify(_tmp)){
				_res = -1;
				resTest[_resKey]['result'] = false;
			} else {
				resTest[_resKey]['result'] = true;
			}
		}
	}
	return _res;
}

var valuesReady = function(anythingBad, values) {
	if (anythingBad) { console.log("SOMETHING WENT WRONG READING VALUES!!!!"); }
	ReadyValue = values;
	evtReauestValuesReady = true;
}

var valuesWritten = function(anythingBad) {
	if (anythingBad) { console.log("SOMETHING WENT WRONG WRITING VALUES!!!!"); }
	evtReauestValuesWritten = true;
}

async function requestValuesReady(_index) {
	// This sets the "translation" to allow us to work with object names defined in our app not in the module
	conn_r.setTranslationCB(function(tag) { return tag; });	
	for(let _i = 0 ; _i < testsettings[_index]['test'].length ; _i++ ){
		conn_r.addItems(testsettings[_index]['test'][_i]['code']);
	}
	conn_r.readAllItems(await valuesReady);
}

async function reauestValuesWritten(_index) {
	let _keys = []; _values = []; _count = 0;
	WrittenValue = {};
	for(let _i = 0 ; _i < testsettings[_index]['test'].length ; _i++ ){
		if(typeof(testsettings[_index]['test'][_i]['written']) !== "undefined" && testsettings[_index]['test'][_i]['enable'] === true){
			let _key   = testsettings[_index]['test'][_i]['code'];
			let _value = testsettings[_index]['test'][_i]['written'];
			 _keys[_count]  = _key;
			 _values[_count] = _value;
			WrittenValue[_key] = _value;
			++_count;
		}
	}
	// This sets the "translation" to allow us to work with object names defined in our app not in the module
	conn_w.setTranslationCB(function(tag) { return tag; });	
	conn_w.writeItems(_keys, _values, await valuesWritten);
}

function resultOutput(){
	console.log('------------------ <<< result >>> ------------------');
	console.log('total:'+String(testOKCount+testNGCount)+' OK:'+String(testOKCount)+' NG:'+String(testNGCount));
	for( let _key in resTest){
		console.log('#device:'+ _key + ' result:' + resTest[_key]['result']);
		if(resTest[_key]['result']===false){
			console.log('->compare error list');
			console.log(resTest[_key]['compare']);
		}
	}
}

function sequenceCtrol() {
	switch(sqno){
	case 0:	// reauestValuesWritten 
		//console.log('sequenceCtrol : reauestValuesWritten sqno:'+sqno);
		if( testID < testsettings.length ){
			if(testsettings[testID].enable === true){
				console.log('--->index:'+testID+' repeatCount:'+testRepeatCount+' device:'+testsettings[testID]['device']);
				evtReauestValuesWritten = false;
				reauestValuesWritten(testID);
				sqno = 1; // wait reauestValuesWritten
			} else {
				sqno = 10; // device next
			}
		} else {
			sqno = 99; // test end
		}
		break;
	case 1:	// wait reauestValuesWritten
		//console.log('sequenceCtrol : reauestValuesWritten wait... sqno:'+sqno);
		if(evtReauestValuesWritten){
			sqno = 2;	// requestValuesReady
		}
		break;
	case 2:	// requestValuesReady
		//console.log('sequenceCtrol : reauestValuesWritten sqno:'+sqno);
		evtReauestValuesReady = false;
		requestValuesReady(testID);
		sqno = 3;	// wait requestValuesReady
		break;
	case 3:	// wait requestValuesReady
		//console.log('sequenceCtrol : requestValuesReady wait... sqno:'+sqno);
		if(evtReauestValuesReady){
			sqno = 4; // compare
		}
		break;
	case 4:	// compare
		//console.log('sequenceCtrol : compare... sqno:'+sqno);
		if(compare(WrittenValue, ReadyValue) !== 1){
			console.log('diff result : NG');
			++testNGCount;
		} else {
			console.log('diff result : OK');
			++testOKCount;
			_res = true;
		}
		sqno = 5; // repeat count check
		break;
	case 5:	// repeat count check
		//console.log('sequenceCtrol : repeat count check... sqno:'+sqno);
		if(testRepeatCount < testsettings[testID]['repeatCount']){
			++testRepeatCount;
			sqno = 0; // reauestValuesWritten
		} else {
			testRepeatCount = 1;
			sqno = 10; // device next
		}	
		break;
	case 10:	// device next
		//console.log('sequenceCtrol : device next... sqno:'+sqno);
		++testID;
		sqno = 0;	// wait requestValuesReady
		break;
	case 99:	// test end
		//console.log('sequenceCtrol : test end... sqno:'+sqno);
		resultOutput();
		process.exit();
		break;
	default:
		console.log('sequenceCtrol : sqno no error... sqno:'+sqno);
		process.exit();
		break;
	}
	setTimeout(sequenceCtrol, 250);
}
sequenceCtrol();
//timer = setInterval(sequenceCtrol, 5000);