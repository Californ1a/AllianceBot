//TODO -- Not working yet

var setRole = function(message, modrolename, membrolename, prefix, bot, toprole) {
  if (message.guild.owner.equals(message.author) || toprole.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
    var str = message.content.toString();
    var results = str.split(" ");
    //console.log(str);
    //strip # if present
    if (results[2].includes("#")) {
      results[2] = results[2].replace("#", "");
    }
    //console.log(str);
    //results = str.split(" ");
    if (results[1] === "help") {
      message.channel.sendMessage("Usage: `" + prefix + "setrole <username> <discriminator> <role>`\nAll fields are required. Both the username and the role are case-sensitive. The discriminator is the number given next to the user's name (Ex. The Alliance`#5209`). The # symbol can be used, but is not required.");
    }
    else if (results.length === 4) {
      //begin parsing username/discriminator
      var somenamevalid = null;
      var failedmessage = "notnull";
      for (var i = 0; i < message.guild.members.size; i++) {
        if (message.guild.members.array()[i].name === results[1]) {
          if (message.guild.members.array()[i].discriminator === results[2]) {
            somenamevalid = message.guild.members.array()[i];
          }
        }
      }
      if (typeof somenamevalid !== "object") {
        failedmessage = null;
        //message.channel.sendMessage("No user with that name/discriminator combo found. Use `" + prefix + "setrole help` for syntax help.")
      }
      //console.log(somenamevalid);
      //end username/discriminator
      //begin parsing role
      var somerolevalid = null;
      for (var i = 0; i < message.guild.roles.size; i++) {
        if (message.guild.roles.array()[i].name === results[3]) {
          somerolevalid = message.guild.roles.array()[i];
        }
      }
      //console.log(somerolevalid);
      //end role parse

      //begin not-found check
      if (typeof somerolevalid !== "object") {
        if (typeof somenamevalid !== "object") {
          message.channel.sendMessage("No role with that name found and no user with that name/discriminator combo found. Use `" + prefix + "setrole help` for syntax help.");
        }
        else {
          message.channel.sendMessage("No role with that name found. Use `" + prefix + "setrole help` for syntax help.");
        }
      }
      else if (typeof somenamevalid !== "object") {
        message.channel.sendMessage("No user with that name/discriminator combo found. Use `" + prefix + "setrole help` for syntax help.");
      }
      //end not-found check





      //assign role begin
      if (typeof somenamevalid === "object" && typeof somerolevalid === "object") {
        var jumpend = "";


        //get top role of user being set
        var userrole2 = message.guild.members.get(somenamevalid.id);
        var toprole2 = 0;
        if (userrole2.roles.size === 1) {
          toprole2 = -1;
        }
        else {
          toprole2 = message.guild.roles.get("position", userrole2.roles.size);
          //console.log(toprole);
        }

        //check if user being set has higher or equal role than message author, bypass if.guild owner
        if (!(message.guild.owner.equals(message.author)) && toprole.position <= toprole2.position) {
          message.channel.sendMessage("You cannot set the role of a user with more permissions than you.");
        }
        else {


          //cannot set roles equal or higher than own, bypass if.guild owner
          if (!(message.guild.owner.equals(message.author)) && somerolevalid.position >= toprole.position) {
            message.channel.sendMessage("You cannot assign a role equal to or higher than your own.");
          }
          else {
            //console.log(somerolevalid.position);
            //console.log(toprole2.position);

            //check if user has role already
            if (somenamevalid.hasRole(somerolevalid)) {
              message.channel.sendMessage(somenamevalid.name + " already has the " + somerolevalid.name + " role.");
              jumpend = true;
            }

            else {
              //check if bot is able to assign the role

              var botcanassign = false;
              var userrole3 = message.guild.detailsOfUser(bot.user);
              if (userrole3.roles.length === 0) {
                //bot is guest
                botcanassign = false;
              }
              else {
                var toprole3 = message.guild.roles.get("position", userrole3.roles.length);
                //console.log(toprole);
                if (toprole3.hasPermission("manageRoles")) {
                  botcanassign = true;
                  //console.log(toprole3.position);
                  //console.log(toprole2.position);
                  if (toprole3.position <= toprole2.position) {
                    botcanassign = false;
                  }
                  else if (toprole3.position - 1 === toprole2.position) {
                    botcanassign = false;
                  }
                  else if (toprole3.position <= somerolevalid.position) {
                    botcanassign = false;
                  }
                }
                else {
                  botcanassign = false;
                }
              }

              //console.log(botcanassign + " 7");

              if (botcanassign) {
                //assign role
                bot.addMemberToRole(somenamevalid, somerolevalid, function(error) {
                  if (error) {
                    console.log(error);
                    message.channel.sendMessage("Error.");
                    return;
                  }
                  else {
                    message.channel.sendMessage("Successfully added " + somenamevalid.mention() + " to the " + somerolevalid.name + " role.");
                  }
                });
              }
              else {
                message.channel.sendMessage("I do not have the permission to set this role.");
              }
            }
          }
        }
        jumpend = false;
      }
      //end assign role
    }
    else {
      message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "setrole help` for syntax help.");
    }
  }
  else {
    bot.reply(message, "You do not have permission to set roles.");
  }
};
//setrole end




//delete role begin
var delRole = function(message, modrolename, membrolename, prefix, bot, toprole) {
  if (message.guild.owner.equals(message.author) || toprole.hasPermission("manageRoles")) {
    var str = message.content.toString();
    var results = null;
    //console.log(str);
    //strip # if present
    if (str.includes("#")) {
      results = str.split(" ");
      if (results[2].includes("#")) {
        results[2] = results[2].replace("#", "");
      }
    }
    else {
      results = str.split(" ");
    }
    //console.log(str);
    //results = str.split(" ");
    if (message.content.includes(" help")) {
      message.channel.sendMessage("Usage: `" + prefix + "delrole <username> <discriminator> <role>`\nAll fields are required. Both the username and the role are case-sensitive. The discriminator is the number given next to the user's name (Ex. The Alliance`#5209`). The # symbol can be used, but is not required.");
    }
    else if (results.length === 4) {
      //begin parsing username/discriminator
      var somenamevalid = null;
      var failedmessage = "notnull";
      for (var i = 0; i < message.guild.members.length; i++) {
        if (message.guild.members[i].name === results[1]) {
          if (message.guild.members[i].discriminator === results[2]) {
            somenamevalid = message.guild.members[i];
          }
        }
      }
      if (typeof somenamevalid !== "object") {
        failedmessage = null;
        //message.channel.sendMessage("No user with that name/discriminator combo found. Use `" + prefix + "setrole help` for syntax help.")
      }
      //console.log(somenamevalid);
      //end username/discriminator
      //begin parsing role
      var somerolevalid = null;
      for (var i = 0; i < message.guild.roles.length; i++) {
        if (message.guild.roles[i].name === results[3]) {
          somerolevalid = message.guild.roles[i];
        }
      }
      //console.log(somerolevalid);
      //end role parse

      //begin not-found check
      if (typeof somerolevalid !== "object") {
        if (typeof somenamevalid !== "object") {
          message.channel.sendMessage("No role with that name found and no user with that name/discriminator combo found. Use `" + prefix + "delrole help` for syntax help.");
        }
        else {
          message.channel.sendMessage("No role with that name found. Use `" + prefix + "delrole help` for syntax help.");
        }
      }
      else if (typeof somenamevalid !== "object") {
        message.channel.sendMessage("No user with that name/discriminator combo found. Use `" + prefix + "delrole help` for syntax help.");
      }
      //end not-found check





      //assign role begin
      if (typeof somenamevalid === "object" && typeof somerolevalid === "object") {
        var jumpend = "";
        var toprole2 = "";


        //get top role of user being set
        var userrole2 = message.guild.detailsOfUser(somenamevalid.id);
        if (userrole2.roles.length === 0) {
          toprole2 = -1;
        }
        else {
          toprole2 = message.guild.roles.get("position", userrole2.roles.length);
          //console.log(toprole);
        }

        //check if user being set has higher or equal role than message author, bypass if.guild owner
        if (!(message.guild.owner.equals(message.author)) && toprole.position <= toprole2.position) {
          message.channel.sendMessage("You cannot remove the role of a user with more permissions than you.");
        }
        else {

          //cannot set roles equal or higher than own, bypass if.guild owner
          if (!(message.guild.owner.equals(message.author)) && somerolevalid.position >= toprole.position) {
            message.channel.sendMessage("You cannot remove a role equal to or higher than your own.");
          }
          else {
            //console.log(somerolevalid.position);
            //console.log(toprole2.position);

            //check if user has the role
            if (!somenamevalid.hasRole(somerolevalid)) {
              message.channel.sendMessage(somenamevalid.name + " does not have the " + somerolevalid.name + " role.");
              jumpend = true;
            }
            else {


              //check if bot can remove role
              var botcanremove = false;
              var userrole3 = message.guild.detailsOfUser(bot.user);
              if (userrole3.roles.length === 0) {
                //bot is guest
                botcanremove = false;
              }
              else {
                var toprole3 = message.guild.roles.get("position", userrole3.roles.length);
                //console.log(toprole);
                if (toprole3.hasPermission("manageRoles")) {
                  botcanremove = true;
                  //console.log(toprole3.position);
                  //console.log(toprole2.position);
                  if (toprole3.position <= toprole2.position) {
                    botcanremove = false;
                  }
                  // else if (toprole3.position - 1 === toprole2.position) {
                  //   botcanremove = false;
                  // }
                }
                else {
                  botcanremove = false;
                }
              }

              if (botcanremove) {
                //assign role
                bot.removeMemberFromRole(somenamevalid, somerolevalid, function(error) {
                  if (error) {
                    console.log(error);
                    message.channel.sendMessage("Error.");
                    return;
                  }
                });
                message.channel.sendMessage("Successfully removed " + somenamevalid.mention() + " from the " + somerolevalid.name + " role.");
              }
              else {
                message.channel.sendMessage("I do not have the permission to remove this role.");
              }
            }
          }
        }
        jumpend = false;
      }
      //end assign role
    }
    else {
      message.channel.sendMessage("Incorrect syntax. Use `" + prefix + "delrole help` for syntax help.");
    }
  }
  else {
    bot.reply(message, "You do not have permission to remove roles.");
  }
};
//delete role end


module.exports = {
  setRole,
  delRole
};
