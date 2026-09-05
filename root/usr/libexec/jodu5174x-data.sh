#!/bin/sh
# jodu5174x-data.sh
# Pure WebUI/cgi HTTP fetch for JODU51741/JODU51740 (no telnet/SSH on this ODU).
# Outputs one merged JSON object to stdout: {"netstatus":{...},"datastatus":{...},"error":null}

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

# The ODU replies with an HTML login-redirect page (no "error" key at all)
# once the session has actually expired server-side, instead of a JSON
# error object. Treat anything that doesn't start with '{' as invalid too.
is_json_obj() {
	case "$1" in
		'{'*) return 0 ;;
		*) return 1 ;;
	esac
}

fail_json() {
	ETHLINK="$(eth_link_status)"
	printf '{"netstatus":null,"datastatus":null,"eth_link":"%s","error":"%s"}\n' "$ETHLINK" "$1"
	exit 0
}

# Resolves whichever interface the router actually uses to reach the ODU
# (via the routing table, so we never hardcode a port name) and reports
# whether that link's physical carrier is up. Useful while the ODU is
# mid-reboot: WebUI/cgi is down, but the ethernet cable/link itself may
# still show up, telling us it's just booting rather than disconnected.
eth_link_status() {
	IFACE="$(ip route get "$HOST" 2>/dev/null | sed -n 's/.* dev \([a-zA-Z0-9.]*\).*/\1/p' | head -n1)"
	[ -z "$IFACE" ] && { echo "unknown"; return; }

	CARRIER="$(cat "/sys/class/net/${IFACE}/carrier" 2>/dev/null)"
	case "$CARRIER" in
		1)
			SPEED="$(cat "/sys/class/net/${IFACE}/speed" 2>/dev/null)"
			DUPLEX="$(cat "/sys/class/net/${IFACE}/duplex" 2>/dev/null)"

			DUP_LABEL=""
			case "$DUPLEX" in
				full) DUP_LABEL="Full" ;;
				half) DUP_LABEL="Half" ;;
			esac

			if [ -n "$SPEED" ] && [ "$SPEED" -gt 0 ] 2>/dev/null; then
				if [ -n "$DUP_LABEL" ]; then
					echo "${SPEED} Mbps (${DUP_LABEL})"
				else
					echo "${SPEED} Mbps"
				fi
			else
				echo "up"
			fi
			;;
		0) echo "down" ;;
		*) echo "unknown" ;;
	esac
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

# call_api URL EXTRA_JSON_FIELDS(without braces, may be empty)
call_api() {
	URL="$1"
	EXTRA="$2"
	TOK="$(cat "$TOKEN_FILE" 2>/dev/null)"

	if [ -n "$EXTRA" ]; then
		BODY="{\"RequestVerifyToken\":\"${TOK}\",${EXTRA}}"
	else
		BODY="{\"RequestVerifyToken\":\"${TOK}\"}"
	fi

	RESP="$($CURL -b "$COOKIE" -c "$COOKIE" -H 'Content-Type: application/json' \
		-d "$BODY" "${BASE}${URL}")"

	NEWTOK="$(echo "$RESP" | extract_token)"
	[ -n "$NEWTOK" ] && echo "$NEWTOK" > "$TOKEN_FILE"

	echo "$RESP"
}

command -v curl >/dev/null 2>&1 || fail_json "curl not found"
[ -z "$PWD_" ] && fail_json "password not configured"

# make sure we have a session
if [ ! -s "$COOKIE" ] || [ ! -s "$TOKEN_FILE" ]; then
	do_login || fail_json "login failed"
fi

NETSTATUS="$(call_api /cgi-bin/cgi/net_status_retrieve.cgi "")"

if ! is_json_obj "$NETSTATUS" || echo "$NETSTATUS" | grep -qi '"error"'; then
	# session/token stale or expired (ODU sometimes returns an HTML
	# login-redirect page instead of JSON) - wipe session, relogin, retry once
	rm -f "$COOKIE" "$TOKEN_FILE"
	do_login || fail_json "login failed"
	NETSTATUS="$(call_api /cgi-bin/cgi/net_status_retrieve.cgi "")"
	is_json_obj "$NETSTATUS" || fail_json "invalid response from ODU"
fi

DATASTATUS="$(call_api /cgi-bin/cgi/data_status.cgi '"operation":"get"')"
is_json_obj "$DATASTATUS" || DATASTATUS=""

if [ -z "$NETSTATUS" ]; then
	fail_json "no response from ODU"
fi

ETHLINK="$(eth_link_status)"

printf '{"netstatus":%s,"datastatus":%s,"eth_link":"%s","error":null}\n' \
	"${NETSTATUS:-null}" "${DATASTATUS:-null}" "$ETHLINK"
