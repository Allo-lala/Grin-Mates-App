#!/bin/bash

# Database Migration Runner
# Usage: ./run-migration.sh [up|down] [migration_number]

set -e

# Default values
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-grin_mates}"
DB_USER="${DB_USER:-postgres}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if psql is available
if ! command -v psql &> /dev/null; then
    print_error "psql command not found. Please install PostgreSQL client."
    exit 1
fi

# Get command
COMMAND=$1
MIGRATION_NUM=${2:-001}

if [ -z "$COMMAND" ]; then
    echo "Usage: $0 [up|down|list] [migration_number]"
    echo ""
    echo "Commands:"
    echo "  up    - Apply migration"
    echo "  down  - Rollback migration"
    echo "  list  - List available migrations"
    echo ""
    echo "Examples:"
    echo "  $0 up 001       - Apply migration 001"
    echo "  $0 down 001     - Rollback migration 001"
    echo "  $0 list         - List all migrations"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"

case $COMMAND in
    up)
        MIGRATION_FILE="$MIGRATIONS_DIR/${MIGRATION_NUM}_create_verification_sessions.sql"
        
        if [ ! -f "$MIGRATION_FILE" ]; then
            print_error "Migration file not found: $MIGRATION_FILE"
            exit 1
        fi
        
        print_info "Applying migration ${MIGRATION_NUM}..."
        print_info "Database: $DB_NAME on $DB_HOST:$DB_PORT"
        
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"; then
            print_success "Migration ${MIGRATION_NUM} applied successfully"
        else
            print_error "Migration ${MIGRATION_NUM} failed"
            exit 1
        fi
        ;;
        
    down)
        ROLLBACK_FILE="$MIGRATIONS_DIR/${MIGRATION_NUM}_create_verification_sessions_rollback.sql"
        
        if [ ! -f "$ROLLBACK_FILE" ]; then
            print_error "Rollback file not found: $ROLLBACK_FILE"
            exit 1
        fi
        
        print_info "Rolling back migration ${MIGRATION_NUM}..."
        print_info "Database: $DB_NAME on $DB_HOST:$DB_PORT"
        
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$ROLLBACK_FILE"; then
            print_success "Migration ${MIGRATION_NUM} rolled back successfully"
        else
            print_error "Rollback of migration ${MIGRATION_NUM} failed"
            exit 1
        fi
        ;;
        
    list)
        print_info "Available migrations:"
        echo ""
        
        for file in "$MIGRATIONS_DIR"/*[0-9]*.sql; do
            if [[ ! "$file" =~ rollback ]]; then
                filename=$(basename "$file")
                echo "  - $filename"
            fi
        done
        echo ""
        ;;
        
    *)
        print_error "Unknown command: $COMMAND"
        echo "Use: $0 [up|down|list] [migration_number]"
        exit 1
        ;;
esac
