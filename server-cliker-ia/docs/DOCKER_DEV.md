# Desarrollo Local con Docker

Guía para levantar y administrar MySQL local usando Docker Compose en el proyecto server-cliker-ia.

## Requisitos Previos

- Docker Desktop instalado y ejecutándose
- Docker Compose incluido (viene con Docker Desktop)

---

## Servicios Disponibles

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **mysql** | 3306 | MySQL 5.7 - Base de datos principal |
| **phpmyadmin** | 8080 | phpMyAdmin - Administrador web de MySQL |

---

## Comandos Rápidos

### Levantar todos los servicios

```bash
# Levantar MySQL y phpMyAdmin
docker-compose up -d

# Ver estado de los servicios
docker-compose ps
```

### Detener servicios

```bash
# Detener sin eliminar datos
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar contenedores Y volúmenes (¡PÉRDIDA DE DATOS!)
docker-compose down -v
```

### Reiniciar servicios

```bash
docker-compose restart
```

### Ver Logs

```bash
# Ver logs en tiempo real de un servicio
docker-compose logs -f mysql
docker-compose logs -f phpmyadmin

# Ver últimos 50 líneas
docker-compose logs --tail=50 mysql
```

---

## phpMyAdmin

Interfaz web para administrar la base de datos MySQL.

### Datos de acceso

| Campo | Valor |
|-------|-------|
| **URL** | http://localhost:8080 |
| **Servidor** | mysql |
| **Usuario** | admin |
| **Contraseña** | admin123 |
| **Base de datos** | clicker_game |

### Notas

- phpMyAdmin espera a que MySQL esté saludable antes de iniciar (`depends_on` con `condition: service_healthy`)
- Si MySQL no está listo, phpMyAdmin mostrará un mensaje de espera

---

## Ejecutar Migraciones de Prisma

```bash
# Asegúrate de estar en la carpeta del servidor
cd server-cliker-ia

# Generar cliente Prisma
npm run prisma:generate

# Crear migración (modo desarrollo)
npm run prisma:migrate

# Push directo al esquema (sin migraciones)
npm run prisma:push

# Poblar base de datos con datos iniciales
npm run prisma:seed

# Reset completo de la base de datos
npm run db:prisma:reset
```

---

## Conectar a la Base de Datos

### Desde phpMyAdmin (recomendado)

Accede a http://localhost:8080 y usa las credenciales de arriba.

### Desde la terminal (mysql CLI)

```bash
# Conectar con el cliente MySQL
docker exec -it clicker-mysql mysql -u admin -p

# O conectar directamente a la base de datos
docker exec -it clicker-mysql mysql -u admin -pclicker_game
```

### Comandos SQL útiles dentro de MySQL

```sql
-- Ver bases de datos
SHOW DATABASES;

-- Usar la base de datos del proyecto
USE clicker_game;

-- Ver tablas
SHOW TABLES;

-- Ver estructura de una tabla
DESC NombreTabla;

-- Ver todos los registros de una tabla
SELECT * FROM NombreTabla;
```

### Desde aplicaciones externas

- **Host**: `localhost`
- **Puerto**: `3306`
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Base de datos**: `clicker_game`

#### Herramientas recomendadas:

- **phpMyAdmin**: http://localhost:8080 (incluido en este stack)
- **MySQL Workbench**: GUI oficial de MySQL
- **DBeaver**: Alternativa gratuita multi-base de datos
- **DataGrip**: IDE de JetBrains para bases de datos
- **VS Code**: Extensión "MySQL" o "Database Client"

---

## Verificar Salud de los Servicios

```bash
# Verificar que los contenedores están corriendo
docker ps | grep clicker

# Verificar estado de salud de MySQL
docker inspect --format='{{.State.Health.Status}}' clicker-mysql

# Ping a MySQL desde fuera del contenedor
mysqladmin ping -h localhost -P 3306 -u admin -p
```

---

## Troubleshooting

### MySQL no inicia

```bash
# Ver logs de errores
docker-compose logs mysql

# Ver recursos del contenedor
docker stats

# Reiniciar el servicio
docker-compose restart mysql
```

### phpMyAdmin no puede conectarse

1. Verificar que MySQL esté corriendo y saludable:
   ```bash
   docker ps | grep clicker-mysql
   docker inspect --format='{{.State.Health.Status}}' clicker-mysql
   ```

2. Esperar a que MySQL esté listo (puede tomar 30-60 segundos)

3. Ver logs de phpMyAdmin:
   ```bash
   docker-compose logs phpmyadmin
   ```

### Error de conexión

1. Verificar que el contenedor está corriendo:
   ```bash
   docker ps | grep clicker-mysql
   ```

2. Verificar que el puerto no está bloqueado:
   ```bash
   netstat -an | grep 3306
   ```

3. Verificar credenciales en `.env`

### Volumen de datos corrupto

> ⚠️ **¡PÉRDIDA DE DATOS!** Solo ejecutar si es necesario.

```bash
# Eliminar volumen y recrear
docker-compose down -v
docker-compose up -d
npm run prisma:push -- --force-reset
npm run prisma:seed
```

---

## Configuración de Variables de Entorno

Las variables se leen del archivo `.env` en la raíz del proyecto:

```env
# MySQL
MYSQL_ROOT_PASSWORD=admin123
MYSQL_DATABASE=clicker_game
MYSQL_USER=admin
MYSQL_PASSWORD=admin123

# URL de conexión para Prisma
DATABASE_URL="mysql://admin:admin123@localhost:3306/clicker_game"
```

---

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run prisma:generate` | Genera el cliente Prisma |
| `npm run prisma:migrate` | Crea y aplica migraciones |
| `npm run prisma:push` | Sincroniza esquema sin migraciones |
| `npm run prisma:seed` | Inserta datos iniciales |
| `npm run db:prisma:reset` | Reset completo (push + seed) |
| `npm run db:mysql:reset` | Reset específico para MySQL |
| `npm run db:mysql:deploy` | Genera script de deploy MySQL |
| `npm run prisma:studio` | Abre GUI de Prisma Studio |

---

## Estructura de Archivos

```
server-cliker-ia/
├── docker-compose.yml    # Definición de servicios Docker (MySQL + phpMyAdmin)
├── .env                  # Variables de entorno (NO subir a git)
├── mysql/
│   └── init.sql          # Script de inicialización de MySQL
├── prisma/
│   ├── schema.prisma     # Esquema de la base de datos
│   └── seed.ts          # Datos iniciales
└── scripts/
    ├── reset-database.ts
    ├── migrate-add-all-upgrades.ts
    ├── reset-database-mysql.ts
    └── generate-mysql-deploy.ts
```
