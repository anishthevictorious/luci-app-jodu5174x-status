#!/bin/sh
# jodu5174x-reboot.sh
# Reboots the JODU51740/51741 ODU itself via its WebUI cgi
# (POST /cgi-bin/cgi/reboot.cgi with {"RequestVerifyToken":"..."} - confirmed
# via browser devtools on the ODU's own WebUI Maintenance > Reboot button).
# Outputs: {"result":true,"error":null} or {"result":false,"error":"..."}

CFG="jodu5174x"
HOST="$(uci -q get ${CFG}.main.host)"; HOST="${HOST:-192.168.225.1}"
USR="$(uci -q get ${CFG}.main.username)"; USR="${USR:-Anish}"
PWD_="$(uci -q get ${CFG}.main.password)"

BASE="https://${HOST}"
COOKIE="/tmp/jodu5174x_cookie.txt"
TOKEN_FILE="/tmp/jodu5174x_token.txt"

CURL="curl -k -s --max-time 8"

extract_token() {
	sed -n 's/.*"RequestVerifyToken"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p'
}

is_json_obj() {
	case "$1" in
		'{'*) return 0 ;;
		*) return 1 ;;
	esac
}

fail_json() {
	printf '{"result":false,"error":"%s"}\n' "$1"
	exit 0
}

get_fresh_token() {
	$CURL -H 'Content-Type: application/json' -d '{}' \
		"${BASE}/cgi-bin/cgi/token_query.cgi" | extract_token
}

do_login() {
	[ -z "$PWD_" ] && return 1

	TOK="$(get_fresh_token)"
	[ -z "$TOK" ] && return 1

	RESP="$($CURL -c "$COOKIE" -H 'Content-Type: application/json' \
		-d "{\"RequestVerifyToken\":\"${TOK}\",\"usr\":\"${USR}\",\"pwd\":\"${PWD_}\"}" \
		"${BASE}/cgi-bin/cgi/login_req.cgi")"

	echo "$RESP" | grep -q '"result"[[:space:]]*:[[:space:]]*true' || return 1

	NEWTOK="$(echo "$RESP" | extract_token)"
	[ -n "$NEWTOK" ] && echo "$NEWTOK" > "$TOKEN_FILE"
	return 0
}

do_reboot() {
	TOK="$(cat "$TOKEN_FILE" 2>/dev/null)"

	RESP="$($CURL -b "$COOKIE" -c "$COOKIE" -H 'Content-Type: application/json' \
		-d "{\"RequestVerifyToken\":\"${TOK}\"}" \
		"${BASE}/cgi-bin/cgi/reboot.cgi")"

	echo "$RESP"
}

command -v curl >/dev/null 2>&1 || fail_json "curl not found"
[ -z "$PWD_" ] && fail_json "password not configured"

if [ ! -s "$COOKIE" ] || [ ! -s "$TOKEN_FILE" ]; then
	do_login || fail_json "login failed"
fi

# Fire the reboot request. The ODU typically cuts the connection almost
# immediately once it accepts this, so curl often gets an empty/garbled
# response or times out - that is the EXPECTED/successful outcome here,
# not a failure, so we don't retry-login or treat it as an error.
do_reboot >/dev/null 2>&1

printf '{"result":true,"error":null}\n'
