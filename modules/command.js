var colors = require("colors");

var commandCount = 0;

module.exports = Command;

function Command(o) {
  this.id = commandCount;
  this.name = o.name;
  this.onCooldown = false;
  this.cooldownTimer = o.cooldown;
  commandCount++;

}

Command.prototype.isEnabledForServer = function(message, connection, prefix) {
  return new Promise((resolve) => {
    var str = message.content;
    var results = str.split(" ");
    var commandname = "";
    if (results[0].includes(prefix)) {
      commandname = results[0].replace(prefix, "");
    }
    connection.query("SELECT commandname FROM commands WHERE server_id=" + message.guild.id + " AND commandname='" + this.name + "'", function(error, enabledforserver) {
      if (error) {
        message.channel.sendMessage("Failed.");
        console.log(error);
        return;
      }
      else {
        if (enabledforserver[0] === null) {
          console.log(colors.red("Command not enabled for this server."));
          resolve(false);
        }
        else {
          console.log(colors.red("Command enabled for this server."));
          resolve(true);
        }
      }
    });
  });
};

Command.prototype.timeout = function() {
  this.onCooldown = true;
  var that = this;
  setTimeout(function() {
    that.onCooldown = false;
  }, this.cooldownTimer);
}
