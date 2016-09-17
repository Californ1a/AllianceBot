var ripWin = function ripWin(message, prefix, modrolename, colors, connection, bot, ripwin) {
  var str = message.content.toString();
  var results = str.split(" ");
  var qu = "";

  // <editor-fold desc='get random rip/win quote if no parameters given'>
  if (results[1] === null) {
    connection.query("SELECT quote FROM " + ripwin + " WHERE server_id=" + message.guild.id + " ORDER BY RAND() LIMIT 1", function(error, quotes) {
      if (error) {
        console.log(error);
        return;
      }
      else {
        if (quotes[0].quote === null || quotes[0].quote === "") {
          message.channel.sendMessage("None found.");
        }
        else {
          message.channel.sendMessage(quotes[0].quote);
        }
      }
    });
  }
  // </editor-fold>


  // <editor-fold desc='add quote if member is moderator'>
  else if (results[1] === "add" && message.member.roles.exists("name", modrolename)) {
    if (results.length >= 3) {
      var recombined = "";
      //console.log(results.length);
      for (var i = 0; i < results.length-2; i++) {
        if (i !== results.length-3) {
          recombined += results[i+2] + " ";
        }
        else {
          recombined += results[i+2];
        }
      }
      console.log(colors.red("Trying to insert " + ripwin + " message '" + recombined + "' into database."));
      var info = {
        "quote": recombined,
        "server_id": message.guild.id
      };
      connection.query("INSERT INTO " + ripwin + " SET ?", info, function(error) {
        if (error) {
          bot.sendMessage("Failed");
          console.log(error);
          return;
        }
        else {
          console.log(colors.red("Successfully inserted " + ripwin + " message."));
          message.channel.sendMessage("Success");
        }
      });
    }
    // <editor-fold desc='add helptext'>
    else {
      qu = ripwin === "win" ? "Totally Awesome!" : ripwin === "rip" ? "Complete Failure!" : "Some Quote";
      message.channel.sendMessage("Syntax: __**`" + prefix + ripwin + " add <quote>`**__\rAdd a new " + ripwin + " quote.\r\r`quote`\rThe quote to add.\r\r**Example**\r`" + prefix + ripwin + " add " + qu + "`\rThis would add the " + ripwin + " quote `" + qu + "` to the list of possible quotes.");
    }
    // </editor-fold>
  }
  // </editor-fold>

  //non-moderator
  else if (results[1] === "add") {
    bot.reply(message, "You do not have permission to add new " + ripwin + " quotes.");
  }

  // <editor-fold desc='del quote if member is moderator'>
  else if (results[1] === "del" && message.member.roles.exists("name", modrolename)) {
    if (results.length >= 3) {
      var recombined = "";
      //console.log(results.length);
      for (var i = 0; i < results.length-2; i++) {
        if (i !== results.length-3) {
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
      connection.query("DELETE FROM " + ripwin + " WHERE quote = '" + recombined + "' AND server_id=" + message.guild.id, function(error) {
        if (error) {
          console.log(error);
          return;
        }
        console.log(colors.red("Successfully removed " + ripwin + " message."));
        message.channel.sendMessage("Success");
      });
    }
    // <editor-fold desc='del helptext'>
    else {
      qu = ripwin === "win" ? "Totally Awesome!" : ripwin === "rip" ? "Total Failure!" : "Some Quote";
      message.channel.sendMessage("Syntax: __**`" + prefix + ripwin + " del <quote>`**__\rRemove a " + ripwin + " quote.\r\r`quote`\rThe quote to remove. It must be an exact match. Use `" + prefix + ripwin + " list` to directly copy from the list.\r\r**Example**\r`" + prefix + ripwin + " del " + qu + "`\rThis would remove the " + ripwin + " quote `" + qu + "` from the list of possible quotes.");
    }
    // </editor-fold>
  }
  // </editor-fold>

  //non-moderator
  else if (results[1] === "del") {
    bot.reply(message, "You do not have permission to remove " + ripwin + " quotes.");
  }

  // <editor-fold desc='helptext'>
  else if (results[1] === "help") {
    if (message.member.roles.exists("name", modrolename)) {
      qu = ripwin === "win" ? "Totally Awesome!" : ripwin === "rip" ? "Total Failure!" : "Some Quote";
      message.channel.sendMessage("Syntax: __**`" + prefix + ripwin + " <add|del|list> <quote>`**__\rAdd or remove a " + ripwin + " quote.\r\r`add|del|list`\rWhether to add or remove a quote, or to get a list of all the current quotes.\r\r`quote`\rOnly required for add or del. The quote to add or remove. For removal it must be an exact match - Use `" + prefix + ripwin + " list` to directly copy from the list for removal.\r\r**Example**\r`" + prefix + ripwin + " add " + qu + "`\rThis would add the " + ripwin + " quote `" + qu + "` to the list of possible quotes.");
    }
    else {
      qu = ripwin === "win" ? "Totally Awesome!" : ripwin === "rip" ? "Total Failure!" : "Some Quote";
      message.channel.sendMessage("Syntax: __**`" + prefix + ripwin + " (key|list)`**__\rObtain a " + ripwin + " quote at random, or with keyword search, or a full list of all quotes.\r\r`key|list` (Optional)\rUse the command without anything else to get a random " + ripwin + " quote returned. Use anything except `help` or `list` to do a search for a specific keyword. Use `list` to obtain a full list of all the current " + ripwin + " quotes in a PM. \r\r**Example**\r`" + prefix + ripwin + " tot`\rThis would do a search for " + ripwin + " quotes that contain `tot` anywhere within them, and, for example, would return `" + qu + "`.");
    }
  }
  // </editor-fold>


  // <editor-fold desc='get full list of quotes in pm'>
  else if (results[1] === "list") {
    console.log(colors.red("Attempting to get full " + ripwin + " list."));
    // var info = {
    // 	"quote": results
    // }
    var rw = ripwin;
    connection.query("SELECT quote FROM " + ripwin + " WHERE server_id=" + message.guild.id + " order by quote asc", function(error, quotes) {
      if (error) {
        bot.sendMessage("Failed to find any, with errors.");
        console.log(error);
        return;
      }
      else {
        if (quotes[0] === null) {
          console.log(colors.red("Failed."));
          message.author.sendMessage("Failed to find any " + ripwin + " quotes for your server.");
        }
        else {
          console.log(colors.red("Success."));
          var quotespm = "\n**Here are all the current " + rw + " quotes:**\n--------------------\n```";
          for (var i = 0; i < quotes.length; i++) {
            quotespm += quotes[i].quote + "\r";
          }
          quotespm += "```";
          message.author.sendMessage(quotespm);
        }
      }
    });
  }
  // </editor-fold>


  else {

    // <editor-fold desc='find quote matching keyword search'>
    if (results.length === 2) {
      console.log(colors.red("Trying to find " + ripwin + " message matching '" + results[1] + "' in database."));
      // var info = {
      //   "quote": results[1]
      // }
      var rw = ripwin;
      //console.log(results[1]);
      // <editor-fold desc='escape bad characters'>
      var escapechars = true;
      while (escapechars) {
        if (results[1].includes("\'") && !results[1].includes("\\\'")) {
          results[1] = results[1].replace("\'", "\\\'", "g");
        }
        else if (results[1].includes("\"") && !results[1].includes("\\\"")) {
          results[1] = results[1].replace("\"", "\\\"", "g");
        }
        else if (results[1].includes("\\") && !results[1].includes("\\\\")) {
          results[1] = results[1].replace("\\", "\\\\", "g");
        }
        else if (results[1].includes("\%") && !results[1].includes("\\\%")) {
          results[1] = results[1].replace("\%", "\\\%", "g");
        }
        else if (results[1].includes("\_") && !results[1].includes("\\\_")) {
          results[1] = results[1].replace("\_", "\\\_", "g");
        }
        else {
          //console.log("false");
          escapechars = false;
        }
      }
      // </editor-fold>

      //console.log(results[1]);
      connection.query("SELECT * FROM " + ripwin + " WHERE server_id=" + message.guild.id + " AND quote LIKE '%" + results[1] + "%' COLLATE utf8_unicode_ci ORDER BY RAND() LIMIT 1", function(error, quotes) {
        if (error) {
          message.channel.sendMessage("Failed to find any matching quotes, with errors.");
          console.log(error);
          return;
        }
        else {
          if (quotes[0] === null) {
            console.log(colors.red("Failed to find any matching."));
            message.channel.sendMessage("Unable to find any " + rw + " quotes matching '" + results[1] + "'.");
          }
          else {
            console.log(colors.red("Successfully found a quote."));
            message.channel.sendMessage(quotes[0].quote);
          }
        }
      });
    }
    // </editor-fold>

    //tried to search with >1 keyword
    else if (results.length > 2) {
      message.channel.sendMessage("You can only use one keyword in the quote search. Use `" + prefix + ripwin + " help` for syntax help.");
    }

    //somehow this thing that happend
    else {
      message.channel.sendMessage("Something happened.");
      console.log(message.content);
    }
  }

  ripwin = null;
}
//end ripwin command
module.exports = {
  ripWin
};
