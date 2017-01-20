const lib_discord = require("discord.js");
const readline = require("readline");

var interFace = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

interFace.question("Token? ", (token) => {
  interFace.close();

  var client = new lib_discord.Client();

  var heist = {
    crew: []
  };

  client.on("ready", () => {
    console.log("Heistbot ready!");
  });

  client.on("message", message => {
    if (message.author.id === "194525847565238272") { // Id of BarbBot
      var startRegex = /^A heist is being planned by (.*)\nThe heist begin in \d{1,2} seconds\. Type .heist play to join their crew\.$/;
      var joinRegex = /^(.*) has joined the crew\.\nThe crew now has \d{1,2} members\.$/;
      var lonelyRegex = /^You tried to rally a crew, but no one wanted to follow you\. The heist has been cancelled\.$/;
      var wonRegex = /^The credits stolen from the vault was split among the winners:\n```Criminals +Credits Stolen +Bonuses +Total\n-+ + -+ + -+ + -+\n(?:(.*) +\d+ +\d+ +\d+\n?)?(?:(.*) +\d+ +\d+ +\d+\n?)?(?:(.*) +\d+ +\d+ +\d+\n?)?(?:(.*) +\d+ +\d+ +\d+\n?)?```/;
      var lostRegex = /^No one made it out safe\. The good guys win\.$/;

      // Make sure to check user id against the bot. (Also check if on the right server) Don't want actually people triggering this.
      if (message.content.match(startRegex) !== null && message.content.match(startRegex).length > 1) {
        var nickname = message.content.match(startRegex)[1];
        for (var member of message.guild.members.values()) {
          if (member.nickname === nickname || member.user.username === nickname) {
            heist.crew = [];
            heist.crew.push(member.user);
            break;
          }
        }
      } else if (message.content.match(joinRegex) !== null && message.content.match(joinRegex).length > 1) {
        var nickname = message.content.match(joinRegex)[1];
        for (var member of message.guild.members.values()) {
          if (member.nickname === nickname || member.user.username === nickname) {
            heist.crew.push(member.user);
            break;
          }
        }
      } else if ((message.content.match(lonelyRegex) !== null && message.content.match(lonelyRegex).length >= 0) || (message.content.match(lostRegex) !== null && message.content.match(lostRegex).length >= 0)) {
        heist.crew = [];
      } else if (message.content.match(wonRegex) !== null && message.content.match(wonRegex).length > 1) {
        var winners = [];
        for (var i=0; i<message.content.match(wonRegex).length - 1; i++) {
          var nickname = message.content.match(wonRegex)[i];
          for (var member of message.guild.members.values()) {
            if (typeof nickname === "string" && (member.nickname === nickname.trim() || member.user.username === nickname.trim())) {
              winners.push(member.user);
              break;
            }
          }
        }
        console.log(winners);

        var response = "";
        for (var i=0; i<heist.crew.length; i++) {
          response += "<@" + heist.crew[i].id + ">, ";
        }
        response = response.substring(0, response.length - 2);

        var looters = "";
        for (var i=0; i<winners.length; i++) {
          looters += "<@" + winners[i].id + ">, ";
        }
        looters = looters.substring(0, looters.length - 2);

        message.channel.sendMessage("We won! :tada:\nOur crew: " + response + "\nLooters: " + looters);

        heist.crew = [];
      }

    }

    var header = message.channel.guild.name + "/" + message.channel.name + ", " + message.author.username + "#" + message.author.discriminator + ": ";
    console.log(header + message.content.replace(/\n/g, "\n" + " ".repeat(header.length)));

    // ONLY USER MESSAGES BEYOND THIS POINT

    if (message.author !== client.user) return;

    var prefix = "+";
    var seperator = " ";
    if (message.content.substring(0, prefix.length) !== prefix) return;

    var command = message.content.split(seperator).length >= 1 ? message.content.split(seperator)[0].substring(prefix.length) : "";
    var params = message.content.split(seperator).slice(prefix.length);


    if (command === "crew") {
      if (heist.crew.length === 0) {
        message.edit("There's no one in the crew :cry:");
        return;
      }
      var response = "";
      for (var i=0; i<heist.crew.length; i++) {
        console.log(heist.crew[i]);
        response += "<@" + heist.crew[i].id + ">, ";
      }
      response = response.substring(0, response.length - 2);
      message.edit(response);
    } else if (command === "reset") {
      heist.crew = [];
      message.delete();
    }
  });

  client.login(token);
});
