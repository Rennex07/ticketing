const {
    Client, IntentsBitField, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder,
    StringSelectMenuBuilder, ChannelType, PermissionsBitField, ModalBuilder,
    TextInputBuilder, TextInputStyle, MessageFlagsBitField, SectionBuilder,
    SeparatorSpacingSize, Colors,
    TextDisplayBuilder, ContainerBuilder,
    ButtonStyle,
    SelectMenuBuilder,
    BaseSelectMenuBuilder,
    ActivityType
} = require("discord.js");
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const axios = require('axios')
const dataPath = path.join(__dirname, 'data.json');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildMembers
    ],
    partials: [
        Partials.Channel, Partials.GuildMember, Partials.User, Partials.Message, Partials.Reaction
    ]
});

let server;
const prefix = "!";
const mainfootertext = "OblivionCPVP"
const mainclr = Colors.DarkPurple;
const headerslog = {
    'Authorization': 'xuaMRWG7Z2UnfwY9zcm8xBTS9MrKs4J3MSvPHrZMM1FcBYwDmaCFVUTLMXitxvYy'
};

function loadData() {
    return JSON.parse(fs.readFileSync(dataPath));
}

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function timeToSeconds(input) {
    const timeUnits = {
        s: 1,
        m: 60,
        h: 3600,
        d: 86400,
        w: 604800,
        mo: 2592000,
        y: 31536000,
    };
    const regex = /^(\d+)(s|m|h|d|w|mo|y)$/;
    const match = input.toLowerCase().match(regex);
    if (!match) throw new Error("Invalid time format. Use 1m, 2h, 3d, etc.");
    const value = parseInt(match[1]);
    const unit = match[2];
    return value * timeUnits[unit];
}

const token = atob(config.token);

async function generateRandomString(length) {
    const url = `https://api.cookie-api.com/api/tools/generate-string?length=${length}&include_digits=true&include_uppercase=false&include_lowercase=true&include_special=false`;

    const response = await axios.get(url, {
        headers: headerslog
    });
    return response.data.generated_string;
}

async function getRandomNumber(length) {
    const url = `https://api.cookie-api.com/api/random/random-number?min=1&max=${length}`;
    const response = await axios.get(url, {
        headers: headerslog
    });
    return response.data.random_number
}

client.once('ready', async (stream) => {
    console.log(`${stream.user.username} is online.`);
    server = await client.guilds.fetch('1367705967990407269');
    stream.user.setActivity({ type: ActivityType.Competing, name: 'PvP' })
    stream.user.setStatus('idle')
});

client.on('guildMemberAdd', async (member) => {
    const welcomechannelid = '1367713734163693709';
    try {
        const channel = await member.guild.channels.fetch(welcomechannelid);
        if (!channel) {
            console.error('Welcome channel not found');
            return;
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`${member.user.username} has joined!`)
            .setDescription('<:Earth:1370528185955127376> Join Our Server!\n<:controller:1372295469006454904> oblivioncpvp.net\n<:BEDROCK:1370528106430861332> 19132\n\n<:Store:1370528138114633838> Checkout or Webstore!\nhttps://store.oblivioncpvp.net\n***You are the ' + member.guild.memberCount + 'th member!***')
            .setThumbnail(member.user.displayAvatarURL({size: 1024})).setFooter({text: `${member.user.username}`, iconURL: member.user.displayAvatarURL({size: 1024})})
            .setTimestamp(Date.now()).setColor(Colors.Yellow);
        await channel.send({embeds: [embed]});
    } catch (error) {
        console.error('Error sending welcome message:', error);
    }
});

client.on('messageCreate', async (msg) => {
    if (msg.content.startsWith(prefix + 'ban')) {
        const member = msg.mentions.users
        const duration = msg.content.split(' ')[2] || 'permanent';
        const reason = msg.content.split(' ')[3] || 'none provided';

        if (!int.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return msg.reply({
                content: 'You are not allowed to use this command.',
            });
        }

        const guildMember = await server.members.fetch(member.id).catch(() => null);
        if (!guildMember) return msg.reply({ content: `User not found in guild.`});

        let durationSeconds = null;
        if (duration !== 'permanent') {
            try {
                durationSeconds = timeToSeconds(duration);
            } catch (err) {
                return msg.reply({ content: `❌ ${err.message}`});
            }
        }
        try {
            const embed = new EmbedBuilder()
            .setTitle('You have been banned!')
            .setDescription('You have been banned from ' + msg.guild.name + ' !')
            .addFields(
                {name: 'Reason', value: reason},
                {name: 'Duration', value: duration}
            )
            .setFooter({text: mainfootertext})
            .setColor(mainclr);
            await member.send({embeds: [embed]});
        } catch (err) {
            
        }
        await guildMember.ban({ reason });

        if (durationSeconds) {
            const data = loadData();
            data.bans.push({
                userId: member.id,
                guildId: int.guild.id,
                unbanAt: Date.now() + durationSeconds * 1000
            });
            saveData(data);
        }

        return msg.reply({
            content: `<@${member.id}> was banned${durationSeconds ? ` for **${duration}**` : ''}. Reason: ${reason}`,
        });
    }
    if (msg.content === '!test') {
        const container = new ContainerBuilder();
      
        const text1 = new TextDisplayBuilder().setContent(
          ['This is a test', '- want like this?'].join('\n')
        );
        const button = new ButtonBuilder()
        .setCustomId('testtesttest')
        .setLabel('Heyo')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);
        const section1 = new SectionBuilder().addTextDisplayComponents(text1).setButtonAccessory(button);
        container.addSectionComponents(section1);
        msg.reply({
          components: [container],
          flags: MessageFlagsBitField.Flags.IsComponentsV2,
        });
      }
      
    if (msg.content.startsWith('!kick')) {
        const member = msg.mentions.users;
        const reason = msg.content.split(' ')[2] || 'none provided';

        if (!int.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return msg.reply({ content: 'You are not allowed to use this' });
        } else {
            const memberr = await server.members.fetch(member.id);
            await memberr.kick(reason);
            return msg.reply({
                content: `<@${member.id}> was kicked. Reason: ${reason}`,
            });
        }
    }
    if (msg.content.startsWith('!warnlist')) {
        const user = msg.mentions.users.first();
        if (!user) return msg.reply('Please mention a user to view warnings');
        
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return msg.reply('You need ManageMessages permission');
        }
    
        const data = loadData();
        const userWarnings = data.warns.filter(warn => warn.userId === user.id);
        if (userWarnings.length === 0) {
            return msg.reply(`No warnings for <@${user.id}>`);
        }
    
        let buildWarningsContainer = () => {
            const container = new ContainerBuilder();
            const headerText = new TextDisplayBuilder()
                .setContent(`Warnings for ${user.tag}`);
            container.addTextDisplayComponents(headerText);
            userWarnings.forEach((warn, idx) => {
                const expireDate = warn.expireAt ? new Date(warn.expireAt).toLocaleString() : 'Never';
                const warningText = new TextDisplayBuilder()
                    .setContent(`Warning #${idx + 1}\nReason: ${warn.reason}\nExpires: ${expireDate}`);
                const removeButton = new ButtonBuilder()
                    .setCustomId(`remove_${idx}`)
                    .setLabel('Remove')
                    .setStyle(ButtonStyle.Danger);
                const section = new SectionBuilder()
                    .addTextDisplayComponents(warningText)
                    .setButtonAccessory(removeButton);
                container.addSectionComponents(section);
            });
            return container;
        }

        const response = await msg.reply({
            components: [buildWarningsContainer()],
            flags: MessageFlagsBitField.Flags.IsComponentsV2
        });
    
        const collector = response.createMessageComponentCollector({
            filter: i => i.user.id === msg.author.id,
            time: 60000
        });
    
        collector.on('collect', async (interaction) => {
            try {
                if (interaction.customId.startsWith('remove_')) {
                    await interaction.deferUpdate();
                    const warningIndex = parseInt(interaction.customId.split('_')[1]);
                    const warningToRemove = userWarnings[warningIndex];
                    data.warns = data.warns.filter(w => 
                        w.userId !== warningToRemove.userId || 
                        w.warnedAt !== warningToRemove.warnedAt
                    );
                    saveData(data);
                    userWarnings.splice(warningIndex, 1);
                    if (userWarnings.length === 0) {
                        const emptyContainer = new ContainerBuilder();
                        emptyContainer.addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`No warnings remaining for ${user.tag}`)
                        );
                        await response.edit({
                            components: [emptyContainer],
                            flags: MessageFlagsBitField.Flags.IsComponentsV2
                        });
                        return collector.stop();
                    }
                    await response.edit({
                        components: [buildWarningsContainer()],
                        flags: MessageFlagsBitField.Flags.IsComponentsV2
                    });
                }
            } catch (error) {
                console.error('Error handling interaction:', error);
            }
        });
    
        collector.on('end', () => {
            response.edit({ components: [] , flags: MessageFlagsBitField.Flags.IsComponentsV2 }).catch(() => {});
        });
    }
    if (msg.content.startsWith('!warn ')) {
        const member = msg.mentions.users.first();
        const duration = msg.content.split(' ')[2] || 'permanent';
        const reason = msg.content.split(' ')[3] || 'none provided';

        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return msg.reply({
                content: 'You are not allowed to use this command.',
            });
        }

        let durationSeconds = null;
        if (duration) {
            try {
                durationSeconds = timeToSeconds(duration);
            } catch (err) {
                const errorMsg = await msg.reply({ content: `❌ ${err.message}`});
                await wait(5000);
                errorMsg.delete().catch(console.error);
            }
        }

        const data = loadData();
        data.warns.push({
            userId: member.id,
            guildId: msg.guild.id,
            warnedAt: Date.now(),
            reason,
            expireAt: durationSeconds ? Date.now() + durationSeconds * 1000 : null
        });
        saveData(data);

        return msg.reply({
            content: `<@${member.id}> was warned${duration ? ` for **${duration}**` : ''}. Reason: ${reason}`,
        });
    }
    if (msg.content === '!debug') {
        if (msg.author.id === '1099586548141391914') {
            msg.react('🟢')
            msg.reply('check dms')
            const welcomechannelid = '1367713734163693709';
            const channel = msg.guild.channels.cache.get(welcomechannelid);
            channel.send({content: 'Debug'})
        }
    }
    if (msg.content === '!commands') {
        const embed = new EmbedBuilder()
        .setTitle('Commands')
        .setDescription('Click the respective button to get the commands in that category')
        .setFooter({text: mainfootertext})
        .setColor(mainclr);
        /*
        const adminbutton = new ButtonBuilder()
        .setCustomId('admincommands')
        .setLabel('Admin')
        .setStyle(ButtonStyle.Danger);
        */
        const modbutton = new ButtonBuilder()
        .setCustomId('modcommands')
        .setLabel('Moderation')
        .setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder().addComponents(modbutton);
        msg.reply({embeds: [embed], components: [row]})
    }
    if (msg.content === '!msgticketsend') {
        if (msg.author.id === '1193364403735773268' || msg.author.id === '1099586548141391914') {
            const dropdown = new StringSelectMenuBuilder()
            .setCustomId('ticket-interaction')
            .setPlaceholder('Select a category')
            .addOptions(
                {label: 'Media', emoji: '🎥', description: 'Social media related inquiries', value: 'socmedia'},
                {label: 'Connection issues', emoji: '📱', description: 'Server connectivity issues', value: 'connectiss'},
                {label: 'Player report', emoji: '⚠️', description: 'Player reports', value: 'plrrep'},
                {label: 'Bug reports', emoji: '🐞', description: 'Unexpected behaivor', value: 'bugrprts'},
                {label: 'Ban appeal', emoji: '📜', description: 'Appeal a ban', value: 'banappl'},
                {label: 'Purchase support', emoji: '💳', description: 'Billing support', value: 'purchasespprt'},
                {label: 'Other', emoji: '❓', description: 'Anything not in here', value: 'other'}
            ).setMinValues(1).setMaxValues(1);
            const embed = new EmbedBuilder()
            .setTitle('Tickets')
            .setDescription('Do you have any problem? Open a ticket here and our staff will assist you!')
            .setFooter({text: mainfootertext + ' | Opening a false ticket will result in a blacklist from opening future tickets!'})
            .setColor(mainclr);
            const action = new ActionRowBuilder().addComponents(dropdown);
            const channel = await server.channels.fetch('1369387441550659737');
            channel.send({embeds: [embed], components: [action]});
        }
    }
    if (msg.content === '!reactionrolessend') {
        if (msg.author.id === '1193364403735773268' || msg.author.id === '1099586548141391914') {
            const embed = new EmbedBuilder()
            .setTitle('Reaction roles')
            .setDescription('Here you can choose some roles for specific pings.')
            .addFields(
                {name: 'The avaiable roles:', value: '<:Youtube:1369389076813189274> | Upload ping\n:tools: | Updates ping\n<:polls:1369760524102930522> | Polls ping'}
            ).setFooter({text: mainfootertext}).setColor(mainclr);
            const guild =  await client.guilds.fetch('1367705967990407269')
            const channel = await guild.channels.fetch('1369761572410495127')
            const msg = await channel.send({embeds: [embed]});
            await msg.react('<:Youtube:1369389076813189274>');
            await msg.react('🛠️');
            await msg.react('<:polls:1369760524102930522>');
        }
    }
    if (msg.content.startsWith('!msgsend')) {
        if (msg.author.id === '1193364403735773268' || msg.author.id === '1099586548141391914') {
            const args = msg.content.split(' ');
            const message = args.slice(1).join(' ');
            if (!message) {
                return msg.react('❌');
            } else {
                msg.channel.send(message);
                msg.delete();
            }
        }
    }
    if (msg.content.startsWith('!role add ')) {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return msg.reply('You need the Manage Roles permission to use this command.');
        }
        const role = msg.mentions.roles.first();
        if (!role) {
            return msg.reply('Please mention a role to add.');
        }
        
        const userToModify = msg.mentions.users.first(); 
        if (!userToModify) {
            return msg.reply('Please mention a user to add the role to.');
        }
        
        try {
            const guildMember = await msg.guild.members.fetch(userToModify.id); 
            
            if (!guildMember) {
                return msg.reply('Could not find that member in the server.');
            }
            
            await guildMember.roles.add(role.id);
            msg.reply(`Successfully added role "${role.name}" to <@${userToModify.id}>.`);
        } catch (error) {
            console.error('Role add error:', error);
            msg.reply('Failed to add role. Please check bot permissions and role hierarchy.');
        }
    }
    if (msg.content.startsWith('!role remove ')) {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return msg.reply('You need the Manage Roles permission to use this command.');
        }
        const role = msg.mentions.roles.first();
        if (!role) return msg.reply('Please mention a role to remove.');
        const userToModify = msg.mentions.users.first();
        if (!userToModify) return msg.reply('Please mention a user to remove the role from.');
        try {
            const guildMember = await msg.guild.members.fetch(userToModify.id);
            if (!guildMember) {
                return msg.reply('Could not find that member in the server.');
            }
            if (!guildMember.roles.cache.has(role.id)) {
                return msg.reply(`<@${userToModify.id}> does not have the role "${role.name}".`);
            }
            await guildMember.roles.remove(role.id);
            msg.reply(`Successfully removed role "${role.name}" from <@${userToModify.id}>.`);
        } catch (error) {
            console.error('Role remove error:', error);
            msg.reply('Failed to remove role. Please check bot permissions and role hierarchy.');
        }
    }
    if (msg.content.startsWith('!unmute ')) {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return msg.reply('You need the Moderate Members permission to use this command.');
        }

        const user = msg.mentions.users.first();
        if (!user) return msg.reply('Please mention a user to unmute.');

        try {
            const member = await msg.guild.members.fetch(user.id);
            if (!member.isCommunicationDisabled()) {
                return msg.reply('This user is not muted.');
            }
            
            await member.timeout(null);
            msg.reply(`Successfully unmuted <@${user.id}>`);
        } catch (error) {
            console.error('Unmute error:', error);
            msg.reply('Failed to unmute user. Check bot permissions and hierarchy.');
        }
    }
    if (msg.content.startsWith('!mute ')) {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return msg.reply('You need the Moderate Members permission to use this command.');
        }
        const user = msg.mentions.users.first();
        if (!user) return msg.reply('Please mention a user to mute.');
        const duration = msg.content.split(' ')[2] || 'permanent';
        const reason = msg.content.split(' ')[3] || 'none provided';

        let durationSeconds = null;
        if (duration) {
            try {
                durationSeconds = timeToSeconds(duration);
            } catch (err) {
                const errorMsg = await msg.reply({ content: `❌ ${err.message}`});
                await wait(5000);
                errorMsg.delete().catch(console.error);
            }
        }

        const data = loadData();
        data.warns.push({
            userId: user.id,
            guildId: msg.guild.id,
            warnedAt: Date.now(),
            reason,
            expireAt: durationSeconds ? Date.now() + durationSeconds * 1000 : null
        });
        saveData(data);

        return msg.reply({
            content: `<@${user.id}> was muted${duration ? ` for **${duration}**` : ''}. Reason: ${reason}`,
        });
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    try {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Failed to fetch reaction:', error);
                return;
            }
        }

        if (user.bot) return;
        if (reaction.message.id !== '1369763811338227953') return;

        const guild = client.guilds.cache.get('1367705967990407269');
        if (!guild) return;

        const member = await guild.members.fetch(user.id).catch(console.error);
        if (!member) return;

        if (reaction.emoji.id === '1369389076813189274') {
            if (!member.roles.cache.has('1369037663650316380')) {
                await member.roles.add('1369037663650316380').catch(console.error);
            }
        } else if (reaction.emoji.name === '🛠️') {
            if (!member.roles.cache.has('1369037699075407973')) {
                await member.roles.add('1369037699075407973').catch(console.error);
            }
        } else if (reaction.emoji.id === '1369760524102930522') {
            if (!member.roles.cache.has('1369037627663188008')) {
                await member.roles.add('1369037627663188008').catch(console.error);
            }
        }
    } catch (error) {
        console.error('Error in messageReactionAdd:', error);
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    try {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Failed to fetch reaction:', error);
                return;
            }
        }
        if (reaction.message.partial) {
            try {
                await reaction.message.fetch();
            } catch (error) {
                console.error('Failed to fetch message:', error);
                return;
            }
        }

        if (reaction.message.id !== '1369763811338227953') return;

        const guild = client.guilds.cache.get('1367705967990407269');
        if (!guild) return;

        const member = await guild.members.fetch(user.id).catch(console.error);
        if (!member) return;

        if (reaction.emoji.id === '1369389076813189274') {
            if (member.roles.cache.has('1369037663650316380')) {
                await member.roles.remove('1369037663650316380').catch(console.error);
            }
        } else if (reaction.emoji.name === '🛠️') {
            if (member.roles.cache.has('1369037699075407973')) {
                await member.roles.remove('1369037699075407973').catch(console.error);
            }
        } else if (reaction.emoji.id === '1369760524102930522') {
            if (member.roles.cache.has('1369037627663188008')) {
                await member.roles.remove('1369037627663188008').catch(console.error);
            }
        }
    } catch (error) {
        console.error('Error in messageReactionRemove:', error);
    }
});

client.on('interactionCreate', async (int) => {
    if (!int.isCommand()) return;

});

client.on('interactionCreate', async (int) => {
    if (!int.isButton()) return;
    if (int.customId === 'testtesttest') {
        let random = await generateRandomString(5)
        console.log(random);
        int.reply({content: `Random generated string: ${random}`, flags: MessageFlagsBitField.Flags.Ephemeral});
    }
    if (int.customId.startsWith('ticketclose-')) {
        const uniqueId = int.customId.split('-')[1];
        const data = loadData();
    
        const ticket = data.tickets.find(t => t.id === int.channel.id);
        if (!ticket) {
            return int.reply({
                content: '❌ Ticket not found in database.',
                flags: MessageFlagsBitField.Flags.Ephemeral
            });
        }
    
        await int.reply({
            content: '🕒 Closing this ticket...',
            flags: MessageFlagsBitField.Flags.Ephemeral
        });
    
        data.tickets = data.tickets.filter(t => t.id !== int.channel.id);
        saveData(data);
    
        await int.channel.send('🔒 This ticket will be deleted in 5 seconds.');
        setTimeout(() => {
            int.channel.delete().catch(err => console.error('Failed to delete ticket channel:', err));
        }, 5000);
    }
    if (int.customId === 'modcommands') {
        if (!int.member.roles.cache.has('1372510858051059803') || !int.member.roles.cache.has('1368355810584956948')) {
            return int.reply({content: 'You do not have enough permissions to click this button.', flags: MessageFlagsBitField.Flags.Ephemeral})
        }
        const embed = new EmbedBuilder()
        .setTitle('Moderation commands')
        .setDescription('<option> - required\n[option] - optional\n\n!ban <user> [duration] [reason] - Bans an user\n!kick <user> [reason] - Kicks an user\n!warn <user> [duration] [reason] - Warns an user\n!mute <user> [duration] [reason] - Mutes an user\n!unban <user> [reason] - Unbans an user\n!unwarn <user> [reason] - Unwarns an user\n!unmute <user> [reason] - Unmutes an user\n!purge <amount> - Purges messages\n!warnlist <user> - Lists warns of an user')
        .setFooter({text: mainfootertext})
        .setColor(mainclr);
        int.reply({embeds: [embed], flags: MessageFlagsBitField.Flags.Ephemeral})
    }
});

client.on('interactionCreate', async (int) => {
    if (!int.isAnySelectMenu()) return;
    if (int.customId === 'ticket-interaction') {
        const data = loadData();
        let blacklisted = false;
        for (const id of data.blacklisted) {
            if (int.user.id === id) {
                blacklisted = true;
                break;
            }
        }
        
        if (blacklisted) {
            return int.reply({
                content: 'You are blacklisted from opening tickets.',
                flags: MessageFlagsBitField.Flags.Ephemeral
            });
        }
        await int.reply({
            content: '*Creating ticket (please wait)...*',
            flags: MessageFlagsBitField.Flags.Ephemeral
        });
    
        const selectedValue = int.values[0];
        const uniqueStr = await generateRandomString(5);
        const ticketName = `${selectedValue}-${uniqueStr}`;
        const guild = int.guild;
        const channel = await guild.channels.create({
            name: ticketName,
            type: 0,
            topic: `Ticket for ${int.user.tag} (${int.user.id})`,
            parent: '1369387302832443485',
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: ['ViewChannel']
                },
                {
                    id: int.user.id,
                    allow: ['ViewChannel', 'SendMessages', 'AttachFiles', 'ReadMessageHistory']
                }
            ]
        });
        data.tickets.push({
            id: channel.id,
            userId: int.user.id,
            username: int.user.tag,
            reason: selectedValue,
            createdAt: Date.now(),
            topic: int.values[0],
            uniqueId: uniqueStr
        });
        saveData(data);
        const embed = new EmbedBuilder()
        .setTitle('Ticket created')
        .setDescription('Your ticket has been created! Please wait until a support member responds to you. Do not ping anyone!')
        await int.editReply({
            content: `✅ Ticket created: <#${channel.id}>`, flags: MessageFlagsBitField.Flags.Ephemeral
        });
        const button = new ButtonBuilder()
        .setCustomId(`ticketclose-${uniqueStr}`)
        .setLabel('Close ticket')
        .setStyle(ButtonStyle.Danger);
        const action = new ActionRowBuilder().addComponents(button);
        await channel.send({embeds: [embed], components: [action]});
        let msg;
        if (selectedValue === 'socmedia') {
            msg = await channel.send(`<@${int.user.id}> please answer this question: Did you check the media requirements? If you did just know if you dont meet you will get blacklisted from media tickets`)
        }
        if (selectedValue === 'connectiss') {
            msg = await channel.send(`<@${int.user.id}> please answer this question: What connection issues do you have? Are you using Bedrock edition, or Java edition?`)
        }
        if (selectedValue === 'plrrep') {
            msg = await channel.send(`<@${int.user.id}> please answer this question: Whats their user? Do you have video proof?`)
        }
        if (selectedValue === 'bugrprts') {
            msg = await channel.send(`<@${int.user.id}> please answer this question: What type of bug is it? Can you send a video of the bug?`)
        }
        if (selectedValue === 'banappl') {
            msg = await channel.send(`<@${int.user.id}> please answer this question: What did you get banned for?`)
        }
        if (selectedValue === 'purchasespprt') {
            msg = await channel.send(`<@${int.user.id}> please answer this question: What problems do you have? do you have the recipt, (if not we cant help) if you do send a screenshot of the recipt.`)
        }
        if (selectedValue === 'other') {
            msg = await channel.send(`<@${int.user.id}> please answer this question: What is your issue?`)
        }
        const filter = m => m.author.id === int.user.id
        const collector = channel.createMessageCollector({filter: filter, time: 360000, max: 1})
        let deleted;
        collector.on('collect', async message => {
            message.react('✅');
            msg.delete();
            message.reply('Thank you. Please wait for support, they will get to you soon.')
            deleted = true;
            collector.stop('Collected')
        });
        collector.on('end', async collected => {
            if (deleted !== true) {
            msg.channel.send('No answer was provided.').catch(err => console.error(err))
            deleted = false;
            }
        });
    }
    
});

setInterval(async () => {
    const data = loadData();
    const now = Date.now();
    const stillBanned = [];

    for (const ban of data.bans) {
        if (ban.unbanAt <= now) {
            try {
                const guild = client.guilds.cache.get(ban.guildId);
                await guild.members.unban(ban.userId, 'Temporary ban expired');
                console.log(`✅ Unbanned ${ban.userId}`);
            } catch (err) {
                console.error(`⚠️ Failed to unban ${ban.userId}:`, err.message);
                stillBanned.push(ban);
            }
        } else {
            stillBanned.push(ban);
        }
    }

    data.bans = stillBanned;

    data.warns = data.warns.filter(warn => {
        if (!warn.expireAt || warn.expireAt > now) return true;
        console.log(`⚠️ Warning for ${warn.userId} expired.`);
        return false;
    });

    saveData(data);
}, 60 * 1000);

client.login(token);