/* Module */
/* Magic Mirror
 * Module: MMM-HTTPRequestDisplay
 *
 * By Eunan Camilleri eunancamilleri@gmail.com
 * v1.0 23/06/2016
 *
 * Modified by KAG 19/02/2019
 * Module: MMM-Flo
 *
 * MIT Licensed.
 */

Module.register("MMM-Elpris",{
// Default module config.
	defaults: {
		//updateInterval: 5 * 60 * 1000, // every 5 minutes
		animationSpeed: 1000,
		refreshInterval: 5 * 60 * 1000, // every 5 minutes
		daysSpan:2,
		lat:60.260000,
		lon:5.320000,
		short:false,
		datatype:"tab", //all, obs, pre, tab
		//httpRequestURL:"http://api.sehavniva.no/tideapi.php?lat="+this.config.lat+"&lon="+this.config.lon+"&fromtime=2019-04-10T00%3A00"+
		//"&totime=2019-04-11T00%3A00&datatype="+this.config.datatype+"&refcode=cd&place=&file=&lang=en&interval=10&dst=0&tzone=1&tide_request=locationdata",
	},


	// Define required scripts.
	getScripts: function() {
		return ["moment.js", "jquery-3.6.0.min.js"];
	},

	// Define required styles.
	getStyles: function() {
		return ["MMM-Elpris.css"];
	},

	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		this.loaded = false;
		moment.locale(config.language);

		// variables that will be loaded from service
		this.nodeNames = "";
		this.nodes = [];

		//Log.log("Sending CONFIG to node_helper.js in " + this.name);
		//Log.log("Payload: " + this.config);
		this.sendSocketNotification("CONFIG", this.config);
	},

	// unload the results from uber services
	processData: function(data) {

		if (!data) {
			// Did not receive usable new data.
			// Maybe this needs a better check?
			Log.log("#No data");
			return;
		}

		this.pdata = data;
//                Log.log(this.pdata);
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			Log.log("#LOADED");
			return wrapper;
		}

		if (!this.pdata) {
			wrapper.innerHTML = "No data";
			Log.log("#NODATA");
			return wrapper;
		}
//		Log.log("UPDATEN");
		var prisValue = this.pdata.data;
//		Log.log(prisValue);

		var tableHeading = document.createElement("div");
		tableHeading.className = "divider";

		tableWrapper = document.createElement("table");
		tableWrapper.className = "Mytable small";

		var row = tableWrapper.insertRow(-1);

		if (this.config.short==false) {
			var headerCell = document.createElement("th");
			headerCell.className = "Myth";
			headerCell.innerHTML = "Elomr.";
			row.appendChild(headerCell);
		}

		var headerCell = document.createElement("th");
		headerCell.className = "Myth";
		headerCell.innerHTML = "Timme";
		row.appendChild(headerCell);

		var headerCell = document.createElement("th");
		headerCell.className = "Myth";
		headerCell.innerHTML = "öre/kWh";
		row.appendChild(headerCell);

                Number.prototype.round = function(places) {
                   return +(Math.round(this + "e+" + places)  + "e-" + places);
                }


		if(prisValue.length > 0) {

			for(var i = 0; i < prisValue.length; i++) {

				var eventWrapper = document.createElement("tr");
				eventWrapper.className = "Mytr";

				if (this.config.short==false) {
					var lineWrapper = document.createElement("td");
					lineWrapper.className = "Mytd";
					lineWrapper.innerHTML = prisValue[i].area;
				}
				var timeWrapper = document.createElement("td");
				timeWrapper.className = "Mytd";
				var dateAndTime = prisValue[i].time;
//				var date = dateAndTime.split("T")[0];
//				var day = date.split("-")[2];
//
				var klokken = dateAndTime.split(" ")[1];
				var hourZ = klokken.split(":")[0];
				var minute = klokken.split(":")[1];
//				var timeZone = klokken.split("+")[1];
//				var timeZoneHour = timeZone.split(":")[0];
//				var hourNo=String(Number(timeZoneHour)+Number(hourZ));
				if (this.config.short==false) {
					timeWrapper.innerHTML = hourZ+" - " + (parseInt(hourZ)+1);
				} else {
					timeWrapper.innerHTML = hourZ;
				}

				var highWrapper = document.createElement("td");
				highWrapper.className = "Mytd";
				//symbolWrapper.className = "Mytd";
                                highWrapper.className = "Mytd";
                                var floatPrice=prisValue[i].price/10.0;
				highWrapper.innerHTML = floatPrice.round(3);
				if (this.config.short==false) {
					eventWrapper.appendChild(lineWrapper);
				}
				eventWrapper.appendChild(timeWrapper);
				eventWrapper.appendChild(highWrapper);
				tableWrapper.appendChild(eventWrapper);
			}
		}
		else {
			var eventWrapper = document.createElement("tr");
			eventWrapper.className = "Mytr";

			var lineWrapper = document.createElement("td");
			lineWrapper.className = "Mytd";

			lineWrapper.innerHTML = "NO DATA";
                        Log.log("Nodata");
			eventWrapper.appendChild(lineWrapper);
			tableWrapper.appendChild(eventWrapper);
		}


		//tableWrapper.appendChild(eventWrapper);
		wrapper.appendChild(tableWrapper);
		return wrapper;
	},

	socketNotificationReceived: function(notification, payload) {
		var parser, xmlDoc;

		if (notification === "STARTED") {
//			this.updateDom();
			Log.log("#STARTED");
		}
		else if (notification === "DATA") {
			this.loaded = true;
			this.processData(payload);
			this.updateDom();
		}
	},

});
