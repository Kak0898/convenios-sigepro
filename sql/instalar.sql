-- =====================================================================
--  Levantamiento de Convenios (módulo SIGEPRO) — instalación en Supabase
--  Pegar TODO este texto en Supabase > SQL Editor > New query y pulsar "Run".
--  Se puede ejecutar más de una vez sin problema (no borra datos).
--  Todas las tablas y funciones empiezan con "conv_", así que puede convivir
--  en el mismo proyecto de Supabase que otra plataforma (por ejemplo, Paso Fronterizo).
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- Tablas ----------
create table if not exists public.conv_regiones (
  rid text primary key,
  orden int not null,
  nombre text not null,
  titulo text not null
);
insert into public.conv_regiones (rid, orden, nombre, titulo) values
  ('arica-parinacota',1,'Arica y Parinacota','Región de Arica y Parinacota'),
  ('tarapaca',2,'Tarapacá','Región de Tarapacá'),
  ('antofagasta',3,'Antofagasta','Región de Antofagasta'),
  ('atacama',4,'Atacama','Región de Atacama'),
  ('coquimbo',5,'Coquimbo','Región de Coquimbo'),
  ('valparaiso',6,'Valparaíso','Región de Valparaíso'),
  ('metropolitana',7,'Metropolitana de Santiago','Región Metropolitana de Santiago'),
  ('ohiggins',8,'Libertador General Bernardo O''Higgins','Región del Libertador General Bernardo O''Higgins'),
  ('maule',9,'Maule','Región del Maule'),
  ('nuble',10,'Ñuble','Región de Ñuble'),
  ('biobio',11,'Biobío','Región del Biobío'),
  ('araucania',12,'La Araucanía','Región de La Araucanía'),
  ('los-rios',13,'Los Ríos','Región de Los Ríos'),
  ('los-lagos',14,'Los Lagos','Región de Los Lagos'),
  ('aysen',15,'Aysén del General Carlos Ibáñez del Campo','Región de Aysén del General Carlos Ibáñez del Campo'),
  ('magallanes',16,'Magallanes y de la Antártica Chilena','Región de Magallanes y de la Antártica Chilena')
on conflict (rid) do update set orden = excluded.orden, nombre = excluded.nombre, titulo = excluded.titulo;

create table if not exists public.conv_delegaciones (
  did text primary key,
  orden int not null,
  region text not null,
  nombre text not null,
  tipo text not null check (tipo in ('regional','provincial'))
);
alter table public.conv_delegaciones add column if not exists rid text references public.conv_regiones(rid);

-- Cada usuario regional queda asignado a UNA región y trabaja con todas sus delegaciones
create table if not exists public.conv_perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  usuario text not null unique,
  nombre text not null,
  rol text not null check (rol in ('admin','consulta','regional')),
  region text references public.conv_regiones(rid),
  correo text not null default '',
  telefono text not null default '',
  cargo text not null default '',
  activo boolean not null default true,
  cambiar boolean not null default true,
  creado text not null default to_char(now() at time zone 'America/Santiago','YYYY-MM-DD HH24:MI:SS')
);

create table if not exists public.conv_config (clave text primary key, valor text not null);
insert into public.conv_config values
  ('periodo','2026-1'), ('periodo_nombre','1er Semestre 2026'), ('recepcion','abierta'), ('fecha_limite','')
on conflict do nothing;

create table if not exists public.conv_levantamientos (
  id bigint generated always as identity primary key,
  periodo text not null,
  delegacion text not null references public.conv_delegaciones(did),
  estado text not null check (estado in ('borrador','enviado','devuelto')),
  nombre_convenio text not null default '',
  tipo_convenio text not null default '',
  institucion text not null default '',
  estado_convenio text not null default '',
  datos jsonb not null default '{}'::jsonb,
  nota_revision text not null default '',
  creado text not null,
  creado_por text not null,
  actualizado text not null,
  actualizado_por text not null,
  enviado text not null default '',
  enviado_por text not null default ''
);
create index if not exists conv_lev_periodo_idx on public.conv_levantamientos (periodo, delegacion);

insert into public.conv_delegaciones (did, orden, region, nombre, tipo, rid)
select x.did, x.orden, x.region, x.nombre, x.tipo, (select g.rid from public.conv_regiones g where g.nombre = x.region) from (values
  ('dpr-arica',1,'Arica y Parinacota','Delegación Presidencial Regional de Arica y Parinacota','regional'),
  ('dpp-parinacota',2,'Arica y Parinacota','Delegación Presidencial Provincial de Parinacota','provincial'),
  ('dpr-tarapaca',3,'Tarapacá','Delegación Presidencial Regional de Tarapacá','regional'),
  ('dpp-tamarugal',4,'Tarapacá','Delegación Presidencial Provincial del Tamarugal','provincial'),
  ('dpr-antofagasta',5,'Antofagasta','Delegación Presidencial Regional de Antofagasta','regional'),
  ('dpp-el-loa',6,'Antofagasta','Delegación Presidencial Provincial de El Loa','provincial'),
  ('dpp-tocopilla',7,'Antofagasta','Delegación Presidencial Provincial de Tocopilla','provincial'),
  ('dpr-atacama',8,'Atacama','Delegación Presidencial Regional de Atacama','regional'),
  ('dpp-chanaral',9,'Atacama','Delegación Presidencial Provincial de Chañaral','provincial'),
  ('dpp-huasco',10,'Atacama','Delegación Presidencial Provincial del Huasco','provincial'),
  ('dpr-coquimbo',11,'Coquimbo','Delegación Presidencial Regional de Coquimbo','regional'),
  ('dpp-choapa',12,'Coquimbo','Delegación Presidencial Provincial del Choapa','provincial'),
  ('dpp-limari',13,'Coquimbo','Delegación Presidencial Provincial de Limarí','provincial'),
  ('dpr-valparaiso',14,'Valparaíso','Delegación Presidencial Regional de Valparaíso','regional'),
  ('dpp-los-andes',15,'Valparaíso','Delegación Presidencial Provincial de Los Andes','provincial'),
  ('dpp-petorca',16,'Valparaíso','Delegación Presidencial Provincial de Petorca','provincial'),
  ('dpp-quillota',17,'Valparaíso','Delegación Presidencial Provincial de Quillota','provincial'),
  ('dpp-san-antonio',18,'Valparaíso','Delegación Presidencial Provincial de San Antonio','provincial'),
  ('dpp-san-felipe',19,'Valparaíso','Delegación Presidencial Provincial de San Felipe de Aconcagua','provincial'),
  ('dpp-marga-marga',20,'Valparaíso','Delegación Presidencial Provincial de Marga Marga','provincial'),
  ('dpp-isla-de-pascua',21,'Valparaíso','Delegación Presidencial Provincial de Isla de Pascua','provincial'),
  ('dpr-metropolitana',22,'Metropolitana de Santiago','Delegación Presidencial Regional Metropolitana de Santiago','regional'),
  ('dpp-chacabuco',23,'Metropolitana de Santiago','Delegación Presidencial Provincial de Chacabuco','provincial'),
  ('dpp-cordillera',24,'Metropolitana de Santiago','Delegación Presidencial Provincial de Cordillera','provincial'),
  ('dpp-maipo',25,'Metropolitana de Santiago','Delegación Presidencial Provincial de Maipo','provincial'),
  ('dpp-melipilla',26,'Metropolitana de Santiago','Delegación Presidencial Provincial de Melipilla','provincial'),
  ('dpp-talagante',27,'Metropolitana de Santiago','Delegación Presidencial Provincial de Talagante','provincial'),
  ('dpr-ohiggins',28,'Libertador General Bernardo O''Higgins','Delegación Presidencial Regional del Libertador General Bernardo O''Higgins','regional'),
  ('dpp-cardenal-caro',29,'Libertador General Bernardo O''Higgins','Delegación Presidencial Provincial de Cardenal Caro','provincial'),
  ('dpp-colchagua',30,'Libertador General Bernardo O''Higgins','Delegación Presidencial Provincial de Colchagua','provincial'),
  ('dpr-maule',31,'Maule','Delegación Presidencial Regional del Maule','regional'),
  ('dpp-curico',32,'Maule','Delegación Presidencial Provincial de Curicó','provincial'),
  ('dpp-linares',33,'Maule','Delegación Presidencial Provincial de Linares','provincial'),
  ('dpp-cauquenes',34,'Maule','Delegación Presidencial Provincial de Cauquenes','provincial'),
  ('dpr-nuble',35,'Ñuble','Delegación Presidencial Regional de Ñuble','regional'),
  ('dpp-itata',36,'Ñuble','Delegación Presidencial Provincial de Itata','provincial'),
  ('dpp-punilla',37,'Ñuble','Delegación Presidencial Provincial de Punilla','provincial'),
  ('dpr-biobio',38,'Biobío','Delegación Presidencial Regional del Biobío','regional'),
  ('dpp-arauco',39,'Biobío','Delegación Presidencial Provincial de Arauco','provincial'),
  ('dpp-biobio',40,'Biobío','Delegación Presidencial Provincial del Biobío','provincial'),
  ('dpr-araucania',41,'La Araucanía','Delegación Presidencial Regional de La Araucanía','regional'),
  ('dpp-malleco',42,'La Araucanía','Delegación Presidencial Provincial de Malleco','provincial'),
  ('dpr-los-rios',43,'Los Ríos','Delegación Presidencial Regional de Los Ríos','regional'),
  ('dpp-ranco',44,'Los Ríos','Delegación Presidencial Provincial del Ranco','provincial'),
  ('dpr-los-lagos',45,'Los Lagos','Delegación Presidencial Regional de Los Lagos','regional'),
  ('dpp-chiloe',46,'Los Lagos','Delegación Presidencial Provincial de Chiloé','provincial'),
  ('dpp-osorno',47,'Los Lagos','Delegación Presidencial Provincial de Osorno','provincial'),
  ('dpp-palena',48,'Los Lagos','Delegación Presidencial Provincial de Palena','provincial'),
  ('dpr-aysen',49,'Aysén del General Carlos Ibáñez del Campo','Delegación Presidencial Regional de Aysén del General Carlos Ibáñez del Campo','regional'),
  ('dpp-capitan-prat',50,'Aysén del General Carlos Ibáñez del Campo','Delegación Presidencial Provincial de Capitán Prat','provincial'),
  ('dpp-general-carrera',51,'Aysén del General Carlos Ibáñez del Campo','Delegación Presidencial Provincial de General Carrera','provincial'),
  ('dpp-aysen',52,'Aysén del General Carlos Ibáñez del Campo','Delegación Presidencial Provincial de Aysén','provincial'),
  ('dpr-magallanes',53,'Magallanes y de la Antártica Chilena','Delegación Presidencial Regional de Magallanes y de la Antártica Chilena','regional'),
  ('dpp-antartica',54,'Magallanes y de la Antártica Chilena','Delegación Presidencial Provincial de Antártica Chilena','provincial'),
  ('dpp-tierra-del-fuego',55,'Magallanes y de la Antártica Chilena','Delegación Presidencial Provincial de Tierra del Fuego','provincial'),
  ('dpp-ultima-esperanza',56,'Magallanes y de la Antártica Chilena','Delegación Presidencial Provincial de Última Esperanza','provincial')
) as x(did, orden, region, nombre, tipo)
on conflict (did) do update set orden = excluded.orden, region = excluded.region, nombre = excluded.nombre, tipo = excluded.tipo, rid = excluded.rid;
update public.conv_delegaciones d set rid = r.rid from public.conv_regiones r where r.nombre = d.region and d.rid is distinct from r.rid;
alter table public.conv_delegaciones alter column rid set not null;

-- ---------- Actualización desde la primera versión (cuentas por delegación → cuentas por región) ----------
-- Si esta base ya tenía la versión anterior instalada, se adapta sola. En una instalación nueva no hace nada.
drop policy if exists p_conv_lev_leer on public.conv_levantamientos;
drop function if exists public.conv_mi_delegacion();
drop function if exists public.conv_crear_cuenta(text,text,text,text,text,boolean);
drop function if exists public.conv_crear_interno(text,text,text,text,text,boolean);
drop function if exists public.conv_editar(uuid,text,text,text);
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'conv_perfiles' and column_name = 'delegacion') then
    alter table public.conv_perfiles drop constraint if exists conv_perfiles_rol_check;
    alter table public.conv_perfiles add column if not exists region text references public.conv_regiones(rid);
    alter table public.conv_perfiles disable trigger user;
    update public.conv_perfiles p set region = d.rid from public.conv_delegaciones d where p.delegacion = d.did;
    update public.conv_perfiles set rol = 'regional' where rol = 'delegacion';
    alter table public.conv_perfiles enable trigger user;
    alter table public.conv_perfiles drop column delegacion;
    alter table public.conv_perfiles add constraint conv_perfiles_rol_check check (rol in ('admin','consulta','regional'));
  end if;
end $$;

-- ---------- Utilidades ----------
create or replace function public.conv_ahora() returns text language sql stable as
$$ select to_char(now() at time zone 'America/Santiago','YYYY-MM-DD HH24:MI:SS') $$;

create or replace function public.conv_hoy() returns date language sql stable as
$$ select (now() at time zone 'America/Santiago')::date $$;

create or replace function public.conv_cfg(p_clave text) returns text language sql stable security definer set search_path = public as
$$ select coalesce((select valor from public.conv_config where clave = p_clave), '') $$;

-- Perfil activo de quien llama (solo si ya cambió su contraseña temporal)
create or replace function public.conv_rol() returns text
language sql stable security definer set search_path = public, auth as
$$ select rol from public.conv_perfiles where id = auth.uid() and activo and not cambiar $$;

create or replace function public.conv_es_admin() returns boolean
language sql stable security definer set search_path = public, auth as
$$ select exists (select 1 from public.conv_perfiles where id = auth.uid() and rol = 'admin' and activo) $$;

create or replace function public.conv_ve_todo() returns boolean
language sql stable security definer set search_path = public, auth as
$$ select coalesce(public.conv_rol() in ('admin','consulta'), false) $$;

create or replace function public.conv_mi_region() returns text
language sql stable security definer set search_path = public, auth as
$$ select region from public.conv_perfiles where id = auth.uid() and activo and not cambiar and rol = 'regional' $$;

-- Región a la que pertenece una delegación
create or replace function public.conv_region_de(p_did text) returns text
language sql stable security definer set search_path = public as
$$ select rid from public.conv_delegaciones where did = p_did $$;

create or replace function public.conv_correo_ok(p text) returns boolean language sql immutable as
$$ select coalesce(p,'') = '' or p ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' $$;

create or replace function public.conv_exigir_admin() returns void
language plpgsql stable security definer set search_path = public, auth as
$$ begin
  if auth.uid() is null then raise exception 'Tu sesión expiró. Vuelve a ingresar.'; end if;
  if not public.conv_es_admin() then raise exception 'No tienes permiso para esta acción.'; end if;
end $$;

create or replace function public.conv_email(p_usuario text) returns text language sql immutable as
$$ select lower(p_usuario) || '@convenios-sigepro.local' $$;

create or replace function public.conv_clave_aleatoria() returns text language plpgsql volatile as
$$ declare a text := 'abcdefghjkmnpqrstuvwxyz23456789'; o text := ''; i int;
begin
  for i in 1..10 loop
    o := o || substr(a, 1 + floor(random()*length(a))::int, 1);
    if i = 5 then o := o || '-'; end if;
  end loop; return o;
end $$;

create or replace function public.conv_validar(p_usuario text, p_clave text) returns void language plpgsql immutable as
$$ begin
  if p_usuario !~ '^[a-z0-9._-]{3,40}$' then
    raise exception 'El usuario debe tener entre 3 y 40 caracteres: letras sin tilde, números, punto, guion o guion bajo.'; end if;
  if p_clave is not null then
    if length(p_clave) < 8 then raise exception 'La contraseña debe tener al menos 8 caracteres.'; end if;
    if lower(p_clave) = lower(p_usuario) then raise exception 'La contraseña no puede ser igual al usuario.'; end if;
  end if;
end $$;

-- Crea la cuenta de acceso + el perfil (uso interno; nadie puede llamarla desde fuera)
create or replace function public.conv_crear_interno(p_usuario text, p_nombre text, p_rol text,
  p_region text, p_clave text, p_cambiar boolean) returns uuid
language plpgsql security definer set search_path = public, auth, extensions as
$$ declare v_id uuid := gen_random_uuid(); v_mail text := public.conv_email(p_usuario);
begin
  if exists (select 1 from public.conv_perfiles where usuario = p_usuario) or exists (select 1 from auth.users where email = v_mail) then
    raise exception 'Ese nombre de usuario ya existe.'; end if;
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new)
  values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_mail,
    extensions.crypt(p_clave, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
  values (gen_random_uuid(), v_id, v_id::text,
    jsonb_build_object('sub', v_id::text, 'email', v_mail, 'email_verified', true, 'phone_verified', false),
    'email', now(), now(), now());
  insert into public.conv_perfiles (id, usuario, nombre, rol, region, cambiar)
  values (v_id, p_usuario, left(p_nombre, 80), p_rol, p_region, p_cambiar);
  return v_id;
end $$;
revoke all on function public.conv_crear_interno(text,text,text,text,text,boolean) from public, anon, authenticated;

-- ---------- Acciones que llama la aplicación ----------
create or replace function public.conv_estado() returns jsonb
language sql stable security definer set search_path = public as
$$ select jsonb_build_object(
     'configurado', exists (select 1 from public.conv_perfiles where rol = 'admin'),
     'periodo', public.conv_cfg('periodo'),
     'periodo_nombre', public.conv_cfg('periodo_nombre'),
     'recepcion', public.conv_cfg('recepcion'),
     'fecha_limite', public.conv_cfg('fecha_limite'),
     'hoy', public.conv_hoy()::text) $$;

create or replace function public.conv_configurar(p_usuario text, p_nombre text, p_clave text) returns void
language plpgsql security definer set search_path = public, auth, extensions as
$$ begin
  if exists (select 1 from public.conv_perfiles where rol = 'admin') then
    raise exception 'La plataforma ya está configurada.'; end if;
  p_usuario := lower(trim(p_usuario)); p_nombre := trim(coalesce(p_nombre,''));
  if p_nombre = '' then raise exception 'Escribe tu nombre.'; end if;
  perform public.conv_validar(p_usuario, p_clave);
  perform public.conv_crear_interno(p_usuario, p_nombre, 'admin', null, p_clave, false);
end $$;

-- Crear una cuenta. p: {rol, region, usuario, nombre, clave, correo, telefono, cargo, varios}
create or replace function public.conv_crear_cuenta(p jsonb) returns jsonb
language plpgsql security definer set search_path = public, auth, extensions as
$$ declare v_r public.conv_regiones; v_nom text := ''; v_clave text; v_id uuid;
  v_rol text := coalesce(nullif(p->>'rol',''), 'regional'); v_usuario text := lower(trim(coalesce(p->>'usuario','')));
  v_nombre text := trim(coalesce(p->>'nombre','')); v_region text := nullif(trim(coalesce(p->>'region','')), '');
  v_correo text := lower(trim(coalesce(p->>'correo',''))); v_varios boolean := coalesce((p->>'varios')::boolean, true);
begin
  perform public.conv_exigir_admin();
  v_clave := trim(coalesce(p->>'clave',''));
  if v_rol not in ('admin','consulta','regional') then raise exception 'Tipo de cuenta no válido.'; end if;
  if v_rol in ('admin','consulta') then
    if v_nombre = '' then raise exception 'Escribe el nombre de la persona.'; end if;
    v_region := null; v_nom := case when v_rol = 'admin' then 'Administrador' else 'Consulta (solo lectura)' end;
  else
    select * into v_r from public.conv_regiones where rid = v_region;
    if not found then raise exception 'Elige la región.'; end if;
    if not v_varios and exists (select 1 from public.conv_perfiles where rol = 'regional' and region = v_region) then
      raise exception 'Esa región ya tiene una cuenta.'; end if;
    if v_usuario = '' then v_usuario := v_region; end if;
    v_nom := v_r.titulo;
    if v_nombre = '' then v_nombre := 'Usuario regional ' || v_r.nombre; end if;
  end if;
  if not public.conv_correo_ok(v_correo) then raise exception 'El correo no es válido.'; end if;
  if v_clave = '' then v_clave := public.conv_clave_aleatoria(); perform public.conv_validar(v_usuario, null);
  else perform public.conv_validar(v_usuario, v_clave); end if;
  v_id := public.conv_crear_interno(v_usuario, v_nombre, v_rol, v_region, v_clave, true);
  update public.conv_perfiles set correo = left(v_correo,120), telefono = left(trim(coalesce(p->>'telefono','')),40),
    cargo = left(trim(coalesce(p->>'cargo','')),120) where id = v_id;
  return jsonb_build_object('region', coalesce(v_region,''), 'nombre_region', v_nom,
                            'nombre', left(v_nombre,80), 'usuario', v_usuario, 'clave', v_clave, 'rol', v_rol);
end $$;

-- Una cuenta regional para cada región que aún no tenga
create or replace function public.conv_crear_todas() returns jsonb
language plpgsql security definer set search_path = public, auth, extensions as
$$ declare r record; v_out jsonb := '[]'::jsonb;
begin
  perform public.conv_exigir_admin();
  for r in select g.rid from public.conv_regiones g
           where not exists (select 1 from public.conv_perfiles p where p.rol = 'regional' and p.region = g.rid)
             and not exists (select 1 from public.conv_perfiles p where p.usuario = g.rid)
           order by g.orden loop
    v_out := v_out || jsonb_build_array(public.conv_crear_cuenta(jsonb_build_object('rol','regional','region',r.rid,'varios',false)));
  end loop;
  return v_out;
end $$;

create or replace function public.conv_restablecer(p_id uuid, p_clave text) returns jsonb
language plpgsql security definer set search_path = public, auth, extensions as
$$ declare v public.conv_perfiles; v_clave text := trim(coalesce(p_clave,''));
begin
  perform public.conv_exigir_admin();
  select * into v from public.conv_perfiles where id = p_id;
  if not found then raise exception 'Cuenta no encontrada.'; end if;
  if v.id = auth.uid() then raise exception 'Tu propia contraseña se cambia desde “Mi cuenta”.'; end if;
  if v_clave = '' then v_clave := public.conv_clave_aleatoria(); else perform public.conv_validar(v.usuario, v_clave); end if;
  update auth.users set encrypted_password = extensions.crypt(v_clave, extensions.gen_salt('bf')), updated_at = now() where id = p_id;
  update public.conv_perfiles set cambiar = true where id = p_id;
  return jsonb_build_object('usuario', v.usuario, 'clave', v_clave);
end $$;

-- Editar una cuenta. p: {rol, region, usuario, nombre, correo, telefono, cargo}
create or replace function public.conv_editar(p_id uuid, p jsonb) returns void
language plpgsql security definer set search_path = public, auth, extensions as
$$ declare v public.conv_perfiles; v_mail text;
  v_usuario text := lower(trim(coalesce(p->>'usuario',''))); v_nombre text := trim(coalesce(p->>'nombre',''));
  v_rol text; v_region text := nullif(trim(coalesce(p->>'region','')), ''); v_correo text := lower(trim(coalesce(p->>'correo','')));
begin
  perform public.conv_exigir_admin();
  select * into v from public.conv_perfiles where id = p_id;
  if not found then raise exception 'Cuenta no encontrada.'; end if;
  v_rol := coalesce(nullif(p->>'rol',''), v.rol);
  if v_rol not in ('admin','consulta','regional') then raise exception 'Tipo de cuenta no válido.'; end if;
  if p_id = auth.uid() and v_rol <> v.rol then raise exception 'No puedes cambiar el tipo de tu propia cuenta.'; end if;
  if v_nombre = '' then raise exception 'Escribe el nombre.'; end if;
  perform public.conv_validar(v_usuario, null);
  if v_rol = 'regional' then
    if not exists (select 1 from public.conv_regiones where rid = v_region) then raise exception 'Elige la región.'; end if;
  else v_region := null; end if;
  if not public.conv_correo_ok(v_correo) then raise exception 'El correo no es válido.'; end if;
  if exists (select 1 from public.conv_perfiles where usuario = v_usuario and id <> p_id) then
    raise exception 'Ese nombre de usuario ya existe.'; end if;
  v_mail := public.conv_email(v_usuario);
  update public.conv_perfiles set usuario = v_usuario, nombre = left(v_nombre,80), rol = v_rol, region = v_region,
    correo = left(v_correo,120), telefono = left(trim(coalesce(p->>'telefono','')),40), cargo = left(trim(coalesce(p->>'cargo','')),120)
  where id = p_id;
  update auth.users set email = v_mail, updated_at = now() where id = p_id;
  update auth.identities set identity_data = identity_data || jsonb_build_object('email', v_mail), updated_at = now()
    where user_id = p_id and provider = 'email';
end $$;

create or replace function public.conv_eliminar(p_id uuid) returns void
language plpgsql security definer set search_path = public, auth as
$$ begin
  perform public.conv_exigir_admin();
  if not exists (select 1 from public.conv_perfiles where id = p_id) then raise exception 'Cuenta no encontrada.'; end if;
  if p_id = auth.uid() then raise exception 'No puedes eliminar tu propia cuenta.'; end if;
  delete from auth.users where id = p_id;
end $$;

create or replace function public.conv_activar(p_id uuid, p_activo boolean) returns void
language plpgsql security definer set search_path = public, auth as
$$ begin
  perform public.conv_exigir_admin();
  if not exists (select 1 from public.conv_perfiles where id = p_id) then raise exception 'Cuenta no encontrada.'; end if;
  if p_id = auth.uid() then raise exception 'No puedes desactivar tu propia cuenta.'; end if;
  update public.conv_perfiles set activo = p_activo where id = p_id;
  update auth.users set banned_until = case when p_activo then null else 'infinity'::timestamptz end where id = p_id;
end $$;

-- Se llama después de que la persona cambió su contraseña
create or replace function public.conv_clave_cambiada(p_nombre text) returns void
language plpgsql security definer set search_path = public, auth as
$$ begin
  if auth.uid() is null then raise exception 'Tu sesión expiró. Vuelve a ingresar.'; end if;
  update public.conv_perfiles set cambiar = false,
    nombre = case when length(trim(coalesce(p_nombre,''))) between 1 and 80 then trim(p_nombre) else nombre end
  where id = auth.uid();
end $$;

-- Datos de contacto (se usan para rellenar "Datos de quien responde")
create or replace function public.conv_guardar_contacto(p_nombre text, p_correo text, p_telefono text, p_cargo text) returns void
language plpgsql security definer set search_path = public, auth as
$$ begin
  if auth.uid() is null then raise exception 'Tu sesión expiró. Vuelve a ingresar.'; end if;
  p_nombre := trim(coalesce(p_nombre,'')); p_correo := lower(trim(coalesce(p_correo,'')));
  if p_nombre = '' or length(p_nombre) > 80 then raise exception 'Escribe tu nombre (máximo 80 caracteres).'; end if;
  if not public.conv_correo_ok(p_correo) then raise exception 'El correo no es válido.'; end if;
  update public.conv_perfiles set nombre = p_nombre, correo = left(p_correo,120),
    telefono = left(trim(coalesce(p_telefono,'')),40), cargo = left(trim(coalesce(p_cargo,'')),120)
  where id = auth.uid();
end $$;

create or replace function public.conv_guardar_config(p jsonb) returns void
language plpgsql security definer set search_path = public, auth as
$$ declare v_per text := trim(coalesce(p->>'periodo','')); v_nom text := trim(coalesce(p->>'periodo_nombre',''));
  v_rec text := coalesce(p->>'recepcion',''); v_lim text := trim(coalesce(p->>'fecha_limite',''));
begin
  perform public.conv_exigir_admin();
  if v_per !~ '^[0-9]{4}-[A-Za-z0-9]{1,10}$' then raise exception 'El código del periodo debe ser como 2026-1 (año, guion y número).'; end if;
  if v_nom = '' or length(v_nom) > 60 then raise exception 'Escribe el nombre del periodo (máximo 60 caracteres).'; end if;
  if v_rec not in ('abierta','cerrada') then raise exception 'Indica si la recepción está abierta o cerrada.'; end if;
  if v_lim <> '' and v_lim !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'La fecha límite no es válida.'; end if;
  insert into public.conv_config values ('periodo', v_per), ('periodo_nombre', v_nom), ('recepcion', v_rec), ('fecha_limite', v_lim)
    on conflict (clave) do update set valor = excluded.valor;
end $$;

-- ¿Una respuesta está vacía? (texto en blanco, lista sin elementos o ausente)
create or replace function public.conv_vacio(v jsonb) returns boolean language sql immutable as
$$ select v is null or v = 'null'::jsonb
     or (jsonb_typeof(v) = 'string' and trim(v #>> '{}') = '')
     or (jsonb_typeof(v) = 'array' and jsonb_array_length(v) = 0) $$;

-- Validación de un levantamiento antes de enviarlo (las mismas reglas obligatorias del formulario)
create or replace function public.conv_validar_envio(d jsonb, p_tipo_del text) returns void language plpgsql stable as
$$ declare k text; v_ini date; v_fin date;
  v_base text[] := array['resp_nombre','resp_correo','resp_telefono','resp_cargo','ministerio','nombre_convenio','id_doc_convenio',
    'id_doc_res_aprueba','inicio_vigencia','fin_vigencia','estado_convenio','unidad_responsable','funcionario_responsable','alcance',
    'resultados','dificultades','recomienda_continuidad','tipo_convenio','evaluacion_general','prioridad_seguimiento','recomendacion'];
  v_transf text[] := array['monto_total','monto_transferido','cuotas','contrata_personal','lugar_ejecucion','monto_ejecutado','monto_rendido',
    'monto_aprobado','monto_observado','estado_rendicion','meta_esperada','unidad_meta','estado_cumplimiento','cobertura_comprometida',
    'cobertura_efectiva','comunas_contempladas','comunas_cubiertas','beneficiarios','articulacion','brecha_territorial','riesgo_categoria','riesgo_detalle'];
  v_pers text[] := array['dotacion_maxima','dotacion_utilizada','renuncias','terminos_anticipados','equipo_trabajo'];
begin
  foreach k in array v_base loop
    if public.conv_vacio(d->k) then raise exception 'Falta completar un dato obligatorio (%).', k; end if;
  end loop;
  if d->>'tipo_convenio' not in ('Colaboración','Transferencia de Recursos') then raise exception 'Tipo de convenio no válido.'; end if;
  if public.conv_vacio(d->'servicio') and public.conv_vacio(d->'institucion_nombre')
     and d->>'ministerio' not in ('Ministerio de Relaciones Exteriores','Ministerio Secretaría General de la Presidencia','Ministerio de Bienes Nacionales','Gobierno Regional') then
    raise exception 'Falta indicar la subsecretaría, servicio o nombre de la institución.'; end if;
  if d->>'tipo_convenio' = 'Transferencia de Recursos' then
    foreach k in array v_transf loop
      if public.conv_vacio(d->k) then raise exception 'Falta completar un dato obligatorio (%).', k; end if;
    end loop;
    if d->>'contrata_personal' = 'Sí' then
      foreach k in array v_pers loop
        if public.conv_vacio(d->k) then raise exception 'Falta completar un dato obligatorio (%).', k; end if;
      end loop;
    end if;
    if (d->>'monto_total') !~ '^[0-9]+$' or (d->>'monto_total')::numeric <= 1 then raise exception 'El monto total del convenio debe ser un monto.'; end if;
  end if;
  if (d->>'id_doc_convenio') !~ '^[0-9]{1,12}$' or (d->>'id_doc_convenio')::bigint <= 10203044 then raise exception 'Señale un ID DOC válido para el convenio.'; end if;
  if (d->>'id_doc_res_aprueba') !~ '^[0-9]{1,12}$' or (d->>'id_doc_res_aprueba')::bigint <= 10203044 then raise exception 'Señale un ID DOC válido para la resolución que aprueba el convenio.'; end if;
  if coalesce(d->>'id_res_dpr','') <> '' and ((d->>'id_res_dpr') !~ '^[0-9]{1,12}$' or (d->>'id_res_dpr')::bigint <= 10000000) then
    raise exception 'Señale un ID DOC válido para la resolución de la DPR.'; end if;
  begin v_ini := (d->>'inicio_vigencia')::date; v_fin := (d->>'fin_vigencia')::date;
  exception when others then raise exception 'Las fechas de vigencia no son válidas.'; end;
  if v_fin < v_ini then raise exception 'El fin de vigencia no puede ser anterior al inicio.'; end if;
end $$;

-- Guardar (borrador) o enviar un levantamiento
-- El usuario regional puede registrar para cualquier delegación de SU región (la elige en el paso 1).
create or replace function public.conv_guardar(p_id bigint, p_datos jsonb, p_enviar boolean, p_delegacion text default null) returns jsonb
language plpgsql security definer set search_path = public, auth as
$$ declare
  v public.conv_perfiles; v_prev public.conv_levantamientos; v_del text; v_tipo_del text; v_rid text; v_estado text; v_ahora text := public.conv_ahora();
  v_per text := public.conv_cfg('periodo'); v_id bigint; d jsonb := coalesce(p_datos, '{}'::jsonb);
begin
  if auth.uid() is null then raise exception 'Tu sesión expiró. Vuelve a ingresar.'; end if;
  select * into v from public.conv_perfiles where id = auth.uid() and activo;
  if not found then raise exception 'Tu sesión expiró. Vuelve a ingresar.'; end if;
  if v.cambiar then raise exception 'Debes cambiar tu contraseña antes de continuar.'; end if;
  if v.rol = 'consulta' then raise exception 'No tienes permiso para esta acción.'; end if;
  if jsonb_typeof(d) <> 'object' or length(d::text) > 100000 then raise exception 'Los datos del formulario no son válidos.'; end if;

  v_del := coalesce(nullif(p_delegacion,''), nullif(d->>'delegacion',''));
  if p_id is not null then
    select * into v_prev from public.conv_levantamientos where id = p_id for update;
    if not found then raise exception 'El registro ya no existe.'; end if;
    v_del := coalesce(v_del, v_prev.delegacion);
    if v.rol = 'regional' then
      if public.conv_region_de(v_prev.delegacion) is distinct from v.region then raise exception 'No tienes permiso para esta acción.'; end if;
      if v_prev.estado = 'enviado' then raise exception 'Este convenio ya fue enviado. Si necesitas corregirlo, pide al administrador que lo devuelva.'; end if;
      if v_prev.periodo <> v_per then raise exception 'Este registro pertenece a un periodo cerrado.'; end if;
      if public.conv_cfg('recepcion') <> 'abierta' then raise exception 'La recepción de respuestas está cerrada.'; end if;
    end if;
  elsif v.rol = 'regional' and public.conv_cfg('recepcion') <> 'abierta' then
    raise exception 'La recepción de respuestas está cerrada.';
  end if;
  select tipo, rid into v_tipo_del, v_rid from public.conv_delegaciones where did = v_del;
  if not found then raise exception 'Elige la delegación.'; end if;
  if v.rol = 'regional' and v_rid is distinct from v.region then
    raise exception 'Solo puedes registrar convenios de las delegaciones de tu región.'; end if;
  d := d || jsonb_build_object('delegacion', v_del);
  if v_tipo_del <> 'provincial' then d := d - 'id_res_dpr'; end if;

  if p_enviar then perform public.conv_validar_envio(d, v_tipo_del); end if;
  v_estado := case when p_enviar then 'enviado' when p_id is null then 'borrador' else v_prev.estado end;

  if p_id is null then
    insert into public.conv_levantamientos (periodo, delegacion, estado, nombre_convenio, tipo_convenio, institucion, estado_convenio, datos,
      creado, creado_por, actualizado, actualizado_por, enviado, enviado_por)
    values (v_per, v_del, v_estado, left(coalesce(d->>'nombre_convenio',''),300), coalesce(d->>'tipo_convenio',''),
      left(coalesce(nullif(d->>'servicio',''), nullif(d->>'institucion_nombre',''), d->>'ministerio', ''),300), coalesce(d->>'estado_convenio',''), d,
      v_ahora, v.usuario, v_ahora, v.usuario, case when p_enviar then v_ahora else '' end, case when p_enviar then v.usuario else '' end)
    returning id into v_id;
  else
    update public.conv_levantamientos set delegacion = v_del, estado = v_estado, nombre_convenio = left(coalesce(d->>'nombre_convenio',''),300),
      tipo_convenio = coalesce(d->>'tipo_convenio',''),
      institucion = left(coalesce(nullif(d->>'servicio',''), nullif(d->>'institucion_nombre',''), d->>'ministerio', ''),300),
      estado_convenio = coalesce(d->>'estado_convenio',''), datos = d, actualizado = v_ahora, actualizado_por = v.usuario,
      enviado = case when p_enviar then v_ahora else enviado end, enviado_por = case when p_enviar then v.usuario else enviado_por end,
      nota_revision = case when p_enviar then '' else nota_revision end
    where id = p_id;
    v_id := p_id;
  end if;
  return jsonb_build_object('id', v_id, 'estado', v_estado);
end $$;

-- El administrador devuelve un convenio enviado para que la delegación lo corrija
create or replace function public.conv_devolver(p_id bigint, p_nota text) returns void
language plpgsql security definer set search_path = public, auth as
$$ declare v_u text; begin
  perform public.conv_exigir_admin();
  select usuario into v_u from public.conv_perfiles where id = auth.uid();
  if trim(coalesce(p_nota,'')) = '' then raise exception 'Escribe qué se debe corregir.'; end if;
  update public.conv_levantamientos set estado = 'devuelto', nota_revision = left(trim(p_nota), 1000),
    actualizado = public.conv_ahora(), actualizado_por = v_u where id = p_id and estado = 'enviado';
  if not found then raise exception 'Solo se pueden devolver convenios enviados.'; end if;
end $$;

-- Eliminar: la delegación solo sus borradores; el administrador cualquiera
create or replace function public.conv_eliminar_levantamiento(p_id bigint) returns void
language plpgsql security definer set search_path = public, auth as
$$ declare v public.conv_perfiles; r public.conv_levantamientos; begin
  if auth.uid() is null then raise exception 'Tu sesión expiró. Vuelve a ingresar.'; end if;
  select * into v from public.conv_perfiles where id = auth.uid() and activo and not cambiar;
  if not found then raise exception 'Tu sesión expiró. Vuelve a ingresar.'; end if;
  select * into r from public.conv_levantamientos where id = p_id;
  if not found then raise exception 'El registro ya no existe.'; end if;
  if v.rol = 'regional' and (public.conv_region_de(r.delegacion) is distinct from v.region or r.estado = 'enviado') then
    raise exception 'Solo puedes eliminar borradores de tu región.'; end if;
  if v.rol = 'consulta' then raise exception 'No tienes permiso para esta acción.'; end if;
  delete from public.conv_levantamientos where id = p_id;
end $$;

-- ---------- Seguridad: cada persona solo ve lo que le corresponde ----------
alter table public.conv_regiones       enable row level security;
alter table public.conv_delegaciones   enable row level security;
alter table public.conv_perfiles       enable row level security;
alter table public.conv_config         enable row level security;
alter table public.conv_levantamientos enable row level security;

drop policy if exists p_conv_reg_leer on public.conv_regiones;
create policy p_conv_reg_leer on public.conv_regiones for select to authenticated using (true);
drop policy if exists p_conv_del_leer on public.conv_delegaciones;
create policy p_conv_del_leer on public.conv_delegaciones for select to authenticated using (true);
drop policy if exists p_conv_perfiles_leer on public.conv_perfiles;
create policy p_conv_perfiles_leer on public.conv_perfiles for select to authenticated
  using (id = auth.uid() or public.conv_es_admin());
drop policy if exists p_conv_config_leer on public.conv_config;
create policy p_conv_config_leer on public.conv_config for select to authenticated using (true);
drop policy if exists p_conv_lev_leer on public.conv_levantamientos;
create policy p_conv_lev_leer on public.conv_levantamientos for select to authenticated
  using (public.conv_ve_todo() or public.conv_region_de(delegacion) = public.conv_mi_region());

-- Nadie escribe directamente en las tablas: solo a través de las funciones de arriba
revoke all on public.conv_regiones, public.conv_delegaciones, public.conv_perfiles, public.conv_config, public.conv_levantamientos from anon, authenticated;
grant select on public.conv_regiones, public.conv_delegaciones, public.conv_perfiles, public.conv_config, public.conv_levantamientos to authenticated;

-- =====================================================================
-- BITÁCORA DE AUDITORÍA
-- Registra inicios de sesión, cuentas, contraseñas, configuración y cada
-- convenio creado, modificado, enviado, devuelto o eliminado. No guarda contraseñas.
-- Solo el administrador la puede leer y nadie puede editarla ni borrarla.
-- =====================================================================
create table if not exists public.conv_bitacora (
  id bigint generated always as identity primary key,
  fecha text not null,                 -- hora de Chile: aaaa-mm-dd hh:mm:ss
  actor uuid,
  actor_usuario text not null,
  accion text not null,
  objeto text not null default '',
  detalle text not null default ''
);
create index if not exists conv_bitacora_fecha_idx on public.conv_bitacora (fecha desc);

create or replace function public.conv_bitacora_registrar(p_accion text, p_objeto text, p_detalle text) returns void
language plpgsql security definer set search_path = public, auth as
$$ declare v_u text; begin
  select usuario into v_u from public.conv_perfiles where id = auth.uid();
  insert into public.conv_bitacora (fecha, actor, actor_usuario, accion, objeto, detalle)
  values (public.conv_ahora(), auth.uid(),
          coalesce(v_u, case when auth.uid() is null then 'sistema' else '(cuenta eliminada)' end),
          p_accion, left(coalesce(p_objeto,''),160), left(coalesce(p_detalle,''),1000));
end $$;

create or replace function public.conv_bitacora_bloquear() returns trigger language plpgsql as
$$ begin raise exception 'La bitácora no se puede modificar ni borrar.'; end $$;
drop trigger if exists t_conv_bitacora_inmutable on public.conv_bitacora;
create trigger t_conv_bitacora_inmutable before update or delete on public.conv_bitacora
  for each row execute function public.conv_bitacora_bloquear();
drop trigger if exists t_conv_bitacora_truncate on public.conv_bitacora;
create trigger t_conv_bitacora_truncate before truncate on public.conv_bitacora
  for each statement execute function public.conv_bitacora_bloquear();

-- Cuentas
create or replace function public.conv_aud_perfiles() returns trigger
language plpgsql security definer set search_path = public, auth as
$$ begin
  if tg_op = 'INSERT' then
    perform public.conv_bitacora_registrar(case when new.rol = 'admin' then 'Crear administrador' else 'Crear cuenta' end,
      new.usuario, 'Tipo: ' || new.rol || coalesce(', región: ' || new.region, ''));
  elsif tg_op = 'DELETE' then
    perform public.conv_bitacora_registrar('Eliminar cuenta', old.usuario, 'Tipo: ' || old.rol || coalesce(', región: ' || old.region, ''));
  else
    if new.usuario is distinct from old.usuario then
      perform public.conv_bitacora_registrar('Cambiar usuario', new.usuario, 'Antes: ' || old.usuario); end if;
    if new.nombre is distinct from old.nombre then
      perform public.conv_bitacora_registrar('Cambiar nombre', new.usuario, 'Antes: ' || old.nombre || ' · Ahora: ' || new.nombre); end if;
    if new.correo is distinct from old.correo or new.telefono is distinct from old.telefono or new.cargo is distinct from old.cargo then
      perform public.conv_bitacora_registrar('Actualizar datos de contacto', new.usuario, ''); end if;
    if new.rol is distinct from old.rol then
      perform public.conv_bitacora_registrar('Cambiar tipo de cuenta', new.usuario, 'Antes: ' || old.rol || ' · Ahora: ' || new.rol); end if;
    if new.region is distinct from old.region then
      perform public.conv_bitacora_registrar('Asignar región', new.usuario, 'Antes: ' || coalesce(old.region,'—') || ' · Ahora: ' || coalesce(new.region,'—')); end if;
    if new.activo is distinct from old.activo then
      perform public.conv_bitacora_registrar(case when new.activo then 'Activar cuenta' else 'Desactivar cuenta' end, new.usuario, ''); end if;
    if new.cambiar and not old.cambiar then
      perform public.conv_bitacora_registrar('Restablecer contraseña', new.usuario, 'Contraseña temporal; deberá cambiarla al ingresar'); end if;
    if old.cambiar and not new.cambiar then
      perform public.conv_bitacora_registrar('Cambio de contraseña', new.usuario, 'La persona eligió su propia contraseña'); end if;
  end if;
  return null;
end $$;
drop trigger if exists t_conv_aud_perfiles on public.conv_perfiles;
create trigger t_conv_aud_perfiles after insert or update or delete on public.conv_perfiles
  for each row execute function public.conv_aud_perfiles();

-- Configuración
create or replace function public.conv_aud_config() returns trigger
language plpgsql security definer set search_path = public, auth as
$$ begin
  if tg_op = 'INSERT' or new.valor is distinct from old.valor then
    perform public.conv_bitacora_registrar('Cambiar configuración', new.clave,
      case when tg_op = 'UPDATE' then 'Antes: ' || old.valor || ' · Ahora: ' || new.valor else 'Valor: ' || new.valor end);
  end if;
  return null;
end $$;
drop trigger if exists t_conv_aud_config on public.conv_config;
create trigger t_conv_aud_config after insert or update on public.conv_config
  for each row execute function public.conv_aud_config();

-- Convenios
create or replace function public.conv_aud_levantamientos() returns trigger
language plpgsql security definer set search_path = public, auth as
$$ declare v_obj text; begin
  if tg_op = 'DELETE' then
    perform public.conv_bitacora_registrar('Eliminar convenio', '#' || old.id || ' · ' || old.delegacion,
      'Nombre: ' || coalesce(nullif(old.nombre_convenio,''),'(sin nombre)') || ' · Estado: ' || old.estado);
    return null;
  end if;
  v_obj := '#' || new.id || ' · ' || new.delegacion;
  if tg_op = 'INSERT' then
    perform public.conv_bitacora_registrar(case when new.estado = 'enviado' then 'Crear y enviar convenio' else 'Crear borrador' end,
      v_obj, 'Nombre: ' || coalesce(nullif(new.nombre_convenio,''),'(sin nombre)') || ' · Periodo: ' || new.periodo);
  elsif new.estado is distinct from old.estado then
    perform public.conv_bitacora_registrar(case new.estado when 'enviado' then 'Enviar convenio' when 'devuelto' then 'Devolver convenio' else 'Cambiar estado' end,
      v_obj, case when new.estado = 'devuelto' then 'Motivo: ' || new.nota_revision else 'Nombre: ' || coalesce(nullif(new.nombre_convenio,''),'(sin nombre)') end);
  elsif new.datos is distinct from old.datos then
    perform public.conv_bitacora_registrar('Modificar convenio', v_obj,
      'Nombre: ' || coalesce(nullif(new.nombre_convenio,''),'(sin nombre)') || ' · Estado: ' || new.estado);
  end if;
  return null;
end $$;
drop trigger if exists t_conv_aud_levantamientos on public.conv_levantamientos;
create trigger t_conv_aud_levantamientos after insert or update or delete on public.conv_levantamientos
  for each row execute function public.conv_aud_levantamientos();

alter table public.conv_bitacora enable row level security;
drop policy if exists p_conv_bitacora_leer on public.conv_bitacora;
create policy p_conv_bitacora_leer on public.conv_bitacora for select to authenticated using (public.conv_es_admin());
revoke all on public.conv_bitacora from anon, authenticated;
grant select on public.conv_bitacora to authenticated;

-- Inicios de sesión: Supabase actualiza last_sign_in_at cada vez que alguien ingresa.
-- Si por cualquier motivo el registro fallara, NUNCA bloquea el ingreso.
create or replace function public.conv_aud_login() returns trigger
language plpgsql security definer set search_path = public, auth as
$$ declare p public.conv_perfiles; begin
  begin
    select * into p from public.conv_perfiles where id = new.id;
    if found then
      insert into public.conv_bitacora (fecha, actor, actor_usuario, accion, objeto, detalle)
      values (public.conv_ahora(), p.id, p.usuario, 'Inicio de sesión', p.usuario,
              'Tipo: ' || p.rol || coalesce(', región: ' || p.region, ''));
    end if;
  exception when others then null;
  end;
  return null;
end $$;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    grant execute on function public.conv_aud_login() to supabase_auth_admin;
    grant execute on function public.conv_ahora() to supabase_auth_admin;
  end if;
end $$;
drop trigger if exists t_conv_aud_login on auth.users;
create trigger t_conv_aud_login after update of last_sign_in_at on auth.users
  for each row when (new.last_sign_in_at is distinct from old.last_sign_in_at)
  execute function public.conv_aud_login();

-- ---------- Permisos de las funciones ----------
-- (solo se tocan las funciones de este módulo; no afecta a otras plataformas del mismo proyecto)
do $$ declare f record; begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname like 'conv\_%' loop
    execute 'revoke all on function ' || f.sig || ' from public, anon, authenticated';
  end loop;
end $$;
grant execute on function public.conv_estado() to anon, authenticated;
grant execute on function public.conv_configurar(text,text,text) to anon, authenticated;
grant execute on function public.conv_crear_cuenta(jsonb) to authenticated;
grant execute on function public.conv_crear_todas() to authenticated;
grant execute on function public.conv_restablecer(uuid,text) to authenticated;
grant execute on function public.conv_editar(uuid,jsonb) to authenticated;
grant execute on function public.conv_eliminar(uuid) to authenticated;
grant execute on function public.conv_activar(uuid,boolean) to authenticated;
grant execute on function public.conv_clave_cambiada(text) to authenticated;
grant execute on function public.conv_guardar_contacto(text,text,text,text) to authenticated;
grant execute on function public.conv_guardar_config(jsonb) to authenticated;
grant execute on function public.conv_guardar(bigint,jsonb,boolean,text) to authenticated;
grant execute on function public.conv_devolver(bigint,text) to authenticated;
grant execute on function public.conv_eliminar_levantamiento(bigint) to authenticated;
-- funciones auxiliares que las políticas necesitan
grant execute on function public.conv_es_admin(), public.conv_ve_todo(), public.conv_mi_region(), public.conv_region_de(text), public.conv_rol(),
  public.conv_hoy(), public.conv_ahora(), public.conv_cfg(text) to authenticated;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    grant execute on function public.conv_aud_login(), public.conv_ahora() to supabase_auth_admin;
  end if;
end $$;
