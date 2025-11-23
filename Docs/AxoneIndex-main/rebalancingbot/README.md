# Bot de Rebalancement HyperEVM (ERA_2)

## Description

Ce bot automatise le processus de rebalancement sur HyperEVM testnet en appelant périodiquement la fonction `rebalancePortfolio(cloidToken1, cloidHype)` sur **plusieurs contrats** `CoreInteractionHandler` (ERA_2). Il envoie un **résumé unifié** via Telegram avec les résultats de tous les contrats après chaque cycle de rebalancement.

## Fonctionnalités

- 🔄 Appel automatique de `rebalancePortfolio(cloidToken1, cloidHype)` sur plusieurs contrats
- 📱 Notifications Telegram avec résumé unifié de tous les contrats
- 💰 Affichage de l'équité USD pour chaque contrat
- 🔒 Gestion sécurisée des clés privées via variables d'environnement
- 📊 Logs détaillés des transactions et des erreurs
- ⚙️ Configuration flexible (intervalle, paramètres de rebalancement)
- 🎯 Support de plusieurs contrats avec gestion d'erreurs indépendante

## Prérequis

- Python 3.10 ou supérieur
- Un portefeuille EVM enregistré comme rebalancer sur le contrat
- Un bot Telegram configuré
- Accès au réseau HyperEVM testnet

## Installation

1. Cloner le dépôt et naviguer vers le dossier du bot :
```bash
cd rebalancingbot
```

2. Installer les dépendances Python :
```bash
pip install -r requirements.txt
```

3. Créer le fichier de configuration `.env` :
```bash
touch .env
```

4. Éditer le fichier `.env` avec vos paramètres (voir section Configuration ci-dessous)

## Configuration

### Variables d'environnement obligatoires

| Variable | Description | Exemple |
|----------|-------------|---------|
| `RPC_URL` | URL du nœud RPC HyperEVM testnet | `https://rpc.hyperliquid-testnet.xyz/evm` |
| `PRIVATE_KEY` | Clé privée du portefeuille rebalancer | `0x...` (64 caractères hex) |
| `TELEGRAM_TOKEN` | Token du bot Telegram | Obtenu depuis @BotFather |
| `TELEGRAM_CHAT_ID` | ID du chat/utilisateur à notifier | Nombre ou @username |
| `HANDLER_ADDRESS_1` | Adresse du premier contrat CoreInteractionHandler | `0x...` (40 caractères hex) |

### Variables d'environnement optionnelles

| Variable | Description | Défaut |
|----------|-------------|--------|
| `REBALANCE_INTERVAL_MINUTES` | Intervalle entre chaque rebalancement (en minutes) | `60` |
| `CLOID_TOKEN1` | Paramètre cloidToken1 pour rebalancePortfolio | `0` |
| `CLOID_HYPE` | Paramètre cloidHype pour rebalancePortfolio | `0` |
| `UPSTASH_REDIS_REST_URL` | URL de l'API REST Redis (Upstash) pour stocker l'historique PPS | - |
| `UPSTASH_REDIS_REST_TOKEN` | Token d'authentification Redis (Upstash) | - |
| `PPS_RETENTION_DAYS` | Nombre de jours de rétention pour l'historique PPS | `90` |

### Configuration multi-contrats

Le bot supporte plusieurs contrats en utilisant des variables numérotées :

**Format pour chaque contrat :**
- `HANDLER_ADDRESS_N` : Adresse du contrat CoreInteractionHandler (obligatoire)
- `CORE_VIEWS_ADDRESS_N` : Adresse du contrat CoreInteractionViews (optionnel, pour récupérer l'équité)
- `VAULT_ADDRESS_N` : Adresse du contrat VaultContract (optionnel, pour enregistrer la PPS)
- `CONTRACT_NAME_N` : Nom du contrat pour les notifications (optionnel, défaut: "Contract N")

**Exemple de configuration :**

```env
# Configuration RPC et Wallet
RPC_URL=https://rpc.hyperliquid-testnet.xyz/evm
PRIVATE_KEY=votre_clé_privée_ici

# Configuration Telegram
TELEGRAM_TOKEN=votre_token_telegram
TELEGRAM_CHAT_ID=votre_chat_id

# Paramètres de rebalancement (optionnels)
REBALANCE_INTERVAL_MINUTES=60
CLOID_TOKEN1=0
CLOID_HYPE=0

# Configuration Redis (optionnel, pour enregistrer l'historique PPS)
UPSTASH_REDIS_REST_URL=https://votre-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=votre_token_redis
PPS_RETENTION_DAYS=90

# Contrat 1 (obligatoire)
HANDLER_ADDRESS_1=0x1234567890123456789012345678901234567890
CORE_VIEWS_ADDRESS_1=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
VAULT_ADDRESS_1=0x1111111111111111111111111111111111111111
CONTRACT_NAME_1=Vault Principal

# Contrat 2 (optionnel)
HANDLER_ADDRESS_2=0x9876543210987654321098765432109876543210
CORE_VIEWS_ADDRESS_2=0xfedcbafedcbafedcbafedcbafedcbafedcbafedc
VAULT_ADDRESS_2=0x2222222222222222222222222222222222222222
CONTRACT_NAME_2=Vault Secondaire

# Contrat 3 (optionnel)
HANDLER_ADDRESS_3=0x3333333333333333333333333333333333333333
# CORE_VIEWS_ADDRESS_3 non défini = pas d'affichage d'équité pour ce contrat
# VAULT_ADDRESS_3 non défini = pas d'enregistrement PPS pour ce contrat
CONTRACT_NAME_3=Vault Tertiaire
```

**Note :** Vous pouvez ajouter autant de contrats que nécessaire en suivant le pattern `HANDLER_ADDRESS_N`, `CORE_VIEWS_ADDRESS_N`, `VAULT_ADDRESS_N`, `CONTRACT_NAME_N`.

### Enregistrement de l'historique PPS

Le bot peut enregistrer automatiquement la PPS (Price Per Share) de chaque vault dans Redis après chaque rebalancing réussi. Cela permet au site web de suivre la performance des vaults dans le temps.

**Configuration requise :**
- `UPSTASH_REDIS_REST_URL` : URL de l'API REST Redis (Upstash)
- `UPSTASH_REDIS_REST_TOKEN` : Token d'authentification
- `VAULT_ADDRESS_N` : Adresse du vault pour chaque contrat (optionnel)

**Structure des données Redis :**
- Clé : `pps:{vault_address}` (adresse en minuscules)
- Format : Liste de JSON avec `{"timestamp": 1234567890, "pps": "1.2345", "blockNumber": 12345, "txHash": "0x..."}`
- Les entrées sont triées du plus récent au plus ancien
- Nettoyage automatique des entrées plus anciennes que `PPS_RETENTION_DAYS` (défaut: 90 jours)

**API pour récupérer l'historique :**
- `GET /api/vaults/{id}/pps?limit=100` : Récupère l'historique PPS d'un vault
  - `{id}` peut être un vault ID (ex: "Era-1") ou une adresse de vault
  - `limit` : nombre maximum d'entrées (optionnel)

### Configuration Telegram

1. Créer un bot avec @BotFather sur Telegram
2. Récupérer le token du bot
3. Envoyer un message au bot
4. Obtenir le chat ID via : `https://api.telegram.org/bot<TOKEN>/getUpdates`

## Utilisation

### Développement

Lancer le bot en mode développement :
```bash
python bot.py
```

Le bot effectuera immédiatement un rebalancement pour tous les contrats configurés au démarrage, puis selon l'intervalle configuré (par défaut toutes les 60 minutes).

### Production

#### Option 1 : Service systemd (Linux)

1. Créer un fichier service :
```bash
sudo nano /etc/systemd/system/rebalancing-bot.service
```

2. Ajouter la configuration :
```ini
[Unit]
Description=HyperEVM Rebalancing Bot
After=network.target

[Service]
Type=simple
User=votre_utilisateur
WorkingDirectory=/chemin/vers/rebalancingbot
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/python3 /chemin/vers/rebalancingbot/bot.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

3. Démarrer et activer le service :
```bash
sudo systemctl daemon-reload
sudo systemctl enable rebalancing-bot
sudo systemctl start rebalancing-bot
```

#### Option 2 : Docker

1. Créer un Dockerfile :
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY bot.py .
CMD ["python", "bot.py"]
```

2. Construire et lancer :
```bash
docker build -t rebalancing-bot .
docker run -d --env-file .env --name rebalancing-bot rebalancing-bot
```

#### Option 3 : PM2

```bash
pm2 start bot.py --name rebalancing-bot --interpreter python3
pm2 save
pm2 startup
```

## Sécurité

⚠️ **IMPORTANT** : 
- **Ne jamais commiter le fichier `.env`** contenant votre clé privée
- Utiliser un fichier `.gitignore` pour exclure `.env`
- Conserver des sauvegardes sécurisées de votre clé privée
- Utiliser des permissions restrictives sur le fichier `.env` : `chmod 600 .env`
- En production, considérer l'utilisation d'un gestionnaire de secrets (AWS Secrets Manager, HashiCorp Vault, etc.)

## Architecture

Le bot utilise les composants suivants :
- **web3.py** : Interaction avec la blockchain HyperEVM
- **schedule** : Planification des tâches périodiques
- **requests** : Envoi des notifications Telegram
- **python-dotenv** : Gestion des variables d'environnement

### Flux d'exécution

1. Chargement de la configuration depuis `.env`
2. Connexion au nœud RPC HyperEVM
3. Chargement dynamique de tous les contrats configurés (`HANDLER_ADDRESS_1`, `HANDLER_ADDRESS_2`, etc.)
4. Initialisation des contrats `CoreInteractionHandler` et `CoreInteractionViews` (si configurés)
5. À chaque intervalle configuré :
   - Pour chaque contrat :
     - Appel de `rebalancePortfolio(cloidToken1, cloidHype)`
     - Récupération de l'équité USD (si `CORE_VIEWS_ADDRESS_N` est configuré)
     - Collecte des résultats (succès/échec, tx hash, gas, équité)
   - Génération d'un message Telegram récapitulatif avec tous les contrats
   - Envoi de la notification Telegram
   - Logging des résultats dans la console

### Format des notifications Telegram

Le bot envoie un message récapitulatif unique contenant :
- **En-tête** : Horodatage et résumé global (succès/échecs)
- **Détails par contrat** : Pour chaque contrat :
  - Nom du contrat
  - Statut (✅ succès / ❌ échec)
  - Hash de la transaction
  - Gas utilisé
  - Numéro de block
  - Équité USD (si disponible)
  - Message d'erreur (si échec)

## Dépannage

### Le bot ne se connecte pas au RPC
- Vérifier que l'URL RPC est correcte
- Tester la connexion : `curl <RPC_URL>`
- Vérifier la connectivité réseau

### Erreur d'estimation de gas
- Vérifier que l'adresse du portefeuille est bien enregistrée comme rebalancer sur chaque contrat
- S'assurer que le portefeuille a suffisamment d'ETH pour les frais
- Vérifier les adresses des contrats handlers
- Si un contrat échoue, les autres continueront à être rebalancés

### Notifications Telegram non reçues
- Vérifier le token et le chat ID
- S'assurer que le bot est démarré sur Telegram
- Tester manuellement : `https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>&text=test`

## Logs

Le bot affiche des logs dans la console avec :
- Liste des contrats chargés au démarrage
- Horodatage de chaque cycle de rebalancement
- Pour chaque contrat : hash des transactions, statut de succès/échec
- Messages d'erreur détaillés par contrat
- Résumé final (nombre de succès/échecs)

**Exemple de logs :**
```
Bot initialisé avec l'adresse: 0x...
RPC: https://rpc.hyperliquid-testnet.xyz/evm
Intervalle de rebalancement: 60 minutes
Paramètres: cloidToken1=0, cloidHype=0
  ✓ Vault Principal: 0x1234...
    Views: 0xabcd...
  ✓ Vault Secondaire: 0x5678...

2 contrat(s) chargé(s)

[2024-01-01 12:00:00] Début du rebalancement pour 2 contrat(s)...
  [Vault Principal] Transaction envoyée: 0x...
  [Vault Principal] ✅ Rebalancement réussi
  [Vault Secondaire] Transaction envoyée: 0x...
  [Vault Secondaire] ✅ Rebalancement réussi
Notification Telegram envoyée

Résumé: 2/2 rebalancement(s) réussi(s)
```

Pour conserver les logs en production :
```bash
python bot.py >> rebalancing.log 2>&1
```

## Support

Pour toute question ou problème :
1. Vérifier les logs pour les messages d'erreur
2. S'assurer que toutes les variables d'environnement sont correctement configurées
3. Consulter la documentation HyperEVM testnet

## Licence

Ce projet est fourni tel quel, sans garantie d'aucune sorte.