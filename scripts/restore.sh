#!/bin/bash

# ========================================
# MenuQR - Script de Restore de Base de Datos
# ========================================

# Configuración por defecto
DB_NAME="menuqr"
DB_USER="menuqr_user"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_FILE=""

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
    echo "Uso: $0 [OPCIONES] ARCHIVO_BACKUP"
    echo ""
    echo "Opciones:"
    echo "  -h, --help          Mostrar esta ayuda"
    echo "  -d, --database      Nombre de la base de datos (default: menuqr)"
    echo "  -u, --user          Usuario de la base de datos (default: menuqr_user)"
    echo "  -H, --host          Host de la base de datos (default: localhost)"
    echo "  -p, --port          Puerto de la base de datos (default: 5432)"
    echo "  -f, --force         Forzar restore sin confirmación"
    echo "  -v, --verbose       Modo verbose"
    echo "  -c, --create        Crear la base de datos si no existe"
    echo ""
    echo "Argumentos:"
    echo "  ARCHIVO_BACKUP      Archivo de backup a restaurar (.sql o .sql.gz)"
    echo ""
    echo "Ejemplos:"
    echo "  $0 backup.sql                           # Restore básico"
    echo "  $0 -d mi_db backup.sql                  # Restore a base de datos específica"
    echo "  $0 -f -v backup.sql.gz                  # Restore forzado con verbose"
    echo "  $0 -c backup.sql                        # Crear DB si no existe"
    echo ""
}

# Variables por defecto
FORCE=false
VERBOSE=false
CREATE_DB=false

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
        -f|--force)
            FORCE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -c|--create)
            CREATE_DB=true
            shift
            ;;
        -*)
            print_error "Opción desconocida: $1"
            show_help
            exit 1
            ;;
        *)
            if [ -z "$BACKUP_FILE" ]; then
                BACKUP_FILE="$1"
            else
                print_error "Solo se puede especificar un archivo de backup"
                exit 1
            fi
            shift
            ;;
    esac
done

# Verificar que se especifique un archivo de backup
if [ -z "$BACKUP_FILE" ]; then
    print_error "Debe especificar un archivo de backup"
    show_help
    exit 1
fi

# Verificar que el archivo de backup existe
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "El archivo de backup no existe: $BACKUP_FILE"
    exit 1
fi

# Verificar si psql está disponible
if ! command -v psql &> /dev/null; then
    print_error "psql no está instalado o no está en el PATH"
    print_error "Instala PostgreSQL client tools para continuar"
    exit 1
fi

# Verificar si pg_restore está disponible (para archivos comprimidos)
if [[ "$BACKUP_FILE" == *.gz ]] && ! command -v pg_restore &> /dev/null; then
    print_warning "pg_restore no está disponible, usando psql con gunzip"
fi

# Mostrar información del restore
echo ""
print_message "=== RESTORE DE BASE DE DATOS MENUQR ==="
echo "  📁 Archivo de backup: $BACKUP_FILE"
echo "  🗄️  Base de datos destino: $DB_NAME"
echo "  👤 Usuario: $DB_USER"
echo "  🌐 Host: $DB_HOST:$DB_PORT"
echo "  🗜️  Comprimido: $([[ "$BACKUP_FILE" == *.gz ]] && echo "Sí" || echo "No")"
echo "  🔧 Crear DB: $([ "$CREATE_DB" = true ] && echo "Sí" || echo "No")"
echo "  ⚠️  Forzado: $([ "$FORCE" = true ] && echo "Sí" || echo "No")"
echo ""

# Confirmación del usuario (a menos que esté forzado)
if [ "$FORCE" = false ]; then
    print_warning "⚠️  ADVERTENCIA: Esta operación sobrescribirá la base de datos $DB_NAME"
    print_warning "Todos los datos existentes se perderán permanentemente"
    echo ""
    read -p "¿Está seguro de que desea continuar? (sí/no): " -r
    if [[ ! $REPLY =~ ^[Ss][Ii]$ ]]; then
        print_message "Operación cancelada por el usuario"
        exit 0
    fi
    echo ""
fi

# Verificar conexión a PostgreSQL
print_message "Verificando conexión a PostgreSQL..."
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" &> /dev/null; then
    print_error "No se puede conectar a PostgreSQL"
    print_error "Host: $DB_HOST, Puerto: $DB_PORT, Usuario: $DB_USER"
    exit 1
fi

print_success "Conexión a PostgreSQL establecida"

# Crear base de datos si se solicita
if [ "$CREATE_DB" = true ]; then
    print_message "Verificando si la base de datos $DB_NAME existe..."
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        print_warning "La base de datos $DB_NAME ya existe"
        
        if [ "$FORCE" = false ]; then
            read -p "¿Desea eliminarla y crear una nueva? (sí/no): " -r
            if [[ ! $REPLY =~ ^[Ss][Ii]$ ]]; then
                print_message "Operación cancelada por el usuario"
                exit 0
            fi
        fi
        
        print_message "Eliminando base de datos existente..."
        if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "DROP DATABASE \"$DB_NAME\";" postgres; then
            print_error "Error eliminando la base de datos existente"
            exit 1
        fi
        print_success "Base de datos eliminada"
    fi
    
    print_message "Creando nueva base de datos $DB_NAME..."
    if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE \"$DB_NAME\";" postgres; then
        print_error "Error creando la base de datos"
        exit 1
    fi
    print_success "Base de datos creada"
fi

# Verificar que la base de datos existe
print_message "Verificando que la base de datos $DB_NAME existe..."
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
    print_error "La base de datos $DB_NAME no existe"
    print_error "Use la opción -c para crearla automáticamente"
    exit 1
fi

print_success "Base de datos $DB_NAME verificada"

# Determinar el comando de restore según el tipo de archivo
if [[ "$BACKUP_FILE" == *.gz ]]; then
    # Archivo comprimido
    print_message "Detectado archivo comprimido, descomprimiendo..."
    RESTORE_CMD="gunzip -c \"$BACKUP_FILE\" | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
else
    # Archivo SQL plano
    RESTORE_CMD="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f \"$BACKUP_FILE\""
fi

# Agregar opciones según parámetros
if [ "$VERBOSE" = true ]; then
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        RESTORE_CMD="gunzip -c \"$BACKUP_FILE\" | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -v"
    else
        RESTORE_CMD="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -v -f \"$BACKUP_FILE\""
    fi
fi

# Ejecutar restore
print_message "Iniciando restore de la base de datos..."
print_message "Esto puede tomar varios minutos dependiendo del tamaño del backup..."

if [ "$VERBOSE" = true ]; then
    print_message "Comando: $RESTORE_CMD"
fi

# Ejecutar el comando
if eval $RESTORE_CMD; then
    print_success "Restore completado exitosamente"
    
    # Verificar que el restore fue exitoso
    print_message "Verificando integridad del restore..."
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM information_schema.tables;" &> /dev/null; then
        TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
        print_success "Restore verificado: $TABLE_COUNT tablas encontradas"
    else
        print_warning "No se pudo verificar completamente el restore"
    fi
    
else
    print_error "Error durante el restore"
    exit 1
fi

# Mostrar resumen
echo ""
print_success "Resumen del restore:"
echo "  📅 Fecha: $(date)"
echo "  📁 Archivo de backup: $BACKUP_FILE"
echo "  🗄️  Base de datos destino: $DB_NAME"
echo "  👤 Usuario: $DB_USER"
echo "  🌐 Host: $DB_HOST:$DB_PORT"
echo "  🗜️  Comprimido: $([[ "$BACKUP_FILE" == *.gz ]] && echo "Sí" || echo "No")"
echo "  🔧 Base de datos creada: $([ "$CREATE_DB" = true ] && echo "Sí" || echo "No")"

print_success "Restore completado exitosamente! 🎉"

# Sugerencias post-restore
echo ""
print_message "Sugerencias post-restore:"
echo "  🔍 Verifique que todas las tablas se restauraron correctamente"
echo "  🔐 Verifique que los usuarios y permisos estén configurados"
echo "  🧪 Ejecute algunas consultas de prueba para verificar la integridad"
echo "  📊 Revise los logs de la aplicación para detectar posibles errores"

