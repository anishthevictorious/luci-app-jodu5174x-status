#!/bin/sh
# jodu5174x-save.sh
# Writes one or more /etc/config/jodu5174x fields and commits once, run as
# root via rpcd file-exec (so it doesn't depend on the uci ubus object's
# commit/apply ACL scope, which needs broader permissions than the simple
# config-scoped "uci":["jodu5174x"] ACL grant and has repeatedly caused
# "Access denied" errors).
#
# Usage: jodu5174x-save.sh <field1> <value1> [<field2> <value2> ...]
#   field: host | username | password | enabled
# Outputs: {"result":true} or {"result":false,"error":"..."}

CFG="jodu5174x"

fail_json() {
	printf '{"result":false,"error":"%s"}\n' "$1"
	exit 0
}

[ "$#" -ge 2 ] && [ $(( $# % 2 )) -eq 0 ] || fail_json "bad arguments"

while [ "$#" -ge 2 ]; do
	FIELD="$1"
	VALUE="$2"
	shift 2

	case "$FIELD" in
		host|username|password|enabled) ;;
		*) fail_json "invalid field: $FIELD" ;;
	esac

	uci set "${CFG}.main.${FIELD}=${VALUE}" 2>/dev/null || fail_json "uci set failed on $FIELD"
done

uci commit "$CFG" 2>/dev/null || fail_json "uci commit failed"

printf '{"result":true}\n'
