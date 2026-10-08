// Conexión con Supabase. Hay DOS ambientes y el sitio elige solo según la dirección web:
//   - Producción (datos reales): solo en las direcciones de la lista PROD_HOSTS.
//   - Pruebas (datos de mentira): cualquier otra dirección (vistas previas de Vercel, localhost, etc.).
// Si los datos de un ambiente están vacíos, la página funciona en MODO DEMOSTRACIÓN
// (sin servidor; lo que se ingresa queda guardado solo en ese navegador).
// Las claves "anon" son PÚBLICAS por diseño: la seguridad real está en las reglas de la base de datos.
// Nunca pongas aquí la clave "service_role".
(function () {
  var PROD_HOSTS = ["convenios-sigepro.vercel.app"];
  // Mismos proyectos de Supabase que Paso Fronterizo (las tablas de este módulo empiezan con "conv_")
  var PROD = {
    url: "https://iqawizophgmftcqomzns.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYXdpem9waGdtZnRjcW9tem5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNzExMjQsImV4cCI6MjEwNjk0NzEyNH0.kuODOA7iYpFQoMpQ5p5M-4g_ebOvzsP2mcfzEjw8p6w"
  };
  var DEV = {
    url: "https://mqiqqbguwrynopulcvsp.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaXFxYmd1d3J5bm9wdWxjdnNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzODIxNTEsImV4cCI6MjEwNjk1ODE1MX0.XnM1TD6XwCeECprHdiAclCnqVTUs36UJ5qkB5PvRHxs"
  };
  var esProd = PROD_HOSTS.indexOf(window.location.hostname) >= 0;
  var cfg = esProd ? PROD : DEV;
  var demo = !(cfg.url && cfg.key);
  window.CONV_CONFIG = { url: cfg.url, key: cfg.key, ambiente: demo ? "demo" : (esProd ? "produccion" : "pruebas") };
  if (!esProd || demo) {
    document.addEventListener("DOMContentLoaded", function () {
      var b = document.createElement("div");
      b.setAttribute("role", "note");
      b.className = "banda-ambiente";
      b.textContent = demo ? "MODO DEMOSTRACIÓN · los datos se guardan solo en este navegador" : "AMBIENTE DE PRUEBAS · los datos no son reales";
      document.body.appendChild(b);
      document.body.classList.add("con-banda");
    });
  }
})();
