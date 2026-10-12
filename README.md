# PokéLab Explorer — Safari 2.0

Proyecto académico con React y Vite. Utiliza [PokéAPI](https://pokeapi.co/) para consultar Pokémon y simula una aventura Safari. Es una aplicación educativa no oficial.

## Cómo probarlo

```bash
npm install
npm run dev
```

Abre el enlace de Vite (en GitHub Codespaces, abre el puerto 5173).

## Safari 2.0

1. Abre **Safari** y selecciona una de las cinco regiones de Isla Aurora.
2. Pulsa **Entrar a esta región** para caminar con tu entrenador.
3. Usa las **flechas o WASD** en computador, o la cruceta de la pantalla en celular.
4. Evita los obstáculos y camina por **hierba alta** para encontrar Pokémon.
5. Cuando aparezca un Pokémon, elige Poké Ball, Super Ball o baya e intenta capturarlo.
6. Puedes **seguir caminando en la misma posición** tras capturar o huir.
7. El álbum, favoritos, inventario e historial se conservan en el almacenamiento local del navegador.

La posición del personaje se conserva **durante la expedición activa** y se reinicia al salir o cambiar de zona. Las probabilidades de encuentro, los niveles y las probabilidades de captura son **simulaciones académicas**; las especies y sus características se consultan a PokéAPI.

## Validación

```bash
npm test
npm run build
npm run lint
```

Los controles, las capturas y la compatibilidad real con WebView Android deben probarse también manualmente.

## Entregables

La versión web puede desplegarse en Netlify y abrirse mediante una WebView Android. La versión independiente de React Native y Expo Go requiere su propio proyecto.

## Créditos

Pokémon y las ilustraciones asociadas pertenecen a sus respectivos titulares. Esta aplicación no está afiliada con The Pokémon Company, Nintendo ni Game Freak.

## Recolección de bayas (minijuego)

Busca arbustos visibles (🫐 y 🌟) dentro del terreno, acércate hasta una casilla contigua y pulsa **E** o **Recolectar**. Detén el indicador móvil en el rango verde pulsando **Espacio** o **Detener aguja**. Las plantas normales requieren dos aciertos y toleran un fallo; las doradas exigen tres aciertos perfectos y se mueven más rápido.

- Si fallas o abandonas, el arbusto se agota y **no recibes bayas**.
- Los arbustos se recuperan tras 26 pasos válidos (normales) o 40 pasos (raros) **en la misma región**, conservando el estado al cerrar y abrir la aplicación.
- Recompensas: arbusto normal 1–2 bayas; dorado 2–3. Capacidad: 25 bayas.
- Los movimientos bloqueados no suman pasos y reabrir Safari no restaura los arbustos.
- La reposición de Poké Balls al agotarse ya no entrega bayas gratuitas: deben recolectarse en el mapa.

Los arbustos, la dificultad y las bayas son reglas diseñadas para esta actividad; **no son funcionalidades de PokéAPI**.
