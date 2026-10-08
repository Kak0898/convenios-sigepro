/* Conexión de la página con los datos.
   - Si config.js tiene la dirección y clave de Supabase → usa Supabase (datos reales o de pruebas).
   - Si config.js está vacío → MODO DEMOSTRACIÓN: los datos se guardan solo en este navegador.
   La página (app.js) usa siempre las mismas funciones: API.estado(), API.entrar(), API.guardar(), etc. */
(function () {
  "use strict";
  var CFG = window.CONV_CONFIG || {};
  var DOMINIO = "@convenios-sigepro.local";

  function Err(msg, code) { var e = new Error(msg); e.code = code || 400; return e; }
  function chileAhora() {
    try {
      var p = {}; new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return p.year + "-" + p.month + "-" + p.day + " " + p.hour + ":" + p.minute + ":" + p.second;
    } catch (e) { return new Date().toISOString().slice(0, 19).replace("T", " "); }
  }
  function validarClave(c, usuario) {
    if (String(c).length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (String(c).toLowerCase() === String(usuario).toLowerCase()) return "La contraseña no puede ser igual al usuario.";
    return null;
  }
  var store = (function () { // localStorage con respaldo en memoria
    var mem = {};
    return {
      get: function (k) { try { var v = localStorage.getItem(k); return v === null ? (k in mem ? mem[k] : null) : v; } catch (e) { return k in mem ? mem[k] : null; } },
      set: function (k, v) { mem[k] = v; try { localStorage.setItem(k, v); } catch (e) {} },
      del: function (k) { delete mem[k]; try { localStorage.removeItem(k); } catch (e) {} }
    };
  })();

  // =====================================================================
  //  SUPABASE
  // =====================================================================
  function Supa() {
    var SKEY = "conv-sesion-v1", ses = null;
    try { var s0 = store.get(SKEY); if (s0) ses = JSON.parse(s0); } catch (e) { ses = null; }
    function guardarSes() { if (ses) store.set(SKEY, JSON.stringify(ses)); else store.del(SKEY); }
    function base(p) { return CFG.url.replace(/\/+$/, "") + p; }
    function cab(auth) { return { apikey: CFG.key, "Content-Type": "application/json", Authorization: "Bearer " + (auth && ses ? ses.access : CFG.key) }; }
    function conexion() { return Err("No se pudo conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.", 503); }
    function tomarSesion(j) { ses = { access: j.access_token, refresh: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, uid: j.user && j.user.id }; guardarSes(); }
    function refrescar() {
      if (!ses || !ses.refresh) return Promise.reject(Err("Tu sesión expiró. Vuelve a ingresar.", 401));
      return fetch(base("/auth/v1/token?grant_type=refresh_token"), { method: "POST", headers: cab(false), body: JSON.stringify({ refresh_token: ses.refresh }) })
        .catch(function () { throw conexion(); })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.access_token) { ses = null; guardarSes(); throw Err("Tu sesión expiró. Vuelve a ingresar.", 401); } tomarSesion(j); }); });
    }
    function conSesion() { if (ses && ses.exp - Date.now() < 60000) return refrescar(); return Promise.resolve(); }
    function traducir(r, j) {
      var msg = (j && (j.message || j.msg || j.error_description || j.error)) || "Error inesperado del servidor.";
      if (r.status === 401 || /JWT/i.test(msg)) return Err("Tu sesión expiró. Vuelve a ingresar.", 401);
      if (/^Tu sesi/.test(msg)) return Err(msg, 401);
      if (/^No tienes permiso/.test(msg)) return Err(msg, 403);
      if (r.status === 403 || /permission denied|row-level/i.test(msg)) return Err("No tienes permiso para esta acción.", 403);
      if (/Could not find the function|schema cache|relation .* does not exist/i.test(msg)) return Err("La base de datos aún no está instalada en Supabase (falta ejecutar sql/instalar.sql).", 500);
      return Err(msg, r.status >= 500 ? 500 : 400);
    }
    function llamar(ruta, init, auth) {
      return conSesion().then(function () {
        init.headers = Object.assign(cab(auth), init.headers || {});
        return fetch(base(ruta), init).catch(function () { throw conexion(); });
      }).then(function (r) {
        if (r.status === 204) return { r: r, j: null };
        return r.text().then(function (t) { var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {} return { r: r, j: j }; });
      }).then(function (x) { if (!x.r.ok) throw traducir(x.r, x.j); return x.j; });
    }
    function rpc(nombre, args, auth) { return llamar("/rest/v1/rpc/" + nombre, { method: "POST", body: JSON.stringify(args || {}) }, auth !== false); }
    function leer(ruta) { return llamar("/rest/v1/" + ruta, { method: "GET" }, true).then(function (j) { return j || []; }); }
    function leerTodo(ruta) {
      var out = [], paso = 1000;
      function pag(off) { return leer(ruta + "&limit=" + paso + "&offset=" + off).then(function (f) { out = out.concat(f); return f.length === paso ? pag(off + paso) : out; }); }
      return pag(0);
    }
    var CAMPOS_PERFIL = "id,usuario,nombre,rol,region,correo,telefono,cargo,activo,cambiar";
    function miPerfil() {
      if (!ses || !ses.uid) return Promise.resolve(null);
      return leer("conv_perfiles?select=" + CAMPOS_PERFIL + "&id=eq." + ses.uid).then(function (f) { return f[0] || null; })
        .catch(function (e) { if (e.code === 401) { ses = null; guardarSes(); return null; } throw e; });
    }
    function ingresar(usuario, clave) {
      return fetch(base("/auth/v1/token?grant_type=password"), { method: "POST", headers: cab(false), body: JSON.stringify({ email: usuario + DOMINIO, password: clave }) })
        .catch(function () { throw conexion(); })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok) {
            var m = String(j.error_code || "") + " " + String(j.msg || j.message || "");
            if (r.status === 429 || /over_request_rate_limit|rate limit/i.test(m)) throw Err("Demasiados intentos. Espera unos minutos e inténtalo de nuevo.", 429);
            if (/banned/i.test(m)) throw Err("Esta cuenta está desactivada. Contacta al administrador.", 401);
            if (r.status >= 500) throw Err("El servidor no respondió bien. Inténtalo de nuevo en un momento.", 500);
            throw Err("Usuario o contraseña incorrectos.", 401);
          }
          tomarSesion(j); return j;
        }); });
    }
    function filtroLev(f) {
      var q = "";
      if (f && f.periodo) q += "&periodo=eq." + encodeURIComponent(f.periodo);
      if (f && f.delegacion) q += "&delegacion=eq." + encodeURIComponent(f.delegacion);
      return q;
    }
    var COLS = "id,periodo,delegacion,estado,nombre_convenio,tipo_convenio,institucion,estado_convenio,nota_revision,creado,creado_por,actualizado,actualizado_por,enviado,enviado_por";
    return {
      demo: false,
      estado: function () {
        return rpc("conv_estado", {}, false).then(function (e) {
          return miPerfil().then(function (p) {
            if (p && !p.activo) { ses = null; guardarSes(); p = null; }
            e.usuario = p; return e;
          });
        });
      },
      configurar: function (nombre, usuario, clave) {
        usuario = String(usuario || "").trim().toLowerCase();
        return rpc("conv_configurar", { p_usuario: usuario, p_nombre: nombre || "", p_clave: clave || "" }, false).then(function () { return ingresar(usuario, clave); });
      },
      entrar: function (usuario, clave) {
        return ingresar(String(usuario || "").trim().toLowerCase(), String(clave || "")).then(miPerfil).then(function (p) {
          if (!p || !p.activo) { ses = null; guardarSes(); throw Err("Esta cuenta está desactivada o no pertenece a esta plataforma.", 401); }
          return p;
        });
      },
      salir: function () {
        var t = ses && ses.access; ses = null; guardarSes();
        if (t) fetch(base("/auth/v1/logout"), { method: "POST", headers: { apikey: CFG.key, Authorization: "Bearer " + t } }).catch(function () {});
        return Promise.resolve();
      },
      cambiarClave: function (actual, nueva, nombre) {
        return miPerfil().then(function (p) {
          if (!p) throw Err("Tu sesión expiró. Vuelve a ingresar.", 401);
          var er = validarClave(nueva, p.usuario); if (er) throw Err(er);
          if (nueva === actual) throw Err("La nueva contraseña debe ser distinta de la actual.");
          return ingresar(p.usuario, actual).catch(function (e) { if (e.code === 401) throw Err("La contraseña actual no es correcta."); throw e; })
            .then(function () { return llamar("/auth/v1/user", { method: "PUT", body: JSON.stringify({ password: nueva }) }, true); })
            .then(function () { return rpc("conv_clave_cambiada", { p_nombre: nombre || "" }); });
        });
      },
      guardarContacto: function (c) { return rpc("conv_guardar_contacto", { p_nombre: c.nombre || "", p_correo: c.correo || "", p_telefono: c.telefono || "", p_cargo: c.cargo || "" }); },
      listar: function (f, conDatos) { return leerTodo("conv_levantamientos?select=" + COLS + (conDatos ? ",datos" : "") + filtroLev(f) + "&order=id.desc"); },
      periodos: function () { return leerTodo("conv_levantamientos?select=periodo&order=periodo.desc").then(function (f) { var s = {}; f.forEach(function (x) { s[x.periodo] = 1; }); return Object.keys(s).sort().reverse(); }); },
      obtener: function (id) { return leer("conv_levantamientos?select=" + COLS + ",datos&id=eq." + Number(id)).then(function (f) { if (!f[0]) throw Err("El registro ya no existe o no tienes acceso.", 404); return f[0]; }); },
      guardar: function (id, datos, enviar, delegacion) { return rpc("conv_guardar", { p_id: id || null, p_datos: datos, p_enviar: !!enviar, p_delegacion: delegacion || null }); },
      devolver: function (id, nota) { return rpc("conv_devolver", { p_id: id, p_nota: nota || "" }); },
      eliminarLev: function (id) { return rpc("conv_eliminar_levantamiento", { p_id: id }); },
      cuentas: function () { return leerTodo("conv_perfiles?select=" + CAMPOS_PERFIL + ",creado&order=usuario.asc"); },
      crearCuenta: function (c) { return rpc("conv_crear_cuenta", { p: c }); },
      crearTodas: function () { return rpc("conv_crear_todas", {}); },
      restablecer: function (id, clave) { return rpc("conv_restablecer", { p_id: id, p_clave: clave || "" }); },
      editarCuenta: function (id, c) { return rpc("conv_editar", { p_id: id, p: c }); },
      eliminarCuenta: function (id) { return rpc("conv_eliminar", { p_id: id }); },
      activar: function (id, activo) { return rpc("conv_activar", { p_id: id, p_activo: !!activo }); },
      bitacora: function (desde, hasta) { return leer("conv_bitacora?select=id,fecha,actor_usuario,accion,objeto,detalle&fecha=gte." + (desde || "2000-01-01") + "&fecha=lte." + (hasta || "2999-12-31") + "%2023:59:59&order=id.desc&limit=3000"); },
      guardarConfig: function (c) { return rpc("conv_guardar_config", { p: c }); }
    };
  }

  // =====================================================================
  //  MODO DEMOSTRACIÓN (sin servidor: todo queda en este navegador)
  // =====================================================================
  function Demo() {
    var KEY = "conv-demo-v1", db;
    function cargar() { try { db = JSON.parse(store.get(KEY) || "null"); } catch (e) { db = null; } if (!db || db.v !== 2) { db = semilla(); grabar(); } }
    function grabar() { store.set(KEY, JSON.stringify(db)); }
    function uid() { return "u" + Math.random().toString(36).slice(2, 10); }
    function yo() { return db.sesion ? db.perfiles.filter(function (p) { return p.id === db.sesion && p.activo; })[0] || null : null; }
    function publico(p) { if (!p) return null; var o = {}; Object.keys(p).forEach(function (k) { if (k !== "clave") o[k] = p[k]; }); return o; }
    function log(accion, objeto, detalle, actor) {
      var a = actor || yo();
      db.bitacora.push({ id: ++db.seqB, fecha: chileAhora(), actor_usuario: a ? a.usuario : "sistema", accion: accion, objeto: objeto || "", detalle: detalle || "" });
    }
    function exigir(roles) {
      var p = yo(); if (!p) throw Err("Tu sesión expiró. Vuelve a ingresar.", 401);
      if (p.cambiar) throw Err("Debes cambiar tu contraseña antes de continuar.", 403);
      if (roles && roles.indexOf(p.rol) < 0) throw Err("No tienes permiso para esta acción.", 403);
      return p;
    }
    function ok(v) { return new Promise(function (res) { setTimeout(function () { res(v); }, 120); }); }
    function hacer(fn) { return new Promise(function (res, rej) { setTimeout(function () { try { cargar(); var v = fn(); grabar(); res(v); } catch (e) { rej(e); } }, 120); }); }
    function claveAleatoria() { var a = "abcdefghjkmnpqrstuvwxyz23456789", o = ""; for (var i = 0; i < 10; i++) { o += a[Math.floor(Math.random() * a.length)]; if (i === 4) o += "-"; } return o; }
    function validarUsuario(u) { if (!/^[a-z0-9._-]{3,40}$/.test(u)) throw Err("El usuario debe tener entre 3 y 40 caracteres: letras sin tilde, números, punto, guion o guion bajo."); }
    function nuevaCuenta(usuario, nombre, rol, region, clave, cambiar, extra) {
      if (db.perfiles.some(function (p) { return p.usuario === usuario; })) throw Err("Ese nombre de usuario ya existe.");
      var p = { id: uid(), usuario: usuario, nombre: nombre.slice(0, 80), rol: rol, region: region || null, correo: "", telefono: "", cargo: "", activo: true, cambiar: cambiar, clave: clave, creado: chileAhora() };
      if (extra) { p.correo = String(extra.correo || "").trim().toLowerCase(); p.telefono = String(extra.telefono || "").trim(); p.cargo = String(extra.cargo || "").trim(); }
      db.perfiles.push(p);
      log(rol === "admin" ? "Crear administrador" : "Crear cuenta", usuario, "Tipo: " + rol + (region ? ", región: " + region : ""));
      return p;
    }
    function regionDe(did) { var d = window.CONV.delegacion(did); return d ? d.rid : null; }
    function correoOk(c) { return !c || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(c).trim()); }
    function semilla() {
      db = { v: 2, perfiles: [], levs: [], bitacora: [], seqL: 0, seqB: 0, sesion: null,
        config: { periodo: "2026-1", periodo_nombre: "1er Semestre 2026", recepcion: "abierta", fecha_limite: "" } };
      nuevaCuenta("admin", "Administradora Demo", "admin", null, "demo1234", false);
      nuevaCuenta("valparaiso", "Carla Muñoz Reyes", "regional", "valparaiso", "demo1234", false, { correo: "cmunoz@interior.gob.cl", telefono: "+56 9 1234 5678", cargo: "Profesional Dpto. Coordinación y Gestión Territorial" });
      nuevaCuenta("metropolitana", "Usuario regional Metropolitana de Santiago", "regional", "metropolitana", "demo1234", false);
      nuevaCuenta("consulta", "Analista nacional", "consulta", null, "demo1234", false);
      var base = { resp_nombre: "Carla Muñoz Reyes", resp_correo: "cmunoz@interior.gob.cl", resp_telefono: "+56 9 1234 5678", resp_cargo: "Profesional Dpto. Coordinación y Gestión Territorial", unidad_responsable: "Departamento Social", funcionario_responsable: "María Pérez", alcance: "Regional", resultados: "Sí", dificultades: ["Ninguna"], recomienda_continuidad: "Sí", inicio_vigencia: "2026-01-02", fin_vigencia: "2026-12-31", estado_convenio: "Vigente" };
      function lev(del, estado, extra) {
        var d = Object.assign({}, base, extra, { delegacion: del }), ah = chileAhora();
        db.levs.push({ id: ++db.seqL, periodo: "2026-1", delegacion: del, estado: estado, nombre_convenio: d.nombre_convenio, tipo_convenio: d.tipo_convenio, institucion: window.CONV.institucion(d), estado_convenio: d.estado_convenio, datos: d, nota_revision: "", creado: ah, creado_por: "valparaiso", actualizado: ah, actualizado_por: "valparaiso", enviado: estado === "enviado" ? ah : "", enviado_por: estado === "enviado" ? "valparaiso" : "" });
      }
      lev("dpr-valparaiso", "enviado", { ministerio: "Ministerio de Desarrollo Social y Familia", servicio: "SENAMA", nombre_convenio: "Programa Vínculos — Acompañamiento a personas mayores", id_doc_convenio: "10450021", id_doc_res_aprueba: "10450388", tipo_convenio: "Transferencia de Recursos",
        monto_total: "48000000", monto_transferido: "24000000", cuotas: "2", contrata_personal: "Sí", lugar_ejecucion: "En dependencias de la Delegación", monto_ejecutado: "19500000", monto_rendido: "18000000", monto_aprobado: "17200000", monto_observado: "800000", estado_rendicion: "Aprobada",
        dotacion_maxima: "4", dotacion_utilizada: "4", renuncias: "0", terminos_anticipados: "0", equipo_trabajo: "Ana Rojas Soto 12.345.678-9\nLuis Díaz Mena 13.456.789-0",
        meta_esperada: "320", unidad_meta: "Personas.", estado_cumplimiento: "Parcialmente cumplido.", retrasos: "No", cobertura_comprometida: "Regional.", cobertura_efectiva: "Provincial.", comunas_contempladas: "12", comunas_cubiertas: "9", beneficiarios: "214",
        articulacion: window.CONV.PASOS[7].campos[5].op[1], brecha_territorial: ["Grandes distancias o dificultades de desplazamiento."], riesgo_categoria: ["Dotación."], riesgo_detalle: "Posible rotación de un profesional en el segundo semestre.",
        evaluacion_general: "Satisfactoria con observaciones.", prioridad_seguimiento: "Media.", recomendacion: "Mantener ejecución." });
      lev("dpp-quillota", "borrador", { ministerio: "Municipalidad", institucion_nombre: "Municipalidad de Quillota", nombre_convenio: "Convenio de colaboración en seguridad comunal", tipo_convenio: "Colaboración" });
      db.bitacora = []; db.seqB = 0;
      log("Instalación", "demo", "Datos de demostración creados", { usuario: "sistema" });
      return db;
    }
    cargar();
    function lev(id) { var r = db.levs.filter(function (x) { return x.id === Number(id); })[0]; if (!r) throw Err("El registro ya no existe.", 404); return r; }
    function puedeVer(p, r) { return p.rol === "admin" || p.rol === "consulta" || regionDe(r.delegacion) === p.region; }
    function copia(x) { return JSON.parse(JSON.stringify(x)); }
    function sinDatos(r) { var o = copia(r); delete o.datos; return o; }

    return {
      demo: true,
      estado: function () { cargar(); var c = db.config; return ok({ configurado: true, periodo: c.periodo, periodo_nombre: c.periodo_nombre, recepcion: c.recepcion, fecha_limite: c.fecha_limite, hoy: chileAhora().slice(0, 10), usuario: publico(yo()) }); },
      configurar: function () { return Promise.reject(Err("En modo demostración la plataforma ya está configurada.")); },
      entrar: function (usuario, clave) {
        return hacer(function () {
          usuario = String(usuario || "").trim().toLowerCase();
          var p = db.perfiles.filter(function (x) { return x.usuario === usuario; })[0];
          if (!p || p.clave !== clave) throw Err("Usuario o contraseña incorrectos.", 401);
          if (!p.activo) throw Err("Esta cuenta está desactivada. Contacta al administrador.", 401);
          db.sesion = p.id; log("Inicio de sesión", p.usuario, "Tipo: " + p.rol + (p.region ? ", región: " + p.region : ""), p);
          return publico(p);
        });
      },
      salir: function () { return hacer(function () { db.sesion = null; }); },
      cambiarClave: function (actual, nueva, nombre) {
        return hacer(function () {
          var p = yo(); if (!p) throw Err("Tu sesión expiró. Vuelve a ingresar.", 401);
          var er = validarClave(nueva, p.usuario); if (er) throw Err(er);
          if (nueva === actual) throw Err("La nueva contraseña debe ser distinta de la actual.");
          if (p.clave !== actual) throw Err("La contraseña actual no es correcta.");
          p.clave = nueva; if (nombre && nombre.trim()) p.nombre = nombre.trim().slice(0, 80);
          if (p.cambiar) { p.cambiar = false; log("Cambio de contraseña", p.usuario, "La persona eligió su propia contraseña"); }
          else log("Cambio de contraseña", p.usuario, "");
        });
      },
      guardarContacto: function (c) {
        return hacer(function () {
          var p = yo(); if (!p) throw Err("Tu sesión expiró. Vuelve a ingresar.", 401);
          if (!String(c.nombre || "").trim()) throw Err("Escribe tu nombre (máximo 80 caracteres).");
          if (!correoOk(c.correo)) throw Err("El correo no es válido.");
          p.nombre = c.nombre.trim().slice(0, 80); p.correo = String(c.correo || "").trim().toLowerCase(); p.telefono = String(c.telefono || "").trim(); p.cargo = String(c.cargo || "").trim();
          log("Actualizar datos de contacto", p.usuario, "");
        });
      },
      listar: function (f, conDatos) {
        return hacer(function () {
          var p = exigir();
          return db.levs.filter(function (r) { return puedeVer(p, r) && (!f || !f.periodo || r.periodo === f.periodo) && (!f || !f.delegacion || r.delegacion === f.delegacion); })
            .sort(function (a, b) { return b.id - a.id; }).map(function (r) { return conDatos ? copia(r) : sinDatos(r); });
        });
      },
      periodos: function () { return hacer(function () { exigir(); var s = {}; db.levs.forEach(function (r) { s[r.periodo] = 1; }); return Object.keys(s).sort().reverse(); }); },
      obtener: function (id) { return hacer(function () { var p = exigir(), r = lev(id); if (!puedeVer(p, r)) throw Err("El registro ya no existe o no tienes acceso.", 404); return copia(r); }); },
      guardar: function (id, datos, enviar, delegacion) {
        return hacer(function () {
          var p = exigir(["admin", "regional"]), prev = id ? lev(id) : null, ah = chileAhora(), c = db.config;
          var del = delegacion || datos.delegacion || (prev && prev.delegacion);
          if (prev && p.rol === "regional") {
            if (regionDe(prev.delegacion) !== p.region) throw Err("No tienes permiso para esta acción.", 403);
            if (prev.estado === "enviado") throw Err("Este convenio ya fue enviado. Si necesitas corregirlo, pide al administrador que lo devuelva.");
            if (prev.periodo !== c.periodo) throw Err("Este registro pertenece a un periodo cerrado.");
          }
          if (p.rol === "regional" && c.recepcion !== "abierta") throw Err("La recepción de respuestas está cerrada.");
          var dl = window.CONV.delegacion(del); if (!dl) throw Err("Elige la delegación.");
          if (p.rol === "regional" && dl.rid !== p.region) throw Err("Solo puedes registrar convenios de las delegaciones de tu región.");
          var d = copia(datos); d.delegacion = del; if (dl.tipo !== "provincial") delete d.id_res_dpr;
          if (enviar) { var errs = window.CONV.validarTodo(d, { delegacion: dl }); if (errs.length) throw Err("Falta completar o corregir: «" + (typeof errs[0].campo.t === "function" ? errs[0].campo.t(d) : errs[0].campo.t) + "» (" + errs[0].paso.titulo + ")."); }
          var r = prev || { id: ++db.seqL, periodo: c.periodo, creado: ah, creado_por: p.usuario, enviado: "", enviado_por: "", nota_revision: "" };
          var antes = prev ? prev.estado : null, cambioDatos = !prev || JSON.stringify(prev.datos) !== JSON.stringify(d);
          r.delegacion = del;
          r.estado = enviar ? "enviado" : (prev ? prev.estado : "borrador");
          r.datos = d; r.nombre_convenio = d.nombre_convenio || ""; r.tipo_convenio = d.tipo_convenio || ""; r.institucion = window.CONV.institucion(d); r.estado_convenio = d.estado_convenio || "";
          r.actualizado = ah; r.actualizado_por = p.usuario;
          if (enviar) { r.enviado = ah; r.enviado_por = p.usuario; r.nota_revision = ""; }
          var obj = "#" + r.id + " · " + del, nom = "Nombre: " + (r.nombre_convenio || "(sin nombre)");
          if (!prev) { db.levs.push(r); log(enviar ? "Crear y enviar convenio" : "Crear borrador", obj, nom + " · Periodo: " + r.periodo); }
          else if (antes !== r.estado) log("Enviar convenio", obj, nom);
          else if (cambioDatos) log("Modificar convenio", obj, nom + " · Estado: " + r.estado);
          return { id: r.id, estado: r.estado };
        });
      },
      devolver: function (id, nota) {
        return hacer(function () {
          var p = exigir(["admin"]), r = lev(id);
          if (!String(nota || "").trim()) throw Err("Escribe qué se debe corregir.");
          if (r.estado !== "enviado") throw Err("Solo se pueden devolver convenios enviados.");
          r.estado = "devuelto"; r.nota_revision = String(nota).trim().slice(0, 1000); r.actualizado = chileAhora(); r.actualizado_por = p.usuario;
          log("Devolver convenio", "#" + r.id + " · " + r.delegacion, "Motivo: " + r.nota_revision);
        });
      },
      eliminarLev: function (id) {
        return hacer(function () {
          var p = exigir(["admin", "regional"]), r = lev(id);
          if (p.rol === "regional" && (regionDe(r.delegacion) !== p.region || r.estado === "enviado")) throw Err("Solo puedes eliminar borradores de tu región.");
          db.levs = db.levs.filter(function (x) { return x.id !== r.id; });
          log("Eliminar convenio", "#" + r.id + " · " + r.delegacion, "Nombre: " + (r.nombre_convenio || "(sin nombre)") + " · Estado: " + r.estado);
        });
      },
      cuentas: function () { return hacer(function () { exigir(["admin"]); return db.perfiles.map(publico).sort(function (a, b) { return a.usuario < b.usuario ? -1 : 1; }); }); },
      crearCuenta: function (c) {
        return hacer(function () {
          exigir(["admin"]);
          var rol = c.rol || "regional", usuario = String(c.usuario || "").trim().toLowerCase(), nombre = String(c.nombre || "").trim(), clave = String(c.clave || "").trim(), rg = null;
          if (["admin", "consulta", "regional"].indexOf(rol) < 0) throw Err("Tipo de cuenta no válido.");
          if (rol === "regional") {
            rg = window.CONV.region(c.region); if (!rg) throw Err("Elige la región.");
            if (!usuario) usuario = rg.rid;
            if (!nombre) nombre = "Usuario regional " + rg.nombre;
          } else if (!nombre) throw Err("Escribe el nombre de la persona.");
          if (!correoOk(c.correo)) throw Err("El correo no es válido.");
          validarUsuario(usuario);
          if (clave) { var er = validarClave(clave, usuario); if (er) throw Err(er); } else clave = claveAleatoria();
          nuevaCuenta(usuario, nombre, rol, rg ? rg.rid : null, clave, true, c);
          return { region: rg ? rg.rid : "", nombre_region: rg ? rg.titulo : (rol === "admin" ? "Administrador" : "Consulta (solo lectura)"), nombre: nombre, usuario: usuario, clave: clave, rol: rol };
        });
      },
      crearTodas: function () {
        return hacer(function () {
          exigir(["admin"]); var out = [];
          window.CONV.REGIONES_LISTA.forEach(function (rg) {
            if (db.perfiles.some(function (p) { return (p.rol === "regional" && p.region === rg.rid) || p.usuario === rg.rid; })) return;
            var clave = claveAleatoria(), nombre = "Usuario regional " + rg.nombre;
            nuevaCuenta(rg.rid, nombre, "regional", rg.rid, clave, true);
            out.push({ region: rg.rid, nombre_region: rg.titulo, nombre: nombre, usuario: rg.rid, clave: clave, rol: "regional" });
          });
          return out;
        });
      },
      restablecer: function (id, clave) {
        return hacer(function () {
          var yoP = exigir(["admin"]), p = db.perfiles.filter(function (x) { return x.id === id; })[0];
          if (!p) throw Err("Cuenta no encontrada."); if (p.id === yoP.id) throw Err("Tu propia contraseña se cambia desde “Mi cuenta”.");
          clave = String(clave || "").trim(); if (clave) { var er = validarClave(clave, p.usuario); if (er) throw Err(er); } else clave = claveAleatoria();
          p.clave = clave; p.cambiar = true; log("Restablecer contraseña", p.usuario, "Contraseña temporal; deberá cambiarla al ingresar");
          return { usuario: p.usuario, clave: clave };
        });
      },
      editarCuenta: function (id, c) {
        return hacer(function () {
          var yoP = exigir(["admin"]), p = db.perfiles.filter(function (x) { return x.id === id; })[0]; if (!p) throw Err("Cuenta no encontrada.");
          var usuario = String(c.usuario || "").trim().toLowerCase(), nombre = String(c.nombre || "").trim(), rol = c.rol || p.rol, region = rol === "regional" ? c.region : null;
          if (["admin", "consulta", "regional"].indexOf(rol) < 0) throw Err("Tipo de cuenta no válido.");
          if (p.id === yoP.id && rol !== p.rol) throw Err("No puedes cambiar el tipo de tu propia cuenta.");
          if (!nombre) throw Err("Escribe el nombre."); validarUsuario(usuario);
          if (rol === "regional" && !window.CONV.region(region)) throw Err("Elige la región.");
          if (!correoOk(c.correo)) throw Err("El correo no es válido.");
          if (db.perfiles.some(function (x) { return x.usuario === usuario && x.id !== id; })) throw Err("Ese nombre de usuario ya existe.");
          if (p.usuario !== usuario) log("Cambiar usuario", usuario, "Antes: " + p.usuario);
          if (p.nombre !== nombre) log("Cambiar nombre", usuario, "Antes: " + p.nombre + " · Ahora: " + nombre);
          if (p.rol !== rol) log("Cambiar tipo de cuenta", usuario, "Antes: " + p.rol + " · Ahora: " + rol);
          if ((p.region || null) !== (region || null)) log("Asignar región", usuario, "Antes: " + (p.region || "—") + " · Ahora: " + (region || "—"));
          var cc = String(c.correo || "").trim().toLowerCase(), ct = String(c.telefono || "").trim(), cg = String(c.cargo || "").trim();
          if (p.correo !== cc || p.telefono !== ct || p.cargo !== cg) log("Actualizar datos de contacto", usuario, "");
          p.usuario = usuario; p.nombre = nombre.slice(0, 80); p.rol = rol; p.region = region || null; p.correo = cc; p.telefono = ct; p.cargo = cg;
        });
      },
      eliminarCuenta: function (id) {
        return hacer(function () {
          var yoP = exigir(["admin"]), p = db.perfiles.filter(function (x) { return x.id === id; })[0];
          if (!p) throw Err("Cuenta no encontrada."); if (p.id === yoP.id) throw Err("No puedes eliminar tu propia cuenta.");
          db.perfiles = db.perfiles.filter(function (x) { return x.id !== id; });
          log("Eliminar cuenta", p.usuario, "Tipo: " + p.rol + (p.region ? ", región: " + p.region : ""));
        });
      },
      activar: function (id, activo) {
        return hacer(function () {
          var yoP = exigir(["admin"]), p = db.perfiles.filter(function (x) { return x.id === id; })[0];
          if (!p) throw Err("Cuenta no encontrada."); if (p.id === yoP.id) throw Err("No puedes desactivar tu propia cuenta.");
          if (p.activo !== !!activo) { p.activo = !!activo; log(activo ? "Activar cuenta" : "Desactivar cuenta", p.usuario, ""); }
        });
      },
      bitacora: function (desde, hasta) {
        return hacer(function () {
          exigir(["admin"]); var de = desde || "2000-01-01", ha = (hasta || "2999-12-31") + " 23:59:59";
          return db.bitacora.filter(function (b) { return b.fecha >= de && b.fecha <= ha; }).slice().reverse();
        });
      },
      guardarConfig: function (c) {
        return hacer(function () {
          exigir(["admin"]);
          if (!/^\d{4}-[A-Za-z0-9]{1,10}$/.test(String(c.periodo || "").trim())) throw Err("El código del periodo debe ser como 2026-1 (año, guion y número).");
          if (!String(c.periodo_nombre || "").trim()) throw Err("Escribe el nombre del periodo (máximo 60 caracteres).");
          if (["abierta", "cerrada"].indexOf(c.recepcion) < 0) throw Err("Indica si la recepción está abierta o cerrada.");
          ["periodo", "periodo_nombre", "recepcion", "fecha_limite"].forEach(function (k) {
            var v = String(c[k] || "").trim(); if (db.config[k] !== v) log("Cambiar configuración", k, "Antes: " + db.config[k] + " · Ahora: " + v); db.config[k] = v;
          });
        });
      },
      reiniciarDemo: function () { store.del(KEY); cargar(); return ok(); }
    };
  }

  var conSupabase = !!(CFG.url && CFG.key && /^https?:\/\//.test(CFG.url));
  window.API = conSupabase ? Supa() : Demo();
})();
