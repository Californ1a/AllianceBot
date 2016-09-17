var RipWin = function () {
  var self = this;
  self.ripWin = function ripWin(message, prefix, modrolename, colors, connection, bot, ripwin) {
    //ripwin add






    //new
    var str = message.content.toString();
    results = str.split(' ');
    if (results[1] == null) {
      connection.query("SELECT quote FROM " + ripwin + " WHERE server_id=" + message.server.id + " ORDER BY RAND() LIMIT 1", function(error, quotes) {
        if (error) {
          console.log(error);
          return;
        }
        else {
          if (quotes[0].quote == null || quotes[0].quote == "") {
            bot.sendMessage(message, "None found.")
          }
          else {
            bot.sendMessage(message, quotes[0].quote);
          }
        }
      });
    }
    else if (results[1] == "add" && bot.memberHasRole(message.author, message.server.roles.get("name", modrolename))) {
      if (results.length >= 3) {
        var recombined = "";
        //console.log(results.length);
        for (i = 0; i < results.length-2; i++) {
          if (i != results.length-3) {
            recombined += results[i+2] + " ";
          }
          else {
            recombined += results[i+2];
          }
        }
        console.log(colors.red("Trying to insert " + ripwin + " message '" + recombined + "' into database."));
        var info = {
          "quote": recombined,
          "server_id": message.server.id
        }
        connection.query("INSERT INTO " + ripwin + " SET ?", info, function(error) {
          if (error) {
            bot.sendMessage("Failed");
            console.log(error);
            return;
          }
          else {
            console.log(colors.red("Successfully inserted " + ripwin + " message."));
            bot.sendMessage(message, "Success");
          }
        });
      }
      else {
        bot.sendMessage(message, modrolename + "s has the ability to add new " + ripwin + " quotes with the use of `" + prefix + ripwin + " add <quote>`");
      }
    }
    else if (results[1] == "add") {
      bot.reply(message, "You do not have permission to add new " + ripwin + " quotes.");
    }
    else if (results[1] == "del" && bot.memberHasRole(message.author, message.server.roles.get("name", modrolename))) {
      if (results.length >= 3) {
        var recombined = "";
        //console.log(results.length);
        for (i = 0; i < results.length-2; i++) {
          if (i != results.length-3) {
            recombined += results[i+2] + " ";
          }
          else {
            recombined += results[i+2];
          }
        }
        var info = {
          "quote": recombined
        }
        console.log(colors.red("Attempting to remove " + ripwin + " message '" + recombined + "' from the database."));
        connection.query("DELETE FROM " + ripwin + " WHERE quote = '" + recombined + "' AND server_id=" + message.server.id, function(error) {
          if (error) {
            console.log(error);
            return;
          }
          console.log(colors.red("Successfully removed " + ripwin + " message."));
          bot.sendMessage(message, "Success");
        });
      }
      else {
        bot.sendMessage(message, modrolename + "s have the ability to remove " + ripwin + " quotes with the use of `" + prefix + ripwin + " del <quote>`. The quote must be an exact match, to prevent erroneously removing the incorrect quote. Use `" + prefix + ripwin + " list` to directly copy from the list.");
      }
    }
    else if (results[1] == "del") {
      bot.reply(message, "You do not have permission to remove " + ripwin + " quotes.");
    }
    else if (results[1] == "help") {
      if (bot.memberHasRole(message.author, message.server.roles.get("name", modrolename))) {
        bot.sendMessage(message, modrolename + "s have the ability to use `" + prefix + ripwin + " <add|del> <quote>`\nMembers can use `" + prefix + ripwin + "` to get a random " + ripwin + " quote and `" + prefix + ripwin + " <keyword>` to search for a matching quote (Ex. `" + prefix + ripwin + " too`) as well as `" + prefix + ripwin + " list` to be PM'd a full list of the current " + ripwin + " quotes.");
      }
      else {
        bot.reply(message, "Use `" + prefix + ripwin + "` to get a random " + ripwin + " quote and `" + prefix + ripwin + " <keyword>` to search for a matching quote (Ex. `" + prefix + ripwin + " too`) as well as `" + prefix + ripwin + " list` to be PM'd a full list of the current " + ripwin + " quotes.");
      }
    }
    else if (results[1] == "list") {
      console.log(colors.red("Attempting to get full " + ripwin + " list."));
      // var info = {
      // 	"quote": results
      // }
      var rw = ripwin;
      connection.query("SELECT quote FROM " + ripwin + " WHERE server_id=" + message.server.id + " order by quote asc", function(error, quotes) {
        if (error) {
          bot.sendMessage("Failed to find any, with errors.");
          console.log(error);
          return;
        }
        else {
          if (quotes[0] == null) {
            console.log(colors.red("Failed."));
            bot.sendMessage(message.author.id, "Failed to find any " + ripwin + " quotes for your server.");
          }
          else {
            console.log(colors.red("Success."));
            var quotespm = "\n**Here are all the current " + rw + " quotes:**\n--------------------\n```";
            for (i = 0; i < quotes.length; i++) {
              quotespm += quotes[i].quote + "\r";
            }
            quotespm += "```";
            bot.sendMessage(message.author.id, quotespm);
          }
        }
      });
    }
    else {
      if (results.length == 2) {
        console.log(colors.red("Trying to find " + ripwin + " message matching '" + results[1] + "' in database."));
        // var info = {
        //   "quote": results[1]
        // }
        var rw = ripwin;
        //console.log(results[1]);
        escapechars = true;
        while (escapechars) {
          if (results[1].includes("\'") && !results[1].includes("\\\'")) {
            //console.log("yes");
            results[1] = results[1].replace("\'", "\\\'", 'g');
          }
          else if (results[1].includes("\"") && !results[1].includes("\\\"")) {
            results[1] = results[1].replace("\"", "\\\"", 'g');
          }
          else if (results[1].includes("\\") && !results[1].includes("\\\\")) {
            results[1] = results[1].replace("\\", "\\\\", 'g');
          }
          else if (results[1].includes("\%") && !results[1].includes("\\\%")) {
            results[1] = results[1].replace("\%", "\\\%", 'g');
          }
          else if (results[1].includes("\_") && !results[1].includes("\\\_")) {
            results[1] = results[1].replace("\_", "\\\_", 'g');
          }
          else {
            //console.log("false");
            escapechars = false;
          }
        }
        //console.log(results[1]);
        connection.query("SELECT * FROM " + ripwin + " WHERE server_id=" + message.server.id + " AND quote LIKE '%" + results[1] + "%' COLLATE utf8_unicode_ci ORDER BY RAND() LIMIT 1", function(error, quotes) {
          if (error) {
            bot.sendMessage(message, "Failed to find any matching quotes, with errors.");
            console.log(error);
            return;
          }
          else {
            if (quotes[0] == null) {
              console.log(colors.red("Failed to find any matching."));
              bot.sendMessage(message, "Unable to find any " + rw + " quotes matching '" + results[1] + "'.");
            }
            else {
              console.log(colors.red("Successfully found a quote."));
              bot.sendMessage(message, quotes[0].quote);
            }
          }
        });
      }
      else if (results.length > 2) {
        bot.sendMessage(message, "You can only use one keyword in the quote search. Use `" + prefix + ripwin + " help` for syntax help.");
      }
      else {
        bot.sendMessage(message, "Something happened.");
        console.log(message.content);
      }
    }

    ripwin = null;
  }
}
//end ripwin command
module.exports = RipWin;
