#!/usr/bin/env bash
# Re-enable resume.urkuconsulting.com on host nginx (backend moved 8001 -> 8005).
set -euo pipefail
SITE=/etc/nginx/sites-available/resume.urkuconsulting.com

sudo cp "$SITE" "$SITE.bak-$(date +%Y%m%d-%H%M%S)"
sudo sed -i 's#proxy_pass http://127.0.0.1:8001;#proxy_pass http://127.0.0.1:8005;#' "$SITE"
sudo ln -sf "$SITE" /etc/nginx/sites-enabled/resume.urkuconsulting.com

# Cert has likely expired while the site was disabled; renew/reissue it.
sudo certbot certonly --nginx -d resume.urkuconsulting.com --keep-until-expiring --non-interactive

sudo nginx -t
sudo systemctl reload nginx
echo "--- check:"
curl -s -o /dev/null -w 'site: %{http_code}\n' https://resume.urkuconsulting.com/
curl -s https://resume.urkuconsulting.com/api/health; echo
