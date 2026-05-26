¡/**
 * Database Trigger: CRM Sync for Konfiga Configuration
 * 
 * Trigger Event: ON UPDATE of 'Konfiga_Configuration' entity
 * 
 * Logic:
 * 1. Checks if 'status' field changed to 'accepted'.
 * 2. If yes, retrieves parent 'Project' ID.
 * 3. Updates Project entity:
 *    - value: configuration.total_price
 *    - status: 'active'
 */

// Simulated Base44 Trigger Context
async function onConfigurationUpdate(event, context) {
    const { entities } = context;
    const { previous, current } = event; // 'previous' and 'current' states of the entity

    // 1. Check for Status Change to 'accepted'
    if (previous.status !== 'accepted' && current.status === 'accepted') {
        console.log(`Configuration ${current.id} accepted. Syncing to Project...`);

        const projectId = current.project_id;
        if (!projectId) {
            console.error("No project_id found in configuration.");
            return;
        }

        try {
            // 2. Update Parent Project
            await entities.Project.update(projectId, {
                value: current.total_price || 0,
                status: 'active',
                updated_date: new Date().toISOString()
            });

            console.log(`Project ${projectId} updated: Status=active, Value=${current.total_price}`);

        } catch (error) {
            console.error(`Failed to sync Project ${projectId}:`, error);
            throw error;
        }
    } else {
        console.log("No sync required. Status change not relevant.");
    }
}

module.exports = onConfigurationUpdate;
¡*cascade082`file:///Users/richardkovac/Documents/Konfiga_ARES_Extension/serverless_logic/crm_sync_trigger.js