const Discord = require("discord.js")
const dotenv = require("dotenv")
const {rest, REST} = require("@discordjs/rest")
const {voice} = require("@discordjs/voice")
const {roots} = require("@discord-api-types/v9")
const fs = require("fs")
const {Player} = require("discord-player")
const { Routes, GuildDefaultMessageNotifications } = require("discord.js")



dotenv.config()
const TOKEN = await question('Application token? ');


const LOAD_SLASH = process.argv[2] == "Load"

const ClientID = "1056802982823464980"
const GuildID = ""

const client = new Discord.Client({

    intents: [
        "GUILDS",
        "GUILD_VOICE_STATES"
    ]

})

client.slashcommands = new Discord.Collection()
client.Player = new Player(client,{
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 125
    }
})


let commands = []

const slashfiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"))

for (const file of slashfiles){
    const slashcmd = require('./slash/${file}')
    client.slashcommands.set(slashcmd.data.name, slashcmd)
    if (LOAD_SLASH)commands.push(slashcmd.data.toJSON())
}

if (LOAD_SLASH) {
    const rest = new REST({version: "g"}).setToken(TOKEN)
    console.log("Getting Slash Commands Ready")
    rest.put(Routes.applicationGuildCommand(ClientID,GuildID), {body: commands})
    .then(() => {
        console.log("Loaded")
        process.exit(0)
    })
    .catch((err) >={
        if (err){
            console.log(err)
            process.exit(1)
        }
    })
}
else {
    client.on("ready", () =>{
        console.log('Logged in as ${client.user.tag}')
    })
    client.on("interactionCreate",  (interaction) =>{
        async function handleCommand() {
            if(!interaction.isCommand()) return

            const slashcmd = client.slashcommands.get(interaction.commandName)
            if (!slashcmd) interaction.reply("Not a valid command idiot")

            await interaction.deferReply()
            await slashcmd.run({client, interaction})
        }
        handleCommand()
    })
    client.login(TOKEN)


    const question = (q) => new Promise((resolve) => rl.question(q, resolve));
(async ()=>{
  const token = await question('Application token? ');
  if(!token) throw new Error('Invalid token');

  const ratelimitTest = await fetch(`https://discord.com/api/v9/invites/discord-developers`);

  if(!ratelimitTest.ok) {
    await question(`Uh oh, looks like the node you're on is currently being blocked by Discord. Press the "Enter" button on your keyboard to be reassigned to a new node. (you'll need to rerun the program once you reconnect)`)

    // This kills the container manager on the repl forcing Replit to assign the repl to another node with another IP address (if the ip is globally rate limited)
    //^ in short: Restarts the bot to be used again/attempted to start up again!
    execSync('kill 1');
    return;
  };
  
  await client.login(token).catch((err) => {
    throw err
  });

  //await client.rest.put(Routes.applicationCommands(client.user.id), { body: commands });

  console.log('DONE | Application/Bot is up and running. DO NOT CLOSE THIS TAB UNLESS YOU ARE FINISHED USING THE BOT, IT WILL PUT THE BOT OFFLINE.');
})();
}