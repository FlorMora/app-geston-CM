/* ==========================================================
   Atelier — app de gestión para Community Manager freelance
   La MARCA es la unidad central. Datos en localStorage.
   ========================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "atelier.cm.v1";

  /* ---------- Definiciones ---------- */

  const STATES = [
    { id: "idea",      label: "Idea" },
    { id: "borrador",  label: "Borrador" },
    { id: "enviado",   label: "Enviado al cliente" },
    { id: "aprobado",  label: "Aprobado" },
    { id: "publicado", label: "Publicado" },
  ];
  const STATE_LABEL = Object.fromEntries(STATES.map(s => [s.id, s.label]));
  const STATE_ORDER = STATES.map(s => s.id);

  const FORMATS = [
    { id: "reel",     label: "Reel" },
    { id: "carrusel", label: "Carrusel" },
    { id: "historia", label: "Historia" },
    { id: "post",     label: "Post estático" },
  ];
  const FORMAT_LABEL = Object.fromEntries(FORMATS.map(f => [f.id, f.label]));

  const FORMAT_ICONS = {
    reel: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
    carrusel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M3 16V5a2 2 0 0 1 2-2h11"/></svg>`,
    historia: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><circle cx="12" cy="12" r="9" stroke-dasharray="4.5 3.5"/><circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none"/></svg>`,
    post: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>`,
  };

  /* ---------- Efemérides argentinas ---------- */

  const RUBRO_META = {
    salud:        { label: "Salud",        color: "#4F7D4F" },
    danza:        { label: "Danza",        color: "#8A64A8" },
    belleza:      { label: "Belleza",      color: "#A9822F" },
    construccion: { label: "Construcción", color: "#8D6E4F" },
    general:      { label: "General",      color: "#9A9285" },
  };

  // d: día fijo · nth: {wd: día de semana (0=dom), n: enésimo} calculado por año
  const EFEMERIDES = [
    { m: 1,  d: 1,               name: "Año Nuevo",                          rubros: ["general"] },
    { m: 1,  d: 6,               name: "Día de Reyes",                       rubros: ["general"] },
    { m: 2,  d: 14,              name: "San Valentín",                       rubros: ["general", "belleza"] },
    { m: 3,  nth: { wd: 1, n: 1 }, name: "Vuelta a clases",                  rubros: ["general", "danza"] },
    { m: 3,  d: 8,               name: "Día Internacional de la Mujer",      rubros: ["general"] },
    { m: 3,  d: 21,              name: "Comienzo del otoño",                 rubros: ["general"] },
    { m: 4,  d: 7,               name: "Día Mundial de la Salud",            rubros: ["salud"] },
    { m: 4,  d: 13,              name: "Día del Kinesiólogo (Arg.)",         rubros: ["salud"] },
    { m: 4,  d: 29,              name: "Día Internacional de la Danza",      rubros: ["danza"] },
    { m: 5,  d: 1,               name: "Día del Trabajador",                 rubros: ["general", "construccion"] },
    { m: 5,  nth: { wd: 1, n: 2 }, name: "Hot Sale (3 días)",                rubros: ["general"] },
    { m: 5,  d: 25,              name: "Revolución de Mayo",                 rubros: ["general"] },
    { m: 6,  nth: { wd: 0, n: 3 }, name: "Día del Padre",                    rubros: ["general", "belleza"] },
    { m: 6,  d: 21,              name: "Comienzo del invierno",              rubros: ["general"] },
    { m: 7,  d: 9,               name: "Día de la Independencia",            rubros: ["general"] },
    { m: 7,  d: 20,              name: "Día del Amigo",                      rubros: ["general"] },
    { m: 8,  nth: { wd: 0, n: 3 }, name: "Día de las Infancias",             rubros: ["general", "danza"] },
    { m: 9,  d: 21,              name: "Día de la Primavera y del Estudiante", rubros: ["general", "danza", "belleza"] },
    { m: 10, nth: { wd: 0, n: 3 }, name: "Día de la Madre (Arg.)",           rubros: ["general", "belleza"] },
    { m: 10, d: 20,              name: "Día Mundial de la Osteoporosis",     rubros: ["salud"] },
    { m: 11, nth: { wd: 1, n: 1 }, name: "CyberMonday (3 días)",             rubros: ["general"] },
    { m: 11, d: 14,              name: "Día Mundial de la Diabetes",         rubros: ["salud"] },
    { m: 11, nth: { wd: 5, n: 4 }, name: "Black Friday",                     rubros: ["general"] },
    { m: 12, d: 21,              name: "Comienzo del verano",                rubros: ["general"] },
    { m: 12, d: 25,              name: "Navidad",                            rubros: ["general"] },
    { m: 12, d: 31,              name: "Fin de año",                         rubros: ["general"] },
  ];

  function nthWeekday(year, month, weekday, n) {
    const first = new Date(year, month - 1, 1);
    const offset = (weekday - first.getDay() + 7) % 7;
    return new Date(year, month - 1, 1 + offset + (n - 1) * 7);
  }

  function efemeridesForMonth(year, month) {
    return EFEMERIDES
      .filter(e => e.m === month)
      .map(e => {
        const day = e.d != null ? e.d : nthWeekday(year, month, e.nth.wd, e.nth.n).getDate();
        return { ...e, day, date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` };
      })
      .sort((a, b) => a.day - b.day);
  }

  const SEED_BRANDS = [
    {
      id: "jasmin",
      rubro: "salud",
      name: "Jasmin Rivas",
      color: "#C06A5B",
      descriptor: "Podóloga",
      objective: "Conversión a turnos",
      pillars: ["Educación", "Casos y resultados", "Turnos y promoción", "Confianza"],
    },
    {
      id: "alquimia",
      rubro: "salud",
      name: "Alquimia Kinesio",
      color: "#7D8E6E",
      descriptor: "Ortopedia · plantillas ortopédicas",
      objective: "Educar + turnos",
      pillars: ["Educación", "Producto", "Testimonios", "Turnos"],
    },
    {
      id: "linax",
      rubro: "salud",
      name: "Linax",
      color: "#4E7B9E",
      descriptor: "Suplementos naturales · web y Mercado Libre · foco Facebook",
      objective: "Funnel Atraer–Nutrir–Convertir",
      pillars: ["Atraer", "Nutrir", "Convertir"],
    },
    {
      id: "seissiete",
      rubro: "danza",
      name: "Seis Siete Va",
      color: "#8A64A8",
      descriptor: "Academia de danza",
      objective: "Comunidad + inscripciones",
      pillars: ["Comunidad", "Clases", "Inscripciones", "Detrás de escena"],
    },
    {
      id: "docta",
      rubro: "belleza",
      name: "Docta Fragancias",
      color: "#A9822F",
      descriptor: "Perfumes árabes · público masculino",
      objective: "Ventas",
      pillars: ["Producto", "Deseo y lifestyle", "Prueba social", "Ofertas"],
    },
  ];

  /* ---------- Utilidades de fecha ---------- */

  function todayISO() {
    const d = new Date();
    return toISO(d);
  }
  function toISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  function parseISO(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function addDays(iso, n) {
    const d = parseISO(iso);
    d.setDate(d.getDate() + n);
    return toISO(d);
  }
  function mondayOfWeek(iso) {
    const d = parseISO(iso);
    const dow = (d.getDay() + 6) % 7; // lunes = 0
    d.setDate(d.getDate() - dow);
    return toISO(d);
  }
  function fmtShort(iso) {
    const d = parseISO(iso);
    return d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
  }
  function fmtLong(iso) {
    const d = parseISO(iso);
    return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  }
  function daysBetween(fromISO, toISOv) {
    return Math.round((parseISO(toISOv) - parseISO(fromISO)) / 86400000);
  }

  /* ---------- Datos de ejemplo (primera vez) ---------- */

  function seedContents() {
    const t = todayISO();
    let n = 0;
    const mk = (brandId, offset, format, pillar, title, state, copy) => ({
      id: "seed-" + (++n),
      brandId,
      date: addDays(t, offset),
      format,
      pillar,
      title,
      state,
      copy: copy || "",
      notes: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return [
      mk("jasmin", -1, "reel", "Educación", "Uñas encarnadas: cuándo consultar", "enviado",
        "¿Te duele al caminar? Estas son las 3 señales de que esa uña necesita atención profesional…"),
      mk("jasmin", 1, "historia", "Turnos y promoción", "Recordatorio de turnos disponibles", "borrador",
        "Quedan pocos turnos esta semana. Escribinos por WhatsApp y reservá el tuyo."),
      mk("alquimia", 0, "carrusel", "Educación", "¿Qué es el estudio de la pisada?", "aprobado",
        "Paso a paso: así evaluamos tu pisada antes de diseñar tus plantillas personalizadas."),
      mk("alquimia", 3, "post", "Testimonios", "Testimonio: volvió a correr sin dolor", "idea"),
      mk("linax", 0, "post", "Convertir", "Promo Mercado Libre: envío gratis", "enviado",
        "Solo por esta semana: envío gratis en toda la línea de magnesio. Link en la bio."),
      mk("linax", 2, "carrusel", "Nutrir", "5 señales de que te falta magnesio", "borrador"),
      mk("seissiete", -2, "reel", "Comunidad", "Resumen de la clase abierta", "aprobado",
        "Lo que se vivió en la clase abierta del sábado. ¡Gracias a todos los que vinieron!"),
      mk("seissiete", 4, "historia", "Inscripciones", "Últimos lugares comisión martes", "idea"),
      mk("docta", 1, "reel", "Deseo y lifestyle", "Amber Oud: la reseña en 30 segundos", "borrador",
        "Notas de salida, corazón y fondo. Para el que quiere dejar huella sin decir una palabra."),
      mk("docta", -3, "post", "Ofertas", "Combo x2 lanzamiento", "publicado",
        "Llevate dos fragancias árabes premium a precio de lanzamiento."),
    ];
  }

  /* ---------- Estado de la app ---------- */

  let db = load();
  let ui = {
    brand: "all",          // marca seleccionada ("all" = todas)
    view: "panel",         // panel | calendario | contenido
    filterState: "all",    // filtro en vista contenido
    calMonth: null,        // { y, m } del mes visible en el calendario
    calState: "all",       // filtro de estado en el calendario
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.brands) && Array.isArray(data.contents)) {
          return migrate(data);
        }
      }
    } catch (e) { /* datos corruptos: se re-inicializa */ }
    const fresh = { brands: SEED_BRANDS, contents: seedContents() };
    persist(fresh);
    return fresh;
  }

  // Completa campos nuevos en datos guardados con versiones anteriores
  function migrate(data) {
    let changed = false;
    data.brands.forEach(b => {
      if (!b.rubro) {
        const seed = SEED_BRANDS.find(s => s.id === b.id);
        b.rubro = seed ? seed.rubro : "general";
        changed = true;
      }
    });
    if (changed) persist(data);
    return data;
  }

  function persist(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data || db));
  }

  function brandById(id) {
    return db.brands.find(b => b.id === id);
  }

  function uid() {
    return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------- Helpers de renderizado ---------- */

  const $ = sel => document.querySelector(sel);

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function stateBadge(stateId) {
    return `<span class="state-badge state-${stateId}">${esc(STATE_LABEL[stateId])}</span>`;
  }

  function nextState(stateId) {
    const i = STATE_ORDER.indexOf(stateId);
    return i >= 0 && i < STATE_ORDER.length - 1 ? STATE_ORDER[i + 1] : null;
  }

  function visibleContents() {
    return ui.brand === "all"
      ? db.contents
      : db.contents.filter(c => c.brandId === ui.brand);
  }

  function isOverdue(c) {
    return c.state !== "publicado" && c.date && c.date < todayISO();
  }

  /* ---------- Selector de marca ---------- */

  function renderBrandSelector() {
    const el = $("#brandSelector");
    const chips = [
      { id: "all", name: "Todas las marcas", color: "" },
      ...db.brands,
    ];
    el.innerHTML = chips.map(b => `
      <button class="brand-chip ${ui.brand === b.id ? "active" : ""}" data-brand="${b.id}"
        ${b.color ? `style="--chip-color:${b.color}"` : ""}>
        ${b.color ? '<span class="dot"></span>' : ""}
        ${esc(b.name)}
      </button>`).join("");
    el.querySelectorAll(".brand-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        ui.brand = btn.dataset.brand;
        render();
      });
    });
  }

  /* ---------- Panel ---------- */

  function renderPanel() {
    const t = todayISO();
    const contents = visibleContents();
    const brandName = ui.brand === "all" ? null : brandById(ui.brand)?.name;

    // Tareas de hoy
    const overdue = contents.filter(isOverdue)
      .sort((a, b) => a.date.localeCompare(b.date));
    const publishToday = contents.filter(c => c.date === t && c.state === "aprobado");
    const prepare = contents.filter(c =>
      c.date && c.date >= t && daysBetween(t, c.date) <= 2 &&
      (c.state === "idea" || c.state === "borrador"));
    const waiting = contents.filter(c => c.state === "enviado" && !isOverdue(c));

    const hasTasks = overdue.length || publishToday.length || prepare.length || waiting.length;

    const taskItem = c => {
      const b = brandById(c.brandId);
      const next = nextState(c.state);
      return `
      <div class="task-item" style="--item-brand:${b.color}" data-open="${c.id}">
        <span class="task-brandbar"></span>
        <div class="task-body">
          <div class="task-title">${esc(c.title)}</div>
          <div class="task-meta">
            <span class="brand-name">${esc(b.name)}</span>
            <span>·</span><span>${FORMAT_LABEL[c.format]}</span>
            ${c.date ? `<span>·</span><span>${fmtShort(c.date)}</span>` : ""}
            ${stateBadge(c.state)}
          </div>
        </div>
        ${next ? `<button class="advance-btn" data-advance="${c.id}" title="Pasar a ${esc(STATE_LABEL[next])}">
          ${esc(STATE_LABEL[next])}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>` : ""}
      </div>`;
    };

    const group = (label, items, alert) => items.length ? `
      <div class="task-group">
        <div class="task-group-label ${alert ? "alert" : ""}">${label}<span class="count">${items.length}</span></div>
        ${items.map(taskItem).join("")}
      </div>` : "";

    const todayCard = `
      <div class="today-card">
        <div class="today-head">
          <h2>Hoy</h2>
          <span class="today-date">${fmtLong(t)}</span>
        </div>
        ${hasTasks ? `
          ${group("Atrasado", overdue, true)}
          ${group("Publicar hoy", publishToday)}
          ${group("Preparar (próx. 48 h)", prepare)}
          ${group("Esperando al cliente", waiting)}
        ` : `
          <div class="empty-today">
            <div class="serif">Todo al día</div>
            <p>No hay pendientes${brandName ? " para " + esc(brandName) : ""}. Buen momento para adelantar ideas.</p>
          </div>`}
      </div>`;

    // Semana
    const monday = mondayOfWeek(t);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    const weekHTML = `
      <div class="section">
        <div class="eyebrow">Esta semana</div>
        <div class="week-strip">
          ${weekDays.map(d => {
            const items = contents.filter(c => c.date === d);
            const dd = parseISO(d);
            return `
            <div class="week-day ${d === t ? "today" : ""}" data-day="${d}" title="${fmtLong(d)}">
              <div class="dow">${dd.toLocaleDateString("es-AR", { weekday: "short" }).slice(0, 2)}</div>
              <div class="dnum">${dd.getDate()}</div>
              <div class="week-dots">
                ${items.slice(0, 6).map(c => {
                  const b = brandById(c.brandId);
                  return `<span class="dot ${c.state === "publicado" ? "done" : ""}" style="background:${b.color}; border-color:${b.color}" title="${esc(b.name)}: ${esc(c.title)}"></span>`;
                }).join("")}
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>`;

    // Resumen por marca (solo con "Todas las marcas")
    let brandsHTML = "";
    if (ui.brand === "all") {
      const weekEnd = addDays(monday, 6);
      const summaries = db.brands.map(b => {
        const items = db.contents.filter(c => c.brandId === b.id);
        const week = items.filter(c => c.date && c.date >= monday && c.date <= weekEnd);
        const late = items.filter(isOverdue).length;
        const counts = {};
        STATE_ORDER.forEach(s => { counts[s] = week.filter(c => c.state === s).length; });
        return { b, week, late, counts };
      }).sort((x, y) => y.late - x.late || y.week.length - x.week.length);

      brandsHTML = `
      <div class="section">
        <div class="eyebrow">Marcas</div>
        <div class="brand-summary-list">
          ${summaries.map(({ b, week, late, counts }) => `
            <div class="brand-summary" style="--item-brand:${b.color}" data-gobrand="${b.id}">
              <div class="brand-summary-head">
                <span class="brand-summary-name">${esc(b.name)}</span>
                ${late
                  ? `<span class="late-badge">${late} atrasado${late > 1 ? "s" : ""}</span>`
                  : `<span class="ok-badge">al día</span>`}
              </div>
              <div class="brand-summary-obj">${esc(b.descriptor)} · ${esc(b.objective)}</div>
              <div class="brand-summary-states">
                ${week.length === 0
                  ? `<span class="mini-count" style="color:var(--ink-faint);background:var(--bg-soft)">sin contenido esta semana</span>`
                  : STATES.filter(s => counts[s.id] > 0).map(s =>
                      `<span class="mini-count" style="color:var(--st-${s.id});background:var(--st-${s.id}-bg)">${counts[s.id]} ${esc(s.label.toLowerCase())}</span>`
                    ).join("")}
              </div>
            </div>`).join("")}
        </div>
      </div>`;
    }

    $("#mainView").innerHTML = `
      <h1 class="section-title">${brandName ? esc(brandName) : "Panel general"}</h1>
      <p class="section-sub">${brandName
        ? esc(brandById(ui.brand).descriptor) + " · " + esc(brandById(ui.brand).objective)
        : "Resumen de la semana en todas las marcas"}</p>
      ${todayCard}
      ${weekHTML}
      ${brandsHTML}
    `;

    // interacciones
    bindCommon($("#mainView"));
    $("#mainView").querySelectorAll("[data-gobrand]").forEach(el => {
      el.addEventListener("click", () => {
        ui.brand = el.dataset.gobrand;
        render();
      });
    });
    $("#mainView").querySelectorAll("[data-day]").forEach(el => {
      el.addEventListener("click", () => {
        const d = parseISO(el.dataset.day);
        ui.view = "calendario";
        ui.calMonth = { y: d.getFullYear(), m: d.getMonth() + 1 };
        render();
        openDayPanel(el.dataset.day);
      });
    });
  }

  /* ---------- Vista Contenido ---------- */

  function renderContenido() {
    const t = todayISO();
    const all = visibleContents()
      .filter(c => ui.filterState === "all" || c.state === ui.filterState)
      .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));

    const filters = [{ id: "all", label: "Todos" }, ...STATES];
    const filtersHTML = `
      <div class="filters">
        ${filters.map(f => `
          <button class="filter-chip ${ui.filterState === f.id ? "active" : ""}" data-filter="${f.id}">
            ${esc(f.label)}
          </button>`).join("")}
      </div>`;

    // Agrupar por franja temporal
    const groups = [
      { key: "overdue", label: "Atrasados", test: c => isOverdue(c) },
      { key: "today", label: "Hoy", test: c => c.date === t && !isOverdue(c) },
      { key: "week", label: "Esta semana", test: c => c.date && c.date > t && daysBetween(t, c.date) <= 6 },
      { key: "later", label: "Más adelante", test: c => c.date && daysBetween(t, c.date) > 6 },
      { key: "nodate", label: "Sin fecha", test: c => !c.date },
      { key: "past", label: "Publicados anteriores", test: () => true },
    ];
    const bucketed = new Map(groups.map(g => [g.key, []]));
    all.forEach(c => {
      const g = groups.find(g => g.test(c));
      bucketed.get(g.key).push(c);
    });

    const card = c => {
      const b = brandById(c.brandId);
      const next = nextState(c.state);
      return `
      <div class="content-card" style="--item-brand:${b.color}" data-open="${c.id}">
        <div class="content-card-top">
          <div>
            <div class="content-card-title">${esc(c.title)}</div>
            ${c.copy ? `<div class="content-card-copy">${esc(c.copy)}</div>` : ""}
          </div>
          <div class="card-actions">
            ${stateBadge(c.state)}
          </div>
        </div>
        <div class="content-card-meta">
          ${ui.brand === "all" ? `<span class="meta-chip brand-tag">${esc(b.name)}</span>` : ""}
          <span class="meta-chip">${FORMAT_LABEL[c.format]}</span>
          ${c.pillar ? `<span class="meta-chip">${esc(c.pillar)}</span>` : ""}
          ${c.date ? `<span class="${isOverdue(c) ? "overdue-tag" : ""}">${fmtShort(c.date)}${isOverdue(c) ? " · atrasado" : ""}</span>` : ""}
          ${next ? `<button class="advance-btn" style="margin-left:auto" data-advance="${c.id}">
            ${esc(STATE_LABEL[next])}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>` : ""}
        </div>
      </div>`;
    };

    const listHTML = all.length === 0
      ? `<div class="empty-list">
          <div class="serif">Nada por acá</div>
          <p>Creá tu primer contenido con el botón +</p>
        </div>`
      : groups.map(g => {
          const items = bucketed.get(g.key);
          if (!items.length) return "";
          return `
            <div class="date-group-label ${g.key === "overdue" ? "overdue" : ""}">${g.label}</div>
            ${items.map(card).join("")}`;
        }).join("");

    const brandName = ui.brand === "all" ? "Todas las marcas" : brandById(ui.brand)?.name;

    $("#mainView").innerHTML = `
      <h1 class="section-title">Contenido</h1>
      <p class="section-sub">${esc(brandName)} · ${all.length} pieza${all.length !== 1 ? "s" : ""}</p>
      ${filtersHTML}
      ${listHTML}
    `;

    bindCommon($("#mainView"));
    $("#mainView").querySelectorAll("[data-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        ui.filterState = btn.dataset.filter;
        render();
      });
    });
  }

  /* ---------- Vista Calendario ---------- */

  function renderCalendario() {
    const t = todayISO();
    if (!ui.calMonth) {
      const td = parseISO(t);
      ui.calMonth = { y: td.getFullYear(), m: td.getMonth() + 1 };
    }
    const { y, m } = ui.calMonth;
    const monthStart = `${y}-${String(m).padStart(2, "0")}-01`;
    const daysInMonth = new Date(y, m, 0).getDate();
    const monthEnd = `${y}-${String(m).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

    // Piezas del mes (marca según selector global, estado según filtro local)
    const monthAll = visibleContents().filter(c => c.date && c.date >= monthStart && c.date <= monthEnd);
    const monthFiltered = monthAll.filter(c => ui.calState === "all" || c.state === ui.calState);
    const byDay = new Map();
    monthFiltered.forEach(c => {
      if (!byDay.has(c.date)) byDay.set(c.date, []);
      byDay.get(c.date).push(c);
    });

    // Efemérides del mes
    const efems = efemeridesForMonth(y, m);
    const efemsByDay = new Map();
    efems.forEach(e => {
      if (!efemsByDay.has(e.date)) efemsByDay.set(e.date, []);
      efemsByDay.get(e.date).push(e);
    });

    // Sugerencias: efeméride cuyo rubro coincide con una marca con pocos posts este mes
    const scopeBrands = ui.brand === "all" ? db.brands : [brandById(ui.brand)].filter(Boolean);
    const suggestions = [];
    for (const e of efems) {
      if (e.date < t) continue; // efemérides pasadas no suman
      for (const b of scopeBrands) {
        const specific = e.rubros.filter(r => r !== "general");
        if (!specific.includes(b.rubro)) continue;
        const brandMonthCount = db.contents.filter(c =>
          c.brandId === b.id && c.date && c.date >= monthStart && c.date <= monthEnd).length;
        if (brandMonthCount >= 3) continue;
        const hasThatDay = db.contents.some(c => c.brandId === b.id && c.date === e.date);
        if (hasThatDay) continue;
        suggestions.push({ brand: b, efem: e });
      }
    }

    const monthName = new Date(y, m - 1, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });

    // Encabezado con navegación
    const headHTML = `
      <div class="cal-head">
        <h1 class="cal-title">${esc(monthName)}</h1>
        <button class="cal-today-btn" id="calToday">Hoy</button>
        <button class="cal-nav-btn" id="calPrev" aria-label="Mes anterior">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button class="cal-nav-btn" id="calNext" aria-label="Mes siguiente">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        </button>
      </div>`;

    // Filtro por estado
    const filtersHTML = `
      <div class="filters">
        ${[{ id: "all", label: "Todos" }, ...STATES].map(s => `
          <button class="filter-chip ${ui.calState === s.id ? "active" : ""}" data-calfilter="${s.id}">
            ${esc(s.label)}
          </button>`).join("")}
      </div>`;

    // Franja de efemérides
    const efemHTML = `
      <div class="efem-strip-wrap">
        <div class="eyebrow">Efemérides argentinas</div>
        ${efems.length ? `
        <div class="efem-strip">
          ${efems.map(e => `
            <span class="efem-chip" data-goday="${e.date}">
              <b>${e.day} ${esc(new Date(y, m - 1, 1).toLocaleDateString("es-AR", { month: "short" }))}</b>
              ${esc(e.name)}
              ${e.rubros.map(r => `<span class="rubro-dot" style="background:${RUBRO_META[r].color}" title="${esc(RUBRO_META[r].label)}"></span>`).join("")}
            </span>`).join("")}
        </div>` : `<div class="efem-empty">Sin efemérides cargadas para este mes.</div>`}
        ${suggestions.length ? `
        <div class="suggestions">
          ${suggestions.slice(0, 3).map((s, i) => `
            <button class="suggestion" data-sug="${i}">
              <span class="sug-icon">✦</span>
              <span><b>${esc(s.brand.name)}</b> tiene pocos posts este mes — ¿algo para el <b>${esc(s.efem.name)}</b> (${fmtShort(s.efem.date)})?</span>
            </button>`).join("")}
        </div>` : ""}
      </div>`;

    // Grilla mensual (semana empieza lunes)
    const firstDow = (new Date(y, m - 1, 1).getDay() + 6) % 7;
    const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
    const dows = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];
    const MAX_PILLS = 3;

    let cells = "";
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - firstDow + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        cells += `<div class="cal-cell other"></div>`;
        continue;
      }
      const iso = `${y}-${String(m).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const items = byDay.get(iso) || [];
      const dayEfems = efemsByDay.get(iso);
      const classes = ["cal-cell"];
      if (!items.length) classes.push("dim");
      if (iso === t) classes.push("today");
      cells += `
        <div class="${classes.join(" ")}" data-calday="${iso}">
          <div class="cal-dnum">${dayNum}</div>
          ${dayEfems ? `<span class="efem-dot" title="${esc(dayEfems.map(e => e.name).join(" · "))}"></span>` : ""}
          ${items.slice(0, MAX_PILLS).map(c => {
            const b = brandById(c.brandId);
            return `<span class="cal-pill ${c.state === "publicado" ? "done" : ""}" style="background:${b.color}"
              title="${esc(b.name)}: ${esc(c.title)} · ${esc(STATE_LABEL[c.state])}">
              ${FORMAT_ICONS[c.format]}<span class="t">${esc(c.title)}</span>
            </span>`;
          }).join("")}
          ${items.length > MAX_PILLS ? `<div class="cal-more">+${items.length - MAX_PILLS}</div>` : ""}
        </div>`;
    }

    const gridHTML = `
      <div class="cal-dow-row">${dows.map(d => `<div class="cal-dow">${d}</div>`).join("")}</div>
      <div class="cal-grid">${cells}</div>`;

    $("#mainView").innerHTML = headHTML + filtersHTML + efemHTML + gridHTML;

    // Interacciones
    const shift = delta => {
      let { y, m } = ui.calMonth;
      m += delta;
      if (m < 1) { m = 12; y--; }
      if (m > 12) { m = 1; y++; }
      ui.calMonth = { y, m };
      render();
    };
    $("#calPrev").addEventListener("click", () => shift(-1));
    $("#calNext").addEventListener("click", () => shift(1));
    $("#calToday").addEventListener("click", () => {
      const td = parseISO(t);
      ui.calMonth = { y: td.getFullYear(), m: td.getMonth() + 1 };
      render();
    });
    $("#mainView").querySelectorAll("[data-calfilter]").forEach(btn => {
      btn.addEventListener("click", () => {
        ui.calState = btn.dataset.calfilter;
        render();
      });
    });
    $("#mainView").querySelectorAll("[data-calday]").forEach(cell => {
      cell.addEventListener("click", () => openDayPanel(cell.dataset.calday));
    });
    $("#mainView").querySelectorAll("[data-goday]").forEach(chip => {
      chip.addEventListener("click", () => openDayPanel(chip.dataset.goday));
    });
    $("#mainView").querySelectorAll("[data-sug]").forEach(btn => {
      btn.addEventListener("click", () => {
        const s = suggestions[Number(btn.dataset.sug)];
        openEditor(null, { brandId: s.brand.id, date: s.efem.date, title: s.efem.name });
      });
    });
  }

  /* ---------- Panel lateral de día ---------- */

  const dayBackdrop = $("#dayPanelBackdrop");

  function openDayPanel(iso) {
    const d = parseISO(iso);
    const items = visibleContents()
      .filter(c => c.date === iso)
      .sort((a, b) => STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state));
    const dayEfems = efemeridesForMonth(d.getFullYear(), d.getMonth() + 1)
      .filter(e => e.date === iso);

    const itemHTML = c => {
      const b = brandById(c.brandId);
      const next = nextState(c.state);
      return `
      <div class="task-item" style="--item-brand:${b.color}" data-open="${c.id}">
        <span class="task-brandbar"></span>
        <div class="task-body">
          <div class="task-title">${esc(c.title)}</div>
          <div class="task-meta">
            <span class="brand-name">${esc(b.name)}</span>
            <span>·</span><span>${FORMAT_LABEL[c.format]}</span>
            ${stateBadge(c.state)}
          </div>
        </div>
        ${next ? `<button class="advance-btn" data-advance="${c.id}">
          ${esc(STATE_LABEL[next])}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>` : ""}
      </div>`;
    };

    $("#dayPanel").innerHTML = `
      <div class="day-panel-head">
        <h2>${esc(fmtLong(iso))}</h2>
        <button class="icon-btn" id="dayPanelClose" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      ${dayEfems.map(e => `
        <span class="efem-chip"><b>Efeméride</b> ${esc(e.name)}
          ${e.rubros.map(r => `<span class="rubro-dot" style="background:${RUBRO_META[r].color}" title="${esc(RUBRO_META[r].label)}"></span>`).join("")}
        </span>`).join("")}
      <div class="day-panel-list">
        ${items.length ? items.map(itemHTML).join("") : `
          <div class="day-panel-empty">
            <div class="serif">Día libre</div>
          </div>`}
      </div>
      <button class="btn-newday" id="btnNewDay">＋ Nuevo contenido este día</button>
    `;

    dayBackdrop.hidden = false;
    document.body.style.overflow = "hidden";

    $("#dayPanelClose").addEventListener("click", closeDayPanel);
    $("#btnNewDay").addEventListener("click", () => {
      closeDayPanel();
      openEditor(null, { date: iso });
    });
    $("#dayPanel").querySelectorAll("[data-open]").forEach(el => {
      el.addEventListener("click", () => {
        closeDayPanel();
        openEditor(el.dataset.open);
      });
    });
    $("#dayPanel").querySelectorAll("[data-advance]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        advanceState(btn.dataset.advance);
        openDayPanel(iso); // refrescar el panel con el nuevo estado
      });
    });
  }

  function closeDayPanel() {
    dayBackdrop.hidden = true;
    document.body.style.overflow = "";
  }

  dayBackdrop.addEventListener("click", e => {
    if (e.target === dayBackdrop) closeDayPanel();
  });

  /* Clicks compartidos: abrir editor / avanzar estado */
  function bindCommon(root) {
    root.querySelectorAll("[data-advance]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        advanceState(btn.dataset.advance);
      });
    });
    root.querySelectorAll("[data-open]").forEach(el => {
      el.addEventListener("click", () => openEditor(el.dataset.open));
    });
  }

  function advanceState(id) {
    const c = db.contents.find(x => x.id === id);
    if (!c) return;
    const next = nextState(c.state);
    if (!next) return;
    c.state = next;
    c.updatedAt = Date.now();
    persist();
    toast(`${c.title} → ${STATE_LABEL[next]}`);
    render();
  }

  /* ---------- Editor (modal) ---------- */

  const backdrop = $("#modalBackdrop");
  const form = $("#contentForm");

  function openEditor(id, prefill) {
    prefill = prefill || {};
    const editing = id ? db.contents.find(c => c.id === id) : null;
    $("#modalTitle").textContent = editing ? "Editar contenido" : "Nuevo contenido";
    $("#btnDelete").hidden = !editing;
    $("#fId").value = editing ? editing.id : "";

    // Marcas (radio con color)
    const selectedBrand = editing ? editing.brandId
      : (prefill.brandId || (ui.brand !== "all" ? ui.brand : db.brands[0].id));
    $("#fBrand").innerHTML = db.brands.map(b => `
      <label>
        <input type="radio" name="brand" value="${b.id}" ${b.id === selectedBrand ? "checked" : ""} />
        <span class="opt" style="--opt-color:${b.color}">
          <span class="dot" style="background:${b.color}"></span>${esc(b.name)}
        </span>
      </label>`).join("");

    // Estados (radio con color)
    const selectedState = editing ? editing.state : "idea";
    $("#fState").innerHTML = STATES.map(s => `
      <label>
        <input type="radio" name="state" value="${s.id}" ${s.id === selectedState ? "checked" : ""} />
        <span class="opt" style="--opt-color:var(--st-${s.id}); --opt-bg:var(--st-${s.id}-bg)">${esc(s.label)}</span>
      </label>`).join("");

    // Formatos
    $("#fFormat").innerHTML = FORMATS.map(f =>
      `<option value="${f.id}" ${editing && editing.format === f.id ? "selected" : ""}>${esc(f.label)}</option>`).join("");

    $("#fTitle").value = editing ? editing.title : (prefill.title || "");
    $("#fDate").value = editing ? (editing.date || "") : (prefill.date || todayISO());
    $("#fCopy").value = editing ? editing.copy : "";
    $("#fNotes").value = editing ? editing.notes : "";

    refreshPillars(selectedBrand, editing ? editing.pillar : null);

    // los pilares dependen de la marca elegida
    $("#fBrand").querySelectorAll("input").forEach(r => {
      r.addEventListener("change", () => refreshPillars(r.value, null));
    });

    backdrop.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function refreshPillars(brandId, selected) {
    const b = brandById(brandId);
    const pillars = b ? b.pillars : [];
    $("#fPillar").innerHTML =
      `<option value="">— Sin pilar —</option>` +
      pillars.map(p => `<option value="${esc(p)}" ${p === selected ? "selected" : ""}>${esc(p)}</option>`).join("");
  }

  function closeEditor() {
    backdrop.hidden = true;
    document.body.style.overflow = "";
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const id = $("#fId").value;
    const data = {
      brandId: form.querySelector('input[name="brand"]:checked').value,
      title: $("#fTitle").value.trim(),
      date: $("#fDate").value || "",
      format: $("#fFormat").value,
      pillar: $("#fPillar").value,
      state: form.querySelector('input[name="state"]:checked').value,
      copy: $("#fCopy").value.trim(),
      notes: $("#fNotes").value.trim(),
      updatedAt: Date.now(),
    };
    if (!data.title) return;

    if (id) {
      const c = db.contents.find(x => x.id === id);
      Object.assign(c, data);
      toast("Contenido actualizado");
    } else {
      db.contents.push({ id: uid(), createdAt: Date.now(), ...data });
      toast("Contenido creado");
    }
    persist();
    closeEditor();
    render();
  });

  $("#btnDelete").addEventListener("click", () => {
    const id = $("#fId").value;
    const c = db.contents.find(x => x.id === id);
    if (!c) return;
    if (!confirm(`¿Eliminar "${c.title}"?`)) return;
    db.contents = db.contents.filter(x => x.id !== id);
    persist();
    closeEditor();
    toast("Contenido eliminado");
    render();
  });

  $("#modalClose").addEventListener("click", closeEditor);
  backdrop.addEventListener("click", e => {
    if (e.target === backdrop) closeEditor();
  });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (!backdrop.hidden) closeEditor();
    else if (!dayBackdrop.hidden) closeDayPanel();
  });

  $("#fabNew").addEventListener("click", () => openEditor(null));

  /* ---------- Toast ---------- */

  let toastTimer = null;
  function toast(msg) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  /* ---------- Navegación ---------- */

  document.querySelectorAll(".bottomnav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      ui.view = btn.dataset.view;
      render();
    });
  });

  /* ---------- Render raíz ---------- */

  function render() {
    renderBrandSelector();
    document.querySelectorAll(".bottomnav-btn").forEach(b =>
      b.classList.toggle("active", b.dataset.view === ui.view));
    if (ui.view === "panel") renderPanel();
    else if (ui.view === "calendario") renderCalendario();
    else renderContenido();
    window.scrollTo({ top: 0 });
  }

  render();
})();
