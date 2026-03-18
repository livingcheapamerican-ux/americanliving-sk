import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { OAuth2Client } from 'npm:google-auth-library@9.6.3';
import { google } from 'npm:googleapis@134.0.0';

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const BASE44_APP_ID = Deno.env.get("BASE44_APP_ID");

Deno.serve(async (req) => {
    const url = new URL(req.url);
    
    console.log('=== DEEP DIAGNOSTICS START ===');
    
    const diagnostics = {
        timestamp: new Date().toISOString(),
        tests: {},
        summary: {
            total: 0,
            passed: 0,
            failed: 0,
            warnings: 0
        }
    };

    // Test 1: Environment Variables
    diagnostics.tests.environmentVariables = await testEnvironmentVariables();
    
    // Test 2: URL Construction
    diagnostics.tests.urlConstruction = testUrlConstruction(url);
    
    // Test 3: User Authentication
    try {
        const base44 = createClientFromRequest(req);
        diagnostics.tests.userAuth = await testUserAuthentication(base44);
        
        // Test 4: Token Status
        if (diagnostics.tests.userAuth.passed) {
            diagnostics.tests.tokenStatus = await testTokenStatus(diagnostics.tests.userAuth.user);
        }
        
        // Test 5: OAuth Client Configuration
        diagnostics.tests.oauthClient = testOAuthClientConfig();
        
        // Test 6: Google API Connectivity
        if (diagnostics.tests.userAuth.user?.google_drive_access_token) {
            diagnostics.tests.googleApiConnectivity = await testGoogleApiConnectivity(
                diagnostics.tests.userAuth.user
            );
        }
        
        // Test 7: Function Endpoints
        diagnostics.tests.functionEndpoints = await testFunctionEndpoints(url);
        
        // Test 8: Database Queries
        diagnostics.tests.databaseQueries = await testDatabaseQueries(base44);
        
        // Test 9: Token Refresh Capability
        if (diagnostics.tests.userAuth.user?.google_drive_refresh_token) {
            diagnostics.tests.tokenRefresh = await testTokenRefresh(
                diagnostics.tests.userAuth.user
            );
        }
        
        // Test 10: Callback URL Validation
        diagnostics.tests.callbackValidation = testCallbackUrlValidation(url);
        
    } catch (error) {
        diagnostics.tests.criticalError = {
            passed: false,
            error: error.message,
            stack: error.stack
        };
    }

    // Calculate summary
    for (const [testName, testResult] of Object.entries(diagnostics.tests)) {
        diagnostics.summary.total++;
        if (testResult.passed) {
            diagnostics.summary.passed++;
        } else if (testResult.warning) {
            diagnostics.summary.warnings++;
        } else {
            diagnostics.summary.failed++;
        }
    }

    // Generate recommendations
    diagnostics.recommendations = generateRecommendations(diagnostics.tests);
    
    console.log('=== DEEP DIAGNOSTICS END ===');
    console.log('Summary:', diagnostics.summary);
    
    return Response.json(diagnostics, {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        }
    });
});

async function testEnvironmentVariables() {
    const test = {
        name: 'Environment Variables',
        passed: true,
        details: {},
        issues: []
    };

    test.details.GOOGLE_CLIENT_ID = {
        exists: !!GOOGLE_CLIENT_ID,
        length: GOOGLE_CLIENT_ID?.length || 0,
        format: GOOGLE_CLIENT_ID?.includes('.apps.googleusercontent.com') ? 'valid' : 'invalid'
    };

    test.details.GOOGLE_CLIENT_SECRET = {
        exists: !!GOOGLE_CLIENT_SECRET,
        length: GOOGLE_CLIENT_SECRET?.length || 0
    };

    test.details.BASE44_APP_ID = {
        exists: !!BASE44_APP_ID,
        value: BASE44_APP_ID
    };

    if (!GOOGLE_CLIENT_ID) {
        test.passed = false;
        test.issues.push('GOOGLE_CLIENT_ID nie je nastavené');
    }

    if (!GOOGLE_CLIENT_SECRET) {
        test.passed = false;
        test.issues.push('GOOGLE_CLIENT_SECRET nie je nastavené');
    }

    if (GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com')) {
        test.passed = false;
        test.issues.push('GOOGLE_CLIENT_ID má nesprávny formát');
    }

    return test;
}

function testUrlConstruction(url) {
    const test = {
        name: 'URL Construction',
        passed: true,
        details: {},
        issues: []
    };

    const origin = url.origin;
    const pathname = url.pathname;
    const isPreview = pathname.includes('/preview/');
    
    const basePath = pathname.split('/preview/')[0];
    const functionPath = `${basePath}/functions/googleDrive`;
    const callbackUrl = `${origin}${functionPath}?action=callback`;

    test.details = {
        origin,
        pathname,
        isPreview,
        basePath,
        functionPath,
        callbackUrl,
        protocol: url.protocol,
        host: url.host
    };

    if (url.protocol !== 'https:' && !url.hostname.includes('localhost')) {
        test.warning = true;
        test.issues.push('Nepoužíva sa HTTPS (povinné pre OAuth)');
    }

    if (isPreview) {
        test.warning = true;
        test.issues.push('Preview režim môže spôsobiť problémy s OAuth callback');
    }

    return test;
}

async function testUserAuthentication(base44) {
    const test = {
        name: 'User Authentication',
        passed: false,
        details: {},
        issues: []
    };

    try {
        const user = await base44.auth.me();
        
        if (!user) {
            test.issues.push('Používateľ nie je prihlásený');
            return test;
        }

        test.passed = true;
        test.user = user;
        test.details = {
            userId: user.id,
            email: user.email,
            role: user.role,
            hasAccessToken: !!user.google_drive_access_token,
            hasRefreshToken: !!user.google_drive_refresh_token,
            tokenExpiry: user.google_drive_token_expiry
        };

    } catch (error) {
        test.issues.push(`Auth error: ${error.message}`);
    }

    return test;
}

async function testTokenStatus(user) {
    const test = {
        name: 'Token Status',
        passed: true,
        details: {},
        issues: []
    };

    if (!user.google_drive_access_token) {
        test.passed = false;
        test.issues.push('Access token chýba');
    } else {
        test.details.accessToken = {
            exists: true,
            length: user.google_drive_access_token.length,
            preview: user.google_drive_access_token.substring(0, 20) + '...'
        };
    }

    if (!user.google_drive_refresh_token) {
        test.warning = true;
        test.issues.push('Refresh token chýba - token sa nedá obnoviť');
    } else {
        test.details.refreshToken = {
            exists: true,
            length: user.google_drive_refresh_token.length,
            preview: user.google_drive_refresh_token.substring(0, 20) + '...'
        };
    }

    if (user.google_drive_token_expiry) {
        const expiryDate = new Date(user.google_drive_token_expiry);
        const now = new Date();
        const isExpired = expiryDate < now;
        const hoursUntilExpiry = (expiryDate - now) / (1000 * 60 * 60);

        test.details.expiry = {
            date: expiryDate.toISOString(),
            isExpired,
            hoursUntilExpiry: hoursUntilExpiry.toFixed(2),
            daysUntilExpiry: (hoursUntilExpiry / 24).toFixed(2)
        };

        if (isExpired) {
            test.passed = false;
            test.issues.push('Token expiroval');
        } else if (hoursUntilExpiry < 1) {
            test.warning = true;
            test.issues.push(`Token expiruje o ${hoursUntilExpiry.toFixed(0)} minút`);
        }
    } else {
        test.warning = true;
        test.issues.push('Token expiry nie je nastavená');
    }

    return test;
}

function testOAuthClientConfig() {
    const test = {
        name: 'OAuth Client Configuration',
        passed: true,
        details: {},
        issues: []
    };

    try {
        const oauth2Client = new OAuth2Client(
            GOOGLE_CLIENT_ID, 
            GOOGLE_CLIENT_SECRET, 
            'http://localhost:3000/callback' // dummy for test
        );

        test.details.clientCreated = true;
        test.details.hasClientId = !!oauth2Client.clientId;
        test.details.hasClientSecret = !!oauth2Client.clientSecret;

    } catch (error) {
        test.passed = false;
        test.issues.push(`OAuth client error: ${error.message}`);
    }

    return test;
}

async function testGoogleApiConnectivity(user) {
    const test = {
        name: 'Google API Connectivity',
        passed: false,
        details: {
            tests: {}
        },
        issues: []
    };

    try {
        const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
        oauth2Client.setCredentials({
            access_token: user.google_drive_access_token,
            refresh_token: user.google_drive_refresh_token,
            expiry_date: user.google_drive_token_expiry,
        });

        // Test 1: Get user info
        try {
            const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
            const userInfo = await oauth2.userinfo.get();
            test.details.tests.userInfo = {
                passed: true,
                email: userInfo.data.email,
                verified: userInfo.data.verified_email
            };
        } catch (error) {
            test.details.tests.userInfo = {
                passed: false,
                error: error.message
            };
            test.issues.push(`User info error: ${error.message}`);
        }

        // Test 2: List files (simple test)
        try {
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            const response = await drive.files.list({
                pageSize: 1,
                fields: 'files(id, name)'
            });
            test.details.tests.listFiles = {
                passed: true,
                fileCount: response.data.files?.length || 0
            };
            test.passed = true;
        } catch (error) {
            test.details.tests.listFiles = {
                passed: false,
                error: error.message,
                code: error.code
            };
            test.issues.push(`List files error: ${error.message}`);
        }

        // Test 3: About (get drive info)
        try {
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            const about = await drive.about.get({ fields: 'user, storageQuota' });
            test.details.tests.driveInfo = {
                passed: true,
                user: about.data.user?.emailAddress,
                storageUsed: about.data.storageQuota?.usage,
                storageLimit: about.data.storageQuota?.limit
            };
        } catch (error) {
            test.details.tests.driveInfo = {
                passed: false,
                error: error.message
            };
        }

    } catch (error) {
        test.issues.push(`Google API error: ${error.message}`);
    }

    return test;
}

async function testFunctionEndpoints(url) {
    const test = {
        name: 'Function Endpoints',
        passed: true,
        details: {
            endpoints: {}
        },
        issues: []
    };

    const origin = url.origin;
    const basePath = url.pathname.split('/preview/')[0];
    const functionPath = `${basePath}/functions/googleDrive`;
    const fullUrl = `${origin}${functionPath}`;

    // Test main endpoint
    try {
        const response = await fetch(fullUrl, { method: 'GET' });
        test.details.endpoints.main = {
            url: fullUrl,
            accessible: response.ok || response.status === 400, // 400 is ok (missing action param)
            status: response.status,
            statusText: response.statusText
        };
    } catch (error) {
        test.passed = false;
        test.details.endpoints.main = {
            url: fullUrl,
            accessible: false,
            error: error.message
        };
        test.issues.push(`Main endpoint not accessible: ${error.message}`);
    }

    // Test callback endpoint
    const callbackUrl = `${fullUrl}?action=callback`;
    try {
        const response = await fetch(callbackUrl, { method: 'GET' });
        test.details.endpoints.callback = {
            url: callbackUrl,
            accessible: true,
            status: response.status,
            statusText: response.statusText
        };
    } catch (error) {
        test.details.endpoints.callback = {
            url: callbackUrl,
            accessible: false,
            error: error.message
        };
    }

    return test;
}

async function testDatabaseQueries(base44) {
    const test = {
        name: 'Database Queries',
        passed: true,
        details: {
            queries: {}
        },
        issues: []
    };

    // Test user query
    try {
        const users = await base44.asServiceRole.entities.User.list();
        test.details.queries.users = {
            passed: true,
            count: users.length,
            withDriveTokens: users.filter(u => u.google_drive_access_token).length
        };
    } catch (error) {
        test.passed = false;
        test.details.queries.users = {
            passed: false,
            error: error.message
        };
        test.issues.push(`User query error: ${error.message}`);
    }

    // Test automations query
    try {
        const automations = await base44.asServiceRole.entities.GoogleDriveAutomation.list();
        test.details.queries.automations = {
            passed: true,
            count: automations.length,
            enabled: automations.filter(a => a.enabled).length
        };
    } catch (error) {
        test.details.queries.automations = {
            passed: false,
            error: error.message
        };
    }

    // Test notifications query
    try {
        const notifications = await base44.asServiceRole.entities.GoogleDriveNotification.list();
        test.details.queries.notifications = {
            passed: true,
            count: notifications.length,
            unread: notifications.filter(n => !n.read).length
        };
    } catch (error) {
        test.details.queries.notifications = {
            passed: false,
            error: error.message
        };
    }

    return test;
}

async function testTokenRefresh(user) {
    const test = {
        name: 'Token Refresh Capability',
        passed: false,
        details: {},
        issues: []
    };

    try {
        const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
        oauth2Client.setCredentials({
            access_token: user.google_drive_access_token,
            refresh_token: user.google_drive_refresh_token,
            expiry_date: user.google_drive_token_expiry,
        });

        const { credentials } = await oauth2Client.refreshAccessToken();
        
        test.passed = true;
        test.details = {
            newAccessToken: credentials.access_token ? 'Generated' : 'Failed',
            newTokenLength: credentials.access_token?.length || 0,
            newExpiry: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null,
            refreshTokenPreserved: !!credentials.refresh_token
        };

    } catch (error) {
        test.issues.push(`Token refresh failed: ${error.message}`);
        test.details.error = error.message;
        test.details.errorCode = error.code;
    }

    return test;
}

function testCallbackUrlValidation(url) {
    const test = {
        name: 'Callback URL Validation',
        passed: true,
        details: {},
        issues: []
    };

    const origin = url.origin;
    const basePath = url.pathname.split('/preview/')[0];
    const functionPath = `${basePath}/functions/googleDrive`;
    const callbackUrl = `${origin}${functionPath}?action=callback`;

    test.details.constructedUrl = callbackUrl;
    test.details.urlComponents = {
        protocol: url.protocol,
        host: url.host,
        basePath,
        functionPath,
        hasPreview: url.pathname.includes('/preview/')
    };

    // Validation rules
    const rules = {
        httpsRequired: url.protocol === 'https:' || url.hostname.includes('localhost'),
        noSpaces: !callbackUrl.includes(' '),
        noDoubleSlashes: !callbackUrl.includes('//functions'),
        validFormat: callbackUrl.match(/^https?:\/\/[^\/]+\/.*\/functions\/googleDrive\?action=callback$/) !== null
    };

    test.details.validationRules = rules;

    if (!rules.httpsRequired) {
        test.passed = false;
        test.issues.push('HTTPS je povinné pre OAuth (okrem localhost)');
    }

    if (!rules.noSpaces) {
        test.passed = false;
        test.issues.push('URL obsahuje medzery');
    }

    if (!rules.noDoubleSlashes) {
        test.warning = true;
        test.issues.push('URL môže obsahovať duplicitné lomítka');
    }

    if (!rules.validFormat) {
        test.warning = true;
        test.issues.push('URL formát sa nezhoduje s očakávaným vzorom');
    }

    // Check if URL matches Google Console requirements
    test.details.googleConsoleRequirements = {
        exactMatch: 'URL musí presne zodpovedať tomu, čo je v Google Console',
        caseSensitive: 'URL je case-sensitive',
        trailingSlash: 'Nesmie mať trailing slash pred ?action=callback',
        parameters: 'Parametre musia byť presne ?action=callback'
    };

    return test;
}

function generateRecommendations(tests) {
    const recommendations = [];

    // Check environment variables
    if (tests.environmentVariables && !tests.environmentVariables.passed) {
        recommendations.push({
            priority: 'CRITICAL',
            issue: 'Environment variables nie sú správne nastavené',
            action: 'Nastavte GOOGLE_CLIENT_ID a GOOGLE_CLIENT_SECRET v Dashboard → Settings → Environment Variables',
            documentation: 'https://console.cloud.google.com/apis/credentials'
        });
    }

    // Check tokens
    if (tests.tokenStatus && !tests.tokenStatus.passed) {
        recommendations.push({
            priority: 'HIGH',
            issue: 'Google Drive tokeny sú neplatné alebo expirované',
            action: 'Kliknite na "Autorizovať" pre obnovenie pripojenia',
            note: 'Po autorizácii skontrolujte, či sa tokeny správne uložili'
        });
    }

    // Check callback URL
    if (tests.callbackValidation && tests.callbackValidation.issues.length > 0) {
        recommendations.push({
            priority: 'HIGH',
            issue: 'Callback URL má problémy',
            action: 'Overte, že URL v Google Console presne zodpovedá: ' + tests.callbackValidation.details.constructedUrl,
            documentation: 'OAuth 2.0 redirect URIs musia byť identické'
        });
    }

    // Check API connectivity
    if (tests.googleApiConnectivity && !tests.googleApiConnectivity.passed) {
        recommendations.push({
            priority: 'HIGH',
            issue: 'Google API nie je dostupné s aktuálnymi tokenmi',
            action: 'Skúste re-autorizovať alebo skontrolujte Google Cloud Console API permissions',
            documentation: 'Overte, že Google Drive API je povolené v projekte'
        });
    }

    // Check token refresh
    if (tests.tokenRefresh && !tests.tokenRefresh.passed) {
        recommendations.push({
            priority: 'MEDIUM',
            issue: 'Token refresh nefunguje',
            action: 'Pri autorizácii uistite sa, že požadujete "offline access" (prompt=consent)',
            note: 'Refresh token sa dáva len pri prvej autorizácii alebo s prompt=consent'
        });
    }

    // Preview mode warning
    if (tests.urlConstruction?.details?.isPreview) {
        recommendations.push({
            priority: 'LOW',
            issue: 'Používate preview režim',
            action: 'Pre produkčné použitie použite štandardnú URL bez /preview/',
            note: 'Preview URL sa môže zmeniť, čo by vyžadovalo update v Google Console'
        });
    }

    // General recommendations
    if (recommendations.length === 0) {
        recommendations.push({
            priority: 'INFO',
            issue: 'Všetky testy prešli úspešne',
            action: 'Integrácia je správne nakonfigurovaná a funguje',
            note: 'Pravidelne kontrolujte expiráciu tokenov'
        });
    }

    return recommendations;
}