import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Fetch all Prosto House models
        const domyFiltered = await base44.entities.Dom.filter({ vyrobca: 'Prosto House' });
        
        if (!domyFiltered || domyFiltered.length === 0) {
            return Response.json({ error: 'No Prosto House models found' }, { status: 404 });
        }

        const report = {
            timestamp: new Date().toISOString(),
            total_models: domyFiltered.length,
            validated: 0,
            errors: [],
            warnings: [],
            summary: {
                models_with_valid_pricing: 0,
                models_with_errors: 0,
                models_with_warnings: 0,
                total_issues: 0
            }
        };

        // Validate each model
        for (const dom of domyFiltered) {
            const modelReport = {
                model_name: dom.nazov,
                model_id: dom.id,
                issues: [],
                status: 'valid'
            };

            // Check if custom prices exist
            if (!dom.konfigurator_custom_ceny_prosto_house || Object.keys(dom.konfigurator_custom_ceny_prosto_house).length === 0) {
                modelReport.issues.push({
                    type: 'error',
                    message: 'No custom prices defined in konfigurator_custom_ceny_prosto_house',
                    severity: 'critical'
                });
                modelReport.status = 'error';
            } else {
                // Validate all prices are numbers and non-negative
                const prices = dom.konfigurator_custom_ceny_prosto_house;
                for (const [key, price] of Object.entries(prices)) {
                    if (typeof price !== 'number') {
                        modelReport.issues.push({
                            type: 'error',
                            message: `Price for "${key}" is not a number (got ${typeof price})`,
                            key,
                            value: price
                        });
                        modelReport.status = 'error';
                    }
                    if (price < 0) {
                        modelReport.issues.push({
                            type: 'warning',
                            message: `Price for "${key}" is negative (${price})`,
                            key,
                            value: price
                        });
                        if (modelReport.status !== 'error') modelReport.status = 'warning';
                    }
                    if (price === 0) {
                        modelReport.issues.push({
                            type: 'warning',
                            message: `Price for "${key}" is zero`,
                            key
                        });
                        if (modelReport.status !== 'error') modelReport.status = 'warning';
                    }
                }
            }

            // Check base price consistency
            if (!dom.zakladna_cena || dom.zakladna_cena <= 0) {
                modelReport.issues.push({
                    type: 'warning',
                    message: 'Base price (zakladna_cena) is missing or invalid',
                    value: dom.zakladna_cena
                });
                if (modelReport.status !== 'error') modelReport.status = 'warning';
            }

            // Add to report
            if (modelReport.issues.length > 0) {
                if (modelReport.status === 'error') {
                    report.summary.models_with_errors++;
                    report.errors.push(modelReport);
                } else {
                    report.summary.models_with_warnings++;
                    report.warnings.push(modelReport);
                }
                report.summary.total_issues += modelReport.issues.length;
            } else {
                report.summary.models_with_valid_pricing++;
            }

            report.validated++;
        }

        // Calculate final validation status
        const validationStatus = report.summary.models_with_errors === 0 
            ? (report.summary.models_with_warnings === 0 ? 'ALL_VALID' : 'WARNINGS_PRESENT')
            : 'ERRORS_FOUND';

        return Response.json({
            status: validationStatus,
            report
        });

    } catch (error) {
        console.error('Validation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});