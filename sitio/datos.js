/* Levantamiento de Convenios — catálogos y definición del formulario.
   Basado en el Google Form "Levantamiento de Convenios 1er Semestre".
   Los textos de las opciones se mantienen IGUALES al formulario original para que los datos
   sean comparables con las respuestas antiguas. Para agregar o cambiar una opción, se edita aquí. */
(function () {
  "use strict";

  // ---------- Regiones (16) y delegaciones (56) ----------
  // Región: [código, nombre, nombre oficial, delegaciones]. Delegación: [código, nombre, tipo].
  // El código de la región se usa como nombre de usuario de la cuenta regional.
  var REGIONES = [
    ["arica-parinacota", "Arica y Parinacota", "Región de Arica y Parinacota", [["dpr-arica", "Delegación Presidencial Regional de Arica y Parinacota", "regional"], ["dpp-parinacota", "Delegación Presidencial Provincial de Parinacota", "provincial"]]],
    ["tarapaca", "Tarapacá", "Región de Tarapacá", [["dpr-tarapaca", "Delegación Presidencial Regional de Tarapacá", "regional"], ["dpp-tamarugal", "Delegación Presidencial Provincial del Tamarugal", "provincial"]]],
    ["antofagasta", "Antofagasta", "Región de Antofagasta", [["dpr-antofagasta", "Delegación Presidencial Regional de Antofagasta", "regional"], ["dpp-el-loa", "Delegación Presidencial Provincial de El Loa", "provincial"], ["dpp-tocopilla", "Delegación Presidencial Provincial de Tocopilla", "provincial"]]],
    ["atacama", "Atacama", "Región de Atacama", [["dpr-atacama", "Delegación Presidencial Regional de Atacama", "regional"], ["dpp-chanaral", "Delegación Presidencial Provincial de Chañaral", "provincial"], ["dpp-huasco", "Delegación Presidencial Provincial del Huasco", "provincial"]]],
    ["coquimbo", "Coquimbo", "Región de Coquimbo", [["dpr-coquimbo", "Delegación Presidencial Regional de Coquimbo", "regional"], ["dpp-choapa", "Delegación Presidencial Provincial del Choapa", "provincial"], ["dpp-limari", "Delegación Presidencial Provincial de Limarí", "provincial"]]],
    ["valparaiso", "Valparaíso", "Región de Valparaíso", [["dpr-valparaiso", "Delegación Presidencial Regional de Valparaíso", "regional"], ["dpp-los-andes", "Delegación Presidencial Provincial de Los Andes", "provincial"], ["dpp-petorca", "Delegación Presidencial Provincial de Petorca", "provincial"], ["dpp-quillota", "Delegación Presidencial Provincial de Quillota", "provincial"], ["dpp-san-antonio", "Delegación Presidencial Provincial de San Antonio", "provincial"], ["dpp-san-felipe", "Delegación Presidencial Provincial de San Felipe de Aconcagua", "provincial"], ["dpp-marga-marga", "Delegación Presidencial Provincial de Marga Marga", "provincial"], ["dpp-isla-de-pascua", "Delegación Presidencial Provincial de Isla de Pascua", "provincial"]]],
    ["metropolitana", "Metropolitana de Santiago", "Región Metropolitana de Santiago", [["dpr-metropolitana", "Delegación Presidencial Regional Metropolitana de Santiago", "regional"], ["dpp-chacabuco", "Delegación Presidencial Provincial de Chacabuco", "provincial"], ["dpp-cordillera", "Delegación Presidencial Provincial de Cordillera", "provincial"], ["dpp-maipo", "Delegación Presidencial Provincial de Maipo", "provincial"], ["dpp-melipilla", "Delegación Presidencial Provincial de Melipilla", "provincial"], ["dpp-talagante", "Delegación Presidencial Provincial de Talagante", "provincial"]]],
    ["ohiggins", "Libertador General Bernardo O'Higgins", "Región del Libertador General Bernardo O'Higgins", [["dpr-ohiggins", "Delegación Presidencial Regional del Libertador General Bernardo O'Higgins", "regional"], ["dpp-cardenal-caro", "Delegación Presidencial Provincial de Cardenal Caro", "provincial"], ["dpp-colchagua", "Delegación Presidencial Provincial de Colchagua", "provincial"]]],
    ["maule", "Maule", "Región del Maule", [["dpr-maule", "Delegación Presidencial Regional del Maule", "regional"], ["dpp-curico", "Delegación Presidencial Provincial de Curicó", "provincial"], ["dpp-linares", "Delegación Presidencial Provincial de Linares", "provincial"], ["dpp-cauquenes", "Delegación Presidencial Provincial de Cauquenes", "provincial"]]],
    ["nuble", "Ñuble", "Región de Ñuble", [["dpr-nuble", "Delegación Presidencial Regional de Ñuble", "regional"], ["dpp-itata", "Delegación Presidencial Provincial de Itata", "provincial"], ["dpp-punilla", "Delegación Presidencial Provincial de Punilla", "provincial"]]],
    ["biobio", "Biobío", "Región del Biobío", [["dpr-biobio", "Delegación Presidencial Regional del Biobío", "regional"], ["dpp-arauco", "Delegación Presidencial Provincial de Arauco", "provincial"], ["dpp-biobio", "Delegación Presidencial Provincial del Biobío", "provincial"]]],
    ["araucania", "La Araucanía", "Región de La Araucanía", [["dpr-araucania", "Delegación Presidencial Regional de La Araucanía", "regional"], ["dpp-malleco", "Delegación Presidencial Provincial de Malleco", "provincial"]]],
    ["los-rios", "Los Ríos", "Región de Los Ríos", [["dpr-los-rios", "Delegación Presidencial Regional de Los Ríos", "regional"], ["dpp-ranco", "Delegación Presidencial Provincial del Ranco", "provincial"]]],
    ["los-lagos", "Los Lagos", "Región de Los Lagos", [["dpr-los-lagos", "Delegación Presidencial Regional de Los Lagos", "regional"], ["dpp-chiloe", "Delegación Presidencial Provincial de Chiloé", "provincial"], ["dpp-osorno", "Delegación Presidencial Provincial de Osorno", "provincial"], ["dpp-palena", "Delegación Presidencial Provincial de Palena", "provincial"]]],
    ["aysen", "Aysén del General Carlos Ibáñez del Campo", "Región de Aysén del General Carlos Ibáñez del Campo", [["dpr-aysen", "Delegación Presidencial Regional de Aysén del General Carlos Ibáñez del Campo", "regional"], ["dpp-capitan-prat", "Delegación Presidencial Provincial de Capitán Prat", "provincial"], ["dpp-general-carrera", "Delegación Presidencial Provincial de General Carrera", "provincial"], ["dpp-aysen", "Delegación Presidencial Provincial de Aysén", "provincial"]]],
    ["magallanes", "Magallanes y de la Antártica Chilena", "Región de Magallanes y de la Antártica Chilena", [["dpr-magallanes", "Delegación Presidencial Regional de Magallanes y de la Antártica Chilena", "regional"], ["dpp-antartica", "Delegación Presidencial Provincial de Antártica Chilena", "provincial"], ["dpp-tierra-del-fuego", "Delegación Presidencial Provincial de Tierra del Fuego", "provincial"], ["dpp-ultima-esperanza", "Delegación Presidencial Provincial de Última Esperanza", "provincial"]]]
  ];

  var DELEGACIONES = [], REGIONES_LISTA = [];
  REGIONES.forEach(function (r, i) {
    REGIONES_LISTA.push({ rid: r[0], nombre: r[1], titulo: r[2], orden: i + 1 });
    r[3].forEach(function (d) { DELEGACIONES.push({ did: d[0], nombre: d[1], tipo: d[2], region: r[1], rid: r[0], orden: DELEGACIONES.length + 1 }); });
  });

  // ---------- Ministerios e instituciones ----------
  // pregunta: título de la segunda pregunta; servicios: lista; texto: se escribe el nombre
  var SERV = "Seleccione Subsecretaría o Servicio";
  var MINISTERIOS = [
    { nombre: "Ministerio del Interior", pregunta: "Seleccione Subsecretaría o Servicio Relacionado", servicios: ["Subsecretaría del Interior", "Subsecretaría de Desarrollo Regional y Administrativo (SUBDERE)", "Servicio Nacional para la Prevención y Rehabilitación del Consumo de Drogas y Alcohol (SENDA)", "Agencia Nacional de Inteligencia (ANI)", "Servicio Electoral"] },
    { nombre: "Ministerio de Relaciones Exteriores" },
    { nombre: "Ministerio de Defensa Nacional", pregunta: SERV, servicios: ["Subsecretaría para las Fuerzas Armadas", "Subsecretaría de Defensa", "Estado Mayor Conjunto (EMCO)", "Dirección General de Aeronáutica Civil (DGAC)", "Ejército de Chile", "Armada de Chile", "Fuerza Aérea de Chile (FACh)"] },
    { nombre: "Ministerio de Hacienda", pregunta: "Seleccione Subsecretaría o Servicio Relacionado", servicios: ["Subsecretaría de Hacienda", "Dirección de Presupuestos (DIPRES)", "Servicio de Impuestos Internos (SII)", "Servicio Nacional de Aduanas", "Tesorería General de la República (TGR)", "Dirección de Compras y Contratación Pública (ChileCompra)", "Unidad de Análisis Financiero (UAF)", "Comisión para el Mercado Financiero (CMF)", "Defensoría del Contribuyente (DEDECON)", "Superintendencia de Casinos de Juego", "BancoEstado", "Casa de Moneda S.A", "Polla Chilena de Beneficencia", "Zofri S.A"] },
    { nombre: "Ministerio Secretaría General de la Presidencia" },
    { nombre: "Ministerio Secretaría General de Gobierno", pregunta: SERV, servicios: ["Subsecretaría General de Gobierno", "División de Organizaciones Sociales (DOS)", "Secretaría de Comunicaciones (SECOM)"] },
    { nombre: "Ministerio de Economía, Fomento y Turismo", pregunta: SERV, servicios: ["Subsecretaría de Economía y Empresas de Menor Tamaño", "Subsecretaría de Turismo", "CORFO", "SERNATUR", "SERNAC", "SERNAPESCA", "INE", "Superintendencia de Insolvencia y Reemprendimiento (SUPERIR)"] },
    { nombre: "Ministerio de Desarrollo Social y Familia", pregunta: SERV, servicios: ["Subsecretaría de Servicios Sociales (incluye SEREMIS)", "Subsecretaría de Evaluación Social", "Subsecretaría de la Niñez", "FOSIS", "SENAMA", "SENADIS", "CONADI", "INJUV", "Servicio Nacional de Protección Especializada a la Niñez y Adolescencia"] },
    { nombre: "Ministerio de Educación", pregunta: SERV, servicios: ["Subsecretaría de Educación", "Subsecretaría de Educación Parvularia", "Subsecretaría de Educación Superior", "Dirección de Educación Pública (DEP) - Incluye Servicios de Educación Pública", "JUNAEB", "JUNJI", "Agencia de Calidad de la Educación", "Superintendencia de Educación", "Comisión Nacional de Acreditación (CNA)", "Consejo Nacional de Educación (CNED)"] },
    { nombre: "Ministerio de Justicia y Derechos Humanos", pregunta: SERV, servicios: ["Subsecretaría de Justicia", "Subsecretaría de Derechos Humanos", "Servicio de Registro Civil e Identificación", "Servicio Nacional de Reinserción Social Juvenil", "Gendarmería de Chile", "Servicio Médico Legal", "Defensoría Penal Pública", "Corporación de Asistencia Judicial de Tarapacá y Antofagasta", "Corporación de Asistencia Judicial de Valparaíso", "Corporación de Asistencia Judicial de la Región Metropolitana", "Corporación de Asistencia Judicial del Biobío"] },
    { nombre: "Ministerio del Trabajo y Previsión Social", pregunta: SERV, servicios: ["Subsecretaría del Trabajo", "Subsecretaría de Previsión Social", "Dirección del Trabajo", "Servicio Nacional de Capacitación y Empleo (SENCE)", "Instituto de Previsión Social (IPS) ChileAtiende", "Instituto de Seguridad Laboral (ISL)", "Superintendencia de Pensiones", "Superintendencia de Seguridad Social", "Dirección de Crédito Prendario (DICREP)"] },
    { nombre: "Ministerio de Obras Públicas", pregunta: SERV, servicios: ["Subsecretaría de Obras Públicas", "Dirección General de Obras Públicas", "Dirección General de Aguas", "Dirección General de Concesiones de Obras Públicas", "Dirección de Vialidad", "Dirección de Obras Hidráulicas", "Dirección de Obras Portuarias", "Dirección de Arquitectura", "Dirección de Aeropuertos", "Dirección de Planeamiento", "Dirección de Contabilidad y Finanzas", "Instituto Nacional de Hidráulica"] },
    { nombre: "Ministerio de Salud", pregunta: SERV, servicios: ["Subsecretaría de Salud Pública", "Subsecretaría de Redes Asistenciales", "FONASA", "Instituto de Salud Pública (ISP)", "CENABAST", "Superintendencia de Salud", "Servicio de Salud correspondiente al territorio"] },
    { nombre: "Ministerio de Vivienda y Urbanismo", pregunta: SERV, servicios: ["Subsecretaría de Vivienda y Urbanismo", "SERVIU (o SERVIU Regional, según la región seleccionada)", "Parque Metropolitano"] },
    { nombre: "Ministerio de Agricultura", pregunta: SERV, servicios: ["Subsecretaría de Agricultura", "Instituto de Desarrollo Agropecuario (INDAP)", "Servicio Agrícola y Ganadero (SAG)", "Corporación Nacional Forestal (CONAF)", "Comisión Nacional de Riego (CNR)", "Oficina de Estudios y Políticas Agrarias (ODEPA)", "Instituto de Investigaciones Agropecuarias (INIA)", "Centro de Información de Recursos Naturales (CIREN)", "Fundación para la Innovación Agraria (FIA)"] },
    { nombre: "Ministerio de Minería", pregunta: "Seleccione Subsecretaría o institución", servicios: ["Subsecretaría de Minería", "Servicio Nacional de Geología y Minería (SERNAGEOMIN)", "Comisión Chilena del Cobre (COCHILCO)", "Empresa Nacional de Minería (ENAMI)", "Corporación Nacional del Cobre de Chile (CODELCO)"] },
    { nombre: "Ministerio de Transportes y Telecomunicaciones", pregunta: "Seleccione Subsecretaría o Institución", servicios: ["Subsecretaría de Transportes", "Subsecretaría de Telecomunicaciones (SUBTEL)", "Junta de Aeronáutica Civil (JAC)", "Comisión Nacional de Seguridad de Tránsito (CONASET)", "Empresa de los Ferrocarriles del Estado (EFE)", "Metro S.A.", "Empresa Portuaria de la Región Seleccionada"] },
    { nombre: "Ministerio de Bienes Nacionales" },
    { nombre: "Ministerio de Energía", pregunta: "Seleccione Subsecretaría o Institución", servicios: ["Subsecretaría de Energía", "Comisión Nacional de Energía (CNE)", "Superintendencia de Electricidad y Combustibles (SEC)", "Comisión Chilena de Energía Nuclear (CCHEN)", "Agencia de Sostenibilidad Energética (AgenciaSE)", "Empresa Nacional del Petróleo (ENAP)"] },
    { nombre: "Ministerio del Medio Ambiente", pregunta: "Seleccione Subsecretaría o Institución", servicios: ["Subsecretaría del Medio Ambiente", "Servicio de Evaluación Ambiental (SEA)", "Superintendencia del Medio Ambiente (SMA)", "Servicio de Biodiversidad y Áreas Protegidas (SBAP)"] },
    { nombre: "Ministerio del Deporte", pregunta: SERV, servicios: ["Subsecretaría del Deporte", "Instituto Nacional de Deportes de Chile (IND)"] },
    { nombre: "Ministerio de la Mujer y la Equidad de Género", pregunta: SERV, servicios: ["Subsecretaría de la Mujer y la Equidad de Género", "Servicio Nacional de la Mujer y la Equidad de Género (SERNAMEG)"] },
    { nombre: "Ministerio de las Culturas, las Artes y el Patrimonio", pregunta: SERV, servicios: ["Subsecretaría de las Culturas y las Artes", "Subsecretaría del Patrimonio Cultural", "Servicio Nacional del Patrimonio Cultural (SERPAT)"] },
    { nombre: "Ministerio de Ciencia, Tecnología, Conocimiento e Innovación", pregunta: SERV, servicios: ["Subsecretaría de Ciencia, Tecnología, Conocimiento e Innovación", "Agencia Nacional de Investigación y Desarrollo (ANID)"] },
    { nombre: "Ministerio de Seguridad Pública", pregunta: SERV, servicios: ["Subsecretaría de Prevención del Delito", "Subsecretaría de Seguridad Pública", "Carabineros de Chile", "Policía de Investigaciones de Chile (PDI)"] },
    { nombre: "Municipalidad", texto: "Nombre de la Municipalidad" },
    { nombre: "Gobierno Regional" },
    { nombre: "Institución Privada", texto: "Nombre Institución Privada" }
  ];
  var MIN_POR_NOMBRE = {};
  MINISTERIOS.forEach(function (m) { MIN_POR_NOMBRE[m.nombre] = m; });

  // ---------- Textos de ayuda (del formulario original) ----------
  var INTRO = "Este formulario tiene por objeto recopilar información estandarizada sobre la ejecución de los convenios de transferencia implementados por las Delegaciones Presidenciales, con el fin de apoyar las labores de monitoreo, seguimiento y evaluación realizadas por la Unidad de Coordinación y Gestión Territorial de la División de Gobierno Interior. La información proporcionada será utilizada para la elaboración de la Ficha de Monitoreo Integral, el análisis de la gestión programática, presupuestaria, jurídica, territorial y de dotación, así como para la identificación de riesgos, brechas y oportunidades de mejora. Todos los antecedentes informados deberán estar respaldados mediante documentación disponible en el expediente electrónico institucional (SIGE).";
  var SIN_CONVENIOS = "En caso de no tener convenios vigentes favor remitir oficio al Jefe de División de Gobierno Interior señalando aquello.";

  var TRANSF = "Transferencia de Recursos";
  function esTransf(d) { return d.tipo_convenio === TRANSF; }

  // ---------- Pasos del formulario ----------
  // Tipos de campo: text, email, tel, textarea, radio, select, checkbox, date, entero, monto.
  //   min / minMsg: el número debe ser MAYOR que min (igual que la validación del Google Form).
  //   otro: agrega la opción "Otro" con texto. exclusivo: opción que desmarca las demás.
  //   cuando(datos, ctx): si devuelve false, el campo o paso no aplica (no se muestra ni se exige).
  var PASOS = [
    { id: "responsable", titulo: "Datos de quien responde", desc: INTRO, nota: SIN_CONVENIOS, campos: [
      { k: "delegacion", t: "Delegación Presidencial", tipo: "delegacion", req: true },
      { k: "resp_nombre", t: "Nombre persona completa formulario", tipo: "text", req: true },
      { k: "resp_correo", t: "Correo electrónico", tipo: "email", req: true },
      { k: "resp_telefono", t: "Teléfono", tipo: "tel", req: true },
      { k: "resp_cargo", t: "Cargo", tipo: "text", req: true }
    ] },
    { id: "institucion", titulo: "Ministerio o institución en convenio", desc: "Complete la siguiente información respecto del convenio de colaboración objeto del monitoreo. Los antecedentes deberán corresponder al instrumento vigente y estar respaldados en el expediente electrónico institucional (SIGE).", campos: [
      { k: "ministerio", t: "Seleccione el Ministerio o Institución Privada con la que se celebro el convenio.", tipo: "select", req: true, op: MINISTERIOS.map(function (m) { return m.nombre; }) },
      { k: "servicio", t: function (d) { var m = MIN_POR_NOMBRE[d.ministerio]; return m && m.pregunta || "Subsecretaría o servicio"; }, tipo: "select", req: true,
        op: function (d) { var m = MIN_POR_NOMBRE[d.ministerio]; return m && m.servicios || []; },
        cuando: function (d) { var m = MIN_POR_NOMBRE[d.ministerio]; return !!(m && m.servicios); } },
      { k: "institucion_nombre", t: function (d) { var m = MIN_POR_NOMBRE[d.ministerio]; return m && m.texto || "Nombre"; }, tipo: "text", req: true,
        cuando: function (d) { var m = MIN_POR_NOMBRE[d.ministerio]; return !!(m && m.texto); } }
    ] },
    { id: "convenio", titulo: "Datos del Convenio", campos: [
      { k: "nombre_convenio", t: "Nombre del Convenio", tipo: "text", req: true },
      { k: "id_doc_convenio", t: "ID DOC Convenio", tipo: "entero", req: true, min: 10203044, minMsg: "Señale un ID DOC Válido" },
      { k: "id_res_dpr", t: "Si es DPP, señale ID de Resolución de DPR que Delego facultades para celebrar el convenio", tipo: "entero", req: false, min: 10000000, minMsg: "Señale ID Doc Valido",
        cuando: function (d, ctx) { return !!(ctx && ctx.delegacion && ctx.delegacion.tipo === "provincial"); } },
      { k: "id_doc_res_aprueba", t: "ID DOC Resolución de la Delegación que aprueba el convenio", tipo: "entero", req: true, min: 10203044, minMsg: "Señale un ID DOC Valido" },
      { k: "inicio_vigencia", t: "Inicio de vigencia", tipo: "date", req: true },
      { k: "fin_vigencia", t: "Fin de Vigencia", d: "En caso que se indefinido poner 31/12/2075", tipo: "date", req: true, indefinido: "2075-12-31" },
      { k: "estado_convenio", t: "Estado del Convenio", tipo: "radio", req: true, op: ["Vigente", "En implementación", "Finalizado", "Suspendido", "En proceso de renovación", "Terminado anticipadamente"],
        ayuda: {
          "Vigente": "el convenio se encuentra formalmente aprobado y dentro de su período de vigencia.",
          "En implementación": "el convenio se encuentra vigente y se están desarrollando las acciones necesarias para iniciar o poner en marcha su ejecución, tales como transferencias, contrataciones, habilitación de espacios o planificación operativa.",
          "Finalizado": "el convenio concluyó su período de vigencia o ejecución y las actividades comprometidas ya terminaron, sin perjuicio de rendiciones, reintegros o cierres administrativos pendientes.",
          "Suspendido": "la ejecución del convenio se encuentra temporalmente interrumpida por razones administrativas, jurídicas, financieras, programáticas o de fuerza mayor.",
          "En proceso de renovación": "el convenio se encuentra próximo a finalizar o ya finalizó, y se están realizando gestiones para prorrogar su vigencia o suscribir un nuevo instrumento.",
          "Terminado anticipadamente": "el convenio concluyó antes de la fecha originalmente prevista, conforme a las causales y procedimientos establecidos en el instrumento."
        } },
      { k: "unidad_responsable", t: "Unidad Responsable en la Delegación", tipo: "radio", req: true, op: ["Gabinete Delegación", "Departamento Jurídico", "Departamento de Administración y Finanzas", "Departamento de Coordinación y Gestión Territorial", "Departamento de Coordinación y Supervigilancia Intersectorial", "Departamento Social"] },
      { k: "funcionario_responsable", t: "Funcionario Responsable", tipo: "text", req: true },
      { k: "alcance", t: "Alcance Planificado", d: "Si es en mas de otra comuna seleccionar otros y señalar las comunas.", tipo: "radio", req: true, op: ["Regional", "Provincial", "Intercomunal", "Comuna asiento de capital"], otro: true },
      { k: "resultados", t: "¿Se ha obtenido resultados derivados del convenio?", tipo: "radio", req: true, op: ["Sí", "No", "Parcialmente"] },
      { k: "dificultades", t: "Dificultades", d: "Seleccione todas las que correspondan", tipo: "checkbox", req: true, op: ["Falta de coordinación", "Baja participación institucional", "Rotación de equipos", "Retraso en actividades", "Cambios institucionales", "Falta de recursos humanos", "Problemas administrativos", "Ninguna"], otro: true, exclusivo: "Ninguna" },
      { k: "recomienda_continuidad", t: "¿Recomendaría la continuidad o renovación del convenio?", tipo: "radio", req: true, op: ["Sí", "No", "Si, con modificaciones."] }
    ] },
    { id: "tipo", titulo: "Tipo de Convenio", desc: "Seleccione el tipo de convenio que será objeto del monitoreo. Esta selección determinará las secciones y campos que deberá completar en el formulario.", campos: [
      { k: "tipo_convenio", t: "Seleccione tipo de convenio", tipo: "radio", req: true, op: ["Colaboración", TRANSF],
        ayuda: {
          "Colaboración": "instrumento mediante el cual dos o más instituciones acuerdan desarrollar acciones conjuntas, coordinar funciones, intercambiar información o prestar apoyo recíproco para el cumplimiento de objetivos comunes.",
          "Transferencia de Recursos": "instrumento mediante el cual una institución pública entrega recursos presupuestarios a una Delegación Presidencial para la ejecución de un programa, proyecto o conjunto de actividades determinadas. Su ejecución implica obligaciones programáticas y financieras, rendición de cuentas, cumplimiento de metas y uso de los recursos conforme a las condiciones establecidas en el convenio."
        } }
    ] },
    { id: "transferencia", titulo: "Caracterización de la Transferencia", cuando: esTransf,
      desc: "En esta sección se recopilan los antecedentes generales que permiten identificar las principales características presupuestarias y operativas del convenio de transferencia. Los antecedentes informados deberán corresponder a la situación vigente del convenio a la fecha de corte señalada y encontrarse respaldados en el convenio, sus modificaciones, las resoluciones aprobatorias y demás documentación disponible en el expediente SIGE.", campos: [
      { k: "monto_total", t: "Monto total del convenio", tipo: "monto", req: true, min: 1, minMsg: "Debe ser un monto" },
      { k: "monto_transferido", t: "Monto transferido a la fecha", tipo: "monto", req: true },
      { k: "cuotas", t: "Número de cuotas contempladas", tipo: "radio", req: true, op: ["1", "2", "3", "4"], otro: true },
      { k: "contrata_personal", t: "¿El convenio contempla la contratación de personal?", tipo: "radio", req: true, op: ["Sí", "No"] },
      { k: "lugar_ejecucion", t: "El convenio se ejecuta en dependencia de la Delegación o en oficinas distintas", tipo: "radio", req: true, op: ["En dependencias de la Delegación", "En oficinas en Comodato", "En inmueble en arriendo"] },
      { k: "monto_ejecutado", t: "Monto ejecutado", tipo: "monto", req: true },
      { k: "monto_rendido", t: "Monto Rendido", tipo: "monto", req: true },
      { k: "monto_aprobado", t: "Monto aprobado", tipo: "monto", req: true },
      { k: "monto_observado", t: "Monto observado", tipo: "monto", req: true },
      { k: "estado_rendicion", t: "Estado de la ultima rendición", tipo: "radio", req: true, op: ["Aprobada", "Rechazada", "Objetada", "Sin rendir", "Rendido"] }
    ] },
    { id: "personal", titulo: "Detalles contratación de personal", cuando: function (d) { return esTransf(d) && d.contrata_personal === "Sí"; }, campos: [
      { k: "dotacion_maxima", t: "Dotación máxima del convenio", tipo: "entero", req: true },
      { k: "dotacion_utilizada", t: "Señale dotación utilizada", tipo: "entero", req: true },
      { k: "renuncias", t: "Número de Renuncias en el periodo", tipo: "entero", req: true },
      { k: "terminos_anticipados", t: "Número de Términos anticipados en el periodo", tipo: "entero", req: true },
      { k: "equipo_trabajo", t: "Señale el equipo del trabajo del Convenio Identificando NOMBRES+APELLIDOS+ RUN", d: "Una persona por línea.", tipo: "textarea", req: true }
    ] },
    { id: "programatica", titulo: "Caracterización Programática", cuando: esTransf, campos: [
      { k: "meta_esperada", t: "Meta esperada del convenio a la fecha de respuesta del presente formulario", tipo: "text", req: true },
      { k: "unidad_meta", t: "Unidad de Medida de la meta", tipo: "radio", req: true, op: ["Personas.", "Atenciones.", "Actividades.", "Comunas.", "Productos.", "Informes."], otro: true },
      { k: "estado_cumplimiento", t: "Estado del cumplimiento", tipo: "radio", req: true, op: ["Cumplido.", "Parcialmente cumplido.", "No cumplido.", "No exigible durante el período."] },
      { k: "retrasos", t: "¿Existen retrasos programáticos?", tipo: "radio", req: false, op: ["Sí", "No"] }
    ] },
    { id: "cobertura", titulo: "Cobertura y gestión territorial", cuando: esTransf,
      desc: "Identifique el ámbito territorial que el convenio establece formalmente para la ejecución del programa, de acuerdo con el convenio, sus anexos técnicos o modificaciones vigentes.", campos: [
      { k: "cobertura_comprometida", t: "Cobertura territorial comprometida", tipo: "select", req: true, op: ["Nacional.", "Regional.", "Provincial.", "Interprovincial.", "Comunal.", "Intercomunal.", "Otra."] },
      { k: "cobertura_efectiva", t: "Cobertura territorial efectiva", d: "Indique el ámbito territorial en el que el programa ha desarrollado efectivamente actividades, prestaciones o intervenciones a la fecha de corte del monitoreo.", tipo: "select", req: true, op: ["Regional.", "Provincial.", "Interprovincial.", "Comunal.", "Intercomunal.", "Sin ejecución territorial a la fecha.", "Otra."] },
      { k: "comunas_contempladas", t: "Número de comunas contempladas", d: "Informe la cantidad total de comunas que el convenio, programa o planificación vigente considera atender durante su período de ejecución.", tipo: "entero", req: true, min: 0, minMsg: "Debe ser mayor que 0" },
      { k: "comunas_cubiertas", t: "Número de comunas efectivamente cubiertas", d: "Informe la cantidad de comunas en las que se han ejecutado efectivamente actividades, prestaciones, atenciones o acciones asociadas al convenio hasta la fecha de corte.", tipo: "entero", req: true,
        min: function (d) { return d.cobertura_efectiva === "Sin ejecución territorial a la fecha." ? -1 : 0; }, minMsg: "Debe ser mayor que 0 (solo puede ser 0 si no hay ejecución territorial a la fecha)" },
      { k: "beneficiarios", t: "Número de personas beneficiarias o atenciones", d: "Informe el número acumulado de personas beneficiarias o de atenciones realizadas por el programa hasta la fecha de corte, según la unidad de medida establecida en el convenio. No deben utilizarse indistintamente los conceptos de personas y atenciones: una misma persona puede recibir más de una atención, por lo que ambas cifras representan resultados diferentes.", tipo: "entero", req: true },
      { k: "articulacion", t: "Nivel de articulación territorial", tipo: "radio", req: true, op: [
        "Existe coordinación periódica y planificada con los principales actores territoriales. Se observan responsabilidades definidas, intercambio de información, acciones conjuntas y mecanismos de seguimiento.",
        "Existe coordinación con algunos actores relevantes, pero esta es principalmente ocasional o presenta debilidades en su planificación, continuidad, cobertura o seguimiento.",
        "La coordinación es limitada, reactiva o se concentra en acciones aisladas. No existen mecanismos regulares de trabajo conjunto y la articulación contribuye escasamente a la ejecución del convenio.",
        "No se identifican acciones de coordinación con actores territoriales, aun cuando estas resultan necesarias para la correcta implementación del convenio.",
        "No corresponde por las características del convenio."] },
      { k: "brecha_territorial", t: "Principal brecha territorial", d: "Identifique la principal dificultad territorial que afecta o podría afectar el cumplimiento de la cobertura, las metas o la entrega oportuna de las prestaciones comprometidas.", tipo: "checkbox", req: true, exclusivo: "No se identifican brechas territoriales.", op: [
        "Dispersión geográfica de la población.", "Grandes distancias o dificultades de desplazamiento.", "Aislamiento territorial.", "Insuficiente cobertura en comunas rurales.", "Falta de infraestructura o espacios adecuados.", "Baja conectividad digital o de telecomunicaciones.", "Insuficiente coordinación con municipios.", "Insuficiente coordinación con servicios públicos.", "Baja participación o demanda de la población objetivo.", "Falta de información para focalizar a la población beneficiaria.", "Concentración de actividades en la capital regional o provincial.", "Condiciones climáticas o geográficas adversas.", "Falta de personal para efectuar despliegue territorial.", "Insuficiencia de recursos para traslados u operación.", "No se identifican brechas territoriales.", "Otra."] }
    ] },
    { id: "riesgos", titulo: "Riesgos y compromisos", cuando: esTransf, campos: [
      { k: "riesgo_categoria", t: "Categoría del riesgo principal", tipo: "checkbox", req: true, exclusivo: "Sin riesgo", op: ["Sin riesgo", "Programático.", "Financiero.", "Administrativo.", "Jurídico.", "Dotación.", "Territorial.", "Comunicacional.", "Otro."] },
      { k: "riesgo_detalle", t: "Relate el riesgo en detalle", tipo: "textarea", req: true }
    ] },
    { id: "evaluacion", titulo: "Evaluación Integral del Convenio", campos: [
      { k: "evaluacion_general", t: "Evaluación general", tipo: "radio", req: true, op: ["Satisfactoria.", "Satisfactoria con observaciones.", "Insatisfactoria.", "Crítica."] },
      { k: "prioridad_seguimiento", t: "Prioridad de Seguimiento", tipo: "radio", req: true, op: ["Baja.", "Media.", "Alta.", "Inmediata."] },
      { k: "recomendacion", t: "Recomendación", tipo: "radio", req: true, op: ["Mantener ejecución.", "Mantener con medidas correctivas.", "Solicitar plan de regularización.", "Evaluar modificación.", "Evaluar suspensión.", "Evaluar término anticipado.", "Cerrar seguimiento."] },
      { k: "observacion_final", t: "Observación final", tipo: "textarea", req: false }
    ] }
  ];

  // Avisos que no impiden enviar, pero conviene revisar
  var AVISOS = [
    function (d) { if (esTransf(d) && num(d.monto_transferido) > num(d.monto_total)) return "El monto transferido es mayor que el monto total del convenio."; },
    function (d) { if (esTransf(d) && num(d.monto_ejecutado) > num(d.monto_transferido)) return "El monto ejecutado es mayor que el monto transferido."; },
    function (d) { if (esTransf(d) && num(d.monto_aprobado) + num(d.monto_observado) > num(d.monto_rendido)) return "El monto aprobado más el observado supera el monto rendido."; },
    function (d) { if (esTransf(d) && d.contrata_personal === "Sí" && num(d.dotacion_utilizada) > num(d.dotacion_maxima)) return "La dotación utilizada es mayor que la dotación máxima."; },
    function (d) { if (esTransf(d) && num(d.comunas_cubiertas) > num(d.comunas_contempladas)) return "Las comunas cubiertas son más que las contempladas."; }
  ];
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }

  // ---------- Lógica del formulario (la usan la página y el modo demostración) ----------
  var OTRO = "Otro: ";
  function vacio(v) { return v === undefined || v === null || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0); }
  function aplica(x, d, ctx) { return !x.cuando || !!x.cuando(d, ctx); }
  function pasosVisibles(d, ctx) { return PASOS.filter(function (p) { return aplica(p, d, ctx); }); }
  function camposVisibles(p, d, ctx) { return p.campos.filter(function (c) { return aplica(c, d, ctx); }); }
  function valor(c, x, d) { return typeof x === "function" ? x(d) : x; }
  function fechaOk(s) { if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return false; var t = new Date(s + "T12:00:00"); return !isNaN(t) && t.toISOString().slice(0, 10) === s; }

  // Devuelve el texto del error o "" si está bien
  function validarCampo(c, d, ctx) {
    var v = d[c.k];
    if (vacio(v)) return c.req ? "Esta pregunta es obligatoria." : "";
    if (c.tipo === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v).trim())) return "Escribe un correo válido (ejemplo: nombre@interior.gob.cl).";
    if (c.tipo === "entero" || c.tipo === "monto") {
      if (!/^\d{1,15}$/.test(String(v))) return "Escribe solo números enteros, sin letras ni signos.";
      var min = valor(c, c.min, d);
      if (min !== undefined && min !== null && Number(v) <= min) return c.minMsg || ("Debe ser mayor que " + min + ".");
    }
    if (c.tipo === "date") {
      if (!fechaOk(v)) return "La fecha no es válida.";
      if (c.k === "fin_vigencia" && fechaOk(d.inicio_vigencia) && v < d.inicio_vigencia) return "El fin de vigencia no puede ser anterior al inicio.";
    }
    if (c.otro) {
      var lista = Array.isArray(v) ? v : [v];
      for (var i = 0; i < lista.length; i++) if (lista[i] === OTRO.trim() || lista[i] === OTRO) return "Escribe el detalle de la opción «Otro».";
    }
    if ((c.tipo === "radio" || c.tipo === "select") && !c.otro) {
      var ops = valor(c, c.op, d) || [];
      if (ops.indexOf(v) < 0) return "Elige una de las opciones.";
    }
    if (c.tipo === "delegacion" && !window.CONV.delegacion(v)) return "Elige la delegación.";
    return "";
  }
  // Errores de todo el formulario: [{paso, campo, msg}]
  function validarTodo(d, ctx) {
    var out = [];
    pasosVisibles(d, ctx).forEach(function (p) {
      camposVisibles(p, d, ctx).forEach(function (c) { var m = validarCampo(c, d, ctx); if (m) out.push({ paso: p, campo: c, msg: m }); });
    });
    return out;
  }
  // Quita las respuestas de preguntas que ya no aplican (por ejemplo, si cambió el tipo de convenio)
  function limpiar(d, ctx) {
    var vis = {}, out = {};
    pasosVisibles(d, ctx).forEach(function (p) { camposVisibles(p, d, ctx).forEach(function (c) { vis[c.k] = 1; }); });
    Object.keys(d).forEach(function (k) { if (vis[k] && !vacio(d[k])) out[k] = d[k]; });
    return out;
  }
  // Texto legible de una respuesta
  function texto(c, v) {
    if (vacio(v)) return "";
    if (c.tipo === "monto") return "$ " + Number(v).toLocaleString("es-CL");
    if (c.tipo === "entero") return Number(v).toLocaleString("es-CL");
    if (c.tipo === "date") return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v.slice(8, 10) + "/" + v.slice(5, 7) + "/" + v.slice(0, 4) : v;
    if (c.tipo === "delegacion") { var dl = window.CONV.delegacion(v); return dl ? dl.nombre : v; }
    if (Array.isArray(v)) return v.join(" · ");
    return String(v);
  }
  // Todas las preguntas (para exportar a Excel): [{k, t}]
  function columnas() {
    var out = [];
    PASOS.forEach(function (p) {
      p.campos.forEach(function (c) {
        var t = typeof c.t === "function" ? ({ servicio: "Subsecretaría o servicio", institucion_nombre: "Nombre de la institución (Municipalidad / Institución Privada)" }[c.k] || c.k) : c.t;
        out.push({ k: c.k, t: t, campo: c });
      });
    });
    return out;
  }

  window.CONV = {
    OTRO: OTRO,
    vacio: vacio, pasosVisibles: pasosVisibles, camposVisibles: camposVisibles, validarCampo: validarCampo,
    validarTodo: validarTodo, limpiar: limpiar, texto: texto, columnas: columnas, fechaOk: fechaOk,
    REGIONES: REGIONES_LISTA.map(function (r) { return r.nombre; }),
    REGIONES_LISTA: REGIONES_LISTA,
    region: function (rid) { for (var i = 0; i < REGIONES_LISTA.length; i++) if (REGIONES_LISTA[i].rid === rid) return REGIONES_LISTA[i]; return null; },
    delegacionesDe: function (rid) { return DELEGACIONES.filter(function (d) { return d.rid === rid; }); },
    DELEGACIONES: DELEGACIONES,
    MINISTERIOS: MINISTERIOS,
    PASOS: PASOS,
    AVISOS: AVISOS,
    TRANSF: TRANSF,
    ESTADOS: { borrador: "Borrador", enviado: "Enviado", devuelto: "Devuelto para corrección" },
    delegacion: function (did) { for (var i = 0; i < DELEGACIONES.length; i++) if (DELEGACIONES[i].did === did) return DELEGACIONES[i]; return null; },
    institucion: function (d) { return d.servicio || d.institucion_nombre || d.ministerio || ""; }
  };
})();
