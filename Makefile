# Export NPM_CONFIG_REGISTRY to use your private registry
export NPM_CONFIG_REGISTRY := https://npm.pkg.github.com/sidharrrthnix

# Define the package name and version
PACKAGE_NAME := @sidharrrthnix/ms-shared-package
PACKAGE_VERSION := $(shell npm view $(PACKAGE_NAME) version --registry=$(NPM_CONFIG_REGISTRY))

# List all microservices
MICROSERVICES := auth-service notification-service gateway-service

# Task to update the package in all microservices
update-package:
	@for service in $(MICROSERVICES); do \
		echo "Updating $(PACKAGE_NAME) in $$service..."; \
		cd $$service && npm install $(PACKAGE_NAME)@$(PACKAGE_VERSION) && cd ..; \
	done
	@echo "Package update complete!"

# Task to install the package in all microservices
install-package:
	@for service in $(MICROSERVICES); do \
		echo "Installing $(PACKAGE_NAME) in $$service..."; \
		cd $$service && npm install $(PACKAGE_NAME) && cd ..; \
	done
	@echo "Package installation complete!"

# Task to update and install the package in all microservices
update-and-install: update-package install-package
	@echo "Package update and installation complete!"

# Task to clean node_modules in all microservices
clean:
	@for service in $(MICROSERVICES); do \
		echo "Cleaning node_modules in $$service..."; \
		cd $$service && rm -rf node_modules && cd ..; \
	done
	@echo "Clean complete!"

# Task to install dependencies in all microservices
install-all:
	@for service in $(MICROSERVICES); do \
		echo "Installing dependencies in $$service..."; \
		cd $$service && npm install && cd ..; \
	done
	@echo "All dependencies installed!"

# Task to list all microservices
list-services:
	@echo "Microservices:"
	@for service in $(MICROSERVICES); do \
		echo "- $$service"; \
	done

# Default task
.PHONY: default
default: list-services
