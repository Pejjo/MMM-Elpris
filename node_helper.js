/* Magic Mirror
 * Node Helper: MMM-Flo
 *
 * By
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
var request = require("request");

module.exports = NodeHelper.create({

	start: function() {
		var self = this;
		console.log("Starting node helper for: " + this.name);
		this.started = false;
		//this.config = null;
	},

	getData: function() {
		var self = this;

		var dateNowAndTime = new Date();
		var dateNow = dateNowAndTime.toISOString().split("T")[0];
		var yearNow = dateNow.split("-")[0];
		var monthNow = dateNow.split("-")[1];
		var dayNow = dateNow.split("-")[2];

		// add a day
		dateNowAndTime.setDate(dateNowAndTime.getDate() + Number(this.config.daysSpan));

		var dateFuture = dateNowAndTime.toISOString().split("T")[0];
		var yearFuture = dateFuture.split("-")[0];
		var monthFuture = dateFuture.split("-")[1];
		var dayFuture = dateFuture.split("-")[2];

		console.log("NEW DATE LOADED:"+dateNow);
		var myUrl = "http://api.sehavniva.no/tideapi.php?lat="+this.config.lat+"&lon="+this.config.lon+"&fromtime="+yearNow+"-"+monthNow+"-"+dayNow+"T00%3A00"+
		"&totime="+yearFuture+"-"+monthFuture+"-"+dayFuture+"T00%3A00"+"&datatype="+this.config.datatype+"&refcode=cd&place=&file=&lang=en&interval=10&dst=0&tzone=1&tide_request=locationdata";

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
				self.sendSocketNotification("DATA", body);
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
