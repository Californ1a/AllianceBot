Alliance Bot
======
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/df49468e160144b29ad68ffb770e609f)](https://www.codacy.com/app/Californ1a/AllianceBot?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Californ1a/AllianceBot&amp;utm_campaign=Badge_Grade)

Discord chat bot created with [discord.js](https://github.com/hydrabolt/discord.js/).

---

## Commands  
Within a syntax, `(parenthesis)` denotes optional parameters (use exact word(s) shown with the parenthesis), and `<less than/greater than>` denotes replacement of the word(s).

---

#### Syntax: `addcomtoserv <command name>`
Enable a specific hardcoded command on a server. Only usable by the bot owner or the server owner.

##### Parameter
* `command name`
  * Command name to be enabled on that server, without the prefix.

##### Example:
* ServOwner: `!addcomtoserv advent`
  * Enable the `!advent` hardcoded command on the server.

---

#### Syntax: `advent (set|del) (<datetime> <event name>)`  
Creates a custom event countdown. Only one event is supported.

##### Parameters
* `set|del`
  * Optional parameter for Moderators to set a new event or delete the current event. When deleting, neither the date nor the name parameters are required because there can only ever be one event countdown at a time.
* `datetime`
  * When setting a new event, provide a date and time in ISO8601 format, using T to denote time, for the event to begin.
* `event name`
  * When setting a new event, provide a name for the event.

##### Examples
* ModUser: `!advent set 2016-02-08T13:30:20 Some Name`
  * Set an event named *Some Name* to start at February 8th, 2016 at 1:30:20 PM.
* ModUser: `!advent del`
  * Delete the current event.
* RegUser: `!advent`
  * Display the countdown for the set event, if there is one.

---

#### Syntax: `automemb`
Not an actual command. If it appears in the command list, it denotes *automatic Member role assignment* whenever a guest first says something in any text channel.

---

#### Syntax: `cmds|commands|help`
Returns the list of commands in a PM.

---

#### Syntax: `delcom <command name>`
Delete a custom command.

##### Parameter
* `command name`
  * The name of the command to be deleted, without the prefix.

##### Example
* ModUser: `!delcom spooky`
  * Deletes the custom `!spooky` command.

---

#### Syntax: `dist <map name> (<mode>)`
Return the current \#1 time on a specified map. May take a few seconds to reply, the Steam request is fairly slow.

##### Parameters
* `map name`
  * The name of the map. Only official maps are supported, no workshop. Abbreviations and full names are both supported (`ttam` = `machines` = `the thing about machines`).
* `mode`
  * The mode. This is only necessary when requesting a Sprint or Speed and Style map (because they have the same map name). Any given mode will be ignored if a Challenge-mode map name is given. Abbreviations for modes is also supported (`speed and style` = `speed` = `sas` = `s&s` | `sprint` = `s`).

##### Examples
* RegUser: `!dist bs s`
* RegUser: `!dist broken symmetry sprint`
  * Both of these will return the best time for Broken Symmetry in Sprint mode.

---

#### Syntax: `newcom <command name> <mod-only> <reply-in-pm> <message>`
Create custom commands.

##### Parameters
* `command name`
  * Name of command without prefix.
* `mod-only (true|false)`
  * Make it so only Moderators can use the custom command.
* `reply-in-pm (true|false)`
  * Reply in a PM rather than in-channel.
* `message`
  * The message to be sent when the command is given.

##### Example
* ModUser: `!newcom spook false false BOO! Scared ya!`
  * The new custom command would be `!spook` which would be enabled for all members to use, would reply in-channel, and the returned message would be `BOO! Scared ya!`.

---

#### Syntax: `remcomfromserv <command name>`
Disable a specific hardcoded command on a server. Only usable by the bot owner or the server owner.

##### Parameter
* `command name`
  * Command name to be disabled on that server, without the prefix.

##### Example:
* ServOwner: `!remcomfromserv advent`
  * Disables the `!advent` hardcoded command on the server.

---

#### Syntax: `rip|win|tf (<key>|list|add|del) (<quote>)`
Obtain or manipulate rip/win/tableflip quotes. Using no parameters returns a random quote.

##### Parameters
* `key`
  * Supply a keyword to search for a specific quote.
* `list`
  * Obtain a complete list of all the quotes in PM.
* `add`
  * Insert the `quote` into the list of quotes.
* `del`
 * Remove the `quote` from the list of quotes.
* `quote`
  * The quote test to be added to the list or removed from the list. For deletion, it must be an exact match. Use `list` and copy+paste from the full list.

##### Examples
* RegUser: `!rip nitro`
  * Return a rip message matching `nitro`.
* ModUser: `!win add Totally Awesome!`
  * Add the quote `Totally Awesome!` to the list of win quotes.
* ModUser: `!rip del Failure!`
  * Remove the quote `Failure!` from the list of rip quotes.

---

#### Syntax: `role set|del @<mention> <role name>`
Moderators can assign and remove roles from other users by \@mentioning them, if they have permission to do so.

##### Parameters
* `set|del`
  * Whether to assign or remove the role.
* `@mention`
  * The user you want to assign or remove the role to/from.
* `role name`
  * The name of the role to assign or remove, case-sensitive.

##### Examples
* ModUser: `!role set @Cali Member`
  * This will assign the role `Member` to the user `Cali`.
* ModUser: `!role del @Cali Member`
  * This will remove the role `Member` from the user `Cali`.

---

#### Syntax: `speedy`
Returns Speedy Saturday information along with links to the SS Reddit and Steam Discussion threads. Also includes the countdown until the next SS.

---

#### Syntax: `ss`
Returns a countdown until the next Speedy Saturday.

---

#### Syntax: `wr <category>`
Uses the server name as the game name and returns the time, username, and video link of the \#1 time on the speedrun.com leaderboards for the specified category.

##### Parameters
* `category`
  * The category to search for. Must match, but doesn't have to be an exact match. Search term `any` will match a category named `any%`, or `all` will match a category named `all collectables`.

##### Example
* RegUser: `!wr any`
  * Returns the time, username, and video link for the top time of the first category matching `any` (likely `any%`).
