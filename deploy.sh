rebuild_service() {
  SERVICE=$1
  echo "🔄 Reconstruyendo $SERVICE..."
  docker-compose build $SERVICE
}

CHANGED_FILES=$(git diff --name-only origin/main HEAD)


if echo "$CHANGED_FILES" | grep -q '^frontend/'; then
  rebuild_service frontend
fi

if echo "$CHANGED_FILES" | grep -q '^backend/'; then
  rebuild_service backend
fi

echo "🚀 Levantando servicios..."
docker-compose up -d