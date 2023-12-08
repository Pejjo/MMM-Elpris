/* Magic Mirror
 * Node Helper: MMM-Flo
 *
 * By
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
var request = require("request");
var RIPEMD160 = require('ripemd160');

module.exports = NodeHelper.create({

	start: function() {
		var self = this;
		console.log("Starting node helper for: " + this.name);
		this.started = false;
		//this.config = null;
	},

	getData: function() {
                var self = this;

                action="now";
                currency=this.config.currency;
                area=this.config.area;
                seed=Date.now();
                key=new RIPEMD160().update(seed + action + area).digest('hex')

                //console.log("NEW DATE LOADED:"+dateNow);
                var myUrl = this.config.url +"?action=" + action + "&currency=" + currency + "&area=" + area + "&seed=" + seed + "&key=" + key;
//                console.log(myUrl);

                //return new Promise(function (resolve, reject) {
                request({
                        url: myUrl,
                        method: "GET",
                        headers: {
                                "User-Agent": "MagicMirror/1.0 ",
                                "Accept-Language": "en_US",
                        "Content-Type": "application/json",
                    },
                }, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                                self.sendSocketNotification("DATA", JSON.parse(body));
//                                console.log(JSON.parse(body));
                        }
                });
                setTimeout(function() { self.getData(); }, this.config.refreshInterval);
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === "CONFIG" && self.started == false) {
			self.config = payload;
			self.sendSocketNotification("STARTED", true);
			self.getData();
			self.started = true;
		}
	}
});
