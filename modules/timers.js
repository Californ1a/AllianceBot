var moment = require("moment"); //requirements

  var getNextSSDay = function getNextSSDay(date, dayOfWeek, currentlyHappening) {

    var resultDate = new Date(date.getTime());

    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
    if (date.getDay() === 6 && date.getHours() >= 16) {
      resultDate.setDate(date.getDate()+7);
    }

    if (currentlyHappening) {
      resultDate.setHours(16);
    }
    else {
      resultDate.setHours(14);
    }
    resultDate.setMinutes(0);
    resultDate.setSeconds(0);
    resultDate.setMilliseconds(0);

    return resultDate;
  };


  //get and format duration from now until "futuredate"
  var getCount = function getCount(currentlyHappening, startMessage, forSS) {
    var momentDate;
    var dateFuture;
    var amount;
    var dateNow = new Date(); //grab current date
    var localTime = dateNow.getTime();
    var localOffset = dateNow.getTimezoneOffset() * 60000; //convert time offset to milliseconds
    var utc = localTime+localOffset;
    var days=0;
    var hours=0;
    var mins=0;
    var secs=0;
    var out="";
    if (forSS.bool) {
      utc = localTime+localOffset;
      amount = getNextSSDay(dateNow, 6, currentlyHappening).getTime() - dateNow.getTime(); //calc milliseconds between dates
    }
    else {
      momentDate = moment(forSS.eventDate);
      dateFuture = momentDate.toDate();
      amount = dateFuture.getTime() - dateNow.getTime(); //calc milliseconds between dates
    }
    //delete dateNow;

    // time is already past
    if(amount < 0){
      //after event starts
      //currentss = 1;
      if (forSS.bool) {
        return getCount(false, "SS is currently happening! It will end in "); //start second countdown
      }
      else {
        out = forSS.eventName + " is currently happening or has passed.";
        return out;
      }
    }
    // date is still good
    else{
      //currentss = 0;
      days=0;hours=0;mins=0;secs=0;out="";

      amount = Math.floor(amount/1000);//kill the "milliseconds" so just secs

      days=Math.floor(amount/86400);//days
      amount %= 86400;

      hours=Math.floor(amount/3600);//hours
      amount %= 3600;

      mins=Math.floor(amount/60);//minutes
      amount %= 60;

      secs=Math.floor(amount);//seconds

      out += startMessage;

      if(days !== 0){out += days +" day"+((days!==1)?"s":"")+", ";}
      if(days !== 0 || hours !== 0){out += hours +" hour"+((hours!==1)?"s":"")+", ";}
      if(days !== 0 || hours !== 0 || mins !== 0){out += mins +" minute"+((mins!==1)?"s":"")+", ";}
      out += secs +" seconds.";
      return out;
      //message.channel.sendMessage("SS will begin in " + out + ".");

    }
  };

module.exports = {
  getCount
};
