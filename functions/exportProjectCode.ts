import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || (user.role !== 'admin' && !user.super_admin)) {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Entity schemas
        const entityNames = ["Dom", "Dokument", "Dopyt", "Referencia", "GoogleDriveAutomation", "GoogleDriveNotification"];
        const entities = {};
        
        for (const entityName of entityNames) {
            try {
                const schema = await base44.asServiceRole.entities[entityName].schema();
                entities[entityName] = schema;
            } catch (error) {
                entities[entityName] = { error: error.message };
            }
        }

        // Project structure
        const projectExport = {
            metadata: {
                appName: "American Living",
                description: "Komplexná aplikácia pre predaj modulárnych domov",
                exportDate: new Date().toISOString(),
                exportedBy: user.email,
                platform: "Base44"
            },
            entities: entities,
            structure: {
                pages: [
                    "Domov", "Katalog", "DetailDomu", "Konfigurator", "KonfiguratorProstoHouse",
                    "KonfiguratorTicabhouse", "InteraktivnyKonfigurator", "GaleriaRealizacii",
                    "ONas", "Kontakt", "AkoToFunguje", "SrovnaniDomu",
                    "AdminDokumenty", "AdminAnalyzaDomov", "AdminSpravaDomov", 
                    "AdminGoogleDrive", "AdminGeneratorObrazkov", "AdminMigraciaObrazkov"
                ],
                components: [
                    "Chatbot", "AIAsistent", "PriceCalculator", "FloatingPrice", 
                    "PriceCalculatorTicabhouse", "GoogleDriveFilesList", "GoogleDriveAutomation",
                    "GoogleDriveNotifications", "DeepDiagnosticsPanel", "DokumentyTreeView",
                    "NotificationCenter", "ProcessMonitor", "konfigurator/KonfiguratorSteps",
                    "admin/DocumentTableWithBulkActions", "admin/DetailedAnalysisResults",
                    "admin/ImageComparisonView", "admin/AdvancedFilters", 
                    "admin/AnalysisStatistics", "admin/QualityRating", "admin/AIComparisonTool"
                ],
                functions: [
                    "analyzujDokument", "analyzujDomyBatch", "googleDrive", "googleDriveMonitor",
                    "googleDriveDiagnostics", "aiAsistent", "analyzujVsetkyDokumentyPodrobne",
                    "reorganizujDokumenty", "autoAnalyzujNoveDokumenty", "validujDokumenty",
                    "stopAllProcesses", "porovnajDokumenty", "exportProjectCode"
                ],
                layout: "Layout.js"
            },
            statistics: {
                totalPages: 18,
                totalComponents: 21,
                totalFunctions: 14,
                totalEntities: 7
            }
        };

        return Response.json(projectExport, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': 'attachment; filename="american-living-export.json"'
            }
        });

    } catch (error) {
        console.error('Export error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});