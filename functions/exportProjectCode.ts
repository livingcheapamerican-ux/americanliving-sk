import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || (user.role !== 'admin' && !user.super_admin)) {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Zoznam všetkých súborov v projekte
        const projectStructure = {
            entities: {},
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
                "NotificationCenter", "ProcessMonitor",
                "konfigurator/KonfiguratorSteps",
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
            layout: "Layout.js",
            exportDate: new Date().toISOString()
        };

        // Exportuj entity schemas
        const entityNames = ["Dom", "Dokument", "Dopyt", "Referencia", "GoogleDriveAutomation", "GoogleDriveNotification"];
        
        for (const entityName of entityNames) {
            try {
                const schema = await base44.asServiceRole.entities[entityName].schema();
                projectStructure.entities[entityName] = schema;
            } catch (error) {
                console.error(`Failed to get schema for ${entityName}:`, error);
                projectStructure.entities[entityName] = { error: error.message };
            }
        }

        // Pridaj User entity info (bez schema lebo je built-in)
        projectStructure.entities.User = {
            builtIn: true,
            customAttributes: ["super_admin", "house_analysis_batch_state", "google_drive_tokens"],
            note: "Built-in entity with custom attributes"
        };

        // Metadata
        projectStructure.metadata = {
            appName: "American Living",
            description: "Komplexná aplikácia pre predaj modulárnych domov",
            version: "1.0",
            totalFiles: projectStructure.pages.length + projectStructure.components.length + projectStructure.functions.length + 1,
            platform: "Base44",
            exportedBy: user.email
        };

        return Response.json({
            success: true,
            project: projectStructure,
            note: "Pre kompletný kód všetkých súborov použite Dashboard → Settings → Export Project, alebo API pre jednotlivé súbory"
        }, {
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