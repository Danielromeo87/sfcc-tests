# SFCC Architect Challenge — static site image
# Multi-stage would be unnecessary here (no build step), so a single
# stage on top of nginx:alpine keeps the image minimal (~40 MB).

FROM nginx:1.27-alpine

# Use the official nginx user
# (nginx:alpine already ships with the `nginx` user; we just rely on it)

# Drop the default nginx site and assets we don't need
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config with:
#   - Gzip + brotli-lite (brotli via nginx-module is heavier; gzip covers most cases)
#   - Long cache for fingerprinted assets, no cache for HTML
#   - Correct MIME type for .webmanifest
#   - Sensible security headers
#   - SPA-friendly fallback to index.html (we're a true single-page app, so
#     any unknown URL falls back to index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy ONLY the web-facing assets. Documentation, deploy notes, .zip backups
# and the repo's own README are intentionally NOT included.
COPY index.html              /usr/share/nginx/html/index.html
COPY styles.css              /usr/share/nginx/html/styles.css
COPY app.js                  /usr/share/nginx/html/app.js
COPY favicon.svg             /usr/share/nginx/html/favicon.svg
COPY og-image.png            /usr/share/nginx/html/og-image.png
COPY manifest.webmanifest    /usr/share/nginx/html/manifest.webmanifest
COPY robots.txt              /usr/share/nginx/html/robots.txt
COPY sitemap.xml             /usr/share/nginx/html/sitemap.xml

# Make sure nginx can read the files
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

# Quick HTTP check against the local server. nginx:alpine ships with wget.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
