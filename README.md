# Atelier — Gestión de contenido para Community Manager freelance

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
- **Piezas de contenido** con: marca, fecha programada, formato (reel, carrusel,
  historia, post estático), pilar de contenido (propio de cada marca), copy,
  estado y notas.
- **Flujo de estados con color propio en todas las vistas**:
  Idea → Borrador → Enviado al cliente → Aprobado → Publicado.
  Botón de avance rápido al siguiente estado desde cualquier tarjeta.

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
