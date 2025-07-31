 # DualEat - Apartado Web

# Introducción 
Este proyecto forma parte de DualEat, una plataforma gastronómica multiplataforma (web y móvil) que busca integrar la experiencia de comer fuera y cocinar en casa. La API RESTful, desarrollada con Node.js, Express.js y Prisma ORM, actúa como núcleo central del sistema, gestionando usuarios, locales gastronómicos, menús, pedidos, comunidades y preferencias.

Entre sus funcionalidades principales, se incluyen:
- Gestión de usuarios, roles y autenticación (incluyendo OAuth con Google/Twitter).
- Administración de locales y menús personalizados, con soporte para carga automática vía OCR.
- Recomendaciones personalizadas de comidas, recetas y locales, adaptadas a preferencias, clima y hábitos.
- Comunidad social con foros temáticos, publicaciones, comentarios y sistema de votación.
- Gamificación mediante logros, rutas gastronómicas y participación en desafíos.
- Herramientas para negocios: estadísticas, promociones por geolocalización, visibilidad y configuración avanzada.

El objetivo principal de esta API es ofrecer un backend robusto, extensible y modular, que sirva como motor de una experiencia gastronómica innovadora, social y personalizada.

## Tecnologías aplicadas
- **TypeScript**
- **Express.js**
- **Prisma / Docker / Supabase**
- **PostgreSQL**
- **React Vite**
- **Google API / JWT / Passport**

## Scripts para levantar
El sistema se logra ejecutar funcionalmente con Docker, aunque puede ejecutarse en modo desarrollo desde la carpeta backend **(cd .\backend\)** y la carpeta frontend **(cd .\frontend\)**, ambas ejecutando npm install seguido de npm run dev. Prima se debe ejecutar con Docker exclusivamente.

## Instalación 
1. Clonación
  - ```https://github.com/Giani2110/DualEat-Web.git```
2. Posicionamiento
  - ```cd .\backend\``` & ```cd .\frontend\```
3. Dependencias (en ambas carpetas)
  - ```npm install```
4. Base de datos (en backend)
  - ```npx prisma generate``` & ```npx prisma migrate deploy```
5. Tablas prueba
  - ```npx prisma db seed```
6. Docker
  - ```cd .\DualEat-Web\```
  - ```docker-compose down -v --rmi all```
  - ```docker-compose build --no-cache```
  - ```docker-compose up```
7. Producción
  - Finalizar en ambas carpetas con ```npm run build```

---

## Dependencias
### Backend
- @prisma/client (^6.12.0): Cliente oficial de Prisma para consultar la base de datos de forma segura y tipada.
- @supabase/supabase-js (^2.53.0): Cliente oficial de Supabase para interactuar con almacenamiento de archivos, bases de datos o autenticación si se usa Supabase como backend.
- bcrypt (^6.0.0): Librería para hashear contraseñas de manera segura.
- cookie-parser (^1.4.7): Middleware para analizar cookies en las peticiones HTTP.
- cors (^2.8.5): Middleware que permite el intercambio de recursos entre distintos orígenes (Cross-Origin Resource Sharing).
- dotenv (^17.2.0): Carga variables de entorno desde un archivo .env al entorno de ejecución de Node.js.
- express (^5.1.0): Framework web minimalista para construir APIs RESTful en Node.js.
- jsonwebtoken (^9.0.2): Implementación de JSON Web Tokens, útil para autenticación basada en tokens.
- passport (^0.7.0): Middleware de autenticación extensible y modular para Node.js.
- passport-google-oauth20 (^2.0.0): Estrategia de autenticación con Google OAuth 2.0 para Passport.
- sharp (^0.34.3): Librería para el procesamiento de imágenes (redimensionar, comprimir, convertir formatos).
- zod (^4.0.10): Librería de validación de esquemas para datos tipados, ideal para validar el body de peticiones.


### Comandos
- ```npm init -y```
- ```npm install @prisma/client @supabase/supabase-js bcrypt cookie-parser cors dotenv express jsonwebtoken passport passport-google-oauth20 sharp zod```
- ```npx prisma init```


### Frontend
- @tailwindcss/vite: Plugin oficial para integrar Tailwind CSS con Vite.
- autoprefixer: Herramienta que agrega prefijos CSS automáticamente para compatibilidad entre navegadores.
- axios: Cliente HTTP basado en promesas para realizar solicitudes a APIs desde el frontend.
- framer-motion: Librería para animaciones modernas y fluidas en React.
- lucide-react: Paquete de íconos SVG accesibles y personalizables para React.
- react: Biblioteca principal para construir interfaces de usuario.
- react-dom: Permite renderizar componentes React en el DOM del navegador.
- react-router-dom: Enrutador oficial para React, permite navegación entre vistas o páginas.
- tailwindcss: Framework de estilos CSS basado en utilidades, altamente personalizable.

### Comandos 
- ```npm install -D @eslint/js @types/node @types/react @types/react-dom @vitejs/plugin-react @vitejs/plugin-react-swc eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals sass typescript typescript-eslint vite```

---
## Documentación (SRS)
- https://docs.google.com/document/d/1ZKYIp8J-EjEReW8FzHTkHUoyacl-9sUkRrlthAvQhfE/edit?usp=sharing
---

