export const REGIONS = [
  {
    id: "arica-parinacota",
    label: "Arica y Parinacota",
    questionType: "radio",
    delegations: [
      "Delegación Presidencial Regional de Arica y Parinacota",
      "Delegación Presidencial Provincial de Parinacota",
    ],
  },
  {
    id: "tarapaca",
    label: "Tarapacá",
    questionType: "radio",
    delegations: [
      "Delegación Presidencial Regional de Tarapacá",
      "Delegación Presidencial Provincial del Tamarugal",
    ],
  },
  {
    id: "antofagasta",
    label: "Antofagasta",
    questionType: "radio",
    delegations: [
      "Delegación Presidencial Regional de Antofagasta",
      "Delegación Presidencial Provincial de El Loa",
      "Delegación Presidencial Provincial de Tocopilla",
    ],
  },
  {
    id: "atacama",
    label: "Atacama",
    questionType: "select",
    delegations: [
      "Delegación Presidencial Regional de Atacama",
      "Delegación Presidencial Provincial de Chañaral",
      "Delegación Presidencial Provincial del Huasco",
    ],
  },
  {
    id: "coquimbo",
    label: "Coquimbo",
    questionType: "radio",
    delegations: [
      "Delegación Presidencial Regional de Coquimbo",
      "Delegación Presidencial Provincial del Choapa",
      "Delegación Presidencial Provincial de Limarí",
    ],
  },
  {
    id: "valparaiso",
    label: "Valparaíso",
    questionType: "radio",
    delegations: [
      "Delegación Presidencial Regional de Valparaíso",
      "Delegación Presidencial Provincial de Los Andes",
      "Delegación Presidencial Provincial de Petorca",
      "Delegación Presidencial Provincial de Quillota",
      "Delegación Presidencial Provincial de San Antonio",
      "Delegación Presidencial Provincial de San Felipe de Aconcagua",
      "Delegación Presidencial Provincial de Marga Marga",
      "Delegación Presidencial Provincial de Isla de Pascua",
    ],
  },
  {
    id: "metropolitana",
    label: "Metropolitana de Santiago",
    questionType: "select",
    delegations: [
      "Delegación Presidencial Regional Metropolitana de Santiago",
      "Delegación Presidencial Provincial de Chacabuco",
      "Delegación Presidencial Provincial de Cordillera",
      "Delegación Presidencial Provincial de Maipo",
      "Delegación Presidencial Provincial de Melipilla",
      "Delegación Presidencial Provincial de Talagante",
    ],
  },
  {
    id: "ohiggins",
    label: "Libertador General Bernardo O'Higgins",
    questionType: "select",
    delegations: [
      "Delegación Presidencial Regional del Libertador General Bernardo O'Higgins",
      "Delegación Presidencial Provincial de Cardenal Caro",
      "Delegación Presidencial Provincial de Colchagua",
    ],
  },
  {
    id: "maule",
    label: "Maule",
    questionType: "radio",
    delegations: [
      "Delegación Presidencial Regional del Maule",
      "Delegación Presidencial Provincial de Curicó",
      "Delegación Presidencial Provincial de Linares",
      "Delegación Presidencial Provincial de Cauquenes",
    ],
  },
  {
    id: "nuble",
    label: "Ñuble",
    questionType: "select",
    delegations: [
      "Delegación Presidencial Regional de Ñuble",
      "Delegación Presidencial Provincial de Itata",
      "Delegación Presidencial Provincial de Punilla",
    ],
  },
  {
    id: "biobio",
    label: "Biobío",
    questionType: "select",
    delegations: [
      "Delegación Presidencial Regional del Biobío",
      "Delegación Presidencial Provincial de Arauco",
      "Delegación Presidencial Provincial del Biobío",
    ],
  },
  {
    id: "araucania",
    label: "La Araucanía",
    questionType: "radio",
    delegations: [
      "Delegación Presidencial Regional de La Araucanía",
      "Delegación Presidencial Provincial de Malleco",
    ],
  },
  {
    id: "los-rios",
    label: "Los Ríos",
    questionType: "radio",
    delegations: [
      "Delegación Presidencial Regional de Los Ríos",
      "Delegación Presidencial Provincial del Ranco",
    ],
  },
  {
    id: "los-lagos",
    label: "Los Lagos",
    questionType: "radio",
    delegations: [
      "Delegación Presidencial Regional de Los Lagos",
      "Delegación Presidencial Provincial de Chiloé",
      "Delegación Presidencial Provincial de Osorno",
      "Delegación Presidencial Provincial de Palena",
    ],
  },
  {
    id: "aysen",
    label: "Aysén del General Carlos Ibáñez del Campo",
    questionType: "select",
    delegations: [
      "Delegación Presidencial Regional de Aysén del General Carlos Ibáñez del Campo",
      "Delegación Presidencial Provincial de Capitán Prat",
      "Delegación Presidencial Provincial de General Carrera",
      "Delegación Presidencial Provincial de Aysén",
    ],
  },
  {
    id: "magallanes",
    label: "Magallanes y de la Antártica Chilena",
    questionType: "radio",
    delegations: [
      "Delegación Presidencial Regional de Magallanes y de la Antártica Chilena",
      "Delegación Presidencial Provincial de Antártica Chilena",
      "Delegación Presidencial Provincial de Tierra del Fuego",
      "Delegación Presidencial Provincial de Última Esperanza",
    ],
  },
];

export const INSTITUTIONS = [
  {
    id: "interior",
    label: "Ministerio del Interior",
    serviceLabel: "Seleccione Subsecretaría o Servicio Relacionado",
    services: [
      "Subsecretaría del Interior",
      "Subsecretaría de Desarrollo Regional y Administrativo (SUBDERE)",
      "Servicio Nacional para la Prevención y Rehabilitación del Consumo de Drogas y Alcohol (SENDA)",
      "Agencia Nacional de Inteligencia (ANI)",
      "Servicio Electoral",
    ],
  },
  { id: "relaciones-exteriores", label: "Ministerio de Relaciones Exteriores" },
  {
    id: "defensa",
    label: "Ministerio de Defensa Nacional",
    serviceLabel: "Seleccione Subsecretaría o Servicio Relacionado",
    services: [
      "Subsecretaría para las Fuerzas Armadas",
      "Subsecretaría de Defensa",
      "Estado Mayor Conjunto (EMCO)",
      "Dirección General de Aeronáutica Civil (DGAC)",
      "Ejército de Chile",
      "Armada de Chile",
      "Fuerza Aérea de Chile (FACh)",
    ],
  },
  {
    id: "hacienda",
    label: "Ministerio de Hacienda",
    serviceLabel: "Seleccione Subsecretaría o Servicio Relacionado",
    services: [
      "Subsecretaría de Hacienda",
      "Dirección de Presupuestos (DIPRES)",
      "Servicio de Impuestos Internos (SII)",
      "Servicio Nacional de Aduanas",
      "Tesorería General de la República (TGR)",
      "Dirección de Compras y Contratación Pública (ChileCompra)",
      "Unidad de Análisis Financiero (UAF)",
      "Comisión para el Mercado Financiero (CMF)",
      "Defensoría del Contribuyente (DEDECON)",
      "Superintendencia de Casinos de Juego",
      "BancoEstado",
      "Casa de Moneda S.A",
      "Polla Chilena de Beneficencia",
      "Zofri S.A",
    ],
  },
  { id: "segpres", label: "Ministerio Secretaría General de la Presidencia" },
  {
    id: "segegob",
    label: "Ministerio Secretaría General de Gobierno",
    serviceLabel: "Seleccione",
    services: [
      "Subsecretaría General de Gobierno",
      "División de Organizaciones Sociales (DOS)",
      "Secretaría de Comunicaciones (SECOM)",
    ],
  },
  {
    id: "economia",
    label: "Ministerio de Economía, Fomento y Turismo",
    services: [
      "Subsecretaría de Economía y Empresas de Menor Tamaño",
      "Subsecretaría de Turismo",
      "CORFO",
      "SERNATUR",
      "SERNAC",
      "SERNAPESCA",
      "INE",
      "Superintendencia de Insolvencia y Reemprendimiento (SUPERIR)",
    ],
  },
  {
    id: "desarrollo-social",
    label: "Ministerio de Desarrollo Social y Familia",
    services: [
      "Subsecretaría de Servicios Sociales (incluye SEREMIS)",
      "Subsecretaría de Evaluación Social",
      "Subsecretaría de la Niñez",
      "FOSIS",
      "SENAMA",
      "SENADIS",
      "CONADI",
      "INJUV",
      "Servicio Nacional de Protección Especializada a la Niñez y Adolescencia",
    ],
  },
  {
    id: "educacion",
    label: "Ministerio de Educación",
    services: [
      "Subsecretaría de Educación",
      "Subsecretaría de Educación Parvularia",
      "Subsecretaría de Educación Superior",
      "Dirección de Educación Pública (DEP) - Incluye Servicios de Educación Pública",
      "JUNAEB",
      "JUNJI",
      "Agencia de Calidad de la Educación",
      "Superintendencia de Educación",
      "Comisión Nacional de Acreditación (CNA)",
      "Consejo Nacional de Educación (CNED)",
    ],
  },
  {
    id: "justicia",
    label: "Ministerio de Justicia y Derechos Humanos",
    services: [
      "Subsecretaría de Justicia",
      "Subsecretaría de Derechos Humanos",
      "Servicio de Registro Civil e Identificación",
      "Servicio Nacional de Reinserción Social Juvenil",
      "Gendarmería de Chile",
      "Servicio Médico Legal",
      "Defensoría Penal Pública",
      "Corporación de Asistencia Judicial de Tarapacá y Antofagasta",
      "Corporación de Asistencia Judicial de Valparaíso",
      "Corporación de Asistencia Judicial de la Región Metropolitana",
      "Corporación de Asistencia Judicial del Biobío",
    ],
  },
  {
    id: "trabajo",
    label: "Ministerio del Trabajo y Previsión Social",
    services: [
      "Subsecretaría del Trabajo",
      "Subsecretaría de Previsión Social",
      "Dirección del Trabajo",
      "Servicio Nacional de Capacitación y Empleo (SENCE)",
      "Instituto de Previsión Social (IPS) ChileAtiende",
      "Instituto de Seguridad Laboral (ISL)",
      "Superintendencia de Pensiones",
      "Superintendencia de Seguridad Social",
      "Dirección de Crédito Prendario (DICREP)",
    ],
  },
  {
    id: "obras-publicas",
    label: "Ministerio de Obras Públicas",
    services: [
      "Subsecretaría de Obras Públicas",
      "Dirección General de Obras Públicas",
      "Dirección General de Aguas",
      "Dirección General de Concesiones de Obras Públicas",
      "Dirección de Vialidad",
      "Dirección de Obras Hidráulicas",
      "Dirección de Obras Portuarias",
      "Dirección de Arquitectura",
      "Dirección de Aeropuertos",
      "Dirección de Planeamiento",
      "Dirección de Contabilidad y Finanzas",
      "Instituto Nacional de Hidráulica",
    ],
  },
  {
    id: "salud",
    label: "Ministerio de Salud",
    services: [
      "Subsecretaría de Salud Pública",
      "Subsecretaría de Redes Asistenciales",
      "FONASA",
      "Instituto de Salud Pública (ISP)",
      "CENABAST",
      "Superintendencia de Salud",
      "Servicio de Salud correspondiente al territorio",
    ],
  },
  {
    id: "vivienda",
    label: "Ministerio de Vivienda y Urbanismo",
    services: [
      "Subsecretaría de Vivienda y Urbanismo",
      "SERVIU (o SERVIU Regional, según la región seleccionada)",
      "Parque Metropolitano",
    ],
  },
  {
    id: "agricultura",
    label: "Ministerio de Agricultura",
    services: [
      "Subsecretaría de Agricultura",
      "Instituto de Desarrollo Agropecuario (INDAP)",
      "Servicio Agrícola y Ganadero (SAG)",
      "Corporación Nacional Forestal (CONAF)",
      "Comisión Nacional de Riego (CNR)",
      "Oficina de Estudios y Políticas Agrarias (ODEPA)",
      "Instituto de Investigaciones Agropecuarias (INIA)",
      "Centro de Información de Recursos Naturales (CIREN)",
      "Fundación para la Innovación Agraria (FIA)",
    ],
  },
  {
    id: "mineria",
    label: "Ministerio de Minería",
    services: [
      "Subsecretaría de Minería",
      "Servicio Nacional de Geología y Minería (SERNAGEOMIN)",
      "Comisión Chilena del Cobre (COCHILCO)",
      "Empresa Nacional de Minería (ENAMI)",
      "Corporación Nacional del Cobre de Chile (CODELCO)",
    ],
  },
  {
    id: "transportes",
    label: "Ministerio de Transportes y Telecomunicaciones",
    services: [
      "Subsecretaría de Transportes",
      "Subsecretaría de Telecomunicaciones (SUBTEL)",
      "Junta de Aeronáutica Civil (JAC)",
      "Comisión Nacional de Seguridad de Tránsito (CONASET)",
      "Empresa de los Ferrocarriles del Estado (EFE)",
      "Metro S.A.",
      "Empresa Portuaria de la Región Seleccionada",
    ],
  },
  { id: "bienes-nacionales", label: "Ministerio de Bienes Nacionales" },
  {
    id: "energia",
    label: "Ministerio de Energía",
    services: [
      "Subsecretaría de Energía",
      "Comisión Nacional de Energía (CNE)",
      "Superintendencia de Electricidad y Combustibles (SEC)",
      "Comisión Chilena de Energía Nuclear (CCHEN)",
      "Agencia de Sostenibilidad Energética (AgenciaSE)",
      "Empresa Nacional del Petróleo (ENAP)",
    ],
  },
  {
    id: "medio-ambiente",
    label: "Ministerio del Medio Ambiente",
    services: [
      "Subsecretaría del Medio Ambiente",
      "Servicio de Evaluación Ambiental (SEA)",
      "Superintendencia del Medio Ambiente (SMA)",
      "Servicio de Biodiversidad y Áreas Protegidas (SBAP)",
    ],
  },
  {
    id: "deporte",
    label: "Ministerio del Deporte",
    services: ["Subsecretaría del Deporte", "Instituto Nacional de Deportes de Chile (IND)"],
  },
  {
    id: "mujer",
    label: "Ministerio de la Mujer y la Equidad de Género",
    services: [
      "Subsecretaría de la Mujer y la Equidad de Género",
      "Servicio Nacional de la Mujer y la Equidad de Género (SERNAMEG)",
    ],
  },
  {
    id: "culturas",
    label: "Ministerio de las Culturas, las Artes y el Patrimonio",
    services: [
      "Subsecretaría de las Culturas y las Artes",
      "Subsecretaría del Patrimonio Cultural",
      "Servicio Nacional del Patrimonio Cultural (SERPAT)",
    ],
  },
  {
    id: "ciencia",
    label: "Ministerio de Ciencia, Tecnología, Conocimiento e Innovación",
    services: [
      "Subsecretaría de Ciencia, Tecnología, Conocimiento e Innovación",
      "Agencia Nacional de Investigación y Desarrollo (ANID)",
    ],
  },
  {
    id: "seguridad",
    label: "Ministerio de Seguridad Pública",
    services: [
      "Subsecretaría de Prevención del Delito",
      "Subsecretaría de Seguridad Pública",
      "Carabineros de Chile",
      "Policía de Investigaciones de Chile (PDI)",
    ],
  },
  { id: "municipalidad", label: "Municipalidad", freeTextLabel: "Nombre de la Municipalidad" },
  { id: "gobierno-regional", label: "Gobierno Regional" },
  { id: "institucion-privada", label: "Institución Privada", freeTextLabel: "Nombre de la institución privada" },
];

const q = (id, label, type, extras = {}) => ({ id, label, type, ...extras });

export const FORM_SECTIONS = {
  identificacion: {
    eyebrow: "Identificación",
    title: "Datos de la persona informante",
    description:
      "Registre los datos de contacto y seleccione la región a la que pertenece la Delegación.",
    questions: [
      q("respondent_name", "Nombre persona completa formulario", "text", { required: true }),
      q("respondent_email", "Correo electrónico", "email", { required: true }),
      q("respondent_phone", "Teléfono", "tel", { required: true }),
      q("respondent_role", "Cargo", "text", { required: true }),
      q("region", "Seleccione Región", "radio", {
        required: true,
        options: REGIONS.map(({ id, label }) => ({ value: id, label })),
      }),
    ],
  },
  datos: {
    eyebrow: "Datos del convenio",
    title: "Identificación y vigencia",
    questions: [
      q("convention_name", "Nombre del Convenio", "text", { required: true }),
      q("sige_convention_id", "ID DOC Convenio", "number", {
        required: true,
        min: 10203045,
        error: "Señale un ID DOC válido.",
      }),
      q(
        "dpp_delegation_resolution_id",
        "Si es DPP, señale ID de Resolución de DPR que delegó facultades para celebrar el convenio",
        "number",
        { min: 10000001, error: "Señale un ID DOC válido." },
      ),
      q("sige_approval_resolution_id", "ID DOC Resolución de la Delegación que aprueba el convenio", "number", {
        required: true,
        min: 10203045,
        error: "Señale un ID DOC válido.",
      }),
      q("start_date", "Inicio de vigencia", "date", { required: true }),
      q("end_date", "Fin de vigencia", "date", {
        required: true,
        description: "En caso de que sea indefinido, ingrese 31/12/2075.",
      }),
      q("convention_status", "Estado del Convenio", "radio", {
        required: true,
        description:
          "Seleccione la situación vigente del convenio a la fecha de corte del monitoreo.",
        options: [
          "Vigente",
          "En implementación",
          "Finalizado",
          "Suspendido",
          "En proceso de renovación",
          "Terminado anticipadamente",
        ],
      }),
      q("responsible_unit", "Unidad Responsable en la Delegación", "radio", {
        required: true,
        options: [
          "Gabinete Delegación",
          "Departamento Jurídico",
          "Departamento de Administración y Finanzas",
          "Departamento de Coordinación y Gestión Territorial",
          "Departamento de Coordinación y Supervigilancia Intersectorial",
          "Departamento Social",
        ],
      }),
      q("responsible_officer", "Funcionario Responsable", "text", { required: true }),
      q("planned_scope", "Alcance Planificado", "radio", {
        required: true,
        description: "Si comprende más de una comuna, seleccione “Otro” e identifíquelas.",
        options: ["Regional", "Provincial", "Intercomunal", "Comuna asiento de capital"],
        other: true,
      }),
      q("has_results", "¿Se han obtenido resultados derivados del convenio?", "radio", {
        required: true,
        options: ["Sí", "No", "Parcialmente"],
      }),
      q("difficulties", "Dificultades", "checkbox", {
        required: true,
        description: "Seleccione todas las que correspondan.",
        options: [
          "Falta de coordinación",
          "Baja participación institucional",
          "Rotación de equipos",
          "Retraso en actividades",
          "Cambios institucionales",
          "Falta de recursos humanos",
          "Problemas administrativos",
          "Ninguna",
        ],
        other: true,
      }),
      q("renewal_recommendation", "¿Recomendaría la continuidad o renovación del convenio?", "radio", {
        required: true,
        options: ["Sí", "No", "Sí, con modificaciones"],
      }),
    ],
  },
  tipo: {
    eyebrow: "Tipo de convenio",
    title: "Clasificación del instrumento",
    description:
      "La selección determina las secciones que deberá completar a continuación.",
    questions: [
      q("convention_type", "Seleccione tipo de convenio", "radio", {
        required: true,
        options: [
          { value: "collaboration", label: "Colaboración" },
          { value: "transfer", label: "Transferencia de Recursos" },
        ],
      }),
    ],
  },
  transferencia_intro: {
    eyebrow: "Convenio de transferencia",
    title: "Antecedentes presupuestarios y operativos",
    description:
      "Informe la situación vigente del convenio a la fecha de corte. Los antecedentes deben estar respaldados en el convenio, sus modificaciones, resoluciones aprobatorias y documentación disponible en SIGE.",
    questions: [],
  },
  transferencia: {
    eyebrow: "Caracterización de la transferencia",
    title: "Ejecución financiera y operativa",
    questions: [
      q("total_amount", "Monto total del convenio", "number", { required: true, min: 2 }),
      q("transferred_amount", "Monto transferido a la fecha", "number", { required: true, min: 0 }),
      q("installments", "Número de cuotas contempladas", "radio", {
        required: true,
        options: ["1", "2", "3", "4"],
        other: true,
      }),
      q("hires_staff", "¿El convenio contempla la contratación de personal?", "radio", {
        required: true,
        options: ["Sí", "No"],
      }),
      q("execution_location", "El convenio se ejecuta en dependencias de la Delegación o en oficinas distintas", "radio", {
        required: true,
        options: [
          "En dependencias de la Delegación",
          "En oficinas en comodato",
          "En inmueble en arriendo",
        ],
      }),
      q("executed_amount", "Monto ejecutado", "number", { required: true, min: 0 }),
      q("rendered_amount", "Monto rendido", "number", { required: true, min: 0 }),
      q("approved_amount", "Monto aprobado", "number", { required: true, min: 0 }),
      q("observed_amount", "Monto observado", "number", { required: true, min: 0 }),
      q("latest_rendition_status", "Estado de la última rendición", "radio", {
        required: true,
        options: ["Aprobada", "Rechazada", "Objetada", "Sin rendir", "Rendido"],
      }),
    ],
  },
  personal: {
    eyebrow: "Contratación de personal",
    title: "Dotación asociada al convenio",
    questions: [
      q("max_staff", "Dotación máxima del convenio", "number", { required: true, min: 0 }),
      q("used_staff", "Señale dotación utilizada", "number", { required: true, min: 0 }),
      q("resignations", "Número de renuncias en el periodo", "number", { required: true, min: 0 }),
      q("early_terminations", "Número de términos anticipados en el periodo", "number", {
        required: true,
        min: 0,
      }),
      q("team", "Señale el equipo de trabajo del convenio identificando NOMBRES + APELLIDOS + RUN", "textarea", {
        required: true,
      }),
    ],
  },
  programatica: {
    eyebrow: "Caracterización programática",
    title: "Metas y cumplimiento",
    questions: [
      q("expected_target", "Meta esperada del convenio a la fecha de respuesta del presente formulario", "number", {
        required: true,
        min: 0,
      }),
      q("target_unit", "Unidad de medida de la meta", "radio", {
        required: true,
        options: ["Personas", "Atenciones", "Actividades", "Comunas", "Productos", "Informes"],
        other: true,
      }),
      q("compliance_status", "Estado del cumplimiento", "radio", {
        required: true,
        options: ["Cumplido", "Parcialmente cumplido", "No cumplido", "No exigible durante el período"],
      }),
      q("program_delays", "¿Existen retrasos programáticos?", "radio", { options: ["Sí", "No"] }),
    ],
  },
  territorial: {
    eyebrow: "Cobertura y gestión territorial",
    title: "Cobertura comprometida y efectiva",
    description:
      "Identifique el ámbito territorial establecido formalmente y la ejecución efectiva a la fecha de corte.",
    questions: [
      q("committed_coverage", "Cobertura territorial comprometida", "select", {
        required: true,
        options: ["Nacional", "Regional", "Provincial", "Interprovincial", "Comunal", "Intercomunal", "Otra"],
      }),
      q("effective_coverage", "Cobertura territorial efectiva", "select", {
        required: true,
        description:
          "Indique el ámbito territorial en el que el programa ha desarrollado efectivamente actividades o prestaciones.",
        options: [
          "Regional",
          "Provincial",
          "Interprovincial",
          "Comunal",
          "Intercomunal",
          "Sin ejecución territorial a la fecha",
          "Otra",
        ],
      }),
      q("planned_communes", "Número de comunas contempladas", "number", {
        required: true,
        min: 0,
        description: "Cantidad total de comunas que el convenio considera atender.",
      }),
      q("covered_communes", "Número de comunas efectivamente cubiertas", "number", {
        required: true,
        min: 0,
        description: "Cantidad de comunas con ejecución efectiva a la fecha de corte.",
      }),
      q("beneficiaries", "Número de personas beneficiarias o atenciones", "number", {
        required: true,
        min: 0,
        description:
          "Informe el acumulado según la unidad de medida establecida. Personas y atenciones representan resultados diferentes.",
      }),
      q("territorial_coordination", "Nivel de articulación territorial", "radio", {
        required: true,
        options: [
          "Existe coordinación periódica y planificada con los principales actores territoriales. Se observan responsabilidades definidas, intercambio de información, acciones conjuntas y mecanismos de seguimiento.",
          "Existe coordinación con algunos actores relevantes, pero es principalmente ocasional o presenta debilidades en su planificación, continuidad, cobertura o seguimiento.",
          "La coordinación es limitada, reactiva o se concentra en acciones aisladas. No existen mecanismos regulares de trabajo conjunto.",
          "No se identifican acciones de coordinación con actores territoriales, aun cuando son necesarias para la correcta implementación del convenio.",
          "No corresponde por las características del convenio.",
        ],
      }),
      q("territorial_gap", "Principal brecha territorial", "checkbox", {
        required: true,
        description:
          "Identifique la principal dificultad territorial que afecta o podría afectar el cumplimiento.",
        options: [
          "Dispersión geográfica de la población",
          "Grandes distancias o dificultades de desplazamiento",
          "Aislamiento territorial",
          "Insuficiente cobertura en comunas rurales",
          "Falta de infraestructura o espacios adecuados",
          "Baja conectividad digital o de telecomunicaciones",
          "Insuficiente coordinación con municipios",
          "Insuficiente coordinación con servicios públicos",
          "Baja participación o demanda de la población objetivo",
          "Falta de información para focalizar a la población beneficiaria",
          "Concentración de actividades en la capital regional o provincial",
          "Condiciones climáticas o geográficas adversas",
          "Falta de personal para efectuar despliegue territorial",
          "Insuficiencia de recursos para traslados u operación",
          "No se identifican brechas territoriales",
          "Otra",
        ],
      }),
    ],
  },
  riesgos: {
    eyebrow: "Riesgos y compromisos",
    title: "Riesgo principal del convenio",
    questions: [
      q("risk_category", "Categoría del riesgo principal", "checkbox", {
        required: true,
        options: [
          "Sin riesgo",
          "Programático",
          "Financiero",
          "Administrativo",
          "Jurídico",
          "Dotación",
          "Territorial",
          "Comunicacional",
          "Otro",
        ],
      }),
      q("risk_detail", "Relate el riesgo en detalle", "textarea", { required: true }),
    ],
  },
  evaluacion: {
    eyebrow: "Evaluación integral",
    title: "Conclusión del monitoreo",
    questions: [
      q("general_evaluation", "Evaluación general", "radio", {
        required: true,
        options: ["Satisfactoria", "Satisfactoria con observaciones", "Insatisfactoria", "Crítica"],
      }),
      q("followup_priority", "Prioridad de Seguimiento", "radio", {
        required: true,
        options: ["Baja", "Media", "Alta", "Inmediata"],
      }),
      q("recommendation", "Recomendación", "radio", {
        required: true,
        options: [
          "Mantener ejecución",
          "Mantener con medidas correctivas",
          "Solicitar plan de regularización",
          "Evaluar modificación",
          "Evaluar suspensión",
          "Evaluar término anticipado",
          "Cerrar seguimiento",
        ],
      }),
      q("final_observation", "Observación final", "textarea"),
    ],
  },
};
