var colors = require("colors");
var cl = require("./chatinfo.js");
var recombined = "";
var i = 0;
var qu = "";
var info = "";

var randomQuote = function(message, rw, c) {
  c.query("SELECT quote FROM " + rw + " WHERE server_id=" + message.guild.id + " ORDER BY RAND() LIMIT 1", function(error, quotes) {
    if (error) {
      console.log(error);
      return;
    }
    else {
      if (typeof quotes[0].quote !== "string") {
        message.channel.sendMessage("None found.");
      }
      else {
        message.channel.sendMessage(quotes[0].quote);
      }
    }
  });
};

var addQuote = function(message, results, rw, prefix, c) {
  recombined = "";
  info = "";
  if (results.length >= 3) {
    //console.log(results.length);
    i = 0;
    for (i; i < results.length-2; i++) {
      if (i !== results.length-3) {
        recombined += results[i+2] + " ";
      }
      else {
        recombined += results[i+2];
      }
    }
    console.log(colors.red("Trying to insert " + rw + " message '" + recombined + "' into database."));
    info = {
      "quote": recombined,
      "server_id": message.guild.id
    };
    c.query("INSERT INTO " + rw + " SET ?", info, function(error) {
      if (error) {
        message.channel.sendMessage("Failed");
        console.log(error);
        return;
      }
      else {
        console.log(colors.red("Successfully inserted " + rw + " message."));
        message.channel.sendMessage("Success");
      }
    });
  }
  else {
    qu = rw === "win" ? "Totally Awesome!" : rw === "rip" ? "Complete Failure!" : "Some Quote";
    message.channel.sendMessage("Syntax: __**`" + prefix + rw + " add <quote>`**__\rAdd a new " + rw + " quote.\r\r`quote`\rThe quote to add.\r\r**Example**\r`" + prefix + rw + " add " + qu + "`\rThis would add the " + rw + " quote `" + qu + "` to the list of possible quotes.");
  }
};

var delQuote = function(message, results, rw, prefix, c) {
  if (results.length >= 3) {
    recombined = "";
    //console.log(results.length);
    i = 0;
    for (i; i < results.length-2; i++) {
      if (i !== results.length-3) {
        recombined += results[i+2] + " ";
      }
      else {
        recombined += results[i+2];
      }
    }
    console.log(colors.red("Attempting to remove " + rw + " message '" + recombined + "' from the database."));
    c.query("DELETE FROM " + rw + " WHERE quote = '" + recombined + "' AND server_id=" + message.guild.id, function(error) {
      if (error) {
        console.log(error);
        return;
      }
      console.log(colors.red("Successfully removed " + rw + " message."));
      message.channel.sendMessage("Success");
    });
  }
  else {
    qu = rw === "win" ? "Totally Awesome!" : rw === "rip" ? "Total Failure!" : "Some Quote";
    message.channel.sendMessage("Syntax: __**`" + prefix + rw + " del <quote>`**__\rRemove a " + rw + " quote.\r\r`quote`\rThe quote to remove. It must be an exact match. Use `" + prefix + rw + " list` to directly copy from the list.\r\r**Example**\r`" + prefix + rw + " del " + qu + "`\rThis would remove the " + rw + " quote `" + qu + "` from the list of possible quotes.");
  }
};

var helpText = function(message, prefix, rw, modrolename) {
  if (message.member.roles.exists("name", modrolename)) {
    qu = rw === "win" ? "Totally Awesome!" : rw === "rip" ? "Total Failure!" : "Some Quote";
    message.channel.sendMessage("Syntax: __**`" + prefix + rw + " <add|del|list> <quote>`**__\rAdd or remove a " + rw + " quote.\r\r`add|del|list`\rWhether to add or remove a quote, or to get a list of all the current quotes.\r\r`quote`\rOnly required for add or del. The quote to add or remove. For removal it must be an exact match - Use `" + prefix + rw + " list` to directly copy from the list for removal.\r\r**Example**\r`" + prefix + rw + " add " + qu + "`\rThis would add the " + rw + " quote `" + qu + "` to the list of possible quotes.");
  }
  else {
    qu = rw === "win" ? "Totally Awesome!" : rw === "rip" ? "Total Failure!" : "Some Quote";
    message.channel.sendMessage("Syntax: __**`" + prefix + rw + " (key|list)`**__\rObtain a " + rw + " quote at random, or with keyword search, or a full list of all quotes.\r\r`key|list` (Optional)\rUse the command without anything else to get a random " + rw + " quote returned. Use anything except `help` or `list` to do a search for a specific keyword. Use `list` to obtain a full list of all the current " + rw + " quotes in a PM. \r\r**Example**\r`" + prefix + rw + " tot`\rThis would do a search for " + rw + " quotes that contain `tot` anywhere within them, and, for example, would return `" + qu + "`.");
  }
};

var listQuotes = function(message, c, rw) {
  console.log(colors.red("Attempting to get full " + rw + " list."));
  c.query("SELECT quote FROM " + rw + " WHERE server_id=" + message.guild.id + " order by quote asc", function(error, quotes) {
    if (error) {
      message.channel.sendMessage("Failed to find any, with errors.");
      console.log(error);
      return;
    }
    else {
      if (typeof quotes[0] !== "object") {
        console.log(colors.red("Failed."));
        message.author.sendMessage("Failed to find any " + rw + " quotes for your server.");
      }
      else {
        console.log(colors.red("Success."));
        var quotespm = "\n**Here are all the current " + rw + " quotes:**\n--------------------\n```";
        i = 0;
        for (i; i < quotes.length; i++) {
          quotespm += quotes[i].quote + "\r";
        }
        quotespm += "```";
        message.author.sendMessage(quotespm);
      }
    }
  });
};

var searchQuotes = function(message, results, rw, c) {
  console.log(colors.red("Trying to find " + rw + " message matching '" + results[1] + "' in database."));
  results[1] = cl.escapeChars(results[1]);
  c.query("SELECT * FROM " + rw + " WHERE server_id=" + message.guild.id + " AND quote LIKE '%" + results[1] + "%' COLLATE utf8_unicode_ci ORDER BY RAND() LIMIT 1", function(error, quotes) {
    if (error) {
      message.channel.sendMessage("Failed to find any matching quotes, with errors.");
      console.log(error);
      return;
    }
    else {
      if (typeof quotes[0] !== "object") {
        console.log(colors.red("Failed to find any matching."));
        message.channel.sendMessage("Unable to find any " + rw + " quotes matching '" + results[1] + "'.");
      }
      else {
        console.log(colors.red("Successfully found a quote."));
        message.channel.sendMessage(quotes[0].quote);
      }
    }
  });
};

var ripWin = function(message, prefix, modrolename, connection, ripwin) {
  var str = message.content.toString();
  var results = str.split(" ");
  if (typeof results[1] !== "string") { //if second word doesn't exist, type undefined
    randomQuote(message, ripwin, connection);
  }
  else if (results[1] === "add" && message.member.roles.exists("name", modrolename)) {
    addQuote(message, results, ripwin, prefix, connection);
  }
  else if (results[1] === "add") { //non-moderator
    message.member.reply(message, "You do not have permission to add new " + ripwin + " quotes.");
  }
  else if (results[1] === "del" && message.member.roles.exists("name", modrolename)) {
    delQuote(message, results, ripwin, prefix, connection);
  }
  else if (results[1] === "del") { //non-moderator
    message.member.reply(message, "You do not have permission to remove " + ripwin + " quotes.");
  }
  else if (results[1] === "help") {
    helpText(message, prefix, ripwin, modrolename);
  }
  else if (results[1] === "list") {
    listQuotes(message, connection, ripwin);
  }
  else {
    if (results.length === 2) {
      searchQuotes(message, results, ripwin, connection);
    }
    else if (results.length > 2) { //tried to search with >1 keyword
      message.channel.sendMessage("You can only use one keyword in the quote search. Use `" + prefix + ripwin + " help` for syntax help.");
    }
    else { //somehow this thing that happend
      message.channel.sendMessage("Something happened.");
      console.log(message.content);
    }
  }
  ripwin = null;
};
//end ripwin command
module.exports = {
  ripWin
};
