# Makefile to automatically run backend + exploit

BACKEND_DIR=backend
BACKEND_ENTRY=server.js
EXPLOIT=exploit.js
NODE=node

.PHONY: exploit run-backend stop-backend

# Default target: run exploit automatically
exploit:
	cd $(BACKEND_DIR) && nohup $(NODE) $(BACKEND_ENTRY) > backend.log 2>&1 &
	@echo $$! > backend.pid
	@sleep 1
	cd $(BACKEND_DIR) && $(NODE) $(EXPLOIT)
	@echo "[*] Stopping backend..."
	@make stop-backend
	@echo "[*] Exploit complete."

# Helper to start backend manually 
run-backend:
	cd $(BACKEND_DIR) && $(NODE) $(BACKEND_ENTRY)

