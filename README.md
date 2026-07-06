# Florencia Mora CM — Gestión de contenido multi-marca

Aplicación web pensada alrededor del concepto de **marca** como unidad central:
gestiona simultáneamente el contenido de 5 marcas de clientes, cada una con su
color identificador, pilares de contenido y objetivo.

## Cómo usarla

Es una app estática, sin dependencias ni build. Opciones:

- Abrir `index.html` directamente en el navegador, o
- Servirla localmente: `python3 -m http.server 8080` y entrar a `http://localhost:8080`.

Los datos se guardan en el navegador (**localStorage**), no se pierden al cerrar.

## Qué incluye esta base

- **Selector de marca siempre visible** arriba, con opción "Todas las marcas".
- **Panel**: tarjeta "Hoy" (atrasados, publicar hoy, preparar en 48 h, esperando
  al cliente), tira semanal con puntos por marca, y resumen por marca ordenado
  por atraso.
- **Contenido**: listado agrupado por franja temporal (atrasados / hoy / esta
  semana / más adelante), con filtros por estado.
- **Calendario**: calendario mensual a pantalla completa con navegación entre
  meses. Cada día muestra sus posts como pastillas con el color de la marca y
  el ícono del formato; los días sin contenido se ven apagados y el día de hoy
  resaltado. Filtro por estado arriba (la marca se filtra con el selector
  global). Al tocar un día se abre un panel lateral con los posts del día y la
  opción de crear uno nuevo con la fecha precargada.
- **Banco de ideas**: tarjetas agrupadas por marca con buscador. Cada idea
  tiene título corto, formato sugerido, gancho/ángulo, pilar y una etiqueta
  opcional de efeméride o tendencia. El botón **"Pasar al calendario"** abre el
  editor de post con todo precargado (marca, título, formato, pilar, el gancho
  como copy inicial y la etiqueta en notas) y deja el cursor en la fecha: el
  flujo idea → post programado es de dos toques. La idea queda marcada como
  "programada". También se pueden **importar ideas en bloque** pegando una
  lista markdown o CSV (título | formato | gancho | pilar | etiqueta): acepta
  tablas markdown, listas con guiones o numeradas, y separadores `|`, `;` o
  `,` — pensado para volcar estrategias mensuales generadas con Claude.
- **Efemérides argentinas** precargadas en el calendario (Día de la Madre,
  Día Mundial de la Diabetes, Hot Sale, primavera, fiestas, vuelta a clases,
  cambios de estación…), etiquetadas por rubro (salud, danza, construcción,
  belleza, general). Cuando una efeméride coincide con el rubro de una marca
  que tiene pocos posts ese mes, aparece una sugerencia sutil que al tocarla
  crea el contenido con marca y fecha ya cargadas.
- **Piezas de contenido** con: marca, fecha programada, formato (reel, carrusel,
  historia, post estático), pilar de contenido (propio de cada marca), copy,
  estado y notas.
- **Flujo de estados con color propio en todas las vistas**:
  Idea → Borrador → Enviado al cliente → Aprobado → Publicado.
  Botón de avance rápido al siguiente estado desde cualquier tarjeta.

## Diseño

Estética profesional en azul noche con acentos en degradé azul→violeta,
tipografías **Montserrat** (títulos) y **DM Sans** (texto), pensada para alta
legibilidad en celular y escritorio.

## Marcas precargadas

| Marca | Rubro | Objetivo | Color |
|---|---|---|---|
| Jasmin Rivas | Podóloga | Conversión a turnos | terracota rosada |
| Alquimia Kinesio | Ortopedia / plantillas | Educar + turnos | verde salvia |
| Linax | Suplementos naturales (foco Facebook) | Funnel Atraer–Nutrir–Convertir | azul |
| Seis Siete Va | Academia de danza | Comunidad + inscripciones | violeta |
| Docta Fragancias | Perfumes árabes | Ventas | ámbar |

Se precargan además algunas piezas de ejemplo (fechadas alrededor de la semana
actual) para que el panel muestre el flujo funcionando; se pueden eliminar
desde el editor de cada pieza.
