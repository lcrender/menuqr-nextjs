#!/bin/bash

# ========================================
# MenuQR - Script de Backup de Base de Datos
# ========================================

# Configuración
DB_NAME="menuqr"
DB_USER="menuqr_user"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/menuqr_backup_${DATE}.sql"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
print_message() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIONES]"
    echo ""
    echo "Opciones:"
    echo "  -h, --help          Mostrar esta ayuda"
    echo "  -d, --database      Nombre de la base de datos (default: menuqr)"
    echo "  -u, --user          Usuario de la base de datos (default: menuqr_user)"
    echo "  -H, --host          Host de la base de datos (default: localhost)"
    echo "  -p, --port          Puerto de la base de datos (default: 5432)"
    echo "  -o, --output        Directorio de salida (default: ./backups)"
    echo "  -c, --compress      Comprimir el backup (gzip)"
    echo "  -v, --verbose       Modo verbose"
    echo ""
    echo "Ejemplos:"
    echo "  $0                                    # Backup básico"
    echo "  $0 -d mi_db -u mi_user               # Backup con parámetros personalizados"
    echo "  $0 -c -v                             # Backup comprimido con verbose"
    echo ""
}

# Variables por defecto
COMPRESS=false
VERBOSE=false

# Parsear argumentos de línea de comandos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--database)
            DB_NAME="$2"
            shift 2
            ;;
        -u|--user)
            DB_USER="$2"
            shift 2
            ;;
        -H|--host)
            DB_HOST="$2"
            shift 2
            ;;
        -p|--port)
            DB_PORT="$2"
            shift 2
            ;;
        -o|--output)
            BACKUP_DIR="$2"
            shift 2
            ;;
        -c|--compress)
            COMPRESS=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            print_error "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Verificar si pg_dump está disponible
if ! command -v pg_dump &> /dev/null; then
    print_error "pg_dump no está instalado o no está en el PATH"
    print_error "Instala PostgreSQL client tools para continuar"
    exit 1
fi

# Crear directorio de backup si no existe
if [ ! -d "$BACKUP_DIR" ]; then
    print_message "Creando directorio de backup: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Verificar conexión a la base de datos
print_message "Verificando conexión a la base de datos..."
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" &> /dev/null; then
    print_error "No se puede conectar a la base de datos"
    print_error "Host: $DB_HOST, Puerto: $DB_PORT, Usuario: $DB_USER, DB: $DB_NAME"
    exit 1
fi

print_success "Conexión a la base de datos establecida"

# Generar nombre del archivo de backup
if [ "$COMPRESS" = true ]; then
    BACKUP_FILE="${BACKUP_DIR}/menuqr_backup_${DATE}.sql.gz"
else
    BACKUP_FILE="${BACKUP_DIR}/menuqr_backup_${DATE}.sql"
fi

# Comando de backup base
BACKUP_CMD="pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"

# Agregar opciones según parámetros
if [ "$VERBOSE" = true ]; then
    BACKUP_CMD="$BACKUP_CMD -v"
fi

# Agregar compresión si se solicita
if [ "$COMPRESS" = true ]; then
    BACKUP_CMD="$BACKUP_CMD | gzip > $BACKUP_FILE"
else
    BACKUP_CMD="$BACKUP_CMD > $BACKUP_FILE"
fi

# Ejecutar backup
print_message "Iniciando backup de la base de datos..."
print_message "Archivo de salida: $BACKUP_FILE"

if [ "$VERBOSE" = true ]; then
    print_message "Comando: $BACKUP_CMD"
fi

# Ejecutar el comando
if eval $BACKUP_CMD; then
    print_success "Backup completado exitosamente"
    
    # Mostrar información del archivo
    if [ "$COMPRESS" = true ]; then
        FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        print_message "Tamaño del archivo: $FILE_SIZE"
    else
        FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        print_message "Tamaño del archivo: $FILE_SIZE"
    fi
    
    print_message "Archivo guardado en: $BACKUP_FILE"
    
    # Limpiar backups antiguos (mantener solo los últimos 10)
    print_message "Limpiando backups antiguos..."
    cd "$BACKUP_DIR"
    ls -t menuqr_backup_*.sql* | tail -n +11 | xargs -r rm -f
    print_success "Limpieza completada"
    
else
    print_error "Error durante el backup"
    exit 1
fi

# Mostrar resumen
echo ""
print_success "Resumen del backup:"
echo "  📅 Fecha: $(date)"
echo "  🗄️  Base de datos: $DB_NAME"
echo "  👤 Usuario: $DB_USER"
echo "  🌐 Host: $DB_HOST:$DB_PORT"
echo "  📁 Archivo: $BACKUP_FILE"
echo "  📏 Tamaño: $FILE_SIZE"
echo "  🗜️  Comprimido: $([ "$COMPRESS" = true ] && echo "Sí" || echo "No")"

print_success "Backup completado exitosamente! 🎉"

