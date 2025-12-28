# 🌐📱 Juegos Infantiles — Web & App Android

**Repositorio:** `web-juegos-infantiles`
**Autor:** Pau Gracia

<img src="assets/img/imagenes/capturaIndex.png" alt="Captura de pantalla de la página principal" width="600">

<img src="assets/img/imagenes/operaciones.png" alt="Captura de pantalla del juego de operaciones" width="600">

---

## 📖 Descripción

**Juegos Infantiles** es una colección de **minijuegos educativos** desarrollados con
**HTML, CSS y JavaScript puro**, pensada para niños y niñas para aprender de forma **lúdica e interactiva**:

- 🧮 Matemáticas
- 🔤 Vocabulario
- 🧠 Memoria
- ♟️ Pensamiento lógico

El proyecto **nació como web** y actualmente se encuentra en un **proceso de adaptación a aplicación Android**, manteniendo una única base de código.

👉 El objetivo final es una **app móvil descargable**, optimizada para **pantallas táctiles** y **orientación vertical (portrait)**.

---

## 🎮 Juegos incluidos

- 🧠 **Memori**
  Juego de memoria visual con ranking de puntuaciones.

- ➕ **Operaciones**
  Práctica de operaciones matemáticas con distintos niveles de dificultad.

- 🔤 **Juego de Palabras**
  Aprendizaje de vocabulario en varios idiomas mediante casillas de letras.

- 🎯 **Ahorcado**
  Juego clásico para reforzar vocabulario y deducción.

- ♟️ **Damas**
  Juego completo de damas contra la máquina:

  - capturas obligatorias
  - coronación
  - IA básica

---

## 🎯 Objetivos actuales del proyecto

- 📱 **Convertir la web en una app Android**
- 🔒 Diseñar la experiencia **solo en orientación vertical (portrait)**
- 🧩 Unificar todos los juegos bajo una **estructura de app común**
- 🗂️ Separar correctamente:

  - CSS global de app
  - CSS específico por juego
  - JS común y JS por juego

- ♻️ Mantener **una sola base de código** (web + app)
- 🚀 Preparar el proyecto para empaquetado con **Capacitor / WebView**

---

## 🛠️ Tecnologías

### Frontend

- **HTML5**
- **CSS3** (Flexbox, media queries, diseño responsive)
- **JavaScript (Vanilla JS)**

### Backend (opcional / legado web)

- **PHP**

  - Guardado de rankings (`guardar.php`)
  - Archivos de datos (`memori.txt`)

### Herramientas

- **Git** (ramas `main` / `dev`)
- **Servidor PHP local**
- Preparado para **Capacitor (Android)**

---

## ✨ Características

- Menú central de acceso a todos los juegos.
- Modal de configuración por juego (niveles, dificultad, opciones).
- Feedback visual inmediato:

  - ✅ Respuesta correcta
  - ❌ Respuesta incorrecta

- Diseño accesible pensado para público infantil.
- Compatible con:

  - 🖥️ Escritorio
  - 📱 Móvil (portrait-first)

- Arquitectura preparada para **app móvil**.

---

## 📂 Estructura del proyecto (en transición)

```text
web-juegos-infantiles/
│
├── index.html                # Menú principal (App)
│
├── juegos/                   # Juegos individuales
│   ├── damas/
│   │   ├── index.html
│   │   ├── damas.js
│   │   └── damas.css
│   ├── memori/
│   ├── operaciones/
│   ├── palabras/
│   └── ahorcado/
│
├── assets/
│   ├── css/
│   │   ├── app.css           # Estilos comunes de la app
│   │   └── variables.css
│   ├── js/
│   │   ├── app.js            # Navegación y utilidades
│   │   └── storage.js
│   ├── img/
│   └── fonts/
│
├── backend/                  # Backend PHP (ranking legacy)
│   └── data/memori.txt
│
└── README.md
```

> ⚠️ La estructura está siendo **refactorizada progresivamente** en la rama `dev`.

---

## 🚀 Instalación y uso (modo web)

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/PauGracia/web-juegos-infantiles.git
cd web-juegos-infantiles
```

---

### 2️⃣ Levantar servidor local (para ranking)

```bash
php -S localhost:8000
```

---

### 3️⃣ Abrir en el navegador

👉 [http://localhost:8000](http://localhost:8000)

⚠️ El ranking solo funciona con servidor PHP activo.

---

## 🌍 Versión online (sin ranking)

👉 [https://paugracia.github.io/web-juegos-infantiles/index.html](https://paugracia.github.io/web-juegos-infantiles/index.html)

---

## 🔀 Flujo de desarrollo

- `main` → versión estable
- `dev` → refactor, adaptación a app móvil y nuevas funcionalidades

Todos los cambios relacionados con:

- separación de CSS / JS
- layout móvil
- adaptación Android

se realizan **exclusivamente en `dev`**.

---

## 🔮 Próximos pasos

- Finalizar separación de juegos en módulos independientes.
- Crear layout base común para todos los juegos.
- Forzar orientación **portrait-only**.
- Integrar vibración, pantalla completa y guardado local.
- Empaquetar como **APK / AAB Android** con Capacitor.
- Publicación en Google Play (fase futura).

---

## 📜 Licencia

Proyecto personal con fines **educativos**, de **aprendizaje** y **portfolio**.

---
