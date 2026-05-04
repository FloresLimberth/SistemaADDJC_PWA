# Backup Base de Datos ADDJC

## Contenido del Backup

Este backup contiene:
- Estructura completa de la base de datos (18 tablas)
- Todos los datos estaticos (baremos, nomenclatura, zonas_esfuerzo)
- Usuarios de prueba (5 usuarios)
- Datos de desarrollo (atletas, entrenadores, etc.)

## Como Restaurar el Backup

### 1. Crear la base de datos vacia

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE db_addjc;

# Salir
\q
```

### 2. Restaurar el backup

**En Windows:**
```bash
# Desde la carpeta backend/backups/
set PGPASSWORD=12345
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d db_addjc -f db_addjc_backup_completo.sql
```

**En Linux/Mac:**
```bash
# Desde la carpeta backend/backups/
PGPASSWORD=tu_password psql -U postgres -d db_addjc -f db_addjc_backup_completo.sql
```

### 3. Verificar la restauracion

```bash
# Verificar que las tablas existen
psql -U postgres -d db_addjc -c "\dt"

# Verificar usuarios
psql -U postgres -d db_addjc -c "SELECT email, rol FROM usuarios;"
```

## Usuarios de Prueba

Despues de restaurar el backup, tendras estos usuarios disponibles:

- **Admin**: admin@addjc.com / admin123
- **Comite Tecnico**: comite@addjc.com / admin123
- **Entrenador**: entrenador@addjc.com / admin123
- **Atleta**: atleta@addjc.com / admin123

## Notas Importantes

- Este backup incluye la estructura completa (tablas, indices, constraints, etc.)
- Usa INSERT statements (no COPY) para mayor compatibilidad
- El backup fue generado con PostgreSQL 17
- Compatible con PostgreSQL 12+
