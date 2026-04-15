const { Client, GatewayIntentBits, PermissionsBitField, ChannelType, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
});

const warnedUsers = new Map(); // Stockage temporaire des avertissements

client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // 🔒 LOCK / UNLOCK
  if (commandName === 'lock') {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
    const salon = interaction.options.getChannel('salon') || interaction.channel;
    return interaction.reply('🔒 Salon verrouillé.');
  }

  if (commandName === 'unlock') {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
    const salon = interaction.options.getChannel('salon') || interaction.channel;
    return interaction.reply('🔓 Salon déverrouillé.');
  }

  // 🎫 TICKET
  if (commandName === 'ticket') {
    const user = interaction.user;
    const guild = interaction.guild;

    const ticketChannel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      ],
    });

    await interaction.reply({ content: `🎫 Ticket créé : ${ticketChannel}`, ephemeral: true });
    await ticketChannel.send(`👋 Bonjour ${user}, un membre du staff va te répondre sous peu.`);
  }

  // 📊 STATS
  if (commandName === 'stats') {
    const g = interaction.guild;
    return interaction.reply(`📊 **Statistiques du serveur :**  
👥 Membres : ${g.memberCount}  
📺 Salons : ${g.channels.cache.size}  
🏷️ Rôles : ${g.roles.cache.size}`);
  }

  // 🚫 BAN
  if (commandName === 'ban') {
    const user = interaction.options.getUser('membre');
    const member = await interaction.guild.members.fetch(user.id);
    await member.ban();
    return interaction.reply(`🚫 ${user.tag} a été banni.`);
  }

  // 🔇 MUTE / UNMUTE
  if (commandName === 'mute') {
    const member = interaction.options.getMember('membre');
    await member.timeout(60 * 60 * 1000, 'Mute manuel (1h)');
    return interaction.reply(`🔇 ${member.user.tag} a été mute pendant 1h.`);
  }

  if (commandName === 'unmute') {
    const member = interaction.options.getMember('membre');
    await member.timeout(null);
    return interaction.reply(`🔊 ${member.user.tag} a été démute.`);
  }

  // ⏳ TEMPBAN
  if (commandName === 'tempban') {
    const member = interaction.options.getMember('membre');
    const temps = interaction.options.getInteger('temps');
    await member.ban();
    interaction.reply(`⏳ ${member.user.tag} banni pour ${temps} minute(s).`);
    setTimeout(async () => {
      await interaction.guild.members.unban(member.id);
    }, temps * 60000);
  }

  // ⏳ TEMPMUTE
  if (commandName === 'tempmute') {
    const member = interaction.options.getMember('membre');
    const temps = interaction.options.getInteger('temps');
    await member.timeout(temps * 60000, 'Mute temporaire');
    return interaction.reply(`🔇 ${member.user.tag} a été mute pour ${temps} minute(s).`);
  }

  // 🚫 NOVOC / ✅ YESVOC
  if (commandName === 'novoc') {
    const member = interaction.options.getMember('membre');
    await member.voice.disconnect();
    await member.roles.add('1493798079940530186'); // <--- remplace par le rôle interdit de ton serveur
    return interaction.reply(`🚫 ${member.user.tag} ne peut plus rejoindre les voc.`);
  }

  if (commandName === 'yesvoc') {
    const member = interaction.options.getMember('membre');
    await member.roles.remove('1493798079940530186');
    return interaction.reply(`✅ ${member.user.tag} peut de nouveau aller en voc.`);
  }

  // ⚠️ AVERTISSEMENT
  if (commandName === 'avertissement') {
    const user = interaction.options.getUser('membre');
    const raison = interaction.options.getString('raison') || 'Aucune raison spécifiée.';
    const warnCount = warnedUsers.get(user.id) || 0;
    warnedUsers.set(user.id, warnCount + 1);
    return interaction.reply(`⚠️ ${user.tag} a reçu un avertissement (${warnCount + 1} au total). Raison : ${raison}`);
  }

  // 🧹 CLEARMESS
  if (commandName === 'clearmess') {
    const user = interaction.options.getUser('membre');
    const messages = await interaction.channel.messages.fetch();
    const userMessages = messages.filter(msg => msg.author.id === user.id);
    await interaction.channel.bulkDelete(userMessages);
    return interaction.reply(`🧹 ${userMessages.size} message(s) de ${user.tag} ont été supprimés.`);
  }

// 👋 BIENVENUE
if (commandName === 'bienvenue') {
  const salon = interaction.options.getChannel('salon') || interaction.channel;
  const message =
    interaction.options.getString('message') ||
    `👋 Bienvenue sur **${interaction.guild ? interaction.guild.name : 'le serveur'}** ! Nous sommes ravis de t’accueillir 😄`;

  // Vérification de base : la commande doit être exécutée dans un serveur
  if (!interaction.guild) {
    return interaction.reply({
      content: '❌ Cette commande ne peut être utilisée qu’en serveur.',
      ephemeral: true,
    });
  }

  // Vérifie que le salon est un salon texte
  if (!salon.isTextBased()) {
    return interaction.reply({
      content: '❌ Le salon spécifié n’est pas un salon texte.',
      ephemeral: true,
    });
  }

  // Création de l’embed
  const embed = new EmbedBuilder()
    .setColor('Green')
    .setDescription(message);

  if (interaction.guild.iconURL()) {
    embed.setAuthor({
      name: interaction.guild.name,
      iconURL: interaction.guild.iconURL(),
    });
  }

  try {
    await salon.send({ embeds: [embed] });
    await interaction.reply({
      content: `✅ Message de bienvenue envoyé dans ${salon}.`,
      ephemeral: true,
    });
  } catch (err) {
    console.error('Erreur envoi bienvenue :', err);
    await interaction.reply({
      content: '❌ Impossible d’envoyer le message dans ce salon. Vérifie mes permissions.',
      ephemeral: true,
    });
  }
}

  // 🎉 GIVEAWAY
  if (commandName === 'giveaway') {
    const lot = interaction.options.getString('lot');
    const duree = interaction.options.getInteger('duree');
    const gagnants = interaction.options.getInteger('gagnants') || 1;

    const embed = new EmbedBuilder()
      .setColor('#ffcc00')
      .setTitle('🎉 Giveaway en cours !')
      .setDescription(`🎁 **Lot :** ${lot}\n⏳ **Durée :** ${duree} minute(s)\n🏆 **Gagnant(s) :** ${gagnants}`)
      .setFooter({ text: `Organisé par ${interaction.user.tag}` })
      .setTimestamp(Date.now() + duree * 60000);

    const message = await interaction.channel.send({ embeds: [embed] });
    await message.react('🎉');

    interaction.reply({ content: '✅ Giveaway lancé avec succès !', ephemeral: true });

    activeGiveaways.set(message.id, { lot, gagnants, fin: Date.now() + duree * 60000 });

    setTimeout(async () => {
      const updatedMsg = await interaction.channel.messages.fetch(message.id);
      const reactions = updatedMsg.reactions.cache.get('🎉');
      const users = await reactions.users.fetch();
      const participants = users.filter(u => !u.bot).map(u => u);

      if (participants.length === 0) {
        return interaction.channel.send('❌ Aucun participant, giveaway annulé.');
      }

      const winners = [];
      for (let i = 0; i < Math.min(gagnants, participants.length); i++) {
        const winner = participants[Math.floor(Math.random() * participants.length)];
        winners.push(winner);
      }

      await interaction.channel.send(`🎊 Félicitations à ${winners.map(u => `<@${u.id}>`).join(', ')} !  
Vous remportez **${lot}** 🎁`);

      activeGiveaways.delete(message.id);
    }, duree * 60000);
  }
});
client.login(process.env.minazouki);
