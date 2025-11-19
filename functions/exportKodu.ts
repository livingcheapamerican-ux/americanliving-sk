import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || (user.role !== 'admin' && !user.super_admin)) {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Export všetkých entity schém
        const entities = {
            Dom: await base44.asServiceRole.entities.Dom.schema(),
            Dokument: await base44.asServiceRole.entities.Dokument.schema(),
            Dopyt: await base44.asServiceRole.entities.Dopyt.schema(),
            Referencia: await base44.asServiceRole.entities.Referencia.schema(),
            GoogleDriveAutomation: await base44.asServiceRole.entities.GoogleDriveAutomation.schema(),
            GoogleDriveNotification: await base44.asServiceRole.entities.GoogleDriveNotification.schema(),
            User: await base44.asServiceRole.entities.User.schema()
        };

        // Štatistiky dát
        const stats = {
            domy_count: (await base44.asServiceRole.entities.Dom.list()).length,
            dokumenty_count: (await base44.asServiceRole.entities.Dokument.list()).length,
            dopyty_count: (await base44.asServiceRole.entities.Dopyt.list()).length,
            referencie_count: (await base44.asServiceRole.entities.Referencia.list()).length,
            users_count: (await base44.asServiceRole.entities.User.list()).length
        };

        // Metadata projektu
        const metadata = {
            export_date: new Date().toISOString(),
            exported_by: user.email,
            app_name: "American Living",
            version: "1.0"
        };

        // Zoznam súborov (metadata - pre skutočný kód musíš použiť Dashboard Export)
        const fileStructure = {
            pages: [
                "Domov", "Katalog", "DetailDomu", "Konfigurator", 
                "KonfiguratorProstoHouse", "KonfiguratorTicabhouse",
                "InteraktivnyKonfigurator", "GaleriaRealizacii",
                "AkoToFunguje", "ONas", "Kontakt", "SrovnaniDomu",
                "AdminDokumenty", "AdminAnalyzaDomov", "AdminGoogleDrive",
                "AdminSpravaDomov", "AdminGeneratorObrazkov", "AdminMigraciaObrazkov"
            ],
            components: [
                "Chatbot", "AIAsistent", "PriceCalculator", "FloatingPrice",
                "PriceCalculatorTicabhouse", "GoogleDriveFilesList",
                "GoogleDriveAutomation", "GoogleDriveNotifications",
                "DeepDiagnosticsPanel", "DokumentyTreeView", "NotificationCenter",
                "ProcessMonitor", "konfigurator/KonfiguratorSteps",
                "admin/DocumentTableWithBulkActions", "admin/DetailedAnalysisResults",
                "admin/ImageComparisonView", "admin/AdvancedFilters",
                "admin/AnalysisStatistics", "admin/QualityRating", "admin/AIComparisonTool"
            ],
            functions: [
                "analyzujDokument", "analyzujDomyBatch", "googleDrive",
                "googleDriveMonitor", "googleDriveDiagnostics", "aiAsistent",
                "analyzujVsetkyDokumentyPodrobne", "reorganizujDokumenty",
                "autoAnalyzujNoveDokumenty", "validujDokumenty",
                "stopAllProcesses", "porovnajDokumenty", "exportKodu"
            ],
            layout: "Layout.js"
        };

        const exportData = {
            metadata,
            entities,
            stats,
            fileStructure,
            note: "Pre export samotného kódu súborov použite Dashboard → Settings → Export. Táto funkcia exportuje len entity schémy a metadata projektu."
        };

        return new Response(JSON.stringify(exportData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="american-living-export-${Date.now()}.json"`
            }
        });

    } catch (error) {
        console.error('Export error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});