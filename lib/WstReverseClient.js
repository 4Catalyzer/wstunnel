// Generated by CoffeeScript 1.8.0
(function() {
  var WebsocketClient, decoder, log, net, url, verboseLog, wst_client,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  log = require("lawg");

  net = require("net");

  url = require("url");

  WebsocketClient = require("websocket").client;

  decoder = require("./buffer-decoder");

  verboseLog = log;

  log = (function(_this) {
    return function() {};
  })(this);

  module.exports = wst_client = (function(_super) {
    __extends(wst_client, _super);

    function wst_client() {
      this.authorize = __bind(this.authorize, this);
      this.handleIncomingRequest = __bind(this.handleIncomingRequest, this);
      return wst_client.__super__.constructor.apply(this, arguments);
    }

    wst_client.prototype.verbose = function() {
      this.on("tunnel", (function(_this) {
        return function(ws) {
          return log("Websocket tunnel established");
        };
      })(this));
      this.on("connectFailed", (function(_this) {
        return function(error) {
          return log("WS connect error", error);
        };
      })(this));
      return log = verboseLog;
    };

    wst_client.prototype.start = function(tunnelPort, wsHostUrl, targetAddress, optionalHeaders, cb) {
      var wsClient, _ref;
      _ref = targetAddress.split(":"), this.targetHost = _ref[0], this.targetPort = _ref[1];
      if (typeof optionalHeaders === "function") {
        cb = optionalHeaders;
        optionalHeaders = {};
      }
      this.authorize(wsHostUrl, optionalHeaders);
      log("Connecting to WS server at " + wsHostUrl);
      wsClient = new WebsocketClient();
      wsHostUrl = "" + wsHostUrl + "/?port=" + tunnelPort;
      log(wsHostUrl);
      wsClient.connect(wsHostUrl, "tunnel-protocol", void 0, optionalHeaders);
      wsClient.on("connectFailed", (function(_this) {
        return function(error) {
          return _this.emit("connectFailed", error);
        };
      })(this));
      wsClient.on("connect", (function(_this) {
        return function(wsConn) {
          _this.emit("tunnel", wsConn);
          return wsConn.on("message", function(msg) {
            return _this.handleIncomingRequest(wsConn, msg);
          });
        };
      })(this));
      return wsClient.on("close", (function(_this) {
        return function() {
          return log("WS closed");
        };
      })(this));
    };

    wst_client.prototype.handleIncomingRequest = function(wsConnection, message) {
      var chunk, identifier, tcpConn, _ref;
      log("WS message received");
      log(this.targetHost, this.targetPort);
      tcpConn = net.connect({
        host: this.targetHost,
        port: this.targetPort
      });
      _ref = decoder.decode(message.binaryData), chunk = _ref.chunk, identifier = _ref.identifier;
      return tcpConn.on("connect", (function(_this) {
        return function() {
          log("TCP connection established");
          tcpConn.on("drain", function(chunk) {
            return log("TCP connection drain");
          });
          tcpConn.on("end", function(chunk) {
            return log("TCP connection end");
          });
          tcpConn.on("error", function(chunk) {
            return log("TCP connection error");
          });
          tcpConn.on("close", function(chunk) {
            return log("TCP connection close");
          });
          tcpConn.on("data", function(chunk) {
            log("TCP connection data");
            chunk = decoder.encode(chunk, identifier);
            return wsConnection.sendBytes(chunk);
          });
          return tcpConn.write(chunk);
        };
      })(this));
    };

    wst_client.prototype.authorize = function(urlString, headers) {
      var auth;
      auth = url.parse(urlString).auth;
      if (auth) {
        return headers.Authorization = "Basic " + (new Buffer(auth)).toString("base64");
      }
    };

    return wst_client;

  })(require("events").EventEmitter);

}).call(this);

//# sourceMappingURL=WstReverseClient.js.map