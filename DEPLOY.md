# Guía de despliegue en VPS

URL pública: **https://test-salesforcecommerce.cloud**

Esta web es 100% estática (HTML/CSS/JS + assets). Sirve desde cualquier servidor web con HTTPS.

## Requisitos del VPS

- Linux (Ubuntu 22.04+ / Debian 12+) con acceso root o sudo
- Nginx o Apache
- DNS: registro A o CNAME apuntando `test-salesforcecommerce.cloud` a la IP del VPS
- Puertos 80 y 443 abiertos

## 0. Despliegue con Docker (recomendado)

El repo incluye un `Dockerfile` listo para producción basado en `nginx:alpine`. Solo sirve los assets web (HTML/CSS/JS + favicon, og-image, manifest, robots, sitemap). Las notas internas (README, DEPLOY, apuntes, .md) y los `.zip` de backup se excluyen automáticamente vía `.dockerignore`.

### Build y ejecución

```bash
# Construir la imagen (tamaño final ~40 MB)
docker build -t sfcc-architect-challenge:latest .

# Lanzar el contenedor, mapeando 8080 local → 80 contenedor
docker run -d --name sfcc --restart unless-stopped -p 8080:80 sfcc-architect-challenge:latest

# Comprobar
curl -I http://localhost:8080/
```

### Con docker compose

```yaml
# compose.yaml
services:
  web:
    build: .
    image: sfcc-architect-challenge:latest
    container_name: sfcc
    restart: unless-stopped
    ports:
      - "8080:80"
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 5s
      retries: 3
```

```bash
docker compose up -d --build
```

### Detrás de un reverse proxy TLS

El contenedor expone HTTP en 80. En producción se mete detrás de algo que termine TLS (Traefik, Caddy, Cloudflare, nginx-proxy, etc.) y haga la redirección 80→443. Ejemplo con Traefik v2:

```yaml
services:
  web:
    build: .
    image: sfcc-architect-challenge:latest
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.sfcc.rule=Host(`test-salesforcecommerce.cloud`)"
      - "traefik.http.routers.sfcc.entrypoints=websecure"
      - "traefik.http.routers.sfcc.tls.certresolver=letsencrypt"
      - "traefik.http.services.sfcc.loadbalancer.server.port=80"
    networks:
      - proxy

networks:
  proxy:
    external: true
    name: traefik_proxy
```

El `nginx.conf` del contenedor ya añade los headers de seguridad relevantes (CSP, HSTS vía reverse proxy, X-Frame-Options, etc.). Si prefieres hacerlo todo en el reverse proxy, deja que Traefik/Caddy los inyecte y quítalos del `nginx.conf` para evitar duplicación.

## 1. Subir ficheros al VPS

Opción A: clonar el repo

```bash
sudo mkdir -p /var/www/sfcc
sudo chown $USER:www-data /var/www/sfcc
cd /var/www/sfcc
git clone https://github.com/TU_USUARIO/sfcc-architect-challenge.git .
```

Opción B: subir por SCP/SFTP

```bash
scp -r ./* usuario@TU_VPS:/tmp/sfcc/
ssh usuario@TU_VPS "sudo mv /tmp/sfcc/* /var/www/sfcc/"
```

## 2. Permisos

```bash
sudo chown -R www-data:www-data /var/www/sfcc
sudo find /var/www/sfcc -type d -exec chmod 755 {} \;
sudo find /var/www/sfcc -type f -exec chmod 644 {} \;
```

## 3. Nginx

Guarda el bloque de servidor en `/etc/nginx/sites-available/sfcc`:

```nginx
# Redirección HTTP -> HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name test-salesforcecommerce.cloud;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name test-salesforcecommerce.cloud;
    root /var/www/sfcc;
    index index.html;

    # Certificados Let's Encrypt (se generan con certbot en el paso 4)
    ssl_certificate     /etc/letsencrypt/live/test-salesforcecommerce.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/test-salesforcecommerce.cloud/privkey.pem;

    # SSL moderno
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # Headers de seguridad
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # CSP: permite Google Fonts y self
    add_header Content-Security-Policy "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'" always;

    # Ocultar versión de Nginx
    server_tokens off;

    # Compresión
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml application/javascript application/json image/svg+xml application/manifest+json;

    # Cache de assets con hash
    location ~* \.(?:css|js|svg|png|jpg|jpeg|gif|webp|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        try_files $uri =404;
    }

    # Robots y sitemap
    location = /robots.txt { add_header Cache-Control "public, max-age=86400"; }
    location = /sitemap.xml { add_header Cache-Control "public, max-age=86400"; }

    # Manifest PWA
    location = /manifest.webmanifest {
        add_header Content-Type "application/manifest+json";
        expires 1d;
    }

    # HTML: siempre fresh
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # SPA fallback (no aplica aquí, pero por si en el futuro)
    location / {
        try_files $uri $uri/ =404;
    }
}
```

Activar y reiniciar:

```bash
sudo ln -s /etc/nginx/sites-available/sfcc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 4. HTTPS con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d test-salesforcecommerce.cloud
# Sigue el asistente: te pedirá email y acepta TOS.
# Certbot modificará automáticamente la configuración Nginx.
```

Renovación automática (ya viene en cron, pero por si acaso):

```bash
sudo certbot renew --dry-run
```

## 5. Verificación post-despliegue

### SSL y headers

```bash
curl -I https://test-salesforcecommerce.cloud
```

Debe mostrar:

- `HTTP/2 200`
- `strict-transport-security: max-age=31536000`
- `x-content-type-options: nosniff`
- `content-security-policy: ...`

### Validadores online

- **Schema.org JSON-LD**: https://validator.schema.org/ (pegar la URL)
- **Open Graph**: https://www.opengraph.xyz/ (pegar la URL)
- **Twitter Card**: https://cards-dev.twitter.com/validator
- **Mobile-friendly**: https://search.google.com/test/mobile-friendly
- **PageSpeed Insights**: https://pagespeed.web.dev/

### Ficheros críticos

Comprueba que responden 200:

```bash
curl -I https://test-salesforcecommerce.cloud/
curl -I https://test-salesforcecommerce.cloud/index.html
curl -I https://test-salesforcecommerce.cloud/styles.css
curl -I https://test-salesforcecommerce.cloud/app.js
curl -I https://test-salesforcecommerce.cloud/favicon.svg
curl -I https://test-salesforcecommerce.cloud/og-image.png
curl -I https://test-salesforcecommerce.cloud/manifest.webmanifest
curl -I https://test-salesforcecommerce.cloud/robots.txt
curl -I https://test-salesforcecommerce.cloud/sitemap.xml
```

### Verificación de SEO

1. Abre https://test-salesforcecommerce.cloud y revisa:
   - Title y description se ven correctos
   - Cambia idioma ES/EN, persiste tras recargar
   - Toggle de tema claro/oscuro persiste
   - Responde un par de preguntas, refresca: el progreso debe estar guardado
2. Inspecciona con DevTools (F12) que no haya errores 404 en la pestaña Network
3. Verifica que `localStorage` guarda `sfccQuizLang`, `sfccQuizTheme`, `sfccQuizProgress`, `sfccQuizFailed`, `sfccQuizBookmarks`

### Google Search Console

1. https://search.google.com/search-console/ → Añadir propiedad (tipo URL prefix)
2. Verifica con el método DNS (registro TXT) o HTML tag
3. Envía el sitemap: `https://test-salesforcecommerce.cloud/sitemap.xml`
4. Solicita indexación de la URL principal

### Bing Webmaster Tools

Opcional pero recomendado para cobertura adicional:
https://www.bing.com/webmasters

## 6. Mantenimiento

### Actualizar contenido

```bash
cd /var/www/sfcc
sudo -u www-data git pull
sudo systemctl reload nginx  # solo si cambia config Nginx
```

### Logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup

```bash
sudo tar czf /backup/sfcc-$(date +%Y%m%d).tar.gz /var/www/sfcc
```

## 7. Ficheros del despliegue

| Fichero | Descripción |
|---|---|
| `index.html` | Página principal |
| `styles.css` | Estilos |
| `app.js` | Lógica + 190+ preguntas |
| `favicon.svg` | Icono vectorial |
| `og-image.png` | Imagen Open Graph 1200×630 |
| `manifest.webmanifest` | PWA manifest |
| `robots.txt` | Directivas crawlers |
| `sitemap.xml` | Mapa del sitio |
| `README.md` | Descripción del proyecto |
| `DEPLOY.md` | Esta guía |
| `sfcc_senior_architect_interview_guide.md` | Guía técnica detallada |
| `ocapi_scapi_pwa_apuntes.md` | Apuntes OCAPI/SCAPI/PWA Kit |
| `SEO_PLAN.md` | Plan SEO |

## 8. Solución de problemas

**Error 404 en manifest.webmanifest al recargar:**
- Verifica que Nginx tiene `location = /manifest.webmanifest` con el Content-Type correcto.
- En Chrome DevTools, ve a Application → Manifest y comprueba que no haya errores.

**CSP bloquea algo:**
- Revisa la consola del navegador (DevTools → Console).
- Ajusta `Content-Security-Policy` en el bloque Nginx según necesites.

**HTTPS no se activa:**
- Comprueba que certbot se ejecutó correctamente: `sudo certbot certificates`.
- Verifica que el puerto 443 está abierto: `sudo ufw allow 443/tcp`.
