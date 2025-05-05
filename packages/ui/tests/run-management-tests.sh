#!/bin/bash

# Run all management tests
echo "Running User Management Tests..."
npx playwright test tests/user-management.spec.js

echo "Running Organization Management Tests..."
npx playwright test tests/organization-management.spec.js

echo "Running Workspace Management Tests..."
npx playwright test tests/workspace-management.spec.js

echo "All tests completed!"
