# DualEat - Apartado Web

---

### Update (8/8)

Hay un nuevo archivo llamado deploy.sh, que puede ejecutarse con `bash ./deploy.sh`, que se conectará con Github, verificando que rama (frontend o backend) debe actualizar sus contenedores de docker compose.

# Introducción

Este proyecto forma parte de DualEat, una plataforma gastronómica multiplataforma (web y móvil) que busca integrar la experiencia de comer fuera y cocinar en casa. La API RESTful, desarrollada con Node.js, Express.js y Prisma ORM, actúa como núcleo central del sistema, gestionando usuarios, locales gastronómicos, menús, pedidos, comunidades y preferencias.

Entre sus funcionalidades principales, se incluyen:

- Gestión de usuarios, roles y autenticación (incluyendo OAuth con Google).
- Administración de locales y menús personalizados, con soporte para carga automática vía OCR.
- Recomendaciones personalizadas de comidas, recetas y locales, adaptadas a preferencias, clima y hábitos.
- Comunidad social con foros temáticos, publicaciones, comentarios y sistema de votación.
- Herramientas para negocios: estadísticas, promociones por geolocalización, visibilidad y configuración avanzada.
- Notificaciones en tiempo real: WebSockets con Socket.IO.
- Integración con IA: Ollama para realizar consultas en el ámbito de las recetas.

El objetivo principal de esta API es ofrecer un backend robusto, extensible y modular, que sirva como motor de una experiencia gastronómica innovadora, social y personalizada.

## Tecnologías aplicadas

### Backend

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js 5
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL 16
- **Cache**: Redis 7
- **Autenticación**: JWT + Passport (Google OAuth)
- **IA**: Ollama (modelos locales)
- **OCR**: Google Cloud Vision API
- **Almacenamiento**: Supabase Storage
- **WebSockets**: Socket.IO
- **Email**: Nodemailer
- **Cron Jobs**: node-cron
- **QR Codes**: qrcode
- **Rate Limiting**: express-rate-limit
- **Image Processing**: Multer + Sharp

### Frontend

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS 4
- **Animaciones**: Framer Motion
- **Gráficos**: Recharts
- **Iconos**: Lucide React
- **Drag & Drop**: DnD Kit
- **HTTP Client**: Axios
- **Image Cropping**: React Image Crop
- **Notifications**: React Hot Toast
- **reCAPTCHA**: React Google reCAPTCHA
- **Date Utils**: date-fns

### DevOps

- **Containerización**: Docker + Docker Compose
- **Admin DB**: pgAdmin 4
- **Redis UI**: Redis Commander

## Scripts para levantar

El sistema se logra ejecutar funcionalmente con Docker, aunque puede ejecutarse en modo desarrollo desde la carpeta backend **(cd .\backend\)** y la carpeta frontend **(cd .\frontend\)**, ambas ejecutando npm install seguido de npm run dev. Prima se debe ejecutar con Docker exclusivamente.

## Instalación

### Prerrequisitos

- Node.js 20+
- Docker Desktop
- Git

1. Clonación

- `https://github.com/Giani2110/DualEat-Web.git`

2. Posicionamiento

- `cd .\backend\` & `cd .\frontend\`

3. Dependencias (en ambas carpetas)

- `npm install`

4. Base de datos (en backend)

- `npx prisma generate` & `npx prisma migrate deploy`

5. Tablas prueba

- `npx prisma db seed`(old)
- `npm run seed`

6. Docker

- `cd .\DualEat-Web\`
- `docker-compose down -v --rmi all`
- `docker-compose build --no-cache`
- `docker-compose up`
- `.\setup-ollama.ps1`

6. Docker (alternativa rápida)

- `docker-compose down`
- `docker-compose build`
- `docker-compose up -d --wait`
- `.\setup-ollama.ps1`

7. Producción

- Finalizar en ambas carpetas con `npm run build`

### Ver logs

`docker-compose logs -f`

### Ver estado de servicios

`docker-compose ps`

### Servicios disponibles

| Servicio | URL                    | Descripción        |
| -------- | ---------------------- | ------------------ |
| Frontend | http://localhost:5173  | Interfaz web       |
| Backend  | http://localhost:3000  | API REST           |
| pgAdmin  | http://localhost:5050  | Admin PostgreSQL   |
| Redis UI | http://localhost:8081  | Visualizador Redis |
| Ollama   | http://localhost:11434 | API de IA          |

### Credenciales pgAdmin

- **Email**: dualeat@gmail.com
- **Password**: 1234

---

## Despliegue a Producción

### Opción 1: Build local + Docker

```bash
# En ambas carpetas (backend y frontend)
npm run build

# Levantar con Docker en modo producción
docker-compose -f docker-compose.prod.yml up -d
```

### Opción 2: Build dentro de Docker

El `docker-compose.yml` ya está configurado para desarrollo. Para producción, modifica el `command` en `docker-compose.yml`:

```yaml
backend:
  command: ["sh", "-c", "npx prisma db push && npm run build && npm start"]

frontend:
  command: ["sh", "-c", "npm run build && npm run preview"]
```

**IMPORTANTE**: El `npm run build` local **NO** afecta a Docker. Docker construye su propia imagen independiente.

### Script de despliegue automático

`bash ./deploy.sh`

---

## Dependencias

### Backend

- **@google-cloud/vision** (^5.3.3): API de Google Cloud para OCR y reconocimiento de texto en imágenes.
- **@prisma/client** (^6.14.0): Cliente oficial de Prisma para consultar la base de datos de forma segura y tipada.
- **@supabase/supabase-js** (^2.57.0): Cliente oficial de Supabase para interactuar con almacenamiento de archivos.
- **axios** (^1.11.0): Cliente HTTP basado en promesas para realizar peticiones externas.
- **bcrypt** (^6.0.0): Librería para hashear contraseñas de manera segura.
- **bcryptjs** (^3.0.2): Alternativa pura en JavaScript para hashear contraseñas.
- **cookie-parser** (^1.4.7): Middleware para analizar cookies en las peticiones HTTP.
- **cors** (^2.8.5): Middleware que permite el intercambio de recursos entre distintos orígenes (CORS).
- **crypto** (^1.0.1): Módulo de criptografía para generación de tokens y hashes.
- **dotenv** (^17.2.0): Carga variables de entorno desde un archivo .env.
- **express** (^5.1.0): Framework web minimalista para construir APIs RESTful en Node.js.
- **express-rate-limit** (^8.1.0): Middleware para limitar la tasa de peticiones y prevenir abusos.
- **express-session** (^1.18.2): Middleware para manejo de sesiones en Express.
- **ioredis** (^5.7.0): Cliente Redis de alto rendimiento con soporte para clustering.
- **jsonwebtoken** (^9.0.2): Implementación de JSON Web Tokens para autenticación basada en tokens.
- **multer** (^2.0.2): Middleware para manejar multipart/form-data, usado para subir archivos.
- **node-cron** (^4.2.1): Programador de tareas cron para Node.js.
- **nodemailer** (^7.0.5): Librería para envío de correos electrónicos.
- **passport** (^0.7.0): Middleware de autenticación extensible y modular para Node.js.
- **passport-google-oauth20** (^2.0.0): Estrategia de autenticación con Google OAuth 2.0 para Passport.
- **qrcode** (^1.5.4): Generador de códigos QR.
- **slugify** (^1.6.6): Convierte texto en slugs amigables para URLs.
- **socket.io** (^4.8.1): Librería para comunicación en tiempo real mediante WebSockets.
- **string-similarity** (^4.0.4): Algoritmos para comparar similitud entre strings.
- **uuid** (^13.0.0): Generador de identificadores únicos universales.
- **zod** (^4.0.10): Librería de validación de esquemas para datos tipados.

#### Comandos Backend

```bash
npm init -y

# Dependencias de producción
npm install @google-cloud/vision @prisma/client @supabase/supabase-js axios bcrypt bcryptjs cookie-parser cors crypto dotenv express express-rate-limit express-session fs ioredis jsonwebtoken multer node-cron nodemailer passport passport-google-oauth20 qrcode slugify socket.io string-similarity uuid zod @types/multer @types/string-similarity

# Dependencias de desarrollo
npm install -D @mermaid-js/mermaid-cli @types/bcrypt @types/bcryptjs @types/cookie-parser @types/cors @types/express @types/express-session @types/ioredis @types/jsonwebtoken @types/node @types/nodemailer @types/passport @types/passport-google-oauth20 @types/qrcode @types/uuid eslint-config-prettier nodemon prettier prisma prisma-erd-generator puppeteer ts-node-dev typescript

# Inicializar Prisma
npx prisma init
```

---

### Frontend

- **@dnd-kit/core** (^6.3.1): Librería base para drag and drop accesible y performante.
- **@dnd-kit/sortable** (^10.0.0): Utilidades para listas ordenables con drag and drop.
- **@tailwindcss/vite** (^4.1.11): Plugin oficial para integrar Tailwind CSS con Vite.
- **autoprefixer** (^10.4.21): Herramienta que agrega prefijos CSS automáticamente para compatibilidad entre navegadores.
- **axios** (^1.11.0): Cliente HTTP basado en promesas para realizar solicitudes a APIs desde el frontend.
- **date-fns** (^4.1.0): Librería moderna para manipulación y formato de fechas.
- **framer-motion** (^12.23.6): Librería para animaciones modernas y fluidas en React.
- **jwt-decode** (^4.0.0): Decodificador de JSON Web Tokens en el cliente.
- **lucide-react** (^0.525.0): Paquete de íconos SVG accesibles y personalizables para React.
- **react** (^19.1.0): Biblioteca principal para construir interfaces de usuario.
- **react-dom** (^19.1.0): Permite renderizar componentes React en el DOM del navegador.
- **react-google-recaptcha** (^3.1.0): Componente React para integrar Google reCAPTCHA.
- **react-hot-toast** (^2.5.2): Notificaciones toast elegantes y personalizables.
- **react-icons** (^5.5.0): Colección de iconos populares como componentes React.
- **react-image-crop** (^11.0.10): Componente para recortar imágenes en React.
- **react-router-dom** (^7.7.0): Enrutador oficial para React, permite navegación entre vistas o páginas.
- **recharts** (^3.2.0): Librería de gráficos construida con componentes React.
- **socket.io-client** (^4.8.1): Cliente para comunicación en tiempo real con Socket.IO.
- **tailwindcss** (^4.1.11): Framework de estilos CSS basado en utilidades, altamente personalizable.

#### Comandos Frontend

```bash
# Dependencias de producción
npm install @dnd-kit/core @dnd-kit/sortable @tailwindcss/vite autoprefixer axios date-fns framer-motion jwt-decode lucide-react react react-dom react-google-recaptcha react-hot-toast react-icons react-image-crop react-router-dom recharts socket.io-client tailwindcss

# Dependencias de desarrollo
npm install -D @eslint/js @types/node @types/react @types/react-dom @types/react-google-recaptcha @types/recharts @vitejs/plugin-react @vitejs/plugin-react-swc eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals sass typescript typescript-eslint vite vite-plugin-sass
```

---

## Documentación (SRS)

- https://docs.google.com/document/d/1ZKYIp8J-EjEReW8FzHTkHUoyacl-9sUkRrlthAvQhfE/edit?usp=sharing

---

# Prisma (Schema)

#### Usuarios y Autenticación

- `User`: Usuarios (común o negocio)
- `UserPreference`: Preferencias alimentarias
- `LocalUser`: Relación usuarios-locales (roles staff/admin)

#### Negocios

- `Business`: Entidad de negocio
- `Local`: Sucursales gastronómicas
- `LocalMenuCategory`: Categorías personalizadas de menú
- `LocalSchedule`: Horarios de atención
- `LocalCalendarEvent`: Agenda de eventos/tareas
- `LocalNote`: Notas y recordatorios

#### Comida

- `FoodCategory`: Categorías generales
- `Food`: Platos/productos

#### Pedidos

- `Order`: Órdenes de compra
- `OrderItem`: Ítems de la orden

#### Comunidad

- `TagCategory`: Agrupación de etiquetas
- `CommunityTag`: Etiquetas temáticas
- `Community`: Comunidades sociales
- `CommunityMember`: Membresía con roles
- `Post`: Publicaciones (recetas, reseñas, etc.)
- `PostComment`: Comentarios con soporte de hilos

#### Recetas

- `Recipe`: Recetas completas
- `RecipeIngredient`: Ingredientes con cantidades
- `RecipeStep`: Pasos de preparación
- `Ingredient`: Catálogo de ingredientes
- `UnitOfMeasure`: Unidades de medida

#### Sistema

- `Vote`: Sistema de votación unificado
- `LocalReview`: Reseñas de locales
- `Notification`: Notificaciones en tiempo real
- `Subscription`: Suscripciones (Mercado Pago)

### Comandos útiles de Prisma

```bash
# Ver base de datos en navegador
npx prisma studio

# Generar diagrama ERD
npx prisma generate

# Aplicar cambios del schema
npx prisma db push

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Resetear base de datos (CUIDADO)
npx prisma migrate reset
```

---

## Prisma Studio

- `npx prisma studio`

---

## Troubleshooting

### Frontend no puede llamar al backend

Verificar CORS en `backend/.env`:

```env
CORS_ORIGIN=http://localhost:0000
```
