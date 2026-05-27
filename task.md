# Roadmap de Calma y Conversión — Aurea Elizabeth

A continuación se detalla el estado actual de la implementación técnica para la plataforma de bienestar sensorial **Aurea Elizabeth**. Cada hito ha sido construido respetando cimientos arquitectónicos sólidos y una dirección de arte de altísima gama.

---

## 🌿 Fase 1: Identidad Visual y Estructura Global
- [x] **Hito 1.1 a 1.4:** Definición de tipografía, paletas cromáticas inspiradas en la naturaleza y componentes atómicos base (`Typography`, `Button`, `Card`).
- [x] **Hito 1.5: Manejo de Assets de Marca y Navegación Interactiva**
  - [x] Transferencia e integración de los logotipos oficiales de lujo (`logo.png` y `slogan.png`) desde el escritorio hacia `src/assets/`.
  - [x] Creación del sistema de animación sensorial `src/core/design-system/animations.css` con micro-animaciones premium (`floatSmoke` para sahumerio, `.reveal-on-scroll` con `IntersectionObserver`, `.card-premium-hover` con transformaciones 3D).
  - [x] Vinculación global en `src/core/design-system/index.css`.
  - [x] Rediseño de la barra de navegación superior (Navbar) con logo reactivo (click vuelve a Inicio y limpia filtros) y botón inmediato para el portal de "Administración".
  - [x] Integración de un Footer de Lujo poético con logo, slogan, datos de contacto lento, redes y métodos de pago monocromáticos.

---

## 🕯️ Fase 2: Home Silent Seller & Experiencia de Calma
- [x] **Hito 2.1: Estructura Editorial del Home**
  - [x] Creación del componente principal de la página de inicio en `src/features/home/HomePage.tsx`.
  - [x] Hero sensorial imponente con copy de conversión emocional y bodegón botánico premium de fondo.
  - [x] Grilla de visualización de categorías de alta gama (Aromaterapia, Bienestar/Spa, Hogar con Intención, Moda Consciente, Kits de Regalo) con efectos de hover e interacciones directas.
  - [x] Faja de confianza con sellos de garantía (pagos seguros, envíos preparados artesanalmente, soporte humano).
- [x] **Hito 2.2: Interacciones Sensoriales y Widgets de Calma**
  - [x] Carrusel de testimonios y rituales favoritos con controles interactivos fluidos.
  - [x] Showcase interactivo paso a paso para el "Kit de Calma Nocturna" con opción directa para añadir todo al carrito en un click.
  - [x] Widget interactivo de meditación: Guía de Respiración Consciente (Inhalá -> Retené -> Exhalá) controlada por estados autónomos de React.
- [x] **Hito 2.3: Micro-animaciones e Inmersión**
  - [x] Simulación realista de humo tridimensional en el Hero utilizando múltiples hebras de gradientes con `@keyframes floatSmoke`.
  - [x] Vela mística CSS animada simulando el parpadeo sutil del fuego sagrado (`@keyframes candleFlicker`).
  - [x] Integración de `IntersectionObserver` nativo con `useRef` para activar transiciones de scroll dinámicas (`.reveal-on-scroll.active`).
  - [x] Normalización de catálogo en `CatalogPage.tsx` para aceptar pre-filtrado dinámico de categorías (`initialCategory`).

---

## ⚙️ Fase 3: Consola de Administración
- [x] **Hito 3.1: Altar de Autogestión**
  - [x] Dashboard mockeado e integrado en `App.tsx` para visualización inmediata del portal de administración de la tienda.
  - [x] Panel interactivo funcional con CRUD completo para gestionar productos botánicos y guardarlos de forma reactiva en `localStorage`.
- [x] **Hito 3.2: Editor Sensorial con Canvas Image Cropper**
  - [x] Componente premium nativo de canvas HTML5 para arrastrar, re-encuadrar y recortar fotos de productos en vivo con resolución de 800x800.
- [x] **Hito 3.3: Sincronización en Caliente**
  - [x] Conexión reactiva en tiempo real entre el repositorio local, el panel de administración, el carrito global y el catálogo de la tienda.

---

## 👑 Fase 4: Refinamientos de Ultra-Lujo (Olimpo del Diseño Digital)
- [x] **Hito 4.1: Minimalismo Absoluto en la Navbar Superior (`src/App.tsx`)**
  - [x] **Eliminación de redundancias**: Se removieron todos los links de navegación textuales. La barra flotante inferior asume con absoluto protagonismo el control táctil del usuario.
  - [x] **Composición Editorial**: Se amplió el logotipo a **56px de alto**, y se integró verticalmente con el eslogan (`slogan.png`) debajo, logrando un balance tipográfico editorial digno de marcas de alta costura.
  - [x] **Acceso Directo Estético**: Se redujo el portal de administración a un único icono minimalista de silueta de usuario (`User` de Lucide) en el extremo derecho, decorado con una transición de borde concéntrico y fondo de vidrio suave (`rgba(197, 168, 128, 0.05)`).
- [x] **Hito 4.2: Tacto Físico de Fondo y Partículas Botánicas (`index.css` & `animations.css`)**
  - [x] **Grano de Papel Artesanal**: Inyección de ruido SVG fractal sutilísimo (4.5% de opacidad) que aporta textura orgánica y física al fondo de la pantalla, reduciendo la artificialidad de la luz del monitor.
  - [x] **Partículas Botánicas**: Inyección de hojas de salvia y pétalos flotantes animados en 3D en el fondo del layout. Se implementaron 3 variantes de `@keyframes` asincrónicas que controlan rotación, traslación vertical y desvanecimiento lumínico tridimensional.
- [x] **Hito 4.3: Perfección Inmersiva en el Hero (`HomePage.tsx`)**
  - [x] **Vela Hiperrealista en 3 Capas**: El fuego animado genérico se reemplazó por un núcleo de llama realista tridimensional. Capa externa naranja-dorada de combustión blureada, núcleo central amarillo-blanco cálido, y base azulada de plasma. Animado con dos keyframes asincrónicos para simular corrientes de aire físicas.
  - [x] **Humo 3D Refinado**: Se expandieron las hebras de humo a 4 capas con delays y desenfoques ópticos diferenciados (tonos crema, salvia y oro), logrando un comportamiento volumétrico hiperrealista de sahumerio.
  - [x] **Sello de Cera Grabado**: Reemplazo del badge "100% Orgánico" por un sello de lacre/cera tridimensional en color terracota hecho a mano (geometría imperfecta a través de border-radius irregulares), con sombras internas de relieve y hover elástico que emula la presión física de un sello.
  - [x] **Marcas de Agua**: Inyección de tipografías gigantes `"AUREA"` y `"ELIZABETH"` al 2% de opacidad al fondo del hero, estableciendo un ancla de maquetación editorial premium.

---

> [!IMPORTANT]
> **Consideraciones de Sustentabilidad y Rendimiento Estético:**
> 1. Todas las animaciones tridimensionales de partículas y humo utilizan las propiedades `transform` and `opacity` junto a `will-change` para forzar la aceleración por hardware (GPU) y asegurar 60 FPS estables.
> 2. El ruido SVG se inyecta en el pseudo-elemento `body::before` con `pointer-events: none` y `z-index: 9999` para que actúe únicamente como un filtro estético superior y no interfiera con ningún evento del mouse o gestos táctiles.
