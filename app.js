import { FORM_SECTIONS, INSTITUTIONS, REGIONS } from "./schema.js";

const DRAFT_KEY = "levantamiento-convenios-draft-v1";
const RECORDS_KEY = "levantamiento-convenios-records-v1";

const elements = {
  container: document.querySelector("#form-container"),
  navigation: document.querySelector("#step-navigation"),
  progressFill: document.querySelector("#progress-fill"),
  progressValue: document.querySelector("#progress-value"),
  recordName: document.querySelector("#record-name"),
  recordCount: document.querySelector("#record-count"),
  recordsButton: document.querySelector("#records-button"),
  resetButton: document.querySelector("#reset-button"),
  saveState: document.querySelector("#save-state"),
  toolbarLabel: document.querySelector("#toolbar-label"),
  toast: document.querySelector("#toast"),
};

const initialState = {
  currentIndex: 0,
  values: {},
  completed: false,
  savedRecord: null,
  errors: {},
  updatedAt: null,
  view: "form",
};

const EXCLUSIVE_CHECKBOX_OPTIONS = {
  difficulties: "Ninguna",
  territorial_gap: "No se identifican brechas territoriales",
  risk_category: "Sin riesgo",
};

const TRANSFER_SECTION_KEYS = ["transferencia", "personal", "programatica", "territorial", "riesgos"];
const INTEGER_FIELD_IDS = new Set([
  "sige_convention_id",
  "dpp_delegation_resolution_id",
  "sige_approval_resolution_id",
  "max_staff",
  "used_staff",
  "resignations",
  "early_terminations",
  "planned_communes",
  "covered_communes",
  "beneficiaries",
]);

const state = loadDraft();

function loadDraft() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DRAFT_KEY));
    return parsed && parsed.values ? { ...initialState, ...parsed, errors: {} } : { ...initialState };
  } catch {
    return { ...initialState };
  }
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function valueOfOption(option) {
  return typeof option === "string" ? option : option.value;
}

function labelOfOption(option) {
  return typeof option === "string" ? option : option.label;
}

function regionFromState() {
  return REGIONS.find((region) => region.id === state.values.region);
}

function institutionFromState() {
  return INSTITUTIONS.find((institution) => institution.id === state.values.institution);
}

function dynamicDelegationSection() {
  const region = regionFromState();
  return {
    eyebrow: "Delegación",
    title: region ? `Delegación en ${region.label}` : "Seleccione la Delegación",
    description: "Indique la unidad territorial que informa el convenio.",
    questions: [
      {
        id: "delegation",
        label: "Seleccione Delegación",
        type: region?.questionType || "select",
        required: true,
        options: region?.delegations || [],
      },
    ],
  };
}

function institutionSection() {
  return {
    eyebrow: "Institución contraparte",
    title: "Ministerio o institución en convenio",
    description: "Seleccione la institución con la que se celebró el convenio.",
    questions: [
      {
        id: "institution",
        label: "Seleccione el Ministerio o institución",
        type: "radio",
        required: true,
        options: INSTITUTIONS.map(({ id, label }) => ({ value: id, label })),
      },
    ],
  };
}

function serviceSection() {
  const institution = institutionFromState();
  if (!institution) return null;

  if (institution.services) {
    return {
      eyebrow: institution.label,
      title: "Organismo contraparte",
      description: "Precise la subsecretaría, servicio o institución relacionada.",
      questions: [
        {
          id: "institution_detail",
          label: institution.serviceLabel || "Seleccione Subsecretaría o Servicio",
          type: institution.services.length > 7 ? "select" : "radio",
          required: true,
          options: institution.services,
        },
      ],
    };
  }

  if (institution.freeTextLabel) {
    return {
      eyebrow: institution.label,
      title: "Identificación de la contraparte",
      questions: [
        {
          id: "institution_detail",
          label: institution.freeTextLabel,
          type: "text",
          required: institution.id !== "institucion-privada",
        },
      ],
    };
  }

  return null;
}

function getSteps() {
  const steps = [
    { key: "identificacion", label: "Identificación", section: FORM_SECTIONS.identificacion },
    { key: "delegacion", label: "Delegación", section: dynamicDelegationSection() },
    { key: "contraparte", label: "Contraparte", section: institutionSection() },
  ];

  const service = serviceSection();
  if (service) steps.push({ key: "servicio", label: "Servicio o unidad", section: service });

  steps.push(
    { key: "datos", label: "Datos del convenio", section: FORM_SECTIONS.datos },
    { key: "tipo", label: "Tipo de convenio", section: FORM_SECTIONS.tipo },
  );

  if (state.values.convention_type === "transfer") {
    steps.push(
      { key: "transferencia_intro", label: "Convenio de transferencia", section: FORM_SECTIONS.transferencia_intro },
      { key: "transferencia", label: "Transferencia", section: FORM_SECTIONS.transferencia },
      { key: "personal", label: "Personal", section: FORM_SECTIONS.personal },
      { key: "programatica", label: "Caracterización programática", section: FORM_SECTIONS.programatica },
      { key: "territorial", label: "Cobertura territorial", section: FORM_SECTIONS.territorial },
      { key: "riesgos", label: "Riesgos", section: FORM_SECTIONS.riesgos },
    );
  }

  if (state.values.convention_type) {
    steps.push({ key: "evaluacion", label: "Evaluación integral", section: FORM_SECTIONS.evaluacion });
  }

  return steps;
}

function persistDraft({ quiet = false } = {}) {
  state.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ currentIndex: state.currentIndex, values: state.values, completed: false, updatedAt: state.updatedAt }),
    );
  } catch {
    showToast("No fue posible guardar el borrador en este dispositivo");
    return false;
  }
  updateSaveState();
  if (!quiet) showToast("Borrador guardado en este dispositivo");
  return true;
}

function updateRecordCount() {
  elements.recordCount.textContent = String(loadRecords().length);
}

function updateSaveState() {
  if (!state.updatedAt) {
    elements.saveState.innerHTML = '<span class="save-dot"></span>Borrador local';
    return;
  }
  const time = new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(state.updatedAt),
  );
  elements.saveState.innerHTML = `<span class="save-dot"></span>Guardado ${time}`;
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 2600);
}

function renderField(question) {
  const current = state.values[question.id];
  const error = state.errors[question.id];
  const required = question.required ? '<span class="required-mark" aria-hidden="true">*</span>' : "";
  const description = question.description
    ? `<p class="field-help" id="${question.id}-help">${escapeHTML(question.description)}</p>`
    : "";
  const errorMarkup = error
    ? `<p class="error-text" id="${question.id}-error">${escapeHTML(error)}</p>`
    : "";
  const describedBy = [question.description ? `${question.id}-help` : "", error ? `${question.id}-error` : ""]
    .filter(Boolean)
    .join(" ");
  const commonAttrs = `${question.required ? "required" : ""} ${describedBy ? `aria-describedby="${describedBy}"` : ""} ${error ? 'aria-invalid="true"' : ""}`;

  if (["text", "email", "tel", "number", "date"].includes(question.type)) {
    const min = question.min !== undefined ? `min="${question.min}"` : "";
    const step = question.type === "number" && INTEGER_FIELD_IDS.has(question.id) ? 'step="1"' : "";
    return `
      <div class="field ${error ? "has-error" : ""}" data-field="${question.id}">
        <label class="field-label" for="${question.id}">${escapeHTML(question.label)}${required}</label>
        ${description}
        <input class="text-input" id="${question.id}" name="${question.id}" type="${question.type}" value="${escapeHTML(current ?? "")}" ${min} ${step} ${commonAttrs} autocomplete="off">
        ${errorMarkup}
      </div>`;
  }

  if (question.type === "textarea") {
    return `
      <div class="field ${error ? "has-error" : ""}" data-field="${question.id}">
        <label class="field-label" for="${question.id}">${escapeHTML(question.label)}${required}</label>
        ${description}
        <textarea class="textarea-input" id="${question.id}" name="${question.id}" ${commonAttrs}>${escapeHTML(current ?? "")}</textarea>
        ${errorMarkup}
      </div>`;
  }

  if (question.type === "select") {
    return `
      <div class="field ${error ? "has-error" : ""}" data-field="${question.id}">
        <label class="field-label" for="${question.id}">${escapeHTML(question.label)}${required}</label>
        ${description}
        <select class="select-input" id="${question.id}" name="${question.id}" ${commonAttrs}>
          <option value="">Seleccione una opción</option>
          ${(question.options || [])
            .map((option) => {
              const value = valueOfOption(option);
              return `<option value="${escapeHTML(value)}" ${String(current) === String(value) ? "selected" : ""}>${escapeHTML(labelOfOption(option))}</option>`;
            })
            .join("")}
        </select>
        ${errorMarkup}
      </div>`;
  }

  if (["radio", "checkbox"].includes(question.type)) {
    const isCheckbox = question.type === "checkbox";
    const selectedValues = isCheckbox ? (Array.isArray(current) ? current : []) : [current];
    const options = [...(question.options || [])];
    if (question.other) options.push({ value: "__other__", label: "Otro" });
    const selectedOther = selectedValues.includes("__other__");
    const columns = options.length > 5 && options.every((option) => labelOfOption(option).length < 55);

    return `
      <fieldset class="field ${error ? "has-error" : ""}" data-field="${question.id}" ${error ? 'aria-invalid="true"' : ""}>
        <legend>${escapeHTML(question.label)}${required}</legend>
        ${description}
        <div class="choice-grid ${columns ? "two-columns" : ""}" ${describedBy ? `aria-describedby="${describedBy}"` : ""}>
          ${options
            .map((option) => {
              const value = valueOfOption(option);
              const checked = selectedValues.map(String).includes(String(value));
              return `<label class="choice-card"><input type="${question.type}" name="${question.id}" value="${escapeHTML(value)}" ${checked ? "checked" : ""}><span>${escapeHTML(labelOfOption(option))}</span></label>`;
            })
            .join("")}
        </div>
        ${
          question.other && selectedOther
            ? `<input class="text-input other-input" name="${question.id}__other" aria-label="Especifique otra opción" placeholder="Especifique" value="${escapeHTML(state.values[`${question.id}__other`] ?? "")}">`
            : ""
        }
        ${errorMarkup}
      </fieldset>`;
  }

  return "";
}

function renderNavigation(steps) {
  elements.navigation.innerHTML = steps
    .map(
      (step, index) => `<button class="step-item ${index === state.currentIndex ? "active" : ""} ${index < state.currentIndex ? "completed" : ""}" type="button" data-step-index="${index}" ${index > state.currentIndex ? "disabled" : ""} ${index === state.currentIndex ? 'aria-current="step"' : ""}><span class="step-index">${index < state.currentIndex ? "✓" : index + 1}</span><span>${escapeHTML(step.label)}</span></button>`,
    )
    .join("");
}

function renderForm() {
  const steps = getSteps();
  state.currentIndex = Math.max(0, Math.min(state.currentIndex, steps.length - 1));
  const currentStep = steps[state.currentIndex];
  const section = currentStep.section;
  const progress = steps.length <= 1 ? 0 : Math.round((state.currentIndex / (steps.length - 1)) * 100);

  elements.progressFill.style.width = `${progress}%`;
  elements.progressValue.textContent = `${progress}%`;
  elements.toolbarLabel.textContent = "Declaración en curso";
  elements.recordName.textContent = state.values.convention_name || "Nuevo convenio";
  elements.resetButton.hidden = false;
  renderNavigation(steps);

  elements.container.innerHTML = `
    <form class="form-card" id="convention-form" novalidate>
      <header class="form-heading">
        <p class="eyebrow">${escapeHTML(section.eyebrow || currentStep.label)}</p>
        <h2>${escapeHTML(section.title)}</h2>
        ${section.description ? `<p class="description">${escapeHTML(section.description)}</p>` : ""}
      </header>
      <div class="form-body">
        ${
          section.questions.length
            ? section.questions.map(renderField).join("")
            : '<div class="information-panel"><span class="information-icon" aria-hidden="true">i</span><p>Esta etapa presenta el contexto del convenio de transferencia. Continúe para registrar su caracterización.</p></div>'
        }
      </div>
      <footer class="form-actions">
        <button class="secondary-button" type="button" data-action="back" ${state.currentIndex === 0 ? "disabled" : ""}>Anterior</button>
        <span class="step-counter">Etapa ${state.currentIndex + 1} de ${steps.length}</span>
        <button class="primary-button" type="button" data-action="next">${currentStep.key === "evaluacion" ? "Guardar declaración" : "Continuar"}</button>
      </footer>
    </form>`;

  updateSaveState();
}

function institutionFromRecord(record) {
  return INSTITUTIONS.find((institution) => institution.id === record.values.institution);
}

function renderSuccess() {
  const record = state.savedRecord;
  elements.progressFill.style.width = "100%";
  elements.progressValue.textContent = "100%";
  elements.toolbarLabel.textContent = "Declaración guardada";
  elements.recordName.textContent = record.values.convention_name || "Convenio registrado";
  elements.resetButton.hidden = true;
  elements.navigation.innerHTML = "";
  elements.container.innerHTML = `
    <section class="form-card success-card">
      <div class="success-check" aria-hidden="true">✓</div>
      <p class="eyebrow">Declaración guardada</p>
      <h2>${escapeHTML(record.values.convention_name || "Convenio registrado")}</h2>
      <p>La declaración quedó almacenada únicamente en este dispositivo con el identificador <strong>${escapeHTML(record.id)}</strong>.</p>
      <div class="success-summary">
        <div><span>Delegación</span><strong>${escapeHTML(record.values.delegation || "—")}</strong></div>
        <div><span>Contraparte</span><strong>${escapeHTML(institutionFromRecord(record)?.label || "—")}</strong></div>
        <div><span>Tipo</span><strong>${record.values.convention_type === "transfer" ? "Transferencia de Recursos" : "Colaboración"}</strong></div>
      </div>
      <div class="success-actions">
        <button class="secondary-button" type="button" data-action="download">Descargar respaldo JSON</button>
        <button class="secondary-button" type="button" data-action="records">Ver registros locales</button>
        <button class="primary-button" type="button" data-action="new">Registrar otro convenio</button>
      </div>
    </section>`;
}

function formatRecordDate(value) {
  try {
    return new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return "Fecha no disponible";
  }
}

function renderRecords() {
  const records = loadRecords().slice().reverse();
  elements.progressFill.style.width = "100%";
  elements.progressValue.textContent = `${records.length}`;
  elements.toolbarLabel.textContent = "Almacenamiento del dispositivo";
  elements.recordName.textContent = `${records.length} ${records.length === 1 ? "registro" : "registros"}`;
  elements.resetButton.hidden = true;
  elements.navigation.innerHTML = "";
  elements.container.innerHTML = `
    <section class="form-card records-card">
      <p class="eyebrow">Registros locales</p>
      <h2>Declaraciones guardadas</h2>
      <p class="records-intro">Estos antecedentes están disponibles únicamente en este navegador. Puede descargar cada declaración o generar un respaldo conjunto.</p>
      ${
        records.length
          ? `<ul class="records-list">${records
              .map(
                (record) => `<li class="record-row">
                  <div>
                    <h3>${escapeHTML(record.values?.convention_name || "Convenio sin nombre")}</h3>
                    <p>${escapeHTML(record.id)} · ${escapeHTML(formatRecordDate(record.createdAt))} · ${record.values?.convention_type === "transfer" ? "Transferencia de Recursos" : "Colaboración"}</p>
                  </div>
                  <button class="secondary-button" type="button" data-action="download-record" data-record-id="${escapeHTML(record.id)}">Descargar JSON</button>
                </li>`,
              )
              .join("")}</ul>`
          : '<div class="records-empty">Todavía no hay declaraciones guardadas en este dispositivo.</div>'
      }
      <div class="records-actions">
        <button class="secondary-button" type="button" data-action="return-form">Volver al formulario</button>
        ${records.length ? '<button class="primary-button" type="button" data-action="download-all">Descargar respaldo completo</button>' : ""}
      </div>
    </section>`;
}

function render() {
  updateRecordCount();
  if (state.view === "records") renderRecords();
  else if (state.completed && state.savedRecord) renderSuccess();
  else renderForm();
}

function updateValueFromElement(element) {
  if (!element.name) return;
  const oldRegion = state.values.region;
  const oldInstitution = state.values.institution;
  const oldConventionType = state.values.convention_type;
  const previousValue = state.values[element.name];
  const hadError = Boolean(state.errors[element.name]);
  const previouslyHadOther = Array.isArray(previousValue)
    ? previousValue.includes("__other__")
    : previousValue === "__other__";

  if (element.type === "checkbox") {
    let selected = [...document.querySelectorAll(`input[name="${CSS.escape(element.name)}"]:checked`)].map(
      (input) => input.value,
    );
    const exclusive = EXCLUSIVE_CHECKBOX_OPTIONS[element.name];
    if (exclusive && element.checked && element.value === exclusive) selected = [exclusive];
    else if (exclusive && element.checked) selected = selected.filter((value) => value !== exclusive);
    state.values[element.name] = selected;
    document.querySelectorAll(`input[name="${CSS.escape(element.name)}"]`).forEach((input) => {
      input.checked = selected.includes(input.value);
    });
  } else {
    state.values[element.name] = element.value;
  }

  if (element.name === "region" && oldRegion !== element.value) delete state.values.delegation;
  if (element.name === "institution" && oldInstitution !== element.value) delete state.values.institution_detail;
  if (element.name === "convention_type" && oldConventionType !== element.value && element.value !== "transfer") {
    for (const sectionKey of TRANSFER_SECTION_KEYS) {
      for (const question of FORM_SECTIONS[sectionKey].questions) {
        delete state.values[question.id];
        delete state.values[`${question.id}__other`];
      }
    }
  }
  if (["radio", "checkbox"].includes(element.type)) {
    const value = state.values[element.name];
    const hasOther = Array.isArray(value) ? value.includes("__other__") : value === "__other__";
    if (!hasOther) delete state.values[`${element.name}__other`];
  }

  delete state.errors[element.name];
  persistDraft({ quiet: true });

  const nextValue = state.values[element.name];
  const nowHasOther = Array.isArray(nextValue) ? nextValue.includes("__other__") : nextValue === "__other__";
  if (["region", "institution", "convention_type"].includes(element.name) || previouslyHadOther !== nowHasOther || hadError) {
    render();
  } else {
    elements.recordName.textContent = state.values.convention_name || "Nuevo convenio";
  }
}

function isEmpty(value) {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "") || (Array.isArray(value) && value.length === 0);
}

function validateQuestion(question) {
  const value = state.values[question.id];
  if (question.required && isEmpty(value)) return "Este campo es obligatorio.";
  if (isEmpty(value)) return null;
  if (["text", "email", "tel", "date", "textarea"].includes(question.type) && typeof value !== "string") {
    return "Ingrese un valor de texto válido.";
  }
  if (question.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
    return "Ingrese una dirección de correo válida.";
  }
  if (question.type === "number") {
    const number = Number(value);
    if (!Number.isFinite(number)) return "Ingrese un número válido.";
    if (INTEGER_FIELD_IDS.has(question.id) && !Number.isInteger(number)) return "Ingrese un número entero.";
    if (question.min !== undefined && number < question.min) {
      return question.error || `El valor debe ser igual o superior a ${question.min}.`;
    }
  }
  if (["radio", "select"].includes(question.type)) {
    const allowed = new Set((question.options || []).map((option) => String(valueOfOption(option))));
    if (question.other) allowed.add("__other__");
    if (!allowed.has(String(value))) return "Seleccione una opción válida.";
  }
  if (question.type === "checkbox") {
    if (!Array.isArray(value)) return "Seleccione una o más opciones válidas.";
    const allowed = new Set((question.options || []).map((option) => String(valueOfOption(option))));
    if (question.other) allowed.add("__other__");
    if (value.some((option) => !allowed.has(String(option)))) return "Seleccione únicamente opciones válidas.";
    const exclusive = EXCLUSIVE_CHECKBOX_OPTIONS[question.id];
    if (exclusive && value.includes(exclusive) && value.length > 1) return `“${exclusive}” no puede combinarse con otras opciones.`;
  }
  if (question.other) {
    const selected = Array.isArray(value) ? value.includes("__other__") : value === "__other__";
    if (selected && isEmpty(state.values[`${question.id}__other`])) return "Especifique la opción seleccionada.";
  }
  return null;
}

function validateCrossFields(stepKey) {
  const errors = {};
  const number = (field) => (isEmpty(state.values[field]) ? null : Number(state.values[field]));

  if (stepKey === "datos") {
    if (state.values.start_date && state.values.end_date && state.values.start_date > state.values.end_date) {
      errors.end_date = "La fecha de término no puede ser anterior al inicio de vigencia.";
    }
    if (String(state.values.delegation || "").includes("Presidencial Provincial") && isEmpty(state.values.dpp_delegation_resolution_id)) {
      errors.dpp_delegation_resolution_id = "Este ID es obligatorio para una Delegación Presidencial Provincial.";
    }
  }

  if (stepKey === "transferencia") {
    const total = number("total_amount");
    const transferred = number("transferred_amount");
    const executed = number("executed_amount");
    const rendered = number("rendered_amount");
    const approved = number("approved_amount");
    const observed = number("observed_amount");
    if (total !== null && transferred > total) errors.transferred_amount = "El monto transferido no puede superar el monto total.";
    if (transferred !== null && executed > transferred) errors.executed_amount = "El monto ejecutado no puede superar el monto transferido.";
    if (executed !== null && rendered > executed) errors.rendered_amount = "El monto rendido no puede superar el monto ejecutado.";
    if (rendered !== null && approved > rendered) errors.approved_amount = "El monto aprobado no puede superar el monto rendido.";
    if (rendered !== null && observed > rendered) errors.observed_amount = "El monto observado no puede superar el monto rendido.";
  }

  if (stepKey === "personal") {
    const maximum = number("max_staff");
    const used = number("used_staff");
    if (maximum !== null && used > maximum) errors.used_staff = "La dotación utilizada no puede superar la dotación máxima.";
  }

  if (stepKey === "territorial") {
    const planned = number("planned_communes");
    const covered = number("covered_communes");
    if (planned !== null && covered > planned) errors.covered_communes = "Las comunas cubiertas no pueden superar las comunas contempladas.";
  }

  return errors;
}

function validateCurrentStep() {
  const step = getSteps()[state.currentIndex];
  state.errors = {};
  for (const question of step.section.questions) {
    const error = validateQuestion(question);
    if (error) state.errors[question.id] = error;
  }
  Object.assign(state.errors, validateCrossFields(step.key));
  if (Object.keys(state.errors).length) {
    render();
    const firstError = elements.container.querySelector("[aria-invalid='true'], .field.has-error input, .field.has-error select, .field.has-error textarea");
    firstError?.focus();
    showToast("Revise los campos señalados antes de continuar");
    return false;
  }
  return true;
}

function validateAllSteps() {
  const steps = getSteps();
  state.errors = {};
  let firstInvalidStep = -1;
  steps.forEach((step, stepIndex) => {
    for (const question of step.section.questions) {
      const error = validateQuestion(question);
      if (!error) continue;
      state.errors[question.id] = error;
      if (firstInvalidStep === -1) firstInvalidStep = stepIndex;
    }
    const crossErrors = validateCrossFields(step.key);
    for (const [field, error] of Object.entries(crossErrors)) {
      state.errors[field] = error;
      if (firstInvalidStep === -1) firstInvalidStep = stepIndex;
    }
  });
  if (firstInvalidStep === -1) return true;
  state.currentIndex = firstInvalidStep;
  persistDraft({ quiet: true });
  render();
  const firstError = elements.container.querySelector("[aria-invalid='true'], .field.has-error input, .field.has-error select, .field.has-error textarea");
  firstError?.focus();
  showToast("Revise los campos señalados antes de guardar");
  return false;
}

function goNext() {
  if (!validateCurrentStep()) return;
  const current = getSteps()[state.currentIndex];
  if (current.key === "evaluacion") {
    saveRecord();
    return;
  }
  state.currentIndex = Math.min(state.currentIndex + 1, getSteps().length - 1);
  persistDraft({ quiet: true });
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBack() {
  state.errors = {};
  state.currentIndex = Math.max(0, state.currentIndex - 1);
  persistDraft({ quiet: true });
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function activeValuesForRecord() {
  const values = {};
  for (const step of getSteps()) {
    for (const question of step.section.questions) {
      if (!(question.id in state.values)) continue;
      const raw = state.values[question.id];
      values[question.id] = question.type === "number" ? Number(raw) : structuredClone(raw);
      if (question.other && `${question.id}__other` in state.values) {
        values[`${question.id}__other`] = state.values[`${question.id}__other`];
      }
    }
  }
  return values;
}

function saveRecord() {
  if (!validateAllSteps()) return;
  const records = loadRecords();
  const stamp = new Date();
  const compactTimestamp = stamp.toISOString().replace(/\D/g, "").slice(0, 14);
  const suffix = crypto.randomUUID().slice(0, 4).toUpperCase();
  const record = {
    id: `LC-${stamp.getFullYear()}-${compactTimestamp.slice(4)}-${suffix}`,
    createdAt: stamp.toISOString(),
    formVersion: "2.0",
    reportingPeriod: { year: stamp.getFullYear(), semester: 1 },
    values: activeValuesForRecord(),
  };
  records.push(record);
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {
    showToast("No fue posible guardar la declaración en este dispositivo");
    return;
  }
  localStorage.removeItem(DRAFT_KEY);
  state.completed = true;
  state.savedRecord = record;
  state.updatedAt = null;
  state.view = "form";
  render();
  showToast("Declaración guardada correctamente");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function loadRecords() {
  try {
    const records = JSON.parse(localStorage.getItem(RECORDS_KEY));
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

function downloadJSON(value, filename) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadRecord(record = state.savedRecord) {
  if (!record) return;
  downloadJSON(record, `${record.id}.json`);
}

function downloadAllRecords() {
  const records = loadRecords();
  if (!records.length) return;
  downloadJSON(
    { exportedAt: new Date().toISOString(), formVersion: "2.0", records },
    `levantamiento-convenios-${new Date().toISOString().slice(0, 10)}.json`,
  );
}

function startNewRecord() {
  Object.assign(state, { ...initialState, values: {}, errors: {}, savedRecord: null, view: "form" });
  localStorage.removeItem(DRAFT_KEY);
  render();
}

function showRecords() {
  state.view = "records";
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function returnToForm() {
  state.view = "form";
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetDraft() {
  if (!Object.keys(state.values).length) return;
  const accepted = window.confirm("¿Desea eliminar todos los datos guardados en este borrador?");
  if (!accepted) return;
  startNewRecord();
  showToast("Borrador eliminado");
}

elements.container.addEventListener("input", (event) => {
  if (event.target.matches("input, select, textarea")) updateValueFromElement(event.target);
});

elements.container.addEventListener("change", (event) => {
  if (event.target.matches("select")) updateValueFromElement(event.target);
});

elements.container.addEventListener("click", (event) => {
  const actionElement = event.target.closest("[data-action]");
  const action = actionElement?.dataset.action;
  if (action === "next") goNext();
  if (action === "back") goBack();
  if (action === "download") downloadRecord();
  if (action === "download-record") {
    const record = loadRecords().find((item) => item.id === actionElement.dataset.recordId);
    downloadRecord(record);
  }
  if (action === "download-all") downloadAllRecords();
  if (action === "records") showRecords();
  if (action === "return-form") returnToForm();
  if (action === "new") startNewRecord();
});

elements.navigation.addEventListener("click", (event) => {
  const button = event.target.closest("[data-step-index]");
  if (!button || button.disabled) return;
  state.errors = {};
  state.currentIndex = Number(button.dataset.stepIndex);
  persistDraft({ quiet: true });
  render();
});

elements.resetButton.addEventListener("click", resetDraft);
elements.recordsButton.addEventListener("click", showRecords);

function knownFieldIds() {
  const ids = new Set(["delegation", "institution", "institution_detail"]);
  Object.values(FORM_SECTIONS).forEach((section) => section.questions.forEach((question) => ids.add(question.id)));
  return ids;
}

function knownOtherFieldIds() {
  const ids = new Set();
  Object.values(FORM_SECTIONS).forEach((section) =>
    section.questions.forEach((question) => {
      if (question.other) ids.add(`${question.id}__other`);
    }),
  );
  return ids;
}

function registerWebMCPTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const known = knownFieldIds();
  const knownOther = knownOtherFieldIds();
  try {
    void Promise.resolve(
      context.registerTool({
        name: "get_convention_form_progress",
        title: "Consultar avance del formulario",
        description: "Devuelve la etapa visible y el avance del borrador local sin modificar datos.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute() {
          const steps = getSteps();
          const step = steps[state.currentIndex];
          return { step: step.key, stepTitle: step.section.title, current: state.currentIndex + 1, total: steps.length, completed: state.completed };
        },
      }),
    ).catch(() => {});

    void Promise.resolve(
      context.registerTool({
        name: "stage_convention_form_fields",
        title: "Completar campos del borrador",
        description: "Actualiza campos conocidos del borrador local y refleja los cambios en el formulario visible.",
        inputSchema: {
          type: "object",
          properties: {
            fields: {
              type: "object",
              additionalProperties: {
                anyOf: [
                  { type: "string" },
                  { type: "number" },
                  { type: "boolean" },
                  { type: "array", items: { type: "string" } },
                ],
              },
            },
          },
          required: ["fields"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          if (!input || typeof input.fields !== "object" || Array.isArray(input.fields)) throw new Error("Se requiere un objeto fields.");
          const entries = Object.entries(input.fields);
          for (const [field, value] of entries) {
            if (!known.has(field) && !knownOther.has(field)) throw new Error(`Campo desconocido: ${field}`);
            if (!["string", "number", "boolean"].includes(typeof value) && !Array.isArray(value)) throw new Error(`Valor no admitido para ${field}`);
          }
          Object.assign(state.values, Object.fromEntries(entries));
          persistDraft({ quiet: true });
          render();
          return { updated: entries.map(([field]) => field), step: getSteps()[state.currentIndex].key };
        },
      }),
    ).catch(() => {});
  } catch {
    // La interfaz visible continúa funcionando en navegadores sin WebMCP.
  }
}

render();
registerWebMCPTools();
