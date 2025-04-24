#!/usr/bin/env node

/**
 * Script pour démarrer l'application en mode développement
 * avec rechargement automatique grâce à nodemon
 */

const { spawn } = require('child_process');
const path = require('path');

// Chemin vers le fichier de démarrage de l'application
const appPath = path.join(__dirname, '../bin/www');

// Options pour nodemon
const nodemonArgs = [
  appPath,
  '--ext',
  'js,json,hbs',
  '--ignore',
  'node_modules/',
  '--ignore',
  'public/',
];

// Démarrer nodemon
const nodemon = spawn('npx', ['nodemon', ...nodemonArgs], {
  stdio: 'inherit',
  shell: true,
});

// Gestion des erreurs
nodemon.on('error', (err) => {
  console.error('Erreur lors du démarrage de nodemon:', err);
  process.exit(1);
});

// Message de démarrage
console.log('Application démarrée en mode développement avec nodemon');
console.log('Appuyez sur Ctrl+C pour arrêter');
