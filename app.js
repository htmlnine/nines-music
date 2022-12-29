const Discord = require("discord.js")
const dotenv = require("dotenv")
const {rest, REST} = require("@discordjs/rest")
const {voice} = require("@discordjs/voice")
const {roots} = require("@discord-api-types/v9")
const fs = require("fs")
const {Player} = require("discord-player")
const { Routes, GuildDefaultMessageNotifications } = require("discord.js")



dotenv.config()
const TOKEN = process.env.TOKEN


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
    })
}