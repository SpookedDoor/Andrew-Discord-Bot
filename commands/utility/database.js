const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const db = require('../../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('database')
        .setDescription('OWNER: Manage the message database')
        .addSubcommand(subcommand =>
            subcommand.setName('add')
                .setDescription('OWNER: Add a message to the database')
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('Category to add the message to')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('The message to add')
                        .setRequired(true)
                )
                .addAttachmentOption(option =>
                    option.setName('attachment')
                        .setDescription('Optional attachment to add with the message')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('OWNER: Remove a message from the database')
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('Category to remove the message from')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('The message to remove')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        ),
    async autocomplete(interaction) {
        try {
            const focusedOption = interaction.options.getFocused(true);
            if (focusedOption.name === 'category') {
                const categories = await db.query(`SELECT name FROM message_categories`);
                const choices = categories.rows.map(row => row.name);
                const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedOption.value.toLowerCase()));
                await interaction.respond(
                    filtered.map(choice => ({ name: choice, value: choice })).slice(0, 25)
                );
            } else if (focusedOption.name === 'message') {
                const category = interaction.options.getString('category');
                // If the user hasn't selected a category yet, return no suggestions.
                if (!category) return await interaction.respond([]);

                // Use server-side filtering and limits to avoid loading massive result sets
                const filter = (focusedOption.value || '').trim();
                let messages;

                if (filter.length > 0) {
                    // Search messages that contain the filter (case-insensitive) and limit to 25
                    messages = await db.query(
                        `SELECT content FROM messages
                        WHERE category_id = (SELECT id FROM message_categories WHERE name = $1)
                        AND content ILIKE '%' || $2 || '%'
                        LIMIT 25`,
                        [category, filter]
                    );
                } else {
                    // No filter provided: return the most recent 25 messages for the category
                    messages = await db.query(
                        `SELECT content FROM messages
                        WHERE category_id = (SELECT id FROM message_categories WHERE name = $1)
                        ORDER BY id DESC
                        LIMIT 25`,
                        [category]
                    );
                }

                const MAX_LEN = 100;
                const seen = new Set();
                const raw = messages.rows.map(r => (r.content || '').toString());

                const choices = raw
                    .map(s => s.replace(/\s+/g, ' ').trim())
                    .filter(s => s.length > 0)
                    .filter(s => {
                        if (seen.has(s)) return false;
                        seen.add(s);
                        return true;
                    })
                    .slice(0, 25);

                const payload = choices.map(choice => {
                    const name = choice.length > MAX_LEN ? choice.slice(0, MAX_LEN - 3) + '...' : choice;
                    const value = choice.length > MAX_LEN ? choice.slice(0, MAX_LEN) : choice;
                    return { name, value };
                });

                await interaction.respond(payload);
            }
        } catch (error) {
            console.error('Error with autocomplete:', error);
        }
    },
    async execute(interaction) {
        try {
            const allowedIDs = [process.env.OWNER_ID, process.env.OWNER2_ID];
            if (!allowedIDs.includes(interaction.user.id)) {
                return interaction.reply({ content: 'You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
            }

            const subcommand = interaction.options.getSubcommand();
            if (subcommand === 'add') {
                const category = interaction.options.getString('category');
                const message = interaction.options.getString('message');
                const attachment = interaction.options.getAttachment('attachment');

                const categories = await db.query(`SELECT id FROM message_categories WHERE name = $1`, [category]);
                if (categories.rows.length === 0) return interaction.reply({ content: `Category "${category}" does not exist. Please create it first with SQL.`, flags: MessageFlags.Ephemeral });

                const categoryId = categories.rows[0].id;
                const insertMessage = await db.query(`INSERT INTO messages (category_id, content) VALUES ($1, $2) RETURNING id`, [categoryId, message]);
                const messageId = insertMessage.rows[0].id;

                if (attachment) {
                    await db.query(`INSERT INTO message_attachments (message_id, file_path) VALUES ($1, $2)`, [messageId, attachment.url]);
                    console.log(`${interaction.user.username} added message "${message}" with attachment "${attachment.url}" to category "${category}".`);
                    return interaction.reply({ content: `Added message "${message}" with attachment "${attachment.url}" to category "${category}".`, flags: MessageFlags.Ephemeral });
                } else {
                    console.log(`${interaction.user.username} added message "${message}" to category "${category}".`);
                    return interaction.reply({ content: `Added message "${message}" to category "${category}".`, flags: MessageFlags.Ephemeral });
                }
            } else if (subcommand === 'remove') {
                const category = interaction.options.getString('category');
                const message = interaction.options.getString('message');

                const categories = await db.query(`SELECT id FROM message_categories WHERE name = $1`, [category]);
                if (categories.rows.length === 0) return interaction.reply({ content: `Category "${category}" does not exist. Please create it first with SQL.`, flags: MessageFlags.Ephemeral });

                const categoryId = categories.rows[0].id;
                const messages = await db.query(`SELECT id FROM messages WHERE category_id = $1 AND content = $2 LIMIT 1`, [categoryId, message]);
                if (messages.rows.length === 0) return interaction.reply({ content: `Message "${message}" does not exist in category "${category}".`, flags: MessageFlags.Ephemeral });

                const messageId = messages.rows[0].id;
                await db.query(`DELETE FROM message_attachments WHERE message_id = $1`, [messageId]);
                await db.query(`DELETE FROM messages WHERE id = $1`, [messageId]);

                console.log(`${interaction.user.username} removed message "${message}" from category "${category}".`);
                return interaction.reply({ content: `Removed message "${message}" from category "${category}".`, flags: MessageFlags.Ephemeral });
            }
        } catch (error) {
            console.error('Error executing database command:', error);
            return interaction.reply({ content: 'An error occurred while executing the command.', flags: MessageFlags.Ephemeral });
        }
    }
}