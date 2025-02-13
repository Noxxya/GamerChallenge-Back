# Installation

```bash
# Cloner le projet
git clone git@github.com:O-clock-Quesadillas/gamer-challenges-back.git
# Se déplacer dans le projet
cd gamer-challenges-back/

# Ouvrir le projet dans VSCode
code .

# Installer les dépendances back

npm install

```

## Mise en place de la base de données

```bash
# Se connecter à son client Postgres
sudo -i -u postgres psql

# Créer un utilisateur de base de données
CREATE USER admin_gamer WITH LOGIN PASSWORD 'gamer';

# Créer une base de données 
CREATE DATABASE gamer WITH OWNER admin_gamer;

# Quitter psql
exit
```

## Mise en place de l'environnement de développement

```bash
# Créer un fichier d'environnement backend
cp .env

# Ajuster les valeurs du fichier .env
code .env

# Lancer les scripts de création de tables et d'échantillonnage
npm run db:reset
```
