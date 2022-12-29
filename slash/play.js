const {SlashCommandBuilder} = require("@discordjs/builders")
const {MessageEmbed} = require("discord.js")
const {QueryType, Playlist} = require("discord-player")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("plays audio from the internet")
        .addSubcommand((subcommand)=>
            subcommand.setName("song")
            .setDescription("Loads a single song from the internet")
            .addStringOption((option)=> option.setName("url").setDescription("the songs url").setRequired(true))
        )
        .addSubcommand((subcommand)=>
            subcommand
                .setName("playlist")
                .setDescription("Loads playlists")
                .addStringOption((option) => option.setName("url").setDescription("the playlist's url").setRequired(true))
        )
        .addSubcommand((subcommand)=>
            subcommand
                .setName("Search")
                .setDescription("Search using givien keywords")
                .addStringOption((option) => option.setName("searchTerms").setDescription("Searched Keywords").setRequired(true))
        ),
        run: async ({client, interaction}) => {
            if(!interaction.member.voice.channel)
                return interaction.editReply("You need to be in a voice channel")
            const queue = await client.player.createQueue(interaction.guild)
            if (!queue.connection) await queue.connect(interaction.member.voice.channel)

            let embed = new MessageEmbed()

            if (interaction.option.getSubCommand() === "song") {
                let url = interaction.options.getString("url")
                const result = await client.player.search(url,{
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_VIDEO
                })
                if (result.tracks.length === 0)
                    return interaction.editReply("no results")
                
                const song = result.tracks[0]
                await queue.addTrack(song)
                embed
                    .setDescription(`**[${song.title}](${song.url})**has been added to the queue`)
                    .setThumbnail(song.thumbnail)
                    .setFooter({text: `Duration: ${song.duration}`})

            } else if (interaction.options.getSubCommand() === "playlist"){

                let url = interaction.options.getString("url")
                const result = await client.player.search(url,{
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_PLAYLIST
                })
                if (result.tracks.length === 0)
                    return interaction.editReply("no results")
                
                const playlist = result.playlist
                await queue.addTracks(result.tracks)
                embed
                    .setDescription(`**[${playlist.title}](${playlist.url})**has been added to the queue`)
                    .setThumbnail(playlist.thumbnail)

            }else if (interaction.option.getSubCommand()=== "Search"){
                let url = interaction.options.getString("searchterms")
                const result = await client.player.search(url,{
                    requestedBy: interaction.user,
                    searchEngine: QueryType.AUTO
                })
                if (result.tracks.length === 0)
                    return interaction.editReply("no results")
                
                const playlist = result.playlist
                await queue.addTracks(result.tracks)
                embed
                    .setDescription(`**[${song.title}](${song.url})**has been added to the queue`)
                    .setThumbnail(playlist.thumbnail)
                    .setFooter({text: `Duration: ${song.duration}`})

            }
            if(!queue.playing) await queue.play()
            await interaction.editReply({
                embeds: [embed]
            })
        },
}