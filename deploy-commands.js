const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder().setName('lock').setDescription('🔒 Verrouille le salon.')
  .addChannelOption(option => option.setName('salon').setDescription('Le salon à bloqué').setRequired(false)),
  new SlashCommandBuilder().setName('unlock').setDescription('🔓 Déverrouille le salon.')
  .addChannelOption(option => option.setName('salon').setDescription('Le salon à débloqué').setRequired(false)),
  new SlashCommandBuilder().setName('ticket').setDescription('🎫 Crée un ticket privé.'),
  new SlashCommandBuilder().setName('stats').setDescription('📊 Affiche les statistiques du serveur.'),
  new SlashCommandBuilder().setName('ban').setDescription('🚫 Bannir un membre.')
    .addUserOption(option => option.setName('membre').setDescription('Le membre à bannir').setRequired(true)),
  new SlashCommandBuilder().setName('mute').setDescription('🔇 Mute un utilisateur.')
    .addUserOption(option => option.setName('membre').setDescription('Le membre à mute').setRequired(true)),
  new SlashCommandBuilder().setName('unmute').setDescription('🔊 Démute un utilisateur.')
    .addUserOption(option => option.setName('membre').setDescription('Le membre à démute').setRequired(true)),
  new SlashCommandBuilder().setName('tempban').setDescription('⏳ Bannir temporairement un utilisateur.')
    .addUserOption(option => option.setName('membre').setDescription('Utilisateur à bannir').setRequired(true))
    .addIntegerOption(option => option.setName('temps').setDescription('Durée en minutes').setRequired(true)),
  new SlashCommandBuilder().setName('tempmute').setDescription('⏳ Mute temporairement un utilisateur.')
    .addUserOption(option => option.setName('membre').setDescription('Utilisateur à mute').setRequired(true))
    .addIntegerOption(option => option.setName('temps').setDescription('Durée en minutes').setRequired(true)),
  new SlashCommandBuilder().setName('novoc').setDescription('🚫 Interdire un utilisateur d’aller en vocal.')
    .addUserOption(option => option.setName('membre').setDescription('Utilisateur à bloquer').setRequired(true)),
  new SlashCommandBuilder().setName('yesvoc').setDescription('✅ Autoriser un utilisateur à aller en vocal.')
    .addUserOption(option => option.setName('membre').setDescription('Utilisateur à autoriser').setRequired(true)),
  new SlashCommandBuilder().setName('avertissement').setDescription('⚠️ Mettre un avertissement à un utilisateur.')
    .addUserOption(option => option.setName('membre').setDescription('Utilisateur à avertir').setRequired(true))
    .addStringOption(option => option.setName('raison').setDescription('Raison de l’avertissement').setRequired(false)),
  new SlashCommandBuilder().setName('clearmess').setDescription('🧹 Effacer tous les messages d’un utilisateur dans ce salon.')
    .addUserOption(option => option.setName('membre').setDescription('Utilisateur cible').setRequired(true)),
  new SlashCommandBuilder().setName('bienvenue').setDescription('👋 Envoie un message de bienvenue.')
    .addChannelOption(opt => opt.setName('salon').setDescription('Salon où envoyer le message').setRequired(false))
    .addStringOption(opt => opt.setName('message').setDescription('Message personnalisé').setRequired(false)),
  new SlashCommandBuilder().setName('giveaway').setDescription('🎉 Lance un giveaway.')
    .addStringOption(opt => opt.setName('lot').setDescription('Lot à gagner').setRequired(true))
    .addIntegerOption(opt => opt.setName('duree').setDescription('Durée en minutes').setRequired(true))
    .addIntegerOption(opt => opt.setName('gagnants').setDescription('Nombre de gagnants').setRequired(false))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.minazouki);

(async () => {
  try {
    console.log('🌀 Déploiement des commandes slash...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    console.log('✅ Commandes enregistrées avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors du déploiement :', error);
  }
})();
