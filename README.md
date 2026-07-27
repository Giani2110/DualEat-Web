# DualEat - Apartado Web (Frontend)

---

# Introducción

Este proyecto constituye la interfaz web (Frontend) de **DualEat**, una plataforma gastronómica diseñada para integrar la experiencia de comer fuera y cocinar en casa. La aplicación cliente provee una interfaz de usuario fluida, moderna y reactiva que conecta directamente a los usuarios y comerciantes con las herramientas de la plataforma.

Entre sus características y módulos visuales principales, se incluyen:

- **Módulos de Usuario y Autenticación**: Formularios de inicio de sesión, registro e integración visual con OAuth (Google).
- **Gestión Visual de Locales y Menús**: Paneles de administración para negocios, gestión de categorías y catálogo de platos.
- **Recomendaciones e Interfaz Gastronómica**: Vistas adaptadas para explorar recetas, comidas y locales según preferencias y hábitos.
- **Comunidad Social**: Feed de publicaciones, foros temáticos, hilos de comentarios, creación de recetas y sistema de votaciones.
- **Panel para Negocios**: Módulos de estadísticas con gráficos interactivos, promociones por ubicación y herramientas de configuración.
- **Notificaciones en Tiempo Real**: Notificaciones dinámicas mediante la integración de eventos por sockets.
- **Asistente e Interfaz de Recetas**: Vistas interactivas enfocadas en la consulta y preparación de recetas.

El objetivo principal de esta aplicación web es ofrecer una experiencia de usuario (UX/UI) ágil, accesible y completamente adaptativa (responsive) para la comunidad gastronómica.

---

## Tecnologías aplicadas

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

### DevOps & Entorno

- **Containerización**: Docker + Docker Compose

---

## Scripts para levantar

El frontend se puede ejecutar directamente en modo desarrollo con Node.js/npm dentro de la carpeta correspondiente (`cd .\frontend\`).

### Desarrollo local (Vite)

```bash
cd .\frontend\
npm install
npm run dev
```

# Instalación
### Prerrequisitos

- Node.js 20+
- Docker Desktop
- Git

1. Clonación

- `https://github.com/Giani2110/DualEat-Web.git`

2. Posicionamiento

- `cd .\frontend\`

3. Dependencias

- `npm install`

4. Docker

- `cd .\DualEat-Web\`
- `docker-compose down -v --rmi all`
- `docker-compose build --no-cache`
- `docker-compose up`

5. Docker (alternativa rápida)

- `docker-compose down`
- `docker-compose build`
- `docker-compose up -d --wait`

6. Producción

- Finalizar con `npm run build`

### Ver logs

`docker-compose logs -f`

### Ver estado de servicios

`docker-compose ps`

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

- https://docs.google.com/document/d/1IVAHxT0B4W8h7CR-GrCLN0g9y4cwBWH0DkIOWL2fVVY/edit?tab=t.0

## Web

- https://dualeat.vercel.app/
