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

# Prisma (Schema)
## Usuarios y Autenticación
- User: Representa a un usuario (común o negocio). Guarda datos como nombre, email, contraseña, avatar, rol, proveedor de autenticación y estado de la suscripción.
- UserPreference: Guarda las preferencias del usuario respecto a categorías de comida o etiquetas de comunidad (polimorfismo manual).
- LocalUser: Relaciona usuarios con locales específicos (con rol de admin o staff dentro del local).

## Negocios y Locales
- Business: Representa a una entidad de negocio propiedad de un usuario.
- Local: Sucursal gastronómica. Tiene info como nombre, horarios, contacto, y un array de categorías propias (categorias_menu) y una relación con categorías definidas (LocalMenuCategory).
- LocalMenuCategory: Categorías personalizadas de un local, con la posibilidad de relacionarlas a una categoría general (FoodCategory).

## Comida y Categorías
- FoodCategory: Categorías generales de comidas (ej. “Vegano”, “Italiana”). Tienen un tipo (tipo de comida, estilo o cultura) y pueden asociarse con locales o preferencias.
- Food: Representa un plato o producto en un local. Tiene info como nombre, precio, imagen, disponibilidad, votos, etc.

## Pedidos
- Order: Representa una orden hecha por un usuario en un local. Tiene estado (OrderStatus), método de pago, fecha de entrega, etc.
- OrderItem: Representa un ítem específico dentro de una orden (comida, cantidad, precio unitario).

## Votación y Reseñas
- Vote: Sistema unificado de votos up/down. Aplica a contenido tipo food, post o comment.
- LocalReview: Review (reseña) que un usuario deja en un local, con puntuación y comentario.

## Contenido Social (Comunidad)
- TagCategory: Agrupa etiquetas de comunidad (ej. “Gastronomía internacional”, “Nutrición y bienestar”).
- CommunityTag: Etiquetas temáticas asociadas a comunidades (ej. “Vegano”, “Barato y rico”).
- Community: Grupos sociales de usuarios organizados por un tag. Tienen visibilidad (public, restricted, private), un creador y miembros.
- CommunityMember: Representa a un usuario que forma parte de una comunidad (puede ser moderador).
- Post: Publicaciones dentro de comunidades. Puede ser receta, recomendación, reseña, etc. Tiene votos y comentarios.
- PostComment: Comentarios a un post, con soporte para subcomentarios (respuestas) y votos.

## Recetas
- Ingredient: Ingredientes utilizados en recetas.
- RecipeIngredient: Cantidad y notas de un ingrediente usado en un post tipo receta.
- RecipeStep: Pasos detallados de una receta asociada a un post.

## Logros
- Achievement: Logros que un usuario puede desbloquear (ej. “Visitá 10 locales nuevos”).
- UserAchievement: Progreso de un usuario en un logro, incluyendo si lo completó.

## Suscripciones
- Subscription: Suscripciones de usuarios con integración a Mercado Pago (ID, estado, fechas).
- SubscriptionStatus / SubscriptionStateMP / SubscriptionPlan: Enums que representan estados y planes de suscripción.

### Enums y Otros
- Role / Providers / VoteType / ContentType / Visibility / OrderStatus / LocalUserRole / TypesCategory: Enums que se usan para diferenciar tipos de roles, contenido, estado, visibilidad, autenticación, etc.
