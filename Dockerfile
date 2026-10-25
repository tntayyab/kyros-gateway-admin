FROM docker.io/manifestdotbuild/manifest:latest

# Overlay custom frontend dist with Admin Control Center & Sidebar integration
COPY packages/frontend/dist /app/packages/frontend/dist

# Overlay custom backend dist with Neon CSP permissions
COPY packages/backend/dist /app/packages/backend/dist

EXPOSE 2099
