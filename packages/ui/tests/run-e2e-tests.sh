#!/bin/bash

# Color definitions for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}Running E2E Tests with Playwright${NC}"
echo -e "${BLUE}=====================================${NC}"

# Function to check if Playwright is installed
check_playwright() {
  if ! command -v npx playwright --version &> /dev/null; then
    echo -e "${YELLOW}Playwright not found. Installing Playwright...${NC}"
    npm install -D @playwright/test
    npx playwright install --with-deps
    echo -e "${GREEN}Playwright installed successfully!${NC}"
  else
    echo -e "${GREEN}Playwright is already installed.${NC}"
  fi
}

# Function to check if dev server is running
check_server() {
  echo -e "${YELLOW}Checking if development server is running...${NC}"
  if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}Development server is running at http://localhost:3000${NC}"
    SERVER_RUNNING=true
  else
    echo -e "${YELLOW}Development server is not running.${NC}"
    SERVER_RUNNING=false
  fi
}

# Function to run tests
run_tests() {
  local mode=$1
  local test_type=${2:-"all"}
  
  echo -e "\n${BLUE}Running tests in ${mode} mode...${NC}"
  
  # Set environment variables for testing 
  export TEST_MODE=true
  
  # Set test files based on test_type
  local test_files=""
  if [ "$test_type" == "workspace" ]; then
    echo -e "${YELLOW}Running workspace management tests only.${NC}"
    test_files="tests/workspace-management.spec.js"
  elif [ "$test_type" == "user-org" ]; then
    echo -e "${YELLOW}Running user & organization management tests only.${NC}"
    test_files="tests/e2e/user-org-management.spec.js tests/user-management.spec.js tests/organization-management.spec.js"
  else
    echo -e "${YELLOW}Running all tests.${NC}"
    test_files="tests" # All tests in the tests directory
  fi
  
  # Choose browser based on mode
  if [ "$mode" == "headless" ]; then
    echo -e "${YELLOW}Running tests in headless mode on Chrome.${NC}"
    npx playwright test ${test_files} --project=chromium
  elif [ "$mode" == "headed" ]; then
    echo -e "${YELLOW}Running tests in headed mode (with browser UI).${NC}"
    npx playwright test ${test_files} --headed --project=chromium
  elif [ "$mode" == "debug" ]; then
    echo -e "${YELLOW}Running tests in debug mode.${NC}"
    npx playwright test ${test_files} --debug --project=chromium
  elif [ "$mode" == "all" ]; then
    echo -e "${YELLOW}Running tests on all browser configurations.${NC}"
    npx playwright test ${test_files}
  else
    echo -e "${RED}Invalid mode: ${mode}${NC}"
    exit 1
  fi
  
  # Check result
  if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ All E2E tests passed!${NC}"
    return 0
  else
    echo -e "\n${RED}✗ Some E2E tests failed.${NC}"
    return 1
  fi
}

# Function to open the test report
open_report() {
  echo -e "\n${YELLOW}Opening test report...${NC}"
  npx playwright show-report playwright-report/
}

# Main execution starts here
check_playwright
check_server

# Parse command-line arguments
MODE="headless"
SHOW_REPORT=false
TEST_TYPE="all"

for arg in "$@"; do
  case $arg in
    --headed)
      MODE="headed"
      shift
      ;;
    --debug)
      MODE="debug"
      shift
      ;;
    --all)
      MODE="all"
      shift
      ;;
    --report)
      SHOW_REPORT=true
      shift
      ;;
    --workspace)
      TEST_TYPE="workspace"
      shift
      ;;
    --user-org)
      TEST_TYPE="user-org"
      shift
      ;;
  esac
done

# Start server if needed
if [ "$SERVER_RUNNING" = false ]; then
  echo -e "${YELLOW}Starting development server in background...${NC}"
  echo -e "${YELLOW}(Note: This might take a while to start)${NC}"
  # The playwright config should handle starting the server
fi

# Run the tests
run_tests "$MODE" "$TEST_TYPE"
TEST_RESULT=$?

# Open report if requested or if tests failed
if [ "$SHOW_REPORT" = true ] || [ $TEST_RESULT -ne 0 ]; then
  open_report
fi

# Print summary
echo -e "\n${BLUE}=====================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}=====================================${NC}"

if [ $TEST_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ All E2E tests completed successfully!${NC}"
else
  echo -e "${RED}✗ Some E2E tests failed. Check the report for details.${NC}"
fi

echo -e "\n${YELLOW}Usage:${NC}"
echo -e "  ${YELLOW}./tests/run-e2e-tests.sh${NC} - Run all tests in headless mode"
echo -e "  ${YELLOW}./tests/run-e2e-tests.sh --headed${NC} - Run tests with browser UI"
echo -e "  ${YELLOW}./tests/run-e2e-tests.sh --debug${NC} - Run tests in debug mode"
echo -e "  ${YELLOW}./tests/run-e2e-tests.sh --all${NC} - Run tests on all browsers"
echo -e "  ${YELLOW}./tests/run-e2e-tests.sh --report${NC} - Open report after running"
echo -e "  ${YELLOW}./tests/run-e2e-tests.sh --workspace${NC} - Run only workspace management tests"
echo -e "  ${YELLOW}./tests/run-e2e-tests.sh --user-org${NC} - Run only user and organization tests"

exit $TEST_RESULT
