<div align="center">

# luci-app-jodu5174x-status

### Made with Claude as a Personal Fun Project.

![version](https://img.shields.io/badge/version-1.0-blue) ![OpenWrt](https://img.shields.io/badge/OpenWrt-Compatible-brightgreen) ![ImmortalWrt](https://img.shields.io/badge/ImmortalWrt-Compatible-brightgreen)

A sleek, lightweight LuCI web interface module for OpenWrt that seamlessly monitors the **JODU51741 / JODU51740** 5G ODU directly from your router — no telnet, no SSH, just the ODU's own WebUI/CGI.

This application entirely eliminates the need to log into the ODU's web portal separately. It bridges your router and the ODU hardware, pulling real-time signal, connection and system diagnostics straight into your router's dashboard.

</div>

## Features

- **No Telnet Required:** Talks to the ODU purely over its existing HTTPS WebUI/CGI interface — nothing to enable on the ODU side.
- **Signal & Connection Status:** RSRP, RSRQ, SINR, BLER, Band, Bandwidth, ARFCN, Physical Cell ID, Modulation and MIMO for both the primary and secondary (CA/SCC) carrier.
- **Live Data Usage:** Tracks TX/RX bytes and overall connection state (link active / down / provisioning / roaming).
- **Ethernet Link Awareness:** Detects the actual router interface facing the ODU and reports link speed/duplex — useful for telling "ODU rebooting" apart from "ODU disconnected".
- **One-Click Reboot:** Reboot the ODU straight from the dashboard.
- **Simple Settings Panel:** Host, username and password for the ODU WebUI, editable from the dashboard and stored in `/etc/config/jodu5174x`.

## Installation

Grab the package from [Releases](../../releases) and install it on your router:

```sh
cd /tmp && apk add --allow-untrusted ./luci-app-jodu5174x-status-1.0-r1.apk
```


After install find the dashboard at **Status → JODU Dashboard**.

## Configuration

All settings are editable from the dashboard's settings panel and are stored in `/etc/config/jodu5174x`:

| Option     | Description                        | Default         |
| ---------- | ------------------------------------ | --------------- |
| `host`     | ODU IP address                       | `192.168.225.1` |
| `username` | ODU WebUI login username             | `Admin`         |
| `password` | ODU WebUI login password             | empty           |
| `enabled`  | Turn background monitoring on/off    | `1`             |

