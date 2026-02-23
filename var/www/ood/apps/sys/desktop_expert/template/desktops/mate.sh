#!/bin/bash
echo "[mate.sh] Starting MATE desktop session for $USER at $(date)"

# Optional: Log file for debugging
export MATE_LOG="${HOME}/.mate_ood_startup.log"
exec > >(tee -a "$MATE_LOG") 2>&1

# Optional: Custom ICEauthority file
export ICEAUTHORITY="${HOME}/.ICEauthority-$$"
touch "$ICEAUTHORITY"

# Ensure D-Bus is available early
eval "$(dbus-launch --sh-syntax)"
export DBUS_SESSION_BUS_ADDRESS

# Remove monitor layout popup
if [[ -f "${HOME}/.config/monitors.xml" ]]; then
  mv "${HOME}/.config/monitors.xml" "${HOME}/.config/monitors.xml.bak"
fi

# Hide desktop icons
gsettings set org.mate.caja.desktop computer-icon-visible false
gsettings set org.mate.caja.desktop trash-icon-visible false

# Set terminal to open as login shell
dconf write /org/mate/terminal/profiles/default/login-shell true 2>/dev/null || true

# Disable screensaver and lock
gsettings set org.mate.screensaver lock-enabled false
gsettings set org.mate.screensaver idle-activation-enabled false
gsettings set org.mate.session idle-delay 0
xset s off && xset -dpms && xset s noblank

export DISABLE_SYSTEMD=1
export GIO_USE_VFS=local
export GTK_MODULES=""
export PIPEWIRE_DISABLE=1
export XDG_CURRENT_DESKTOP=MATE

# Clean up old Google Chrome locks
rm -f ~/.config/google-chrome/Singleton*

# Define Chrome as Default Browser
xdg-settings set default-web-browser google-chrome.desktop

# Start MATE desktop
echo "[mate.sh] Launching mate-session..."
exec mate-session
