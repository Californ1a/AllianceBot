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



  var getDown = function getDown() { //second countdown, for end of event
    //currentss = 1;
    var currentTime = new Date();
    var amount2 = getNextSSDay(currentTime, 6, false).getTime() - currentTime.getTime();
    var days=0;
    var hours=0;
    var mins=0;
    var secs=0;
    var out="";
    //delete currentTime;

    if(amount2 < 0){
      //currentss = 0;
      console.log("Woops, something went wrong.");
      //when event is over
    }

    else{
      days=0;hours=0;mins=0;secs=0;out="";

      amount2 = Math.floor(amount2/1000);//kill the "milliseconds" so just secs

      days=Math.floor(amount2/86400);//days
      amount2=amount2%86400;

      hours=Math.floor(amount2/3600);//hours
      amount2=amount2%3600;

      mins=Math.floor(amount2/60);//minutes
      amount2=amount2%60;

      secs=Math.floor(amount2);//seconds

      out += "SS is currently happening! It will end in ";

      if(days !== 0){out += days +" day"+((days!==1)?"s":"")+", ";}
      if(days !== 0 || hours !== 0){out += hours +" hour"+((hours!==1)?"s":"")+", ";}
      if(days !== 0 || hours !== 0 || mins !== 0){out += mins +" minute"+((mins!==1)?"s":"")+", ";}
      out += secs +" seconds.";
      return out;
    }
  };


  //get and format duration from now until "futuredate"
  var getCount = function getCount() {

    var dateNow = new Date(); //grab current date
    var localTime = dateNow.getTime();
    var localOffset = dateNow.getTimezoneOffset() * 60000; //convert time offset to milliseconds
    var utc = localTime+localOffset;
    var amount = getNextSSDay(dateNow, 6, true).getTime() - dateNow.getTime(); //calc milliseconds between dates
    var days=0;
    var hours=0;
    var mins=0;
    var secs=0;
    var out="";
    //delete dateNow;

    // time is already past
    if(amount < 0){
      //after event starts
      //currentss = 1;
      return getDown(); //start second countdown
    }
    // date is still good
    else{
      //currentss = 0;
      days=0;hours=0;mins=0;secs=0;out="";

      amount = Math.floor(amount/1000);//kill the "milliseconds" so just secs

      days=Math.floor(amount/86400);//days
      amount=amount%86400;

      hours=Math.floor(amount/3600);//hours
      amount=amount%3600;

      mins=Math.floor(amount/60);//minutes
      amount=amount%60;

      secs=Math.floor(amount);//seconds

      out += "The next SS will begin in ";

      if(days !== 0){out += days +" day"+((days!==1)?"s":"")+", ";}
      if(days !== 0 || hours !== 0){out += hours +" hour"+((hours!==1)?"s":"")+", ";}
      if(days !== 0 || hours !== 0 || mins !== 0){out += mins +" minute"+((mins!==1)?"s":"")+", ";}
      out += secs +" seconds.";
      return out;
      //message.channel.sendMessage("SS will begin in " + out + ".");

    }
  };



  //get and format duration from now until "futuredate"
  var getCountEvent = function getCountEvent(dateFuture, eventName) {
    var momentDate = moment(dateFuture);
    dateFuture = momentDate.toDate();
    var dateNow = new Date(); //grab current date
    var localTime = dateNow.getTime();
    var localOffset = dateNow.getTimezoneOffset() * 60000; //convert time offset to milliseconds
    var utc = localTime+localOffset;
    var amount = dateFuture.getTime() - dateNow.getTime(); //calc milliseconds between dates
    var days=0;
    var hours=0;
    var mins=0;
    var secs=0;
    var out="";
    //delete dateNow;

    // time is already past
    if(amount < 0){
      //after event starts
      out = eventName + " is currently happening or has passed.";
      return out;
    }
    // date is still good
    else{
      //currentss = 0;
      days=0;hours=0;mins=0;secs=0;out="";

      amount = Math.floor(amount/1000);//kill the "milliseconds" so just secs

      days=Math.floor(amount/86400);//days
      amount=amount%86400;

      hours=Math.floor(amount/3600);//hours
      amount=amount%3600;

      mins=Math.floor(amount/60);//minutes
      amount=amount%60;

      secs=Math.floor(amount);//seconds

      out += eventName + " will begin in ";

      if(days !== 0){out += days +" day"+((days!==1)?"s":"")+", ";}
      if(days !== 0 || hours !== 0){out += hours +" hour"+((hours!==1)?"s":"")+", ";}
      if(days !== 0 || hours !== 0 || mins !== 0){out += mins +" minute"+((mins!==1)?"s":"")+", ";}
      out += secs +" seconds.";
      return out;

    }
  };

module.exports = {
  getCountEvent,
  getCount
};
