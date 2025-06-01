#!/bin/bash

# Sync upstream changes into core using git subtree
# Usage: ./scripts/sync-upstream.sh [branch]

set -e

UPSTREAM_REPO="https://github.com/upstream/repo.git"  # Replace with actual repo
UPSTREAM_BRANCH="${1:-main}"
SUBTREE_PREFIX="core"
BACKUP_BRANCH="backup-before-sync-$(date +%Y%m%d-%H%M%S)"

echo "🔄 Starting upstream sync process..."

# Create a backup branch
echo "📦 Creating backup branch: $BACKUP_BRANCH"
git checkout -b "$BACKUP_BRANCH"
git checkout -

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

# Fetch the latest changes from upstream
echo "⬇️  Fetching latest from upstream..."
git subtree pull --prefix="$SUBTREE_PREFIX" "$UPSTREAM_REPO" "$UPSTREAM_BRANCH" --squash -m "chore: sync upstream changes from $UPSTREAM_BRANCH"

# Check if pull was successful
if [ $? -eq 0 ]; then
    echo "✅ Successfully pulled upstream changes"
else
    echo "❌ Failed to pull upstream changes. Check for conflicts."
    echo "💡 To revert: git checkout $BACKUP_BRANCH"
    exit 1
fi

# Run conflict detection
echo "🔍 Checking for potential conflicts with your customizations..."
if [ -f "scripts/check-conflicts.js" ]; then
    node scripts/check-conflicts.js
    if [ $? -ne 0 ]; then
        echo "⚠️  Potential conflicts detected. Review the output above."
        echo "💡 To revert: git checkout $BACKUP_BRANCH"
    fi
fi

# Run tests
echo "🧪 Running tests..."
if command -v pnpm &> /dev/null; then
    pnpm test
elif command -v npm &> /dev/null; then
    npm test
else
    echo "⚠️  No package manager found. Skipping tests."
fi

echo "✨ Sync complete!"
echo "📝 Next steps:"
echo "   1. Review the changes: git diff $BACKUP_BRANCH"
echo "   2. Test your application thoroughly"
echo "   3. If issues arise, revert: git checkout $BACKUP_BRANCH"
echo "   4. Delete backup when confident: git branch -d $BACKUP_BRANCH" 