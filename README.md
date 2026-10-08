# Levantamiento de Convenios 2.0

Aplicación independiente para el levantamiento y monitoreo semestral de convenios, separada de SIGEPRO.

## Producción

- Vercel: https://levantamiento-de-convenio-2-0.vercel.app
- Formulario dinámico con rutas para convenios de colaboración y transferencia.
- Guardado automático del borrador en el navegador.
- Historial local y exportación de respaldos JSON.
- Diseño responsive para escritorio y dispositivos móviles.

## Privacidad y almacenamiento

Esta versión no transmite información a SIGEPRO ni a una base de datos externa. Los borradores y registros se almacenan únicamente en el navegador del dispositivo utilizado. Para uso institucional multiusuario se requiere incorporar autenticación y persistencia segura en servidor.

## Ejecución local

Sirva la raíz del proyecto mediante HTTP, por ejemplo:

```bash
python3 -m http.server 4173
```

Luego abra `http://localhost:4173`.
