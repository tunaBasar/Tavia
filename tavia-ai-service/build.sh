#!/bin/bash
cd /home/tuna/Desktop/tavia_v2/tavia-ai-service
./gradlew clean build -x test > build.out 2>&1
