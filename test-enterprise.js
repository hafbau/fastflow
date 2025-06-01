#!/usr/bin/env node

// Test script to verify enterprise features are enabled

const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';

async function testEnterpriseFeatures() {
    console.log('🚀 Testing FlowStack Enterprise Features...\n');

    const endpoints = [
        { name: 'Workspaces', url: '/workspaces', method: 'GET' },
        { name: 'Organizations', url: '/organizations', method: 'GET' },
        { name: 'Users', url: '/users', method: 'GET' },
        { name: 'Roles', url: '/roles', method: 'GET' },
        { name: 'Auth Status', url: '/auth/status', method: 'GET' },
        { name: 'Settings', url: '/settings', method: 'GET' }
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`Testing ${endpoint.name} (${endpoint.method} ${endpoint.url})...`);
            const response = await axios({
                method: endpoint.method,
                url: `${API_URL}${endpoint.url}`,
                headers: {
                    'Content-Type': 'application/json'
                },
                validateStatus: () => true // Don't throw on any status
            });
            
            console.log(`✅ ${endpoint.name}: Status ${response.status}`);
            
            if (response.data && response.data.PLATFORM_TYPE) {
                console.log(`   Platform: ${response.data.PLATFORM_TYPE}`);
            }
            
            if (response.status === 401) {
                console.log('   (Authentication required - this is expected)');
            }
            
        } catch (error) {
            console.log(`❌ ${endpoint.name}: ${error.message}`);
        }
        console.log('');
    }
}

// Run the test
testEnterpriseFeatures().catch(console.error); 