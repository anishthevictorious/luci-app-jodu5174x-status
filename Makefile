include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for JODU51741/51740 5G ODU status (no telnet, WebUI cgi)
LUCI_DEPENDS:=+curl
LUCI_PKGARCH:=all

PKG_NAME:=luci-app-jodu5174x-status
PKG_VERSION:=3.0
PKG_RELEASE:=1

define Package/luci-app-jodu5174x-status/postinst
#!/bin/sh
[ -n "$$IPKG_INSTROOT" ] || {
	rm -f /tmp/luci-indexcache /tmp/luci-modulecache/* 2>/dev/null
	/etc/init.d/rpcd restart >/dev/null 2>&1
}
exit 0
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
