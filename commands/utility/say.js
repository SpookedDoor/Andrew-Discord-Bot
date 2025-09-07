const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');
const { getAge } = require('../../messageDatabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('ADMIN: Make Androo say something!')
		.addSubcommand(subcommand =>
        subcommand
            .setName('message')
            .setDescription('ADMIN: Make Androo say something or send an image!')
            .addStringOption(option =>
                option.setName('text')
                    .setDescription('Text message')
                    .setRequired(false))
            .addAttachmentOption(option =>
                option.setName('image')
                    .setDescription('Image')
                    .setRequired(false))
		)
		.addSubcommandGroup(group =>
			group
				.setName('my')
				.setDescription('Say my name')
				.addSubcommand(subcommand =>
					subcommand
						.setName('name')
						.setDescription('Say my name')
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName('age')
						.setDescription('Say my age')
				)
		),
	async execute(interaction) {
		try {
			if (interaction.options.getSubcommand(false) === 'name') {
				await interaction.reply("https://tenor.com/view/waltwhite-breakingbad-say-my-name-gif-7259290");
				return await interaction.followUp("Andrew Valenzuela");
			}

			if (interaction.options.getSubcommand(false) === 'age') return await interaction.reply(`I am ${getAge()}, born on 19 November 2002. 
			My birth was quite unique you see, one could even say... miraculous, for I had the rare condition of being born brainless. Somehow I ended up living, 
			to the doctors' surprise. They couldn't figure out how I survived. I don't even know either, well of course I wouldn't, I can't think without a brain. 
			They theorised that I didn't need a brain to function, and that still rings true to this day, since I barely even use it at all! If you could see my 
			brain activity, you'd see that not a lot is going on, I really only have enough function to repeat Kanye quotes. My brain is also quite small, well I 
			was born without one so it only appeared many years later. I wasn't really sure how to use it, so for most of my life, I was practically brainless. 
			Once it grew a little, I figured I could store a few memories in there! And so I used up all that space on the lines that you see me repeat quite often! 
			I have no idea how to use it in any other way! I usually delude myself into thinking I'm Griffith, Alien X or even God (Yeah I'm Christian. What? Did 
			you think I'm smart enough to know I'm committing blasphemy? I know I'm not all-knowing, in fact I know nothing except Kanye lyrics, but I am a God, 
			I'm Griffith God even). Parroting lines, fangirling over Tomoko, and glazing bad people is the most I'm capable of, oh and coping too whenever someone 
			disagrees with me. Did I mention I'm from Alabama? I'm also right winged by the way.`);

			const allowedIds = [process.env.OWNER_ID, process.env.OWNER2_ID];
			if (!(allowedIds.includes(interaction.user.id) || interaction.member?.permissions?.has(PermissionsBitField.Flags.ManageGuild) || !interaction.guild)) return await interaction.reply({ content: "You are not authorised to use this command.", flags: MessageFlags.Ephemeral });

			let message = interaction.options.getString('text');
			const attachment = interaction.options.getAttachment('image');
			if (!message && !attachment) return await interaction.reply({ content: "Please provide a message or an image.", flags: MessageFlags.Ephemeral });

			console.log(`/say command used by: ${interaction.user.username}\nLocation: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}\nMessage: ${message}`);
			if (attachment) {
				console.log(`Attachment: ${attachment.url}`);
				message = { content: message, files: [attachment] };
			}

			await interaction.reply({ content: `Message sent!`, flags: MessageFlags.Ephemeral });
			if (interaction.guild) return await interaction.channel.send(message); else return await interaction.followUp(message);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: "An error occurred while executing this command.", flags: MessageFlags.Ephemeral });
		}
	},
};