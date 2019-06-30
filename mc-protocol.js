/**
 * Copyright ....
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
module.exports = function(RED) {
    'use strict';
    var _mdMcProtocol = require('mcprotocol');

    // Configuration Node
    function McProtocolNode(n) {
        RED.nodes.createNode(this,n);
        this.plcaddress = n.plcaddress;
        this.plcport = n.plcport;
        this.device = n.device;
        this.deviceold = "";

        // -1:initial/error, 0:disconect, 1:connect
        //this.connectionStats = -1;

        this.event  = 0;

        var node = this;
        node.log("createNode");

        var _mdConnection = new _mdMcProtocol;

        //disconnect();
        //connect();

        var _isoConnectionState = -1;
        var _connectionStats = function () {
            // status
            if(_isoConnectionState!==_mdConnection.isoConnectionState){
                node.log("update status:"+_isoConnectionState+" -> "+_mdConnection.isoConnectionState);
                _isoConnectionState = _mdConnection.isoConnectionState;
                switch(_mdConnection.isoConnectionState){
                    case 0:     // 0
                        node.status({fill:"green",shape:"dot",text:"stanby"});
                        //disconnect();
                        connect();
                        break;
                    case 1:     // 1 = trying to connect
                        node.status({fill:"green",shape:"dot",text:"trying to connect"});
                        break;
                    case 4:     // 4 = all connected,
                        node.status({fill:"green",shape:"dot",text:"all connected"});
                        break;
                    default:
                        node.status({fill:"red",shape:"ring",text:"not supported"});
                        break;
                }                
            }

            // device upload
            /*
            if(node.deviceold !== node.device){
                node.log("update device address device:"+node.device);
                node.deviceold = node.device;
                var variables = JSON.parse(node.device);
                // This sets the "translation" to allow us to work with object names defined in our app not in the module
                _mdConnection.setTranslationCB(function(tag) {return variables[tag];});
                for(let _key in variables) {
                    _mdConnection.addItems(_key);
                }
            }
            */            
        }
        setInterval(_connectionStats, 3000);

        node.on('input', function(msg) {

            //if( this.connectionStats!==1 ) return;
            if (typeof(_mdConnection) === "undefined") return;
            if (_mdConnection.isoConnectionState!==4) return;

            var doneReading = false;
            var doneWriting = false;
            
            if (typeof(_mdConnection) !== "undefined") {
                //_mdConnection.setTranslationCB(function(tag) {return variables[tag];}); 	// This sets the "translation" to allow us to work with object names defined in our app not in the module
                //_mdConnection.addItems(['TestDword1','TestDword2','TestDword3','TestDword4']);
                //conn.addItems('TestDword1');
                //conn.addItems('TestDwordBit1');
                //conn.addItems(['TEST1', 'TEST4']);	
                //conn.addItems('TEST6');
                //conn.removeItems(['TEST2', 'TEST3']);  // We could do this.  
                //conn.writeItems(['TEST5', 'TEST7'], [ true, true ], valuesWritten);  	// You can write an array of items as well.  
                //conn.writeItems('TEST4', [ 666, 777 ], valuesWritten);  				// You can write a single array item too.  
                _mdConnection.readAllItems(valuesReady);	
            }
            
            function valuesReady(anythingBad, values) {
                if (anythingBad) { console.log("SOMETHING WENT WRONG READING VALUES!!!!"); }
                console.log(values);
                msg.payload = values;
                //flow.set('values', values);
                node.send(msg);
                doneReading = true;
                if (doneWriting) { process.exit(); }
            }
            
            function valuesWritten(anythingBad) {
                if (anythingBad) { console.log("SOMETHING WENT WRONG WRITING VALUES!!!!"); }
                console.log("Done writing.");
                doneWriting = true;
                if (doneReading) { process.exit(); }
            }
        });        
 
        node.on('close', function(removed, done) {
            node.log("close");
            if (removed) {
                // This node has been deleted
                disconnect();
            } else {
                // This node is being restarted
                disconnect();
            }
            if (typeof(_mdConnection) !== "undefined") {
                _mdConnection = {};
            }
            done();
        });

        function connect() {
            if (typeof(_mdConnection) !== "undefined") {
                _mdConnection.initiateConnection({port: node.plcport, host: node.plcaddress, ascii: false}, connected); 
            }

            function connected(err) {
                if (typeof(err) !== "undefined") {
                    //node.connectionStats = -1;
                    //node.status({fill:"red",shape:"ring",text:"disconnect"});
                    // We have an error.  Maybe the PLC is not reachable.  
                    console.log(err);
                } else {
                    //node.connectionStats = 1;    
                    //node.status({fill:"green",shape:"dot",text:"connected"});
                    //msg.payload = 'connected..';
                    //node.send(msg);

                    var variables = JSON.parse(node.device);
                    // This sets the "translation" to allow us to work with object names defined in our app not in the module
                    _mdConnection.setTranslationCB(function(tag) {return variables[tag];});
                    for(let _key in variables) {
                        _mdConnection.addItems(_key);
                    }
                }
                return;
            }    
        }            

        function disconnect() {
            if (typeof(_mdConnection) !== "undefined") {
                _mdConnection.dropConnection();
            }
        }
    }
    RED.nodes.registerType("mc-protocol",McProtocolNode);
}