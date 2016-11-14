var ampm = "AM";
var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

var messageDate = function messageDate(message) {
	var d = message.createdAt;

	//console.log(d);

	var hournow = d.getHours();
	ampm = "AM";
	if (hournow === 0) {
		hournow = 12;
		ampm = "AM";
	} else if (hournow >= 13) {
		hournow -= 12;
		ampm = "PM";
	}
	if (hournow < 10 && hournow > 0) {
		hournow = "0" + hournow;
	}
	var minutenow = d.getMinutes();
	if (minutenow < 10) {
		minutenow = "0" + minutenow;
	}
	var secondnow = d.getSeconds();
	if (secondnow < 10) {
		secondnow = "0" + secondnow;
	}
	var day = d.getDate();
	var monthIndex = d.getMonth();
	var year = d.getFullYear();
	var thedate = monthNames[monthIndex] + " " + day + ", " + year + " " + hournow + ":" + minutenow + ":" + secondnow + " " + ampm;
	return {
		"formattedDate": thedate,
		year,
		"month": monthNames[monthIndex],
		"hour": hournow,
		"minute": minutenow,
		ampm
	};
};

module.exports = {
	messageDate
};
