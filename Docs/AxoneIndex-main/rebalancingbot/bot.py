#!/usr/bin/env python3
"""
Bot de rebalancement pour HyperEVM testnet (ERA_2)
Appelle périodiquement rebalancePortfolio(cloidToken1, cloidHype) sur plusieurs contrats CoreInteractionHandler
et envoie des notifications Telegram avec un résumé unifié des résultats.
"""

import os
import time
import schedule
import requests
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from web3 import Web3
from web3.middleware import geth_poa_middleware
from eth_account import Account
from typing import List, Dict, Optional, Tuple

# Charger les variables d'environnement
load_dotenv()

# Configuration globale
RPC_URL = os.getenv('RPC_URL')
PRIVATE_KEY = os.getenv('PRIVATE_KEY')
TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')

# Paramètres configurables
REBALANCE_INTERVAL_MINUTES = int(os.getenv('REBALANCE_INTERVAL_MINUTES', '60'))
CLOID_TOKEN1 = int(os.getenv('CLOID_TOKEN1', '0'))
CLOID_HYPE = int(os.getenv('CLOID_HYPE', '0'))

# Configuration Redis (Upstash)
UPSTASH_REDIS_REST_URL = os.getenv('UPSTASH_REDIS_REST_URL')
UPSTASH_REDIS_REST_TOKEN = os.getenv('UPSTASH_REDIS_REST_TOKEN')
PPS_RETENTION_DAYS = int(os.getenv('PPS_RETENTION_DAYS', '90'))

# Vérifier les variables obligatoires
if not all([RPC_URL, PRIVATE_KEY, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID]):
    raise ValueError("Les variables RPC_URL, PRIVATE_KEY, TELEGRAM_TOKEN et TELEGRAM_CHAT_ID doivent être définies dans le fichier .env")

# ABI minimal du contrat CoreInteractionHandler (ERA_2)
HANDLER_ABI = [
    {
        "inputs": [
            {"internalType": "uint128", "name": "cloidToken1", "type": "uint128"},
            {"internalType": "uint128", "name": "cloidHype", "type": "uint128"}
        ],
        "name": "rebalancePortfolio",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "usdcCoreTokenId",
        "outputs": [{"internalType": "uint64", "name": "", "type": "uint64"}],
        "stateMutability": "view",
        "type": "function"
    }
]

VIEWS_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "handler", "type": "address"}],
        "name": "equitySpotUsd1e18",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
]

# ABI minimal du contrat VaultContract (ERA_2)
VAULT_ABI = [
    {
        "inputs": [],
        "name": "pps1e18",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
]

# Initialiser Web3
web3 = Web3(Web3.HTTPProvider(RPC_URL))

# Ajouter le middleware POA si nécessaire (pour certains réseaux de test)
web3.middleware_onion.inject(geth_poa_middleware, layer=0)

# Vérifier la connexion
if not web3.is_connected():
    raise ConnectionError(f"Impossible de se connecter au nœud RPC: {RPC_URL}")

# Obtenir l'adresse publique à partir de la clé privée
account = Account.from_key(PRIVATE_KEY)
public_address = account.address

print(f"Bot initialisé avec l'adresse: {public_address}")
print(f"RPC: {RPC_URL}")
print(f"Intervalle de rebalancement: {REBALANCE_INTERVAL_MINUTES} minutes")
print(f"Paramètres: cloidToken1={CLOID_TOKEN1}, cloidHype={CLOID_HYPE}")


def load_contracts() -> List[Dict]:
    """
    Charge dynamiquement tous les contrats depuis les variables d'environnement.
    Format attendu: HANDLER_ADDRESS_1, HANDLER_ADDRESS_2, etc.
    Optionnel: CORE_VIEWS_ADDRESS_N, CONTRACT_NAME_N, VAULT_ADDRESS_N
    """
    contracts = []
    index = 1
    
    while True:
        handler_address = os.getenv(f'HANDLER_ADDRESS_{index}')
        if not handler_address:
            # Plus de contrats à charger
            break
        
        # Nom du contrat (optionnel)
        contract_name = os.getenv(f'CONTRACT_NAME_{index}', f'Contract {index}')
        
        # Adresse du contrat views (optionnel)
        views_address = os.getenv(f'CORE_VIEWS_ADDRESS_{index}')
        
        # Adresse du vault (optionnel, pour récupérer la PPS)
        vault_address = os.getenv(f'VAULT_ADDRESS_{index}')
        
        # Initialiser le contrat handler
        handler_contract = web3.eth.contract(
            address=Web3.to_checksum_address(handler_address),
            abi=HANDLER_ABI
        )
        
        # Initialiser le contrat views si fourni
        views_contract = None
        if views_address:
            views_contract = web3.eth.contract(
                address=Web3.to_checksum_address(views_address),
                abi=VIEWS_ABI
            )
        
        # Initialiser le contrat vault si fourni
        vault_contract = None
        if vault_address:
            vault_contract = web3.eth.contract(
                address=Web3.to_checksum_address(vault_address),
                abi=VAULT_ABI
            )
        
        contract_info = {
            'name': contract_name,
            'handler_address': handler_address,
            'views_address': views_address,
            'vault_address': vault_address,
            'handler_contract': handler_contract,
            'views_contract': views_contract,
            'vault_contract': vault_contract
        }
        
        contracts.append(contract_info)
        print(f"  ✓ {contract_name}: {handler_address}")
        if views_address:
            print(f"    Views: {views_address}")
        if vault_address:
            print(f"    Vault: {vault_address}")
        
        index += 1
    
    if not contracts:
        raise ValueError("Aucun contrat trouvé. Définissez au moins HANDLER_ADDRESS_1 dans le fichier .env")
    
    print(f"\n{len(contracts)} contrat(s) chargé(s)")
    return contracts


# Charger tous les contrats au démarrage
CONTRACTS = load_contracts()


def redis_request(command: List) -> Optional[Dict]:
    """
    Envoie une requête à Redis via l'API REST d'Upstash.
    Retourne None en cas d'erreur.
    """
    if not UPSTASH_REDIS_REST_URL or not UPSTASH_REDIS_REST_TOKEN:
        return None
    
    try:
        response = requests.post(
            UPSTASH_REDIS_REST_URL,
            headers={
                'Authorization': f'Bearer {UPSTASH_REDIS_REST_TOKEN}',
                'Content-Type': 'application/json'
            },
            json=command,
            timeout=5
        )
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Erreur Redis: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Erreur lors de la requête Redis: {e}")
        return None


def get_pps(contract_info: Dict) -> Optional[float]:
    """
    Récupère la PPS (Price Per Share) depuis le VaultContract.
    Retourne None si le vault n'est pas configuré ou en cas d'erreur.
    """
    try:
        if contract_info['vault_contract'] is None:
            return None
        
        pps_raw = contract_info['vault_contract'].functions.pps1e18().call()
        pps = pps_raw / 1e18
        return pps
    except Exception as e:
        print(f"Erreur lors de la récupération de la PPS pour {contract_info['name']}: {e}")
        return None


def store_pps_redis(vault_address: str, pps: float, timestamp: int, block_number: int, tx_hash: str) -> bool:
    """
    Enregistre la PPS dans Redis (liste par vault).
    Retourne True si succès, False sinon.
    """
    if not vault_address:
        return False
    
    # Créer l'entrée JSON
    entry = {
        "timestamp": timestamp,
        "pps": str(pps),
        "blockNumber": block_number,
        "txHash": tx_hash
    }
    entry_json = json.dumps(entry)
    
    # Clé Redis: pps:{vault_address}
    key = f"pps:{vault_address.lower()}"
    
    # Ajouter en tête de liste avec LPUSH
    result = redis_request(["LPUSH", key, entry_json])
    if result is None:
        return False
    
    return True


def cleanup_old_pps_entries(vault_address: str) -> None:
    """
    Nettoie les entrées PPS plus anciennes que PPS_RETENTION_DAYS.
    """
    if not vault_address:
        return
    
    key = f"pps:{vault_address.lower()}"
    cutoff_timestamp = int((datetime.now() - timedelta(days=PPS_RETENTION_DAYS)).timestamp())
    
    # Récupérer toutes les entrées
    result = redis_request(["LRANGE", key, "0", "-1"])
    if result is None or 'result' not in result:
        return
    
    entries = result['result']
    if not entries:
        return
    
    # Filtrer les entrées à garder (plus récentes que cutoff_timestamp)
    entries_to_keep = []
    for entry_json in entries:
        try:
            entry = json.loads(entry_json)
            if entry.get('timestamp', 0) >= cutoff_timestamp:
                entries_to_keep.append(entry_json)
        except:
            # Ignorer les entrées invalides
            continue
    
    # Si toutes les entrées sont à garder, ne rien faire
    if len(entries_to_keep) == len(entries):
        return
    
    # Supprimer la liste et la recréer avec les entrées à garder
    if entries_to_keep:
        # Supprimer la clé
        redis_request(["DEL", key])
        # Recréer avec les entrées à garder (dans l'ordre inverse pour garder le plus récent en premier)
        for entry_json in reversed(entries_to_keep):
            redis_request(["LPUSH", key, entry_json])
    else:
        # Supprimer la clé si aucune entrée à garder
        redis_request(["DEL", key])


def send_telegram_message(message: str):
    """Envoie un message via Telegram"""
    try:
        response = requests.get(
            f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
            params={
                "chat_id": TELEGRAM_CHAT_ID,
                "text": message,
                "parse_mode": "HTML"
            },
            timeout=10
        )
        if response.status_code != 200:
            print(f"Erreur Telegram: {response.text}")
    except Exception as e:
        print(f"Erreur lors de l'envoi du message Telegram: {e}")


def get_equity(contract_info: Dict) -> Optional[float]:
    """
    Récupère l'équité USD depuis Hyper Core pour un contrat donné.
    Retourne None si le contrat views n'est pas configuré ou en cas d'erreur.
    """
    try:
        if contract_info['views_contract'] is None:
            return None
        
        equity_raw = contract_info['views_contract'].functions.equitySpotUsd1e18(
            Web3.to_checksum_address(contract_info['handler_address'])
        ).call()
        equity_usd = equity_raw / 1e18
        return equity_usd
    except Exception as e:
        print(f"Erreur lors de la récupération de l'équité pour {contract_info['name']}: {e}")
        return None


def rebalance_contract(contract_info: Dict, cloid_token1: int, cloid_hype: int) -> Dict:
    """
    Exécute le rebalancement pour un contrat donné.
    Retourne un dictionnaire avec les résultats.
    """
    result = {
        'name': contract_info['name'],
        'handler_address': contract_info['handler_address'],
        'vault_address': contract_info.get('vault_address'),
        'success': False,
        'tx_hash': None,
        'gas_used': None,
        'block_number': None,
        'equity_usd': None,
        'pps': None,
        'error': None
    }
    
    try:
        handler_contract = contract_info['handler_contract']
        
        # Récupérer le nonce
        nonce = web3.eth.get_transaction_count(public_address)
        
        # Estimer le gas
        gas_estimate = handler_contract.functions.rebalancePortfolio(
            cloid_token1, cloid_hype
        ).estimate_gas({'from': public_address})
        
        # Obtenir le prix du gas
        gas_price = web3.eth.gas_price
        
        # Construire la transaction
        transaction = handler_contract.functions.rebalancePortfolio(
            cloid_token1, cloid_hype
        ).build_transaction({
            'from': public_address,
            'nonce': nonce,
            'gas': int(gas_estimate * 1.2),  # Ajouter 20% de marge
            'gasPrice': gas_price,
        })
        
        # Signer la transaction
        signed_txn = web3.eth.account.sign_transaction(transaction, private_key=PRIVATE_KEY)
        
        # Envoyer la transaction
        tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)
        result['tx_hash'] = tx_hash.hex()
        print(f"  [{contract_info['name']}] Transaction envoyée: {tx_hash.hex()}")
        
        # Attendre le reçu
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
        result['gas_used'] = receipt.gasUsed
        result['block_number'] = receipt.blockNumber
        result['success'] = receipt.status == 1
        
        # Récupérer l'équité après le rebalancement
        result['equity_usd'] = get_equity(contract_info)
        
        # Récupérer la PPS si le rebalancement a réussi et que le vault est configuré
        if receipt.status == 1 and contract_info.get('vault_address'):
            pps = get_pps(contract_info)
            result['pps'] = pps
            
            if pps is not None:
                # Enregistrer la PPS dans Redis
                timestamp = int(time.time())
                tx_hash_str = tx_hash.hex()
                if store_pps_redis(contract_info['vault_address'], pps, timestamp, receipt.blockNumber, tx_hash_str):
                    print(f"  [{contract_info['name']}] PPS enregistrée: {pps:.18f}")
                    # Nettoyer les anciennes entrées
                    cleanup_old_pps_entries(contract_info['vault_address'])
                else:
                    print(f"  [{contract_info['name']}] ⚠️ Échec de l'enregistrement PPS dans Redis")
        
        if receipt.status == 1:
            print(f"  [{contract_info['name']}] ✅ Rebalancement réussi")
        else:
            print(f"  [{contract_info['name']}] ❌ Rebalancement échoué (status: {receipt.status})")
            
    except Exception as e:
        result['error'] = str(e)
        print(f"  [{contract_info['name']}] ❌ Erreur: {e}")
        
        # Essayer quand même de récupérer l'équité
        result['equity_usd'] = get_equity(contract_info)
    
    return result


def format_telegram_message(results: List[Dict], timestamp: str) -> str:
    """
    Génère un message Telegram récapitulatif avec tous les résultats.
    """
    success_count = sum(1 for r in results if r['success'])
    failure_count = len(results) - success_count
    
    # En-tête
    message = f"🔄 <b>Rebalancement - {timestamp}</b>\n\n"
    
    # Résumé global
    if success_count == len(results):
        message += "✅ <b>Tous les rebalancements ont réussi</b>\n\n"
    elif success_count > 0:
        message += f"⚠️ <b>Résultats mixtes:</b> {success_count} succès, {failure_count} échec(s)\n\n"
    else:
        message += "❌ <b>Tous les rebalancements ont échoué</b>\n\n"
    
    # Détails par contrat
    message += "📊 <b>Détails par contrat:</b>\n\n"
    
    for result in results:
        status_emoji = "✅" if result['success'] else "❌"
        message += f"{status_emoji} <b>{result['name']}</b>\n"
        message += f"   📍 Handler: <code>{result['handler_address']}</code>\n"
        
        if result['tx_hash']:
            message += f"   📊 Tx: <code>{result['tx_hash']}</code>\n"
        
        if result['gas_used'] is not None:
            message += f"   ⛽ Gas: {result['gas_used']:,}\n"
        
        if result['block_number'] is not None:
            message += f"   🔢 Block: {result['block_number']:,}\n"
        
        if result['equity_usd'] is not None:
            message += f"   💰 Équité: ${result['equity_usd']:,.2f}\n"
        
        if result['error']:
            message += f"   🚫 Erreur: {result['error']}\n"
        
        message += "\n"
    
    return message


def rebalance_all():
    """Fonction principale de rebalancement pour tous les contrats"""
    timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
    print(f"\n[{timestamp}] Début du rebalancement pour {len(CONTRACTS)} contrat(s)...")
    
    results = []
    
    # Rebalancer chaque contrat
    for contract_info in CONTRACTS:
        result = rebalance_contract(contract_info, CLOID_TOKEN1, CLOID_HYPE)
        results.append(result)
    
    # Générer et envoyer le message Telegram
    message = format_telegram_message(results, timestamp)
    send_telegram_message(message)
    print("Notification Telegram envoyée")
    
    # Afficher un résumé dans les logs
    success_count = sum(1 for r in results if r['success'])
    print(f"\nRésumé: {success_count}/{len(results)} rebalancement(s) réussi(s)")


def main():
    """Fonction principale"""
    print("\n🤖 Bot de rebalancement multi-contrats démarré")
    print(f"📅 Exécution prévue toutes les {REBALANCE_INTERVAL_MINUTES} minutes")
    print(f"📋 {len(CONTRACTS)} contrat(s) configuré(s)\n")
    
    # Exécuter immédiatement au démarrage
    rebalance_all()
    
    # Planifier l'exécution selon l'intervalle configuré
    schedule.every(REBALANCE_INTERVAL_MINUTES).minutes.do(rebalance_all)
    
    # Boucle principale
    while True:
        schedule.run_pending()
        time.sleep(1)


if __name__ == "__main__":
    main()
