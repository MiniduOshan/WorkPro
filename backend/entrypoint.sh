#!/bin/sh
echo "=== CHECKING ENVIRONMENT VARIABLES ==="
echo "SMTP_HOST=$SMTP_HOST"
echo "SMTP_PORT=$SMTP_PORT"
echo "SMTP_USER=$SMTP_USER"
echo "SMTP_PASS=$SMTP_PASS"
echo "SMTP_FROM=$SMTP_FROM"
echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID"
echo "FRONTEND_URL=$FRONTEND_URL"
echo "=== END ENV CHECK ==="

# Continue with normal startup
exec "$@"
