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
    function McProtocolReadNode(n) {
        this.log("mc-protocol-read:McProtocolReadNode");
        RED.nodes.createNode(this,n);
        this.plcaddress = n.plcaddress;
        this.plcport = n.plcport;
        this.devicestring = n.devicestring;

        var node = this;
        var mdConnection = new _mdMcProtocol;
        var isoConnectionState = -1;
        var devicevariablesOld = "";

        // updateConnectionStats
        var updateConnectionStats = function () {
            //node.log("mc-protocol-read:updateConnectionStats");
            // status
            if(isoConnectionState!==mdConnection.isoConnectionState){
                //node.log("update status:"+isoConnectionState+" -> "+mdConnection.isoConnectionState);
                isoConnectionState = mdConnection.isoConnectionState;
                switch(mdConnection.isoConnectionState){
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
        }
        setInterval(updateConnectionStats, 3000);

        node.on('input', function(msg) {
            //node.log("mc-protocol-read:input");
            try {
                if (typeof(mdConnection) === "undefined") return;
                if (mdConnection.isoConnectionState!==4) return;

                if (typeof(node.devicestring) !== "undefined") {
                    if(node.devicestring!==""){
                        msg.payload = node.devicestring;
                    }
                }

                if (typeof(msg.payload) !== "undefined") {
                    let _result = updateReadItems(msg.payload);
                    if(_result === 1){
                        node.log("updateReadItems:update");
                        let _devicevariablesObject = JSON.parse(msg.payload);
                        // This sets the "translation" to allow us to work with object names defined in our app not in the module
                        mdConnection.setTranslationCB(function(tag) {return _devicevariablesObject[tag];});
                        for(let _key in _devicevariablesObject) {
                            mdConnection.addItems(_key);
                        }
                    }
                }

                //mdConnection.addItems(['TestDword1','TestDword2','TestDword3','TestDword4']);
                //conn.addItems('TestDword1');
                //conn.addItems('TestDwordBit1');
                //conn.addItems(['TEST1', 'TEST4']);	
                //conn.addItems('TEST6');
                //conn.removeItems(['TEST2', 'TEST3']);  // We could do this.  
                //conn.writeItems(['TEST5', 'TEST7'], [ true, true ], valuesWritten);  	// You can write an array of items as well.  
                //conn.writeItems('TEST4', [ 666, 777 ], valuesWritten);  				// You can write a single array item too.  
                mdConnection.readAllItems(valuesReady);

            } catch(e) {
                node.error(e);                
            }

            // updateReadItems
            function updateReadItems(_devicevariables){
                //node.log("mc-protocol-read:updateReadItems");
                let _update = 0;
                try {
                    if (typeof(mdConnection) !== "undefined"){
                        node.log("mc-protocol-read: _devicevariables:"+_devicevariables + " devicevariablesOld:"+devicevariablesOld);
                        if(_devicevariables !== devicevariablesOld){
                            devicevariablesOld = _devicevariables;
                            _update = 1;
                        }
                    }
                } catch(e) {
                    node.error(e);                
                }
                return _update;
            }

            // valuesReady
            function valuesReady(anythingBad, values) {
                //node.log("mc-protocol-read:valuesReady");
                try {
                    if (anythingBad) { node.error("SOMETHING WENT WRONG READING VALUES!!!!"); }
                    msg.payload = values;
                    node.send(msg);
                } catch(e) {
                    node.error(e);                
                }
            }
        });        
 
        node.on('close', function(removed, done) {
            //node.log("mc-protocol-read:close removed:"+removed);
            try {
                if (removed) {
                    // This node has been deleted
                    disconnect();
                } else {
                    // This node is being restarted
                    disconnect();
                }
                if (typeof(mdConnection) !== "undefined") {
                    mdConnection = {};
                }
                done();
            } catch(e) {
                node.error(e);                
            }
        });

        // plc connect
        function connect() {
            //node.log("mc-protocol-read:connect");
            try {
                if (typeof(mdConnection) !== "undefined") {
                    mdConnection.initiateConnection({port: node.plcport, host: node.plcaddress, ascii: false}, connected); 
                }
            } catch(e) {
                node.error(e);                
            }

            // call back connected
            function connected(err) {
                //node.log("mc-protocol-read:connected");
                try {
                    if (typeof(err) !== "undefined") {
                        // We have an error.  Maybe the PLC is not reachable.  
                        console.log(err);
                    } else {
                        console.log('connected..');
                    }
                } catch(e) {
                    node.error(e);                
                }
                return;
            }    
        }            

        // plc disconect
        function disconnect() {
            //node.log("mc-protocol-write:disconnect");
            try {
                if (typeof(mdConnection) !== "undefined") {
                    mdConnection.dropConnection();
                }
            } catch(e) {
                node.error(e);                
            }
        }
    }
    RED.nodes.registerType("mc-protocol-read",McProtocolReadNode);

    // Configuration Write Node
    function McProtocolWriteNode(n) {
        //this.log("mc-protocol-read:McProtocolWriteNode");
        RED.nodes.createNode(this,n);
        this.plcaddress = n.plcaddress;
        this.plcport = n.plcport;
        this.devicestring = n.devicestring;

        var node = this;
        var mdConnection = new _mdMcProtocol;
        var isoConnectionState = -1;
        var devicevariablesOld = "";

        // updateConnectionStats
        var updateConnectionStats = function () {
            //node.log("mc-protocol-write:updateConnectionStats");
            try {
                // status
                if(isoConnectionState!==mdConnection.isoConnectionState){
                    //node.log("update status:"+isoConnectionState+" -> "+mdConnection.isoConnectionState);
                    isoConnectionState = mdConnection.isoConnectionState;
                    switch(mdConnection.isoConnectionState){
                    case 0:     // 0
                        node.status({fill:"green",shape:"dot",text:"stanby"});
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
            } catch(e) {
                node.error(e);                
            }
        }
        setInterval(updateConnectionStats, 3000);

        // node:input
        node.on('input', function(msg) {
            //node.log("mc-protocol-write:input");
            try {
                if (typeof(mdConnection) === "undefined") return;
                if (mdConnection.isoConnectionState!==4)  return;

                if (typeof(node.devicestring) !== "undefined") {
                    if(node.devicestring!==""){
                        msg.payload = node.devicestring;
                    }
                }

                if (typeof(msg.payload) !== "undefined") {
                    let _result = updateWriteItems(msg.payload);
                    if(_result === 1){
                        //node.log("updateWriteItems:update payload:"+msg.payload);
                        let _devicevariablesObject = JSON.parse(msg.payload);
                        // This sets the "translation" to allow us to work with object names defined in our app not in the module
                        mdConnection.setTranslationCB(function(tag) { console.log(tag); return tag;}); 
                        let _keys = [];
                        let _values = [];
                        let _index = 0;
                        for(let _key in _devicevariablesObject) {
                            //_keys[_index] = _key.split(",")[0];
                            _keys[_index] = _key;
                            _values[_index] = _devicevariablesObject[_key];
                            ++_index;
                        }
                        mdConnection.writeItems(_keys, _values, valuesWritten);
                    }
                }
            } catch(e) {
                node.error(e);                
            }

            // updateWriteItems
            function updateWriteItems(_devicevariables){
                //node.log("mc-protocol-write:updateWriteItems");
                let _update = 0;
                try {
                    if (typeof(mdConnection) !== "undefined"){
                        node.log("mc-protocol-write: _devicevariables:"+_devicevariables + " devicevariablesOld:"+devicevariablesOld);
                        if(_devicevariables !== devicevariablesOld){
                            devicevariablesOld = _devicevariables;
                            _update = 1;
                        }
                    }

                } catch(e) {
                    node.error(e);                
                }
                return _update;
            }

            function valuesWritten(anythingBad) {
                try {
                    if (anythingBad) { node.error("SOMETHING WENT WRONG WRITING VALUES!!!!"); }
                    msg.payload = "Done writing.";
                    node.send(msg);
                } catch(e) {
                    node.error(e);                
                }
            }
        });        
 
        // node:close
        node.on('close', function(removed, done) {
            //node.log("mc-protocol-write:close removed:"+removed);
            try {
                if (removed) {
                    // This node has been deleted
                    disconnect();
                } else {
                    // This node is being restarted
                    disconnect();
                }
                if (typeof(mdConnection) !== "undefined") {
                    mdConnection = {};
                }
                done();
            } catch(e) {
                node.error(e);                
            }
        });

        // plc connect
        function connect() {
            //node.log("mc-protocol-write:connect");
            try {
                if (typeof(mdConnection) !== "undefined") {
                    mdConnection.initiateConnection({port: node.plcport, host: node.plcaddress, ascii: false}, connected); 
                }
            } catch(e) {
                node.error(e);                
            }

            // call back connected
            function connected(err) {
                //node.log("mc-protocol-write:connected");
                try {
                    if (typeof(err) !== "undefined") {
                        // We have an error.  Maybe the PLC is not reachable.  
                        console.log(err);
                    } else {
                        console.log('connected..');
                    }
                } catch(e) {
                    node.error(e);                
                }
                return;
            }    
        }            

        // plc disconect
        function disconnect() {
            //node.log("mc-protocol-write:disconnect");
            try {
                if (typeof(mdConnection) !== "undefined") {
                    mdConnection.dropConnection();
                }
            } catch(e) {
                node.error(e);                
            }
        }
    }
    RED.nodes.registerType("mc-protocol-write",McProtocolWriteNode);
}