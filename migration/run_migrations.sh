#!/bin/bash

# Script de migration pour exécuter les fichiers SQL dans l'ordre
# Usage: ./run_migrations.sh

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Répertoires
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_COMPOSE_DIR="$PROJECT_ROOT/docker"
MIGRATIONS_DIR="$PROJECT_ROOT/migration"

# Variables de connexion (par défaut depuis docker-compose.yml)
DB_NAME="tobacomit"
DB_USER="app"
DB_PASSWORD="root"
DB_ROOT_PASSWORD="root"

echo -e "${YELLOW}🔍 Recherche du container Docker MySQL...${NC}"

# Trouver le nom du container MySQL depuis docker-compose
cd "$DOCKER_COMPOSE_DIR"
CONTAINER_NAME=$(docker-compose ps -q db 2>/dev/null || echo "")

if [ -z "$CONTAINER_NAME" ]; then
    echo -e "${RED}❌ Erreur: Le container MySQL n'est pas en cours d'exécution${NC}"
    echo -e "${YELLOW}💡 Astuce: Lancez 'docker-compose up -d' dans le dossier docker/${NC}"
    exit 1
fi

# Vérifier que le container est bien démarré
CONTAINER_STATUS=$(docker inspect -f '{{.State.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "")
if [ "$CONTAINER_STATUS" != "running" ]; then
    echo -e "${RED}❌ Erreur: Le container MySQL n'est pas en cours d'exécution (statut: $CONTAINER_STATUS)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Container trouvé: $CONTAINER_NAME${NC}"

# Vérifier que le dossier de migrations existe
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}❌ Erreur: Le dossier de migrations n'existe pas: $MIGRATIONS_DIR${NC}"
    exit 1
fi

# Lister les fichiers SQL dans l'ordre numérique
echo -e "${YELLOW}📋 Recherche des fichiers de migration...${NC}"
MIGRATION_FILES=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort -V)

if [ -z "$MIGRATION_FILES" ]; then
    echo -e "${YELLOW}⚠️  Aucun fichier de migration trouvé dans $MIGRATIONS_DIR${NC}"
    exit 0
fi

# Compter les fichiers
MIGRATION_COUNT=$(echo "$MIGRATION_FILES" | wc -l | tr -d ' ')
echo -e "${GREEN}✅ $MIGRATION_COUNT fichier(s) de migration trouvé(s)${NC}"

# Exécuter chaque migration
SUCCESS_COUNT=0
FAILED_COUNT=0

while IFS= read -r migration_file; do
    if [ -f "$migration_file" ]; then
        filename=$(basename "$migration_file")
        echo -e "\n${YELLOW}📄 Exécution de: $filename${NC}"
        
        # Exécuter le fichier SQL dans le container
        if docker exec -i "$CONTAINER_NAME" mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$migration_file" 2>/dev/null; then
            echo -e "${GREEN}✅ Migration réussie: $filename${NC}"
            ((SUCCESS_COUNT++))
        else
            echo -e "${RED}❌ Erreur lors de l'exécution de: $filename${NC}"
            ((FAILED_COUNT++))
            # Optionnel: continuer ou arrêter
            # exit 1
        fi
    fi
done <<< "$MIGRATION_FILES"

# Résumé
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Migrations réussies: $SUCCESS_COUNT${NC}"
if [ $FAILED_COUNT -gt 0 ]; then
    echo -e "${RED}❌ Migrations échouées: $FAILED_COUNT${NC}"
    exit 1
else
    echo -e "${GREEN}🎉 Toutes les migrations ont été exécutées avec succès!${NC}"
fi
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

