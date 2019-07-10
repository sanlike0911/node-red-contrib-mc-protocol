/**
 * (The MIT License)
 * 
 * Copyright (c) 2019 sanlike <sanlike0911@gmail.com>
 * 
 **/
module.exports = function(RED) {
    'use strict';
    var mdMcProtocol = require('./mcprotocol');

    // 0:disable, 1:debug, 2:info, 3:warning, 4:error
    const DebugLevel = 4;
    const tmrUpdateConectionStatus = 3000;

    /**
     * debugLog
     * @param string _text
     * @param numbar _lv 0:disable, 1:debug, 2:info, 3:warning, 4:error
     * @private
     */    
    function debugLog(_node, _text, _lv = 1){
        if(_lv >= DebugLevel) _node.log(_text);
    }

    /**
     * Configuration Out Node
     * @param {object} n
     * @private
     */       
    function McProtocolOutNode(n) {
        debugLog(this, "mc-protocol-out:McProtocolInNode",1);
        RED.nodes.createNode(this,n);
        this.plcaddress = n.plcaddress;
        this.plcport = n.plcport;
        this.devicestring = n.devicestring;

        var node = this;
        var mdConnection = new mdMcProtocol;
        var isoConnectionState = -1;
        var devicevariablesOld = "";

        /**
         * updateConnectionStats
         * @param void
         * @private
         */
        var updateConnectionStats = function () {
            debugLog(node,"mc-protocol-out:updateConnectionStats",0);
            // status
            if(isoConnectionState!==mdConnection.isoConnectionState){
                debugLog(node,"update status:"+isoConnectionState+" -> "+mdConnection.isoConnectionState,1);
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

        /**
         * plc connect
         * @param void
         * @private
         */   
        function connect() {
            debugLog(node,"mc-protocol-out:connect",1);
            try {
                if (typeof(mdConnection) !== "undefined") {
                    mdConnection.initiateConnection({port: node.plcport, host: node.plcaddress, ascii: false}, connected); 
                }
            } catch(e) {
                node.error(e);                
            }

            /**
             * call back connected
             * @param {object} _err
             * @private
             */   
            function connected(_err) {
                debugLog(node,"mc-protocol-out:connected",1);
                try {
                    if (typeof(_err) !== "undefined") {
                        // We have an error.  Maybe the PLC is not reachable.  
                        debugLog(node, _err,4);
                    } else {
                        debugLog(node, 'connected..',2);
                    }
                } catch(e) {
                    node.error(e);                
                }
                return;
            }    
        }            

        /**
         * plc disconnect
         * @param void
         * @private
         */   
        function disconnect() {
            debugLog(node,"mc-protocol-out:disconnect",1);
            try {
                if (typeof(mdConnection) !== "undefined") {
                    mdConnection.dropConnection();
                }
            } catch(e) {
                node.error(e);                
            }
        }

        /**
         * node on input
         * @param {object} msg
         * @private
         */       
        node.on('input', function(msg) {
            debugLog(node,"mc-protocol-out:input",1);
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
                        debugLog(node,"updateReadItems:update",1);
                        let _devicevariablesObject = JSON.parse(msg.payload);
                        // This sets the "translation" to allow us to work with object names defined in our app not in the module
                        mdConnection.setTranslationCB(function(tag) {debugLog(node,tag,1); return _devicevariablesObject[tag];});
                        for(let _key in _devicevariablesObject) {
                            mdConnection.addItems(_key);
                        }
                    }
                }

                mdConnection.readAllItems(valuesReady);

            } catch(e) {
                node.error(e);                
            }

            /**
             * updateReadItems
             * @param {object} _devicevariables
             * @private
             */                
            function updateReadItems(_devicevariables){
                debugLog(node,"mc-protocol-out:updateReadItems",1);
                let _update = 0;
                try {
                    if (typeof(mdConnection) !== "undefined"){
                        debugLog(node,"mc-protocol-out: _devicevariables:"+_devicevariables + " devicevariablesOld:"+devicevariablesOld,1);
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

            /**
             * call back valuesReady
             * @param numbar _anythingBad
             * @param {object} _values
             * @private
             */                
            function valuesReady(_anythingBad, _values) {
                debugLog(node,"mc-protocol-out:valuesReady",1);
                try {
                    if (_anythingBad) {
                        node.error("SOMETHING WENT WRONG READING VALUES!!!!");
                    } else {
                        msg.payload = _values;
                        node.send(msg);
                    }
                } catch(e) {
                    node.error(e);                
                }
            }
        });        
 
        /**
         * node on close
         * @param numbar _removed
         * @param function _done
         * @private
         */                
        node.on('close', function(_removed, _done) {
            debugLog(node,"mc-protocol-out:close removed:"+_removed,1);
            try {
                if (_removed) {
                    // This node has been deleted
                    disconnect();
                } else {
                    // This node is being restarted
                    disconnect();
                }
                if (typeof(mdConnection) !== "undefined") {
                    mdConnection = {};
                }
                _done();
            } catch(e) {
                node.error(e);                
            }
        });

        // interval updateConnectionStats
        setInterval(updateConnectionStats, tmrUpdateConectionStatus);
    }
    RED.nodes.registerType("mc-protocol-out",McProtocolOutNode);

    /**
     * Configuration Out Node
     * @param {object} n
     * @private
     */
    function McProtocolInNode(n) {
        debugLog(this, "mc-protocol-in:McProtocolOutNode");
        RED.nodes.createNode(this,n);
        this.plcaddress = n.plcaddress;
        this.plcport = n.plcport;
        this.devicestring = n.devicestring;

        var node = this;
        var mdConnection = new mdMcProtocol;
        var isoConnectionState = -1;
        var devicevariablesOld = "";

        /**
         * updateConnectionStats
         * @param void
         * @private
         */
        var updateConnectionStats = function () {
            debugLog(node,"mc-protocol-in:updateConnectionStats",0);
            try {
                // status
                if(isoConnectionState!==mdConnection.isoConnectionState){
                    debugLog(node,"update status:"+isoConnectionState+" -> "+mdConnection.isoConnectionState,1);
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

        /**
         * plc connect
         * @param void
         * @private
         */   
        function connect() {
            debugLog(node,"mc-protocol-in:connect",1);
            try {
                if (typeof(mdConnection) !== "undefined") {
                    mdConnection.initiateConnection({port: node.plcport, host: node.plcaddress, ascii: false}, connected); 
                }
            } catch(e) {
                node.error(e);                
            }

            /**
             * call back connected
             * @param void
             * @param {object} _err
             * @private
             */   
            function connected(_err) {
                debugLog(node,"mc-protocol-in:connected",1);
                try {
                    if (typeof(_err) !== "undefined") {
                        // We have an error.  Maybe the PLC is not reachable.  
                        debugLog(node, _err,4);
                    } else {
                        debugLog(node, 'connected..',2);
                    }
                } catch(e) {
                    node.error(e);                
                }
                return;
            }    
        }            

        /**
         * plc disconnect
         * @param void
         * @private
         */   
        function disconnect() {
            debugLog(node,"mc-protocol-in:disconnect",1);
            try {
                if (typeof(mdConnection) !== "undefined") {
                    mdConnection.dropConnection();
                }
            } catch(e) {
                node.error(e);                
            }
        }

        /**
         * node on input
         * @param {object} msg
         * @private
         */       
        node.on('input', function(msg) {
            debugLog(node,"mc-protocol-in:input",1);
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
                        debugLog(node,"updateWriteItems:update payload:"+msg.payload,1);
                        let _devicevariablesObject = JSON.parse(msg.payload);
                        // This sets the "translation" to allow us to work with object names defined in our app not in the module
                        mdConnection.setTranslationCB(function(tag) {debugLog(node,tag,1); return tag;}); 
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
                        msg.payload = _devicevariablesObject;
                        node.send(msg);
                    }
                }
            } catch(e) {
                node.error(e);                
            }

            /**
             * updateWriteItems
             * @param {object} _devicevariables
             * @private
             */  
            function updateWriteItems(_devicevariables){
                debugLog(node,"mc-protocol-in:updateWriteItems",1);
                let _update = 0;
                try {
                    if (typeof(mdConnection) !== "undefined"){
                        debugLog(node,"mc-protocol-in: _devicevariables:"+_devicevariables + " devicevariablesOld:"+devicevariablesOld,1);
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


            /**
             * call back valuesWritten
             * @param numbar _anythingBad
             * @private
             */       
            function valuesWritten(_anythingBad) {
                try {
                    if (_anythingBad) {
                        node.error("SOMETHING WENT WRONG WRITING VALUES!!!!");
                    } else {
                        msg.payload = "Done writing.";
                        node.send(msg);
                    }
                } catch(e) {
                    node.error(e);                
                }
            }
        });        
 
        /**
         * node on close
         * @param numbar _removed
         * @param function _done
         * @private
         */           
        node.on('close', function(_removed, _done) {
            debugLog(node,"mc-protocol-in:close removed:"+_removed,1);
            try {
                if (_removed) {
                    // This node has been deleted
                    disconnect();
                } else {
                    // This node is being restarted
                    disconnect();
                }
                if (typeof(mdConnection) !== "undefined") {
                    mdConnection = {};
                }
                _done();
            } catch(e) {
                node.error(e);                
            }
        });

        // interval updateConnectionStats
        setInterval(updateConnectionStats, tmrUpdateConectionStatus);
    }
    RED.nodes.registerType("mc-protocol-in",McProtocolInNode);
}