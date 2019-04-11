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

Module.register("MMM-Flo",{
// Default module config.
	defaults: {
		//updateInterval: 5 * 60 * 1000, // every 5 minutes
		animationSpeed: 1000,
		refreshInterval: 5 * 60 * 1000, // every 5 minutes
		daysSpan:2,
		lat:60.260283,
		lon:5.321504,
		datatype:"tab", //all, obs, pre, tab
		//httpRequestURL:"http://api.sehavniva.no/tideapi.php?lat="+this.config.lat+"&lon="+this.config.lon+"&fromtime=2019-04-10T00%3A00"+
		//"&totime=2019-04-11T00%3A00&datatype="+this.config.datatype+"&refcode=cd&place=&file=&lang=en&interval=10&dst=0&tzone=1&tide_request=locationdata",
	},


	// Define required scripts.
	getScripts: function() {
		return ["moment.js", "https://code.jquery.com/jquery-2.2.3.min.js"];
	},

	// Define required styles.
	getStyles: function() {
		return ["MMM-Flo.css"];
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

		this.data = data;
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

		if (!this.data) {
			wrapper.innerHTML = "No data";
			Log.log("#NODATA");
			return wrapper;
		}

		var waterValue = this.data.getElementsByTagName("waterlevel");
		//Log.log(waterValue);

		var dateNowAndTime = new Date();
		var dateNow = dateNowAndTime.toISOString().split("T")[0];
		var dayNow = dateNow.split("-")[2];

		var tableHeading = document.createElement("div");
		tableHeading.className = "divider";

		var floIcon = document.createElement("img");
		floIcon.className = "icon";
		floIcon.src = "modules/MMM-Flo/Kartverket.png";
		//tableHeading.innerHTML = "Tidevann";
		tableHeading.appendChild(floIcon);
		wrapper.appendChild(tableHeading);

		tableWrapper = document.createElement("table");
		tableWrapper.className = "Mytable small";

		var row = tableWrapper.insertRow(-1);

		var headerCell = document.createElement("th");
		headerCell.className = "Myth";
		headerCell.innerHTML = "Tidevann";
		row.appendChild(headerCell);

		var headerCell = document.createElement("th");
		headerCell.className = "Myth";
		headerCell.innerHTML = "Tidspunkt";
		row.appendChild(headerCell);

		var headerCell = document.createElement("th");
		headerCell.className = "Myth";
		headerCell.innerHTML = "Flo / Fjære";
		row.appendChild(headerCell);

		if(this.config.daysSpan>1) {
			var headerCell = document.createElement("th");
			headerCell.className = "Myth";
			headerCell.innerHTML = "Dato";
			row.appendChild(headerCell);
		}

		//Log.log(waterValue.length);

		if(waterValue.length > 0) {

			for(var i = 0; i < waterValue.length; i++) {

				var eventWrapper = document.createElement("tr");
				eventWrapper.className = "Mytr";

				var lineWrapper = document.createElement("td");
				lineWrapper.className = "Mytd";
				lineWrapper.innerHTML = waterValue[i].getAttribute("value");

				var timeWrapper = document.createElement("td");
				timeWrapper.className = "Mytd";
				var dateAndTime = waterValue[i].getAttribute("time");;
				var date = dateAndTime.split("T")[0];
				var day = date.split("-")[2];

				var klokken = dateAndTime.split("T")[1];
				var hourZ = klokken.split(":")[0];
				var minute = klokken.split(":")[1];
				var timeZone = klokken.split("+")[1];
				var timeZoneHour = timeZone.split(":")[0];
				var hourNo=String(Number(timeZoneHour)+Number(hourZ));
				timeWrapper.innerHTML =hourNo+":"+minute;


				var highWrapper = document.createElement("td");
				timeWrapper.className = "Mytd";
				//symbolWrapper.className = "Mytd";
				var symbol = document.createElement("span");
				var image = document.createElement("img");
				image.className = "tag";
				if(waterValue[i].getAttribute("flag")==="high") {image.src = "modules/MMM-Flo/High.png";}
				else {image.src = "modules/MMM-Flo/Low.png";}
				symbol.appendChild(image);
				symbol.className = "symbol";
				highWrapper.appendChild(symbol);

				if(this.config.daysSpan>1) {
					var dateWrapper = document.createElement("td");
					dateWrapper.className = "Mytd";
					if(day===dayNow) {dateWrapper.innerHTML ="Idag"}
					else {dateWrapper.innerHTML = day+" / "+month;}
				}

				eventWrapper.appendChild(lineWrapper);
				eventWrapper.appendChild(timeWrapper);
				eventWrapper.appendChild(highWrapper);
				if(this.config.daysSpan>1) {
					eventWrapper.appendChild(dateWrapper);
				}

				tableWrapper.appendChild(eventWrapper);
			}
		}
		else {
			var eventWrapper = document.createElement("tr");
			eventWrapper.className = "Mytr";

			var lineWrapper = document.createElement("td");
			lineWrapper.className = "Mytd";

			lineWrapper.innerHTML = "NO DATA";
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
			this.updateDom();
			Log.log("#STARTED");
		}
		else if (notification === "DATA") {
			this.loaded = true;

			parser = new DOMParser();
			xmlDoc = parser.parseFromString(payload,"text/xml");

			this.processData(xmlDoc);
			this.updateDom();
		}
	},

});
