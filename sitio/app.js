/* Levantamiento de Convenios (módulo SIGEPRO) — interfaz. JavaScript simple, sin dependencias. */
(function () {
  "use strict";
  var C = window.CONV, API = window.API;
  var S = { e: null, u: null, pestana: null, f: {}, edit: null };
  var app = document.getElementById("app");
  var ROLES = { regional: "Usuario regional", admin: "Administrador", consulta: "Consulta (solo lectura)" };
  var ROLES_AYUDA = { regional: "Ve y registra los convenios de todas las delegaciones de su región.", admin: "Gestiona cuentas, ve todo, edita, devuelve y configura el periodo.", consulta: "Ve el resumen y todos los convenios. No puede modificar nada." };

  // ---------- utilidades ----------
  function h(tag, props) {
    var el = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "class") el.className = v;
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else if (k === "value") el.value = v;
      else if (k === "checked") el.checked = !!v;
      else if (k === "disabled") el.disabled = !!v;
      else if (k === "html") el.innerHTML = v;
      else el.setAttribute(k, v === true ? "" : v);
    });
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) c.forEach(function (x) { add(el, x); });
    else el.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
  }
  function fFecha(iso) { return iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso.slice(8, 10) + "/" + iso.slice(5, 7) + "/" + iso.slice(0, 4) : ""; }
  function fFechaHora(ts) { return ts ? fFecha(ts) + " " + ts.slice(11, 16) : ""; }
  function mensaje(tipo, txt) { return h("div", { class: "msg " + tipo, role: tipo === "error" ? "alert" : "status" }, txt); }
  function campo(label, input, hint) {
    var id = input.id || ("c" + Math.random().toString(36).slice(2, 8)); input.id = id;
    return h("div", { class: "field" }, h("label", { for: id }, label), input, hint ? h("div", { class: "hint" }, hint) : null);
  }
  function aviso(t, tipo) {
    var b = document.getElementById("aviso-global"); if (!b) return;
    b.textContent = t; b.className = tipo === "error" ? "error" : ""; b.hidden = false;
    clearTimeout(aviso.t); aviso.t = setTimeout(function () { b.hidden = true; }, 6000);
  }
  function titulo(c, d) { return typeof c.t === "function" ? c.t(d) : c.t; }
  function delegacionDe(did) { return C.delegacion(did) || { did: did, nombre: did || "—", region: "—", tipo: "" }; }
  function tituloRegion(rid) { var r = C.region(rid); return r ? r.titulo : (rid || "—"); }
  function nombreCorto(did) { var d = C.delegacion(did); return d ? d.nombre.replace(/^Delegación Presidencial /, "DP ") : (did || "—"); }
  function pillEstado(e) {
    var m = { borrador: ["none", "✎ Borrador"], enviado: ["ok", "✓ Enviado"], devuelto: ["warn", "↩ Devuelto"] }[e] || ["none", e];
    return h("span", { class: "pill " + m[0] }, m[1]);
  }
  function confirmar(titulo, texto, boton, peligro) {
    return new Promise(function (res) {
      var velo = h("div", { class: "velo", onclick: function (ev) { if (ev.target === velo) { velo.remove(); res(false); } } });
      var si = h("button", { class: "btn" + (peligro ? " peligro-lleno" : ""), onclick: function () { velo.remove(); res(true); } }, boton);
      velo.appendChild(h("div", { class: "modal chico", role: "dialog", "aria-modal": "true" },
        h("h2", null, titulo), h("p", { style: "margin:10px 0 18px" }, texto),
        h("div", { class: "row" }, si, h("button", { class: "btn sec", onclick: function () { velo.remove(); res(false); } }, "Cancelar"))));
      document.body.appendChild(velo); si.focus();
    });
  }
  function modal(tituloTxt, contenido, ancho) {
    var velo = h("div", { class: "velo", onclick: function (ev) { if (ev.target === velo) cerrar(); } });
    function cerrar() { velo.remove(); document.removeEventListener("keydown", esc); }
    function esc(ev) { if (ev.key === "Escape") cerrar(); }
    document.addEventListener("keydown", esc);
    velo.appendChild(h("div", { class: "modal" + (ancho ? " ancho" : ""), role: "dialog", "aria-modal": "true" },
      h("div", { class: "row", style: "justify-content:space-between;margin-bottom:12px;flex-wrap:nowrap" }, h("h2", null, tituloTxt), h("button", { class: "btn sec small no-print", onclick: cerrar }, "Cerrar")),
      contenido(cerrar)));
    document.body.appendChild(velo);
    return cerrar;
  }
  function bajar(nombre, datos, tipo) {
    var blob = new Blob([datos], { type: tipo || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = nombre; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 4000);
  }
  function hoyTxt() { return (S.e && S.e.hoy) || new Date().toISOString().slice(0, 10); }

  // ---------- Excel (.xlsx) ----------
  function xesc(s) { return String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function colL(i) { var s = ""; while (i > 0) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - m - 1) / 26); } return s; }
  function xlsx(hojas) {
    var z = new JSZip();
    var estilos = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F4E79"/><bgColor rgb="FF1F4E79"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFD9E0E7"/></left><right style="thin"><color rgb="FFD9E0E7"/></right><top style="thin"><color rgb="FFD9E0E7"/></top><bottom style="thin"><color rgb="FFD9E0E7"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="3" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
    var ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>';
    var wbS = "", rel = "";
    hojas.forEach(function (hj, i) {
      var n = i + 1, filas = '<row r="1" ht="32" customHeight="1">' + hj.columnas.map(function (c, j) { return '<c r="' + colL(j + 1) + '1" s="1" t="inlineStr"><is><t xml:space="preserve">' + xesc(c.t) + "</t></is></c>"; }).join("") + "</row>";
      hj.filas.forEach(function (f, r) {
        var rr = r + 2;
        filas += '<row r="' + rr + '">' + f.map(function (v, j) {
          var ref = colL(j + 1) + rr;
          if (typeof v === "number" && isFinite(v)) return '<c r="' + ref + '" s="3"><v>' + v + "</v></c>";
          if (v === null || v === undefined || v === "") return '<c r="' + ref + '" s="2"/>';
          return '<c r="' + ref + '" s="2" t="inlineStr"><is><t xml:space="preserve">' + xesc(String(v).slice(0, 32000)) + "</t></is></c>";
        }).join("") + "</row>";
      });
      var ult = colL(hj.columnas.length) + Math.max(2, hj.filas.length + 1);
      var cols = hj.columnas.map(function (c, j) { return '<col min="' + (j + 1) + '" max="' + (j + 1) + '" width="' + (c.ancho || 24) + '" customWidth="1"/>'; }).join("");
      z.file("xl/worksheets/sheet" + n + ".xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"' + (i === 0 ? ' tabSelected="1"' : "") + '><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>' + cols + "</cols><sheetData>" + filas + '</sheetData><autoFilter ref="A1:' + ult + '"/></worksheet>');
      ct += '<Override PartName="/xl/worksheets/sheet' + n + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
      wbS += '<sheet name="' + xesc(hj.nombre.slice(0, 31)) + '" sheetId="' + n + '" r:id="rId' + n + '"/>';
      rel += '<Relationship Id="rId' + n + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + n + '.xml"/>';
    });
    var defs = hojas.map(function (hj, i) { return '<definedName name="_xlnm._FilterDatabase" localSheetId="' + i + '" hidden="1">\'' + xesc(hj.nombre.slice(0, 31)).replace(/'/g, "''") + "'!$A$1:$" + colL(hj.columnas.length) + "$" + Math.max(2, hj.filas.length + 1) + "</definedName>"; }).join("");
    z.file("[Content_Types].xml", ct + "</Types>");
    z.file("_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
    z.file("xl/workbook.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + wbS + "</sheets><definedNames>" + defs + "</definedNames></workbook>");
    z.file("xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + rel + '<Relationship Id="rId' + (hojas.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
    z.file("xl/styles.xml", estilos);
    return z.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  }
  function valorExcel(c, v) {
    if (C.vacio(v)) return "";
    if ((c.tipo === "monto" || c.tipo === "entero") && /^\d+$/.test(String(v))) return Number(v);
    if (c.tipo === "delegacion") return delegacionDe(v).nombre;
    if (c.tipo === "date") return fFecha(v);
    if (Array.isArray(v)) return v.join("; ");
    return String(v);
  }
  function excelConvenios(regs, nombreArchivo) {
    var cols = C.columnas().filter(function (x) { return x.k !== "delegacion"; });
    var cab = [{ t: "N°", ancho: 7 }, { t: "Periodo", ancho: 10 }, { t: "Región", ancho: 22 }, { t: "Delegación", ancho: 40 }, { t: "Estado del registro", ancho: 14 }, { t: "Enviado", ancho: 17 }, { t: "Enviado por", ancho: 18 }, { t: "Última modificación", ancho: 17 }, { t: "Modificado por", ancho: 18 }]
      .concat(cols.map(function (x) { return { t: x.t, ancho: x.campo.tipo === "textarea" || x.campo.tipo === "checkbox" ? 45 : (x.campo.tipo === "monto" || x.campo.tipo === "entero" ? 16 : 28) }; }));
    var filas = regs.map(function (r) {
      var d = r.datos || {}, dl = delegacionDe(r.delegacion);
      return [r.id, r.periodo, dl.region, dl.nombre, C.ESTADOS[r.estado] || r.estado, fFechaHora(r.enviado), r.enviado_por, fFechaHora(r.actualizado), r.actualizado_por]
        .concat(cols.map(function (x) { return valorExcel(x.campo, d[x.k]); }));
    });
    return xlsx([{ nombre: "Convenios", columnas: cab, filas: filas }]).then(function (u8) { bajar(nombreArchivo, u8); });
  }

  // ---------- inicio ----------
  function cargarEstado() {
    return API.estado().then(function (e) {
      S.e = e; S.u = e.usuario || null;
      if (S.u && !S.pestana) S.pestana = S.u.rol === "regional" ? "mis" : "resumen";
      render();
    }).catch(function (e) {
      app.innerHTML = "";
      app.appendChild(h("div", { class: "page" }, mensaje("error", "No se pudo conectar con el servidor: " + e.message), h("button", { class: "btn", onclick: cargarEstado }, "Reintentar")));
    });
  }
  function salir() {
    var hacer = function () { API.salir().then(function () { S.u = null; S.edit = null; S.pestana = null; S.f = {}; render(); }); };
    if (S.edit && S.edit.sucio) return confirmar("¿Cerrar sesión sin guardar?", "Hay cambios en el formulario que aún no se han guardado.", "Cerrar sesión", true).then(function (si) { if (si) hacer(); });
    hacer();
  }
  function render() {
    app.innerHTML = "";
    window.scrollTo(0, 0);
    if (!S.e.configurado) return app.appendChild(vistaConfigurar());
    if (!S.u) return app.appendChild(vistaLogin());
    if (S.u.cambiar) { app.appendChild(barra()); return app.appendChild(h("div", { class: "page" }, vistaCambiarClave(true))); }
    app.appendChild(barra());
    if (S.edit) return app.appendChild(vistaFormulario());
    var tabs = pestanas();
    if (!tabs.some(function (t) { return t[0] === S.pestana; })) S.pestana = tabs[0][0];
    app.appendChild(h("div", { class: "tabs", role: "tablist" }, tabs.map(function (t) {
      return h("button", { class: "tab", role: "tab", "aria-selected": String(S.pestana === t[0]), onclick: function () { S.pestana = t[0]; render(); } }, t[1]);
    })));
    var page = h("main", { class: "page" });
    app.appendChild(page);
    ({ mis: vistaMisConvenios, resumen: vistaResumen, convenios: vistaConvenios, cuentas: vistaCuentas, bitacora: vistaBitacora, config: vistaConfig, cuenta: vistaMiCuenta })[S.pestana](page);
  }
  function pestanas() {
    if (S.u.rol === "admin") return [["resumen", "Resumen"], ["convenios", "Convenios"], ["cuentas", "Cuentas"], ["bitacora", "Bitácora"], ["config", "Configuración"], ["cuenta", "Mi cuenta"]];
    if (S.u.rol === "consulta") return [["resumen", "Resumen"], ["convenios", "Convenios"], ["cuenta", "Mi cuenta"]];
    return [["mis", "Convenios de mi región"], ["cuenta", "Mi cuenta"]];
  }
  function marca() {
    return h("div", { class: "brand" }, h("div", { class: "brand-mark", "aria-hidden": "true" }, "SG"),
      h("div", null, h("div", { class: "brand-t" }, "Levantamiento de Convenios"), h("div", { class: "brand-s" }, "SIGEPRO · División de Gobierno Interior")));
  }
  function barra() {
    var sub = S.u.rol === "regional" ? tituloRegion(S.u.region) : ROLES[S.u.rol];
    return h("header", { class: "topbar" }, marca(),
      h("div", { class: "periodo-chip", title: "Periodo activo" }, S.e.periodo_nombre || S.e.periodo, S.e.recepcion === "cerrada" ? " · recepción cerrada" : ""),
      h("div", { class: "spacer" }),
      h("div", { class: "who" }, h("b", null, S.u.nombre), sub),
      h("button", { class: "btn sec small", onclick: salir }, "Cerrar sesión"));
  }

  // ---------- acceso ----------
  function vistaLogin() {
    var u = h("input", { type: "text", id: "lg-u", autocomplete: "username", autocapitalize: "none", spellcheck: "false", required: true });
    var p = h("input", { type: "password", id: "lg-p", autocomplete: "current-password", required: true });
    var err = h("div"), b = h("button", { class: "btn", type: "submit", style: "width:100%" }, "Ingresar");
    var f = h("form", { onsubmit: function (ev) {
      ev.preventDefault(); err.innerHTML = ""; b.disabled = true; b.textContent = "Ingresando…";
      API.entrar(u.value, p.value).then(function () { S.pestana = null; return cargarEstado(); })
        .catch(function (e) { err.appendChild(mensaje("error", e.message)); b.disabled = false; b.textContent = "Ingresar"; p.value = ""; p.focus(); });
    } }, err, campo("Usuario", u), campo("Contraseña", p), b);
    var demo = API.demo ? h("div", { class: "card info" }, h("h3", null, "Modo demostración"),
      h("p", { class: "small" }, "Para probar la plataforma usa una de estas cuentas (contraseña ", h("b", null, "demo1234"), "):"),
      h("div", { class: "demo-cuentas" }, [["admin", "Administrador nacional"], ["valparaiso", "Usuario regional de Valparaíso"], ["metropolitana", "Usuario regional Metropolitana"], ["consulta", "Solo lectura"]].map(function (x) {
        return h("button", { type: "button", class: "btn sec small", onclick: function () { u.value = x[0]; p.value = "demo1234"; b.focus(); } }, h("b", null, x[0]), " · ", x[1]);
      })),
      h("p", { class: "small muted", style: "margin-top:10px" }, "Lo que ingreses queda guardado solo en este navegador. ",
        h("button", { type: "button", class: "link", onclick: function () { API.reiniciarDemo().then(function () { aviso("Datos de demostración reiniciados."); }); } }, "Reiniciar datos de demostración"))) : null;
    setTimeout(function () { u.focus(); }, 0);
    return h("div", { class: "login" }, h("div", { class: "card centrada" }, marca(), h("h1", { style: "margin:18px 0 4px" }, "Ingresar"),
      h("p", { class: "muted small", style: "margin-bottom:16px" }, "Usa el usuario y contraseña entregados por la Unidad de Coordinación y Gestión Territorial."), f), demo);
  }
  function vistaConfigurar() {
    var n = h("input", { type: "text", id: "cf-n", autocomplete: "name" }), u = h("input", { type: "text", id: "cf-u", autocapitalize: "none", value: "admin" });
    var p = h("input", { type: "password", id: "cf-p", autocomplete: "new-password" }), p2 = h("input", { type: "password", id: "cf-p2", autocomplete: "new-password" });
    var err = h("div"), b = h("button", { class: "btn", type: "submit" }, "Crear administrador");
    return h("div", { class: "card centrada" }, marca(), h("h1", { style: "margin:18px 0 6px" }, "Primera configuración"),
      h("p", { class: "muted small", style: "margin-bottom:14px" }, "Crea la cuenta del administrador. Después podrás crear las cuentas de los usuarios regionales."),
      h("form", { onsubmit: function (ev) {
        ev.preventDefault(); err.innerHTML = "";
        if (p.value !== p2.value) return err.appendChild(mensaje("error", "Las contraseñas no coinciden."));
        b.disabled = true;
        API.configurar(n.value, u.value, p.value).then(cargarEstado).catch(function (e) { err.appendChild(mensaje("error", e.message)); b.disabled = false; });
      } }, err, campo("Tu nombre", n), campo("Usuario", u, "Letras sin tilde, números, punto o guion."), campo("Contraseña", p, "Mínimo 8 caracteres."), campo("Repite la contraseña", p2), b));
  }
  function vistaCambiarClave(obligatorio) {
    var nom = h("input", { type: "text", id: "cc-n", value: S.u.nombre });
    var a = h("input", { type: "password", id: "cc-a", autocomplete: "current-password" });
    var n = h("input", { type: "password", id: "cc-nv", autocomplete: "new-password" }), n2 = h("input", { type: "password", id: "cc-nv2", autocomplete: "new-password" });
    var err = h("div"), b = h("button", { class: "btn", type: "submit" }, "Guardar contraseña");
    var f = h("form", { onsubmit: function (ev) {
      ev.preventDefault(); err.innerHTML = "";
      if (n.value !== n2.value) return err.appendChild(mensaje("error", "Las contraseñas nuevas no coinciden."));
      b.disabled = true;
      API.cambiarClave(a.value, n.value, obligatorio ? nom.value : "").then(function () {
        aviso("Contraseña actualizada."); a.value = n.value = n2.value = ""; b.disabled = false;
        if (obligatorio) cargarEstado();
      }).catch(function (e) { err.appendChild(mensaje("error", e.message)); b.disabled = false; });
    } }, err, obligatorio ? campo("Tu nombre", nom, "Así aparecerás en los registros.") : null,
      campo(obligatorio ? "Contraseña temporal (la que te entregaron)" : "Contraseña actual", a), campo("Nueva contraseña", n, "Mínimo 8 caracteres."), campo("Repite la nueva contraseña", n2),
      h("div", { class: "row" }, b, obligatorio ? h("button", { type: "button", class: "btn sec", onclick: salir }, "Cerrar sesión") : null));
    return h("div", { class: "card" + (obligatorio ? " centrada" : ""), style: obligatorio ? "" : "max-width:520px" },
      h("h2", null, obligatorio ? "Elige tu contraseña" : "Cambiar contraseña"),
      obligatorio ? h("p", { class: "muted small" }, "Es tu primer ingreso o tu contraseña fue restablecida. Elige una contraseña personal para continuar.") : null, f);
  }

  // ---------- periodo ----------
  function bandaPeriodo() {
    var e = S.e, abierta = e.recepcion === "abierta", lim = e.fecha_limite;
    var vencido = abierta && lim && hoyTxt() > lim;
    var cls = !abierta ? "plazo atras" : vencido ? "plazo pend" : "plazo ok";
    return h("div", { class: cls },
      h("div", { class: "plazo-t" }, "Periodo: " + (e.periodo_nombre || e.periodo)),
      h("div", null, abierta ? (lim ? (vencido ? "⚠ El plazo de entrega venció el " + fFecha(lim) + ". Aún puedes enviar mientras la recepción siga abierta." : "Recepción abierta · plazo de entrega: " + fFecha(lim)) : "Recepción abierta") : "✕ La recepción de respuestas está cerrada. Solo puedes consultar lo enviado."));
  }

  // ---------- Usuario regional: convenios de su región ----------
  function vistaMisConvenios(page) {
    var abierta = S.e.recepcion === "abierta", dels = C.delegacionesDe(S.u.region);
    page.appendChild(h("div", { class: "page-head" }, h("div", null, h("h1", null, "Convenios de mi región"), h("p", { class: "muted" }, tituloRegion(S.u.region) + " · " + dels.length + " delegaciones")),
      abierta ? h("button", { class: "btn grande", onclick: function () { abrirFormulario(null); } }, "+ Registrar convenio") : null));
    page.appendChild(bandaPeriodo());
    var cuerpo = h("div", null, h("p", { class: "cargando" }, "Cargando…"));
    page.appendChild(cuerpo);
    API.listar({}).then(function (regs) {
      cuerpo.innerHTML = "";
      var act = regs.filter(function (r) { return r.periodo === S.e.periodo; }), ant = regs.filter(function (r) { return r.periodo !== S.e.periodo; });
      var cuenta = { borrador: 0, enviado: 0, devuelto: 0 }; act.forEach(function (r) { cuenta[r.estado]++; });
      cuerpo.appendChild(h("div", { class: "kpis" }, [["Enviados", cuenta.enviado, "ok"], ["Borradores", cuenta.borrador, ""], ["Devueltos para corregir", cuenta.devuelto, cuenta.devuelto ? "warn" : ""]].map(function (k) { return h("div", { class: "kpi " + k[2] }, h("b", null, k[1]), k[0]); })));
      act.filter(function (r) { return r.estado === "devuelto"; }).forEach(function (r) {
        cuerpo.appendChild(h("div", { class: "msg aviso" }, h("b", null, "↩ Devuelto: " + (r.nombre_convenio || "(sin nombre)") + " · " + nombreCorto(r.delegacion)), h("div", null, "Corrección solicitada: " + r.nota_revision),
          abierta ? h("button", { class: "btn small", style: "margin-top:8px", onclick: function () { abrirFormulario(r.id); } }, "Corregir y reenviar") : null));
      });
      // avance por delegación de la región
      var porDel = {}; dels.forEach(function (d) { porDel[d.did] = { enviado: 0, borrador: 0, devuelto: 0 }; });
      act.forEach(function (r) { if (porDel[r.delegacion]) porDel[r.delegacion][r.estado]++; });
      cuerpo.appendChild(h("div", { class: "card" }, h("h3", null, "Avance por delegación"),
        h("ul", { class: "avance" }, dels.map(function (d) {
          var x = porDel[d.did], sit = x.enviado ? ["ok", "✓ " + x.enviado + (x.enviado === 1 ? " enviado" : " enviados")] : (x.borrador || x.devuelto) ? ["warn", "✎ En curso"] : ["none", "○ Sin registros"];
          return h("li", null, h("span", null, d.nombre.replace(/^Delegación Presidencial /, "")), h("span", { class: "pill " + sit[0] }, sit[1]));
        }))));
      if (!act.length) {
        cuerpo.appendChild(h("div", { class: "card vacio" }, h("h3", null, "Aún no hay convenios registrados en este periodo"),
          h("p", { class: "muted" }, "Registra cada convenio vigente por separado e indica a qué delegación de la región corresponde. Puedes guardar un borrador y terminarlo después."),
          h("p", { class: "small muted" }, "En caso de no tener convenios vigentes favor remitir oficio al Jefe de División de Gobierno Interior señalando aquello."),
          abierta ? h("button", { class: "btn", onclick: function () { abrirFormulario(null); } }, "+ Registrar el primer convenio") : null));
      } else cuerpo.appendChild(tablaMis(act, abierta));
      if (ant.length) cuerpo.appendChild(h("details", { class: "card" }, h("summary", null, h("b", null, "Periodos anteriores"), " (" + ant.length + ")"), h("div", { style: "margin-top:12px" }, tablaMis(ant, false))));
    }).catch(function (e) { cuerpo.innerHTML = ""; cuerpo.appendChild(mensaje("error", e.message)); });
  }
  function tablaMis(regs, editable) {
    return h("div", { class: "table-wrap" }, h("table", null,
      h("thead", null, h("tr", null, ["N°", "Delegación", "Convenio", "Institución", "Tipo", "Estado", "Última modificación", ""].map(function (t) { return h("th", null, t); }))),
      h("tbody", null, regs.map(function (r) {
        var puede = editable && r.estado !== "enviado";
        return h("tr", null, h("td", { class: "nowrap muted" }, "#" + r.id), h("td", { class: "small" }, nombreCorto(r.delegacion)), h("td", null, h("b", null, r.nombre_convenio || "(sin nombre)")), h("td", null, r.institucion || "—"), h("td", null, r.tipo_convenio || "—"),
          h("td", null, pillEstado(r.estado)), h("td", { class: "nowrap small" }, fFechaHora(r.actualizado)),
          h("td", { class: "acciones" }, puede ? h("button", { class: "btn small", onclick: function () { abrirFormulario(r.id); } }, r.estado === "devuelto" ? "Corregir" : "Continuar") : null,
            h("button", { class: "btn sec small", onclick: function () { verFicha(r.id); } }, "Ver"),
            puede && r.estado === "borrador" ? h("button", { class: "btn peligro small", onclick: function () { eliminarLev(r, render); } }, "Eliminar") : null));
      }))));
  }
  function eliminarLev(r, luego) {
    confirmar("¿Eliminar este convenio?", "Se eliminará «" + (r.nombre_convenio || "(sin nombre)") + "». Esta acción queda registrada en la bitácora y no se puede deshacer.", "Eliminar", true).then(function (si) {
      if (!si) return;
      API.eliminarLev(r.id).then(function () { aviso("Convenio eliminado."); luego(); }).catch(function (e) { aviso(e.message, "error"); });
    });
  }

  // ---------- Formulario por pasos ----------
  function abrirFormulario(id, delegacionAdmin) {
    if (!id) {
      var d = { resp_nombre: S.u.nombre || "", resp_correo: S.u.correo || "", resp_telefono: S.u.telefono || "", resp_cargo: S.u.cargo || "" };
      if (delegacionAdmin) d.delegacion = delegacionAdmin;
      S.edit = { id: null, d: d, paso: 0, sucio: false, errores: {}, reg: null, recordar: true };
      return render();
    }
    API.obtener(id).then(function (r) {
      S.edit = { id: r.id, d: r.datos || {}, paso: 0, sucio: false, errores: {}, reg: r, recordar: false };
      render();
    }).catch(function (e) { aviso(e.message, "error"); });
  }
  function ctxEdit() { return { delegacion: C.delegacion(S.edit.d.delegacion) }; }
  function cerrarFormulario() {
    var E = S.edit;
    if (!E || !E.sucio) { S.edit = null; return render(); }
    var velo = h("div", { class: "velo" });
    function fin() { velo.remove(); S.edit = null; render(); }
    velo.appendChild(h("div", { class: "modal chico", role: "dialog", "aria-modal": "true" },
      h("h2", null, "Hay cambios sin guardar"), h("p", { style: "margin:10px 0 18px" }, "¿Quieres guardar el borrador antes de salir?"),
      h("div", { class: "row" },
        h("button", { class: "btn", onclick: function () { velo.remove(); guardarBorrador(true).then(function (ok) { if (ok) { aviso("Borrador guardado."); S.edit = null; render(); } }); } }, "Guardar y salir"),
        h("button", { class: "btn peligro", onclick: fin }, "Salir sin guardar"),
        h("button", { class: "btn sec", onclick: function () { velo.remove(); } }, "Seguir editando"))));
    document.body.appendChild(velo);
  }
  window.addEventListener("beforeunload", function (ev) { if (S.edit && S.edit.sucio) { ev.preventDefault(); ev.returnValue = ""; } });

  // Guarda el borrador. Si ya hay un guardado en curso, espera a que termine (así nunca se crean dos registros).
  function guardarBorrador(silencioso) {
    var E = S.edit;
    if (!E) return Promise.resolve(false);
    if (E.pend) return E.pend.then(function () { return S.edit === E ? guardarBorrador(silencioso) : false; });
    var d = C.limpiar(E.d, ctxEdit());
    if (!d.delegacion) { if (!silencioso) aviso("Primero elige la delegación (paso 1).", "error"); return Promise.resolve(false); }
    if (!E.sucio && E.id) { if (!silencioso) aviso("Borrador guardado. Puedes continuar después desde «Mis convenios»."); return Promise.resolve(true); }
    var ver = E.ver || 0;
    E.guardando = true; pintarEstadoGuardado();
    E.pend = API.guardar(E.id, d, false, d.delegacion).then(function (r) {
      E.pend = null; E.id = r.id; E.sucio = (E.ver || 0) !== ver; E.guardando = false; E.guardadoEn = new Date(); pintarEstadoGuardado();
      if (E.recordar && S.u.rol === "regional") recordarContacto(d);
      if (!silencioso) aviso("Borrador guardado. Puedes continuar después desde «Mis convenios».");
      return true;
    }).catch(function (e) { E.pend = null; E.guardando = false; pintarEstadoGuardado(); aviso("No se pudo guardar: " + e.message, "error"); return false; });
    return E.pend;
  }
  function recordarContacto(d) {
    var c = { nombre: d.resp_nombre, correo: d.resp_correo, telefono: d.resp_telefono, cargo: d.resp_cargo };
    if (c.nombre === S.u.nombre && c.correo === S.u.correo && c.telefono === S.u.telefono && c.cargo === S.u.cargo) return;
    if (!c.nombre) return;
    API.guardarContacto(c).then(function () { S.u.nombre = c.nombre; S.u.correo = c.correo || ""; S.u.telefono = c.telefono || ""; S.u.cargo = c.cargo || ""; S.edit && (S.edit.recordar = false); }).catch(function () {});
  }
  function pintarEstadoGuardado() {
    var el = document.getElementById("estado-guardado"); if (!el || !S.edit) return;
    var E = S.edit;
    el.textContent = E.guardando ? "Guardando…" : E.sucio ? "Cambios sin guardar" : E.guardadoEn ? "✓ Guardado a las " + ("0" + E.guardadoEn.getHours()).slice(-2) + ":" + ("0" + E.guardadoEn.getMinutes()).slice(-2) : (E.id ? "✓ Guardado" : "Aún no guardado");
    el.className = "estado-guardado" + (E.sucio ? " sucio" : "");
  }

  function vistaFormulario() {
    var E = S.edit, ctx = ctxEdit(), pasos = C.pasosVisibles(E.d, ctx), total = pasos.length + 1;
    if (E.paso > pasos.length) E.paso = pasos.length;
    var esRevision = E.paso === pasos.length, paso = pasos[E.paso];
    var errs = C.validarTodo(E.d, ctx), errPorPaso = {};
    errs.forEach(function (x) { errPorPaso[x.paso.id] = (errPorPaso[x.paso.id] || 0) + 1; });
    var enviado = E.reg && E.reg.estado === "enviado";

    var stepper = h("nav", { class: "stepper", "aria-label": "Pasos del formulario" }, h("ol", null, pasos.map(function (p, i) {
      var st = i === E.paso ? "actual" : (errPorPaso[p.id] ? (E.visto && E.visto[p.id] ? "error" : "") : "listo");
      return h("li", { class: st }, h("button", { type: "button", onclick: function () { irPaso(i); }, "aria-current": i === E.paso ? "step" : null },
        h("span", { class: "num" }, st === "listo" ? "✓" : st === "error" ? "!" : String(i + 1)), h("span", { class: "txt" }, p.titulo)));
    }).concat([h("li", { class: esRevision ? "actual" : "" }, h("button", { type: "button", onclick: function () { irPaso(pasos.length); } }, h("span", { class: "num" }, "✓"), h("span", { class: "txt" }, enviado ? "Revisión y guardado" : "Revisión y envío")))])));

    var cabeza = h("div", { class: "form-head" },
      h("div", null, h("button", { class: "link", onclick: cerrarFormulario }, "← Volver"),
        h("h1", null, E.id ? (E.d.nombre_convenio || "Convenio #" + E.id) : "Registrar convenio"),
        h("div", { class: "muted small" }, (E.d.delegacion ? delegacionDe(E.d.delegacion).nombre + " · " : "") + (S.e.periodo_nombre || "") + (E.reg ? " · " : ""), E.reg ? pillEstado(E.reg.estado) : null)),
      h("div", { class: "form-head-acc" }, h("span", { id: "estado-guardado", class: "estado-guardado" }),
        h("button", { class: "btn sec", onclick: function () { guardarBorrador(false); } }, enviado ? "Guardar cambios" : "Guardar borrador")));

    var progreso = h("div", { class: "progreso", role: "progressbar", "aria-valuemin": "1", "aria-valuemax": String(total), "aria-valuenow": String(E.paso + 1) },
      h("div", { class: "progreso-t" }, "Paso " + (E.paso + 1) + " de " + total), h("div", { class: "progreso-barra" }, h("span", { style: "width:" + Math.round((E.paso + 1) / total * 100) + "%" })));

    var cont = h("section", { class: "paso" });
    if (E.reg && E.reg.estado === "devuelto" && E.reg.nota_revision) cont.appendChild(h("div", { class: "msg aviso" }, h("b", null, "Corrección solicitada por el administrador: "), E.reg.nota_revision));
    if (esRevision) cont.appendChild(pasoRevision(pasos, errs, ctx, enviado));
    else cont.appendChild(pasoCampos(paso, ctx));

    var nav = h("div", { class: "paso-nav" },
      E.paso > 0 ? h("button", { class: "btn sec", onclick: function () { irPaso(E.paso - 1); } }, "← Anterior") : h("span"),
      esRevision ? null : h("button", { class: "btn", onclick: function () { siguiente(paso, ctx); } }, E.paso === pasos.length - 1 ? "Revisar →" : "Siguiente →"));

    var vista = h("div", { class: "page form-page" }, cabeza, progreso, h("div", { class: "form-grid" }, stepper, h("div", null, cont, nav)));
    setTimeout(pintarEstadoGuardado, 0);
    return vista;
  }
  function irPaso(i) {
    var E = S.edit, pasos = C.pasosVisibles(E.d, ctxEdit()), p = pasos[E.paso];
    if (p) { E.visto = E.visto || {}; E.visto[p.id] = true; }
    E.paso = i; E.errores = {};
    if (E.sucio) guardarBorrador(true);
    render();
  }
  function siguiente(paso, ctx) {
    var E = S.edit, errores = {}, primero = null;
    C.camposVisibles(paso, E.d, ctx).forEach(function (c) { var m = C.validarCampo(c, E.d, ctx); if (m) { errores[c.k] = m; if (!primero) primero = c.k; } });
    if (primero) {
      E.errores = errores; render();
      var el = document.getElementById("q-" + primero); if (el) { el.scrollIntoView({ block: "center" }); var f = el.querySelector("input,select,textarea"); if (f) f.focus(); }
      return;
    }
    irPaso(E.paso + 1);
  }

  var REPINTA = { ministerio: 1, tipo_convenio: 1, contrata_personal: 1, delegacion: 1, cobertura_efectiva: 0 };
  function cambiar(k, v, repintar) {
    var E = S.edit;
    E.d[k] = v; E.sucio = true; E.ver = (E.ver || 0) + 1; delete E.errores[k];
    if (k === "ministerio") { delete E.d.servicio; delete E.d.institucion_nombre; }
    var q = document.getElementById("q-" + k); if (q) { q.classList.remove("con-error"); var m = q.querySelector(".err"); if (m) m.remove(); }
    pintarEstadoGuardado();
    if (repintar || REPINTA[k]) { var y = window.scrollY; render(); window.scrollTo(0, y); }
  }

  function pasoCampos(paso, ctx) {
    var E = S.edit, d = E.d;
    var box = h("div", { class: "card paso-card" }, h("h2", null, paso.titulo));
    if (paso.desc) box.appendChild(h("p", { class: "paso-desc" }, paso.desc));
    if (paso.nota) box.appendChild(h("p", { class: "paso-nota" }, paso.nota));
    C.camposVisibles(paso, d, ctx).forEach(function (c) { box.appendChild(pregunta(c, d, ctx)); });
    if (paso.id === "responsable" && S.u.rol === "regional") {
      box.appendChild(h("label", { class: "check-simple" }, h("input", { type: "checkbox", checked: E.recordar, onchange: function (ev) { E.recordar = ev.target.checked; } }), " Recordar estos datos de contacto para mis próximos convenios"));
    }
    return box;
  }
  function pregunta(c, d, ctx) {
    var E = S.edit, err = E.errores[c.k], v = d[c.k], id = "f-" + c.k;
    var q = h("div", { class: "q" + (err ? " con-error" : ""), id: "q-" + c.k });
    var t = titulo(c, d);
    q.appendChild(h(c.tipo === "radio" || c.tipo === "checkbox" ? "div" : "label", { class: "q-t", for: c.tipo === "radio" || c.tipo === "checkbox" ? null : id, id: "t-" + c.k }, t, c.req ? h("span", { class: "req", "aria-label": "obligatoria" }, " *") : h("span", { class: "opc" }, " (opcional)")));
    if (c.d) q.appendChild(h("div", { class: "hint" }, c.d));
    var tipo = c.tipo;
    if (tipo === "text" || tipo === "email" || tipo === "tel") {
      q.appendChild(h("input", { type: tipo === "text" ? "text" : tipo, id: id, value: v || "", autocomplete: { resp_nombre: "name", resp_correo: "email", resp_telefono: "tel", resp_cargo: "organization-title" }[c.k] || "off", maxlength: "300",
        oninput: function (ev) { cambiar(c.k, ev.target.value); } }));
    } else if (tipo === "textarea") {
      q.appendChild(h("textarea", { id: id, rows: "4", maxlength: "4000", oninput: function (ev) { cambiar(c.k, ev.target.value); } }, v || ""));
    } else if (tipo === "entero" || tipo === "monto") {
      var fmt = function (s) { return s ? Number(s).toLocaleString("es-CL") : ""; };
      var inp = h("input", { type: "text", id: id, inputmode: "numeric", value: tipo === "monto" ? fmt(v) : (v || ""), autocomplete: "off", maxlength: "20",
        oninput: function (ev) {
          var dig = ev.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 15);
          if (tipo === "monto") ev.target.value = fmt(dig); else if (ev.target.value !== dig) ev.target.value = dig;
          cambiar(c.k, dig);
        } });
      q.appendChild(tipo === "monto" ? h("div", { class: "con-prefijo" }, h("span", null, "$"), inp) : inp);
    } else if (tipo === "date") {
      var indef = c.indefinido && v === c.indefinido;
      var di = h("input", { type: "date", id: id, value: v || "", disabled: indef, min: "1990-01-01", max: "2099-12-31", onchange: function (ev) { cambiar(c.k, ev.target.value); } });
      q.appendChild(di);
      if (c.indefinido) q.appendChild(h("label", { class: "check-simple" }, h("input", { type: "checkbox", checked: indef, onchange: function (ev) { cambiar(c.k, ev.target.checked ? c.indefinido : "", true); } }), " Vigencia indefinida (se registra 31/12/2075)"));
    } else if (tipo === "select") {
      var ops = (typeof c.op === "function" ? c.op(d) : c.op) || [];
      q.appendChild(h("select", { id: id, onchange: function (ev) { cambiar(c.k, ev.target.value); } }, h("option", { value: "" }, "Elige una opción…"),
        ops.map(function (o) { return h("option", { value: o, selected: o === v ? "selected" : null }, o); })));
    } else if (tipo === "radio") {
      q.appendChild(opcionesRadio(c, v));
    } else if (tipo === "checkbox") {
      q.appendChild(opcionesCheck(c, v || []));
    } else if (tipo === "delegacion") {
      q.appendChild(selectorDelegacion(c, v));
    }
    if (err) q.appendChild(h("div", { class: "err", role: "alert" }, "⚠ " + err));
    return q;
  }
  function opcionesRadio(c, v) {
    var name = "r-" + c.k, esOtro = typeof v === "string" && v.indexOf(C.OTRO) === 0, largo = c.op.some(function (o) { return o.length > 60; }) || c.ayuda;
    var grupo = h("div", { class: "opciones" + (largo ? " largas" : ""), role: "radiogroup", "aria-labelledby": "t-" + c.k });
    c.op.forEach(function (o) {
      grupo.appendChild(h("label", { class: "opcion" }, h("input", { type: "radio", name: name, value: o, checked: v === o, onchange: function () { cambiar(c.k, o, !!c.otro || REPINTA[c.k]); } }),
        h("span", null, h("span", { class: "op-t" }, o), c.ayuda && c.ayuda[o] ? h("span", { class: "op-ayuda" }, c.ayuda[o]) : null)));
    });
    if (c.otro) {
      var txt = h("input", { type: "text", class: "otro-txt", "aria-label": "Detalle de la opción Otro", value: esOtro ? v.slice(C.OTRO.length) : "", placeholder: "Escribe aquí…", maxlength: "300",
        oninput: function (ev) { cambiar(c.k, C.OTRO + ev.target.value); } });
      grupo.appendChild(h("label", { class: "opcion otro" }, h("input", { type: "radio", name: name, checked: esOtro, onchange: function () { cambiar(c.k, C.OTRO + txt.value, true); } }),
        h("span", null, h("span", { class: "op-t" }, "Otro:"), esOtro ? txt : null)));
      if (esOtro) setTimeout(function () { if (document.activeElement === document.body) txt.focus(); }, 0);
    }
    return grupo;
  }
  function opcionesCheck(c, v) {
    var grupo = h("div", { class: "opciones" + (c.op.some(function (o) { return o.length > 60; }) ? " largas" : ""), role: "group", "aria-labelledby": "t-" + c.k });
    var otroVal = v.filter(function (x) { return x.indexOf(C.OTRO) === 0; })[0];
    function poner(sel) { cambiar(c.k, sel, true); }
    c.op.forEach(function (o) {
      grupo.appendChild(h("label", { class: "opcion" }, h("input", { type: "checkbox", value: o, checked: v.indexOf(o) >= 0, onchange: function (ev) {
        var sel = v.slice();
        if (ev.target.checked) { sel = c.exclusivo === o ? [o] : sel.filter(function (x) { return x !== c.exclusivo; }).concat([o]); }
        else sel = sel.filter(function (x) { return x !== o; });
        poner(sel);
      } }), h("span", { class: "op-t" }, o)));
    });
    if (c.otro) {
      var txt = h("input", { type: "text", class: "otro-txt", "aria-label": "Detalle de la opción Otro", value: otroVal ? otroVal.slice(C.OTRO.length) : "", placeholder: "Escribe aquí…", maxlength: "300",
        oninput: function (ev) { var sel = v.filter(function (x) { return x.indexOf(C.OTRO) !== 0; }); sel.push(C.OTRO + ev.target.value); v = sel; cambiar(c.k, sel); } });
      grupo.appendChild(h("label", { class: "opcion otro" }, h("input", { type: "checkbox", checked: !!otroVal, onchange: function (ev) {
        var sel = v.filter(function (x) { return x.indexOf(C.OTRO) !== 0 && x !== c.exclusivo; });
        if (ev.target.checked) sel.push(C.OTRO);
        poner(sel);
      } }), h("span", null, h("span", { class: "op-t" }, "Otro:"), otroVal !== undefined ? txt : null)));
    }
    return grupo;
  }
  function selectorDelegacion(c, v) {
    var dl = C.delegacion(v);
    if (S.u.rol === "regional") {
      var opciones = C.delegacionesDe(S.u.region);
      return h("div", null,
        h("select", { id: "f-delegacion", onchange: function (ev) { cambiar("delegacion", ev.target.value, true); } },
          h("option", { value: "" }, "Elige la delegación…"),
          opciones.map(function (x) { return h("option", { value: x.did, selected: x.did === v ? "selected" : null }, x.nombre); })),
        h("div", { class: "hint", style: "margin-top:6px" }, tituloRegion(S.u.region) + " · tu cuenta puede registrar para cualquiera de sus " + opciones.length + " delegaciones."));
    }
    var reg = S.edit.regionSel || (dl ? dl.region : "");
    var sR = h("select", { id: "f-region", "aria-label": "Región", onchange: function (ev) { S.edit.regionSel = ev.target.value; cambiar("delegacion", "", true); } },
      h("option", { value: "" }, "Elige la región…"), C.REGIONES.map(function (r) { return h("option", { value: r, selected: r === reg ? "selected" : null }, r); }));
    var sD = h("select", { id: "f-delegacion", disabled: !reg, onchange: function (ev) { cambiar("delegacion", ev.target.value, true); } },
      h("option", { value: "" }, reg ? "Elige la delegación…" : "Primero elige la región"),
      C.DELEGACIONES.filter(function (x) { return x.region === reg; }).map(function (x) { return h("option", { value: x.did, selected: x.did === v ? "selected" : null }, x.nombre); }));
    return h("div", { class: "grid2" }, h("div", { class: "field" }, h("label", { for: "f-region", class: "small" }, "Región"), sR), h("div", { class: "field" }, h("label", { for: "f-delegacion", class: "small" }, "Delegación"), sD));
  }
  function resumenRespuestas(d, ctx, conEnlaces) {
    return C.pasosVisibles(d, ctx).map(function (p, i) {
      return h("div", { class: "resumen-paso" }, h("div", { class: "row", style: "justify-content:space-between" }, h("h3", null, p.titulo),
        conEnlaces ? h("button", { class: "link no-print", onclick: function () { irPaso(i); } }, "Editar") : null),
        h("dl", null, C.camposVisibles(p, d, ctx).map(function (c) {
          var t = C.texto(c, d[c.k]);
          return [h("dt", null, titulo(c, d)), h("dd", { class: t ? "" : "muted" }, t || "— sin respuesta —")];
        })));
    });
  }
  function pasoRevision(pasos, errs, ctx, enviado) {
    var E = S.edit, d = E.d, box = h("div", null);
    var avisos = C.AVISOS.map(function (f) { return f(d); }).filter(Boolean);
    if (errs.length) {
      box.appendChild(h("div", { class: "msg error" }, h("b", null, "Antes de enviar, completa o corrige " + (errs.length === 1 ? "1 respuesta" : errs.length + " respuestas") + ":"),
        h("ul", { class: "lista-err" }, errs.slice(0, 12).map(function (x) {
          return h("li", null, h("button", { class: "link", onclick: function () { var i = pasos.indexOf(x.paso); E.paso = i; E.errores = {}; E.errores[x.campo.k] = x.msg; render(); var el = document.getElementById("q-" + x.campo.k); if (el) el.scrollIntoView({ block: "center" }); } },
            x.paso.titulo + " → " + titulo(x.campo, d)), ": " + x.msg);
        })), errs.length > 12 ? h("div", null, "…y " + (errs.length - 12) + " más.") : null));
    } else box.appendChild(h("div", { class: "msg ok" }, h("b", null, "✓ Todas las respuestas obligatorias están completas.")));
    if (avisos.length) box.appendChild(h("div", { class: "msg aviso" }, h("b", null, "Revisa estos datos (no impiden el envío):"), h("ul", null, avisos.map(function (a) { return h("li", null, a); }))));
    var card = h("div", { class: "card" }, h("h2", null, "Revisión de respuestas"), resumenRespuestas(d, ctx, true));
    box.appendChild(card);
    var err = h("div");
    var cerrada = S.e.recepcion !== "abierta" && S.u.rol !== "admin";
    var btn = h("button", { class: "btn grande", disabled: errs.length > 0 || cerrada, onclick: function () {
      if (enviado) {
        btn.disabled = true;
        return guardarBorrador(true).then(function (ok) { btn.disabled = false; if (ok) { aviso("Cambios guardados."); S.edit = null; render(); } });
      }
      confirmar("¿Enviar este convenio?", "Una vez enviado ya no podrás modificarlo, salvo que el administrador lo devuelva para corrección.", "Enviar convenio").then(function (si) {
        if (!si) return;
        btn.disabled = true; btn.textContent = "Enviando…"; err.innerHTML = "";
        var limpio = C.limpiar(d, ctx);
        (E.pend || Promise.resolve()).then(function () { return API.guardar(E.id, limpio, true, limpio.delegacion); }).then(function (r) {
          if (E.recordar && S.u.rol === "regional") recordarContacto(limpio);
          E.sucio = false; S.edit = null; render(); exito(r.id, limpio);
        }).catch(function (e) { btn.disabled = false; btn.textContent = "Enviar convenio"; err.appendChild(mensaje("error", e.message)); });
      });
    } }, enviado ? "Guardar cambios" : "Enviar convenio");
    box.appendChild(h("div", { class: "card enviar" }, err, cerrada ? mensaje("aviso", "La recepción de respuestas está cerrada; solo puedes guardar el borrador.") : null,
      h("div", { class: "row" }, btn, h("button", { class: "btn sec", onclick: function () { guardarBorrador(false); } }, enviado ? "Guardar sin salir" : "Guardar borrador y seguir después"))));
    return box;
  }
  function exito(id, d) {
    modal("Convenio enviado", function (cerrar) {
      return h("div", null, h("p", { class: "exito-ico", "aria-hidden": "true" }, "✓"),
        h("p", null, "«" + (d.nombre_convenio || "Convenio") + "» quedó registrado con el N° ", h("b", null, "#" + id), "."),
        h("p", { class: "muted small" }, "Si hay otros convenios vigentes en tu región, regístralos uno por uno."),
        h("div", { class: "row", style: "margin-top:16px" },
          S.u.rol === "regional" && S.e.recepcion === "abierta" ? h("button", { class: "btn", onclick: function () { cerrar(); abrirFormulario(null); } }, "+ Registrar otro convenio") : null,
          h("button", { class: "btn sec", onclick: function () { cerrar(); verFicha(id); } }, "Ver ficha"),
          h("button", { class: "btn sec", onclick: cerrar }, "Listo")));
    });
  }

  // ---------- Ficha de un convenio ----------
  function verFicha(id, alCambiar) {
    API.obtener(id).then(function (r) {
      var d = r.datos || {}, dl = delegacionDe(r.delegacion), ctx = { delegacion: C.delegacion(r.delegacion) };
      modal("Ficha del convenio #" + r.id, function (cerrar) {
        var acc = h("div", { class: "row no-print", style: "margin-bottom:14px" });
        acc.appendChild(h("button", { class: "btn sec small solo-instalada", onclick: function () { document.body.classList.add("imprimiendo"); window.print(); setTimeout(function () { document.body.classList.remove("imprimiendo"); }, 500); } }, "Imprimir / guardar PDF"));
        if (S.u.rol === "admin") {
          acc.appendChild(h("button", { class: "btn small", onclick: function () { cerrar(); abrirFormulario(r.id); } }, "Editar"));
          if (r.estado === "enviado") acc.appendChild(h("button", { class: "btn sec small", onclick: function () { cerrar(); devolver(r, alCambiar || render); } }, "Devolver para corrección"));
          acc.appendChild(h("button", { class: "btn peligro small", onclick: function () { cerrar(); eliminarLev(r, alCambiar || render); } }, "Eliminar"));
        } else if (S.u.rol === "regional" && r.estado !== "enviado" && S.e.recepcion === "abierta" && r.periodo === S.e.periodo) {
          acc.appendChild(h("button", { class: "btn small", onclick: function () { cerrar(); abrirFormulario(r.id); } }, r.estado === "devuelto" ? "Corregir" : "Continuar"));
        }
        return h("div", { class: "ficha" }, acc,
          h("div", { class: "ficha-meta" },
            h("div", null, h("span", { class: "muted small" }, "Convenio"), h("b", null, r.nombre_convenio || "(sin nombre)")),
            h("div", null, h("span", { class: "muted small" }, "Delegación"), dl.nombre),
            h("div", null, h("span", { class: "muted small" }, "Periodo"), r.periodo),
            h("div", null, h("span", { class: "muted small" }, "Estado"), pillEstado(r.estado)),
            h("div", null, h("span", { class: "muted small" }, "Enviado"), r.enviado ? fFechaHora(r.enviado) + " por " + r.enviado_por : "—"),
            h("div", null, h("span", { class: "muted small" }, "Última modificación"), fFechaHora(r.actualizado) + " por " + r.actualizado_por)),
          r.nota_revision ? mensaje("aviso", "Corrección solicitada: " + r.nota_revision) : null,
          resumenRespuestas(d, ctx, false));
      }, true);
    }).catch(function (e) { aviso(e.message, "error"); });
  }
  function devolver(r, luego) {
    modal("Devolver para corrección", function (cerrar) {
      var t = h("textarea", { id: "dv-n", rows: "4", maxlength: "1000", placeholder: "Ejemplo: el ID DOC de la resolución no corresponde; revisar montos rendidos." }), err = h("div");
      var b = h("button", { class: "btn", onclick: function () {
        b.disabled = true; err.innerHTML = "";
        API.devolver(r.id, t.value).then(function () { cerrar(); aviso("Convenio devuelto para corrección."); luego(); }).catch(function (e) { b.disabled = false; err.appendChild(mensaje("error", e.message)); });
      } }, "Devolver");
      setTimeout(function () { t.focus(); }, 0);
      return h("div", null, h("p", null, "«" + (r.nombre_convenio || "(sin nombre)") + "» — " + nombreCorto(r.delegacion)),
        h("p", { class: "muted small" }, "El usuario regional verá este mensaje y podrá corregir y reenviar el convenio."), err, campo("¿Qué debe corregir?", t), h("div", { class: "row" }, b));
    });
  }

  // ---------- Administración: resumen ----------
  function selectorPeriodo(valor, alCambiar) {
    var s = h("select", { id: "f-periodo", onchange: function () { alCambiar(s.value); } }, h("option", { value: S.e.periodo }, (S.e.periodo_nombre || S.e.periodo) + " (activo)"));
    API.periodos().then(function (ps) { ps.filter(function (p) { return p !== S.e.periodo; }).forEach(function (p) { s.appendChild(h("option", { value: p, selected: p === valor ? "selected" : null }, p)); }); }).catch(function () {});
    s.value = valor;
    return s;
  }
  function vistaResumen(page) {
    var per = S.f.periodo || S.e.periodo;
    page.appendChild(h("div", { class: "page-head" }, h("div", null, h("h1", null, "Resumen del levantamiento"), h("p", { class: "muted" }, "Avance de las 56 delegaciones presidenciales")),
      h("div", { class: "field", style: "margin:0;min-width:240px" }, h("label", { for: "f-periodo" }, "Periodo"), selectorPeriodo(per, function (v) { S.f.periodo = v; render(); }))));
    if (per === S.e.periodo) page.appendChild(bandaPeriodo());
    var cuerpo = h("div", null, h("p", { class: "cargando" }, "Cargando…")); page.appendChild(cuerpo);
    API.listar({ periodo: per }, true).then(function (regs) {
      cuerpo.innerHTML = "";
      var porDel = {}; C.DELEGACIONES.forEach(function (d) { porDel[d.did] = { enviado: 0, borrador: 0, devuelto: 0, ult: "" }; });
      var env = regs.filter(function (r) { return r.estado === "enviado"; });
      regs.forEach(function (r) { var x = porDel[r.delegacion]; if (!x) return; x[r.estado]++; if (r.actualizado > x.ult) x.ult = r.actualizado; });
      var conEnv = Object.keys(porDel).filter(function (k) { return porDel[k].enviado > 0; }).length;
      var sinNada = Object.keys(porDel).filter(function (k) { var x = porDel[k]; return !x.enviado && !x.borrador && !x.devuelto; }).length;
      var montoT = 0, transf = 0, prioAlta = 0, critico = 0;
      env.forEach(function (r) {
        var d = r.datos || {};
        if (d.tipo_convenio === C.TRANSF) { transf++; montoT += Number(d.monto_total) || 0; }
        if (d.prioridad_seguimiento === "Alta." || d.prioridad_seguimiento === "Inmediata.") prioAlta++;
        if (d.evaluacion_general === "Insatisfactoria." || d.evaluacion_general === "Crítica.") critico++;
      });
      cuerpo.appendChild(h("div", { class: "kpis" }, [
        ["Convenios enviados", env.length, ""], ["Delegaciones con envíos", conEnv + " / " + C.DELEGACIONES.length, conEnv === C.DELEGACIONES.length ? "ok" : ""],
        ["Delegaciones sin registros", sinNada, sinNada ? "warn" : "ok"], ["Borradores en curso", regs.filter(function (r) { return r.estado === "borrador"; }).length, ""],
        ["Devueltos para corregir", regs.filter(function (r) { return r.estado === "devuelto"; }).length, ""],
        ["Monto total de transferencias enviadas", "$ " + montoT.toLocaleString("es-CL"), "monto"],
        ["Prioridad alta o inmediata", prioAlta, prioAlta ? "crit" : ""], ["Evaluación insatisfactoria o crítica", critico, critico ? "crit" : ""]
      ].map(function (k) { return h("div", { class: "kpi " + k[2] }, h("b", null, k[1]), k[0]); })));
      if (env.length) {
        var tipos = {}; env.forEach(function (r) { var t = r.tipo_convenio || "—"; tipos[t] = (tipos[t] || 0) + 1; });
        cuerpo.appendChild(h("p", { class: "muted small", style: "margin:-6px 0 16px" }, "Por tipo: " + Object.keys(tipos).map(function (t) { return t + " " + tipos[t]; }).join(" · ")));
      }
      var fEst = h("select", { id: "rs-e", onchange: pintar }, h("option", { value: "" }, "Todas"), h("option", { value: "env" }, "Con envíos"), h("option", { value: "borr" }, "Solo borradores o devueltos"), h("option", { value: "nada" }, "Sin registros"));
      var fReg = h("select", { id: "rs-r", onchange: pintar }, h("option", { value: "" }, "Todas las regiones"), C.REGIONES.map(function (r) { return h("option", { value: r }, r); }));
      var tabla = h("div");
      cuerpo.appendChild(h("div", { class: "filtros" }, campo("Región", fReg), campo("Situación", fEst)));
      cuerpo.appendChild(tabla);
      function pintar() {
        tabla.innerHTML = "";
        var filas = C.DELEGACIONES.filter(function (d) {
          var x = porDel[d.did];
          if (fReg.value && d.region !== fReg.value) return false;
          if (fEst.value === "env" && !x.enviado) return false;
          if (fEst.value === "borr" && (x.enviado || (!x.borrador && !x.devuelto))) return false;
          if (fEst.value === "nada" && (x.enviado || x.borrador || x.devuelto)) return false;
          return true;
        });
        tabla.appendChild(h("div", { class: "table-wrap" }, h("table", null,
          h("thead", null, h("tr", null, ["Región", "Delegación", "Situación", "Enviados", "Borradores", "Devueltos", "Último movimiento", ""].map(function (t) { return h("th", null, t); }))),
          h("tbody", null, filas.map(function (d) {
            var x = porDel[d.did], sit = x.enviado ? ["ok", "✓ Con envíos"] : (x.borrador || x.devuelto) ? ["warn", "✎ En curso"] : ["none", "○ Sin registros"];
            return h("tr", null, h("td", null, d.region), h("td", null, d.nombre), h("td", null, h("span", { class: "pill " + sit[0] }, sit[1])),
              h("td", { class: "num" }, x.enviado), h("td", { class: "num" }, x.borrador), h("td", { class: "num" }, x.devuelto), h("td", { class: "nowrap small" }, fFechaHora(x.ult) || "—"),
              h("td", null, (x.enviado || x.borrador || x.devuelto) ? h("button", { class: "btn sec small", onclick: function () { S.f.delegacion = d.did; S.f.region = d.region; S.pestana = "convenios"; render(); } }, "Ver convenios") : null));
          })))));
      }
      pintar();
    }).catch(function (e) { cuerpo.innerHTML = ""; cuerpo.appendChild(mensaje("error", e.message)); });
  }

  // ---------- Administración: convenios ----------
  function vistaConvenios(page) {
    var per = S.f.periodo || S.e.periodo, esAdmin = S.u.rol === "admin";
    var acciones = h("div", { class: "row" });
    page.appendChild(h("div", { class: "page-head" }, h("div", null, h("h1", null, "Convenios"), h("p", { class: "muted" }, "Todos los convenios registrados por las delegaciones")), acciones));
    var fP = selectorPeriodo(per, function (v) { S.f.periodo = v; render(); });
    var fR = h("select", { id: "cv-r" }, h("option", { value: "" }, "Todas"), C.REGIONES.map(function (r) { return h("option", { value: r, selected: r === S.f.region ? "selected" : null }, r); }));
    var fD = h("select", { id: "cv-d" });
    function llenarD() {
      fD.innerHTML = ""; fD.appendChild(h("option", { value: "" }, "Todas"));
      C.DELEGACIONES.filter(function (d) { return !fR.value || d.region === fR.value; }).forEach(function (d) { fD.appendChild(h("option", { value: d.did, selected: d.did === S.f.delegacion ? "selected" : null }, d.nombre.replace(/^Delegación Presidencial /, ""))); });
    }
    llenarD();
    var fE = h("select", { id: "cv-e" }, h("option", { value: "" }, "Todos"), Object.keys(C.ESTADOS).map(function (k) { return h("option", { value: k, selected: k === S.f.estado ? "selected" : null }, C.ESTADOS[k]); }));
    var fT = h("select", { id: "cv-t" }, h("option", { value: "" }, "Todos"), ["Colaboración", C.TRANSF].map(function (k) { return h("option", { value: k, selected: k === S.f.tipo ? "selected" : null }, k); }));
    var fQ = h("input", { type: "search", id: "cv-q", value: S.f.q || "", placeholder: "Nombre, institución o ID DOC" });
    page.appendChild(h("div", { class: "filtros" }, campo("Periodo", fP), campo("Región", fR), campo("Delegación", fD), campo("Estado del registro", fE), campo("Tipo de convenio", fT), campo("Buscar", fQ)));
    var res = h("div", null, h("p", { class: "cargando" }, "Cargando…")); page.appendChild(res);
    var regs = [];
    function filtrados() {
      var q = (fQ.value || "").trim().toLowerCase();
      return regs.filter(function (r) {
        var dl = delegacionDe(r.delegacion);
        if (fR.value && dl.region !== fR.value) return false;
        if (fD.value && r.delegacion !== fD.value) return false;
        if (fE.value && r.estado !== fE.value) return false;
        if (fT.value && r.tipo_convenio !== fT.value) return false;
        if (q && (r.nombre_convenio + " " + r.institucion + " " + ((r.datos || {}).id_doc_convenio || "") + " " + ((r.datos || {}).ministerio || "")).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
    }
    function pintar() {
      S.f.region = fR.value; S.f.delegacion = fD.value; S.f.estado = fE.value; S.f.tipo = fT.value; S.f.q = fQ.value;
      var fs = filtrados(); res.innerHTML = "";
      res.appendChild(h("p", { class: "muted small" }, fs.length + (fs.length === 1 ? " convenio" : " convenios")));
      if (!fs.length) return res.appendChild(h("div", { class: "card vacio" }, h("p", { class: "muted" }, "No hay convenios con estos filtros.")));
      res.appendChild(h("div", { class: "table-wrap" }, h("table", null,
        h("thead", null, h("tr", null, ["N°", "Delegación", "Convenio", "Institución", "Tipo", "Estado del convenio", "Registro", "Modificado", ""].map(function (t) { return h("th", null, t); }))),
        h("tbody", null, fs.map(function (r) {
          return h("tr", null, h("td", { class: "nowrap muted" }, "#" + r.id), h("td", { class: "small" }, nombreCorto(r.delegacion)), h("td", null, h("b", null, r.nombre_convenio || "(sin nombre)")),
            h("td", { class: "small" }, r.institucion || "—"), h("td", { class: "small" }, r.tipo_convenio || "—"), h("td", { class: "small" }, r.estado_convenio || "—"),
            h("td", null, pillEstado(r.estado)), h("td", { class: "nowrap small" }, fFechaHora(r.actualizado)),
            h("td", null, h("button", { class: "btn sec small", onclick: function () { verFicha(r.id, cargar); } }, "Ver")));
        })))));
    }
    [fR].forEach(function (x) { x.addEventListener("change", function () { S.f.delegacion = ""; llenarD(); pintar(); }); });
    [fD, fE, fT].forEach(function (x) { x.addEventListener("change", pintar); });
    fQ.addEventListener("input", pintar);
    function cargar() {
      res.innerHTML = ""; res.appendChild(h("p", { class: "cargando" }, "Cargando…"));
      API.listar({ periodo: per }, true).then(function (f) { regs = f; pintar(); }).catch(function (e) { res.innerHTML = ""; res.appendChild(mensaje("error", e.message)); });
    }
    acciones.appendChild(h("button", { class: "btn sec solo-instalada", onclick: function (ev) {
      var b = ev.target, fs = filtrados(); if (!fs.length) return aviso("No hay convenios para descargar.", "error");
      b.disabled = true; excelConvenios(fs, "Levantamiento_Convenios_" + per + "_" + hoyTxt() + ".xlsx").then(function () { b.disabled = false; }).catch(function () { b.disabled = false; aviso("No se pudo generar el Excel.", "error"); });
    } }, "⬇ Descargar Excel"));
    if (esAdmin) acciones.appendChild(h("button", { class: "btn", onclick: function () { abrirFormulario(null, fD.value || ""); } }, "+ Registrar por una delegación"));
    cargar();
  }

  // ---------- Administración: cuentas ----------
  function claveAleatoria() { var a = "abcdefghjkmnpqrstuvwxyz23456789", o = ""; var r = new Uint32Array(10); (window.crypto || window.msCrypto).getRandomValues(r); for (var i = 0; i < 10; i++) { o += a[r[i] % a.length]; if (i === 4) o += "-"; } return o; }
  function mostrarCreds(lista, tituloTxt) {
    modal(tituloTxt, function () {
      var txt = lista.map(function (c) { return (c.nombre_region || c.nombre) + "\tUsuario: " + c.usuario + "\tContraseña temporal: " + c.clave; }).join("\n");
      return h("div", null, h("div", { class: "msg aviso" }, "Copia o descarga estas credenciales ahora: las contraseñas no se vuelven a mostrar. Cada persona deberá elegir su propia contraseña en el primer ingreso."),
        h("div", { class: "table-wrap", style: "max-height:50vh;overflow:auto" }, h("table", { class: "credenciales" }, h("thead", null, h("tr", null, h("th", null, "Cuenta"), h("th", null, "Usuario"), h("th", null, "Contraseña temporal"))),
          h("tbody", null, lista.map(function (c) { return h("tr", null, h("td", null, c.nombre_region || c.nombre), h("td", null, c.usuario), h("td", null, c.clave)); })))),
        h("div", { class: "row", style: "margin-top:12px" },
          h("button", { class: "btn", onclick: function (ev) { (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { ev.target.textContent = "✓ Copiado"; }).catch(function () { aviso("No se pudo copiar; usa la descarga.", "error"); }); } }, "Copiar"),
          h("button", { class: "btn sec solo-instalada", onclick: function () { xlsx([{ nombre: "Cuentas", columnas: [{ t: "Cuenta", ancho: 60 }, { t: "Usuario", ancho: 24 }, { t: "Contraseña temporal", ancho: 22 }], filas: lista.map(function (c) { return [c.nombre_region || c.nombre, c.usuario, c.clave]; }) }]).then(function (u8) { bajar("Cuentas_" + hoyTxt() + ".xlsx", u8); }); } }, "Descargar Excel")));
    }, true);
  }
  function vistaCuentas(page) {
    var acc = h("div", { class: "row" });
    page.appendChild(h("div", { class: "page-head" }, h("div", null, h("h1", null, "Cuentas"), h("p", { class: "muted" }, "Crea, edita y elimina usuarios. A cada usuario regional se le asigna una región completa.")), acc));
    var res = h("div", null, h("p", { class: "cargando" }, "Cargando…")); page.appendChild(res);

    function formCuenta(cuenta) {
      return function (cerrar) {
        var esNueva = !cuenta, soyYo = cuenta && cuenta.id === S.u.id, tocoU = !!cuenta;
        var rolActual = cuenta ? cuenta.rol : "regional";
        var tipos = h("div", { class: "opciones", role: "radiogroup", "aria-label": "Tipo de cuenta" }, Object.keys(ROLES).map(function (k) {
          return h("label", { class: "opcion" }, h("input", { type: "radio", name: "fc-rol", value: k, checked: rolActual === k, disabled: soyYo && k !== rolActual, onchange: verRol }),
            h("span", null, h("span", { class: "op-t" }, ROLES[k]), h("span", { class: "op-ayuda" }, ROLES_AYUDA[k])));
        }));
        var reg = h("select", { id: "fc-reg" }, h("option", { value: "" }, "Elige la región…"),
          C.REGIONES_LISTA.map(function (r) { return h("option", { value: r.rid, selected: cuenta && cuenta.region === r.rid ? "selected" : null }, r.titulo); }));
        var regInfo = h("div", { class: "hint" });
        var nom = h("input", { type: "text", id: "fc-n", value: cuenta ? cuenta.nombre : "", maxlength: "80" }), usu = h("input", { type: "text", id: "fc-u", autocapitalize: "none", value: cuenta ? cuenta.usuario : "" });
        var cor = h("input", { type: "email", id: "fc-c", value: cuenta ? cuenta.correo || "" : "" }), tel = h("input", { type: "tel", id: "fc-t", value: cuenta ? cuenta.telefono || "" : "" }), car = h("input", { type: "text", id: "fc-g", value: cuenta ? cuenta.cargo || "" : "" });
        var cla = h("input", { type: "text", id: "fc-k", value: esNueva ? claveAleatoria() : "", autocomplete: "off" });
        var err = h("div"), btn = h("button", { class: "btn", type: "submit" }, esNueva ? "Crear cuenta" : "Guardar cambios");
        var filaReg = h("div", { class: "field" }, h("label", { for: "fc-reg" }, "Región asignada"), reg, regInfo);
        usu.addEventListener("input", function () { tocoU = true; });
        function rolSel() { var x = tipos.querySelector("input:checked"); return x ? x.value : rolActual; }
        function verRol() {
          filaReg.hidden = rolSel() !== "regional";
          var dl = C.delegacionesDe(reg.value);
          regInfo.textContent = reg.value ? "Podrá registrar convenios de " + dl.length + " delegaciones: " + dl.map(function (d) { return d.nombre.replace(/^Delegación Presidencial (Regional|Provincial) (de |del |de la )?/, ""); }).join(", ") + "." : "";
          if (esNueva && !tocoU) usu.value = rolSel() === "regional" ? reg.value : "";
        }
        reg.addEventListener("change", verRol); setTimeout(verRol, 0);
        return h("form", { onsubmit: function (ev) {
          ev.preventDefault(); err.innerHTML = ""; btn.disabled = true;
          var datos = { rol: rolSel(), region: reg.value, nombre: nom.value, usuario: usu.value, correo: cor.value, telefono: tel.value, cargo: car.value };
          if (esNueva) datos.clave = cla.value;
          var p = esNueva ? API.crearCuenta(datos) : API.editarCuenta(cuenta.id, datos);
          p.then(function (r) { cerrar(); cargar(); if (esNueva) mostrarCreds([r], "Cuenta creada"); else aviso("Cuenta actualizada."); })
            .catch(function (e) { err.appendChild(mensaje("error", e.message)); btn.disabled = false; err.scrollIntoView({ block: "nearest" }); });
        } }, err,
          h("div", { class: "field" }, h("span", { class: "legend" }, "Tipo de cuenta"), tipos, soyYo ? h("div", { class: "hint" }, "No puedes cambiar el tipo de tu propia cuenta.") : null),
          filaReg,
          h("div", { class: "grid2" }, campo("Nombre de la persona", nom, esNueva ? "Para usuarios regionales puede quedar vacío; la persona lo escribe en su primer ingreso." : null),
            campo("Usuario", usu, esNueva ? "Para usuarios regionales, si lo dejas vacío se usa el código de la región." : "Con este nombre ingresa a la plataforma.")),
          h("div", { class: "grid2" }, campo("Correo (opcional)", cor), campo("Teléfono (opcional)", tel)),
          campo("Cargo (opcional)", car),
          esNueva ? campo("Contraseña temporal", cla, "Se pedirá cambiarla en el primer ingreso. Déjala vacía para generar una automática.") : h("p", { class: "hint" }, "La contraseña se cambia con «Restablecer clave» en la lista de cuentas."),
          h("div", { class: "row" }, btn, h("button", { type: "button", class: "btn sec", onclick: cerrar }, "Cancelar")));
      };
    }

    acc.appendChild(h("button", { class: "btn sec", onclick: function () {
      confirmar("¿Crear una cuenta por región?", "Se creará un usuario regional con contraseña temporal para cada región que todavía no tenga uno. Al final verás las credenciales para entregarlas.", "Crear cuentas").then(function (si) {
        if (!si) return;
        API.crearTodas().then(function (l) { cargar(); if (l.length) mostrarCreds(l, l.length + (l.length === 1 ? " cuenta creada" : " cuentas creadas")); else aviso("Todas las regiones ya tienen un usuario regional."); }).catch(function (e) { aviso(e.message, "error"); });
      });
    } }, "Crear cuentas faltantes por región"));
    acc.appendChild(h("button", { class: "btn", onclick: function () { modal("Nueva cuenta", formCuenta(null)); } }, "+ Nueva cuenta"));

    function cargar() {
      API.cuentas().then(function (cs) {
        res.innerHTML = "";
        var conCuenta = {}; cs.forEach(function (c) { if (c.rol === "regional" && c.activo) conCuenta[c.region] = 1; });
        var faltan = C.REGIONES_LISTA.filter(function (r) { return !conCuenta[r.rid]; });
        res.appendChild(h("div", { class: "kpis" }, [["Cuentas activas", cs.filter(function (c) { return c.activo; }).length, ""], ["Regiones sin usuario activo", faltan.length + " / " + C.REGIONES_LISTA.length, faltan.length ? "warn" : "ok"], ["Con clave temporal", cs.filter(function (c) { return c.cambiar; }).length, ""]].map(function (k) { return h("div", { class: "kpi " + k[2] }, h("b", null, k[1]), k[0]); })));
        if (faltan.length && faltan.length < C.REGIONES_LISTA.length) res.appendChild(h("p", { class: "small muted", style: "margin:-6px 0 14px" }, "Sin usuario regional activo: " + faltan.map(function (r) { return r.nombre; }).join(", ") + "."));
        var fq = h("input", { type: "search", id: "cu-q", placeholder: "Usuario, nombre o correo" });
        var ft = h("select", { id: "cu-t" }, h("option", { value: "" }, "Todos"), Object.keys(ROLES).map(function (k) { return h("option", { value: k }, ROLES[k]); }));
        var fr = h("select", { id: "cu-r" }, h("option", { value: "" }, "Todas"), C.REGIONES_LISTA.map(function (r) { return h("option", { value: r.rid }, r.nombre); }));
        var tabla = h("div");
        res.appendChild(h("div", { class: "filtros" }, campo("Buscar", fq), campo("Tipo de cuenta", ft), campo("Región", fr))); res.appendChild(tabla);
        function pintar() {
          var q = fq.value.trim().toLowerCase(); tabla.innerHTML = "";
          var filas = cs.filter(function (c) {
            if (ft.value && c.rol !== ft.value) return false;
            if (fr.value && c.region !== fr.value) return false;
            return !q || (c.usuario + " " + c.nombre + " " + (c.correo || "")).toLowerCase().indexOf(q) >= 0;
          }).sort(function (a, b) {
            var oa = a.rol === "regional" ? (C.region(a.region) || { orden: 99 }).orden : (a.rol === "admin" ? -2 : -1), ob = b.rol === "regional" ? (C.region(b.region) || { orden: 99 }).orden : (b.rol === "admin" ? -2 : -1);
            return oa - ob || (a.usuario < b.usuario ? -1 : 1);
          });
          if (!filas.length) return tabla.appendChild(h("div", { class: "card vacio" }, h("p", { class: "muted" }, "No hay cuentas con estos filtros.")));
          tabla.appendChild(h("div", { class: "table-wrap" }, h("table", null,
            h("thead", null, h("tr", null, ["Usuario", "Nombre y contacto", "Tipo", "Región asignada", "Estado", ""].map(function (t) { return h("th", null, t); }))),
            h("tbody", null, filas.map(function (c) {
              var est = !c.activo ? ["crit", "✕ Desactivada"] : c.cambiar ? ["warn", "! Clave temporal"] : ["ok", "✓ Activa"], soyYo = c.id === S.u.id;
              return h("tr", null, h("td", { class: "nowrap" }, h("b", null, c.usuario), soyYo ? h("div", { class: "small muted" }, "(tú)") : null),
                h("td", null, c.nombre, (c.correo || c.telefono) ? h("div", { class: "small muted" }, [c.correo, c.telefono].filter(Boolean).join(" · ")) : null, c.cargo ? h("div", { class: "small muted" }, c.cargo) : null),
                h("td", { class: "small" }, ROLES[c.rol] || c.rol), h("td", { class: "small" }, c.rol === "regional" ? tituloRegion(c.region) : "Todo el país"),
                h("td", null, h("span", { class: "pill " + est[0] }, est[1])),
                h("td", { class: "acciones" }, h("button", { class: "btn sec small", onclick: function () { modal("Editar cuenta · " + c.usuario, formCuenta(c)); } }, "Editar"),
                  soyYo ? null : h("button", { class: "btn sec small", onclick: function () {
                    confirmar("¿Restablecer la contraseña?", "Se generará una contraseña temporal para «" + c.usuario + "». La persona deberá cambiarla al ingresar.", "Restablecer").then(function (si) {
                      if (si) API.restablecer(c.id, "").then(function (r) { cargar(); mostrarCreds([{ nombre: c.nombre, nombre_region: c.rol === "regional" ? tituloRegion(c.region) : c.nombre, usuario: r.usuario, clave: r.clave }], "Contraseña restablecida"); }).catch(function (e) { aviso(e.message, "error"); });
                    });
                  } }, "Restablecer clave"),
                  soyYo ? null : h("button", { class: "btn sec small", onclick: function () { API.activar(c.id, !c.activo).then(function () { aviso(c.activo ? "Cuenta desactivada." : "Cuenta activada."); cargar(); }).catch(function (e) { aviso(e.message, "error"); }); } }, c.activo ? "Desactivar" : "Activar"),
                  soyYo ? null : h("button", { class: "btn peligro small", onclick: function () {
                    confirmar("¿Eliminar la cuenta?", "Se eliminará «" + c.usuario + "» y ya no podrá ingresar. Los convenios que haya registrado se conservan. Si solo quieres bloquearla un tiempo, usa «Desactivar».", "Eliminar", true).then(function (si) { if (si) API.eliminarCuenta(c.id).then(function () { aviso("Cuenta eliminada."); cargar(); }).catch(function (e) { aviso(e.message, "error"); }); });
                  } }, "Eliminar")));
            })))));
        }
        fq.addEventListener("input", pintar); ft.addEventListener("change", pintar); fr.addEventListener("change", pintar); pintar();
      }).catch(function (e) { res.innerHTML = ""; res.appendChild(mensaje("error", e.message)); });
    }
    cargar();
  }

  // ---------- Administración: bitácora ----------
  function sumaDias(iso, n) { var d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  function vistaBitacora(page) {
    var de = h("input", { type: "date", id: "bt-d", value: S.f.bDesde || sumaDias(hoyTxt(), -30) }), ha = h("input", { type: "date", id: "bt-h", value: S.f.bHasta || hoyTxt() });
    var q = h("input", { type: "search", id: "bt-q", placeholder: "Usuario, acción o detalle" }), res = h("div"), eventos = [];
    var bx = h("button", { class: "btn sec solo-instalada" }, "⬇ Descargar Excel");
    page.appendChild(h("div", { class: "page-head" }, h("div", null, h("h1", null, "Bitácora"), h("p", { class: "muted" }, "Registro inalterable de ingresos, cuentas, configuración y cada convenio creado, modificado, enviado, devuelto o eliminado.")), bx));
    page.appendChild(h("div", { class: "filtros" }, campo("Desde", de), campo("Hasta", ha), campo("Buscar", q)));
    page.appendChild(res);
    function filtrados() { var t = q.value.trim().toLowerCase(); return eventos.filter(function (e) { return !t || (e.actor_usuario + " " + e.accion + " " + e.objeto + " " + e.detalle).toLowerCase().indexOf(t) >= 0; }); }
    function pintar() {
      var fs = filtrados(); res.innerHTML = "";
      res.appendChild(h("p", { class: "muted small" }, fs.length + " eventos" + (eventos.length >= 3000 ? " (se muestran los 3.000 más recientes; acota las fechas)" : "")));
      res.appendChild(h("div", { class: "table-wrap" }, h("table", null, h("thead", null, h("tr", null, ["Fecha y hora", "Usuario", "Acción", "Sobre", "Detalle"].map(function (t) { return h("th", null, t); }))),
        h("tbody", null, fs.map(function (e) { return h("tr", null, h("td", { class: "nowrap small" }, fFechaHora(e.fecha) + e.fecha.slice(16)), h("td", { class: "nowrap" }, e.actor_usuario), h("td", null, h("b", null, e.accion)), h("td", { class: "small" }, e.objeto), h("td", { class: "small" }, e.detalle)); })))));
    }
    function cargar() {
      S.f.bDesde = de.value; S.f.bHasta = ha.value; res.innerHTML = ""; res.appendChild(h("p", { class: "cargando" }, "Cargando…"));
      API.bitacora(de.value, ha.value).then(function (f) { eventos = f; pintar(); }).catch(function (e) { res.innerHTML = ""; res.appendChild(mensaje("error", e.message)); });
    }
    de.addEventListener("change", cargar); ha.addEventListener("change", cargar); q.addEventListener("input", pintar);
    bx.addEventListener("click", function () {
      var fs = filtrados(); if (!fs.length) return aviso("No hay eventos para descargar.", "error");
      xlsx([{ nombre: "Bitácora", columnas: [{ t: "Fecha y hora", ancho: 20 }, { t: "Usuario", ancho: 20 }, { t: "Acción", ancho: 26 }, { t: "Sobre", ancho: 30 }, { t: "Detalle", ancho: 70 }], filas: fs.map(function (e) { return [e.fecha, e.actor_usuario, e.accion, e.objeto, e.detalle]; }) }])
        .then(function (u8) { bajar("Bitacora_" + de.value + "_a_" + ha.value + ".xlsx", u8); });
    });
    cargar();
  }

  // ---------- Administración: configuración ----------
  function vistaConfig(page) {
    var e = S.e;
    var per = h("input", { type: "text", id: "cg-p", value: e.periodo }), nom = h("input", { type: "text", id: "cg-n", value: e.periodo_nombre, maxlength: "60" });
    var rec = h("select", { id: "cg-r" }, h("option", { value: "abierta", selected: e.recepcion === "abierta" ? "selected" : null }, "Abierta: los usuarios regionales pueden registrar y enviar"), h("option", { value: "cerrada", selected: e.recepcion === "cerrada" ? "selected" : null }, "Cerrada: solo consulta"));
    var lim = h("input", { type: "date", id: "cg-l", value: e.fecha_limite || "" });
    var err = h("div"), b = h("button", { class: "btn", type: "submit" }, "Guardar configuración");
    page.appendChild(h("h1", { style: "margin-bottom:14px" }, "Configuración"));
    page.appendChild(h("form", { class: "card", style: "max-width:640px", onsubmit: function (ev) {
      ev.preventDefault(); err.innerHTML = "";
      var cambiaPeriodo = per.value.trim() !== e.periodo;
      (cambiaPeriodo ? confirmar("¿Cambiar el periodo activo?", "Los convenios nuevos quedarán en el periodo «" + per.value.trim() + "». Lo registrado en «" + e.periodo + "» se conserva y se puede consultar, pero los usuarios regionales ya no podrán modificarlo.", "Cambiar periodo") : Promise.resolve(true)).then(function (si) {
        if (!si) return; b.disabled = true;
        API.guardarConfig({ periodo: per.value.trim(), periodo_nombre: nom.value.trim(), recepcion: rec.value, fecha_limite: lim.value })
          .then(function () { aviso("Configuración guardada."); S.f = {}; return cargarEstado(); })
          .catch(function (x) { err.appendChild(mensaje("error", x.message)); b.disabled = false; });
      });
    } }, err, h("div", { class: "grid2" }, campo("Código del periodo", per, "Ejemplo: 2026-1 (1er semestre), 2026-2."), campo("Nombre del periodo", nom, "Así lo verán los usuarios regionales.")),
      campo("Recepción de respuestas", rec), campo("Plazo de entrega (opcional)", lim, "Se muestra como aviso; no bloquea el envío. Para bloquear, cierra la recepción."), b));
  }

  // ---------- Mi cuenta ----------
  function vistaMiCuenta(page) {
    page.appendChild(h("h1", { style: "margin-bottom:14px" }, "Mi cuenta"));
    var n = h("input", { type: "text", id: "mc-n", value: S.u.nombre, autocomplete: "name" }), c = h("input", { type: "email", id: "mc-c", value: S.u.correo || "", autocomplete: "email" });
    var t = h("input", { type: "tel", id: "mc-t", value: S.u.telefono || "", autocomplete: "tel" }), g = h("input", { type: "text", id: "mc-g", value: S.u.cargo || "", autocomplete: "organization-title" });
    var err = h("div"), b = h("button", { class: "btn", type: "submit" }, "Guardar datos");
    page.appendChild(h("div", { class: "grid-cuenta" },
      h("form", { class: "card", onsubmit: function (ev) {
        ev.preventDefault(); err.innerHTML = ""; b.disabled = true;
        var x = { nombre: n.value, correo: c.value, telefono: t.value, cargo: g.value };
        API.guardarContacto(x).then(function () { S.u.nombre = x.nombre.trim(); S.u.correo = x.correo.trim().toLowerCase(); S.u.telefono = x.telefono.trim(); S.u.cargo = x.cargo.trim(); aviso("Datos guardados."); b.disabled = false; render(); })
          .catch(function (e) { err.appendChild(mensaje("error", e.message)); b.disabled = false; });
      } }, h("h2", null, "Datos de contacto"), h("p", { class: "muted small" }, "Se usan para rellenar «Datos de quien responde» en cada convenio."), err,
        h("div", { class: "field" }, h("span", { class: "legend" }, "Usuario"), h("div", { class: "fijo" }, S.u.usuario + " · " + ROLES[S.u.rol] + (S.u.region ? " · " + tituloRegion(S.u.region) : ""))),
        campo("Nombre completo", n), campo("Correo electrónico", c), campo("Teléfono", t), campo("Cargo", g), b),
      vistaCambiarClave(false)));
  }

  cargarEstado();
})();
