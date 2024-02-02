#!/bin/bash

OS := $(shell uname)

help: ## Show this help message
	@echo 'usage: make [target]'
	@echo
	@echo 'targets:'
	@egrep '^(.+)\:\ ##\ (.+)' ${MAKEFILE_LIST} | column -t -c 2 -s ':#'

env:
	
down:
	cd environment && docker-compose down && cd ../
run:
	cd environment && docker-compose up && cd ../
rund:
	cd environment && docker-compose up -d && cd ../
ps:
	cd environment && docker-compose ps && cd ../
exec:
	cd environment && docker exec -it ruteador-node /bin/sh && cd ../
build:
	cd application && npm run build && cd ../

deploy: build
	cd application && aws s3 cp --recursive dist/spa/ s3://app.dimipropartners.com --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers && cd ../