import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    console.log('[GoogleDriveMonitor] Starting monitoring check...');

    try {
        const base44 = createClientFromRequest(req);
        
        // Get all users with Google Drive access
        const users = await base44.asServiceRole.entities.User.list();
        const usersWithDrive = users.filter(u => u.google_drive_access_token);
        
        console.log('[GoogleDriveMonitor] Checking', usersWithDrive.length, 'users');

        const notifications = [];
        const now = new Date();

        for (const user of usersWithDrive) {
            // Check token expiration
            if (user.google_drive_token_expiry) {
                const expiryDate = new Date(user.google_drive_token_expiry);
                const hoursUntilExpiry = (expiryDate - now) / (1000 * 60 * 60);

                // Notify if token expires in less than 24 hours
                if (hoursUntilExpiry > 0 && hoursUntilExpiry < 24) {
                    console.log('[GoogleDriveMonitor] Token expiring soon for user:', user.email);
                    
                    // Check if notification already exists
                    const existingNotifs = await base44.asServiceRole.entities.GoogleDriveNotification.filter({
                        user_id: user.id,
                        notification_type: 'token_expiration',
                        read: false
                    });

                    if (existingNotifs.length === 0) {
                        notifications.push({
                            user_id: user.id,
                            notification_type: 'token_expiration',
                            severity: 'warning',
                            message: `Váš Google Drive token expiruje o ${Math.round(hoursUntilExpiry)} hodín. Prosím, re-autorizujte pripojenie.`,
                            metadata: { 
                                expiry_date: user.google_drive_token_expiry,
                                hours_until_expiry: hoursUntilExpiry
                            }
                        });
                    }
                }

                // Check if token already expired
                if (expiryDate < now) {
                    console.log('[GoogleDriveMonitor] Token expired for user:', user.email);
                    
                    const existingNotifs = await base44.asServiceRole.entities.GoogleDriveNotification.filter({
                        user_id: user.id,
                        notification_type: 'connection_lost',
                        read: false
                    });

                    if (existingNotifs.length === 0) {
                        notifications.push({
                            user_id: user.id,
                            notification_type: 'connection_lost',
                            severity: 'error',
                            message: 'Pripojenie ku Google Drive vypršalo. Prosím, znovu autorizujte prístup.',
                            metadata: { 
                                expiry_date: user.google_drive_token_expiry
                            }
                        });
                    }
                }
            }

            // Get notification rules for this user
            const notificationRules = await base44.asServiceRole.entities.GoogleDriveAutomation.filter({
                type: 'notification',
                enabled: true,
                created_by: user.email
            });

            // Send email notifications if configured
            for (const rule of notificationRules) {
                if (rule.rule_config.notification_email) {
                    const relevantNotifs = notifications.filter(n => n.user_id === user.id);
                    
                    for (const notif of relevantNotifs) {
                        if (notif.notification_type === rule.rule_config.notification_type) {
                            try {
                                await base44.asServiceRole.integrations.Core.SendEmail({
                                    to: rule.rule_config.notification_email,
                                    subject: `Google Drive: ${notif.notification_type}`,
                                    body: notif.message
                                });
                                console.log('[GoogleDriveMonitor] Email sent to:', rule.rule_config.notification_email);
                            } catch (emailError) {
                                console.error('[GoogleDriveMonitor] Email error:', emailError.message);
                            }
                        }
                    }
                }
            }
        }

        // Create all notifications
        if (notifications.length > 0) {
            console.log('[GoogleDriveMonitor] Creating', notifications.length, 'notifications');
            await base44.asServiceRole.entities.GoogleDriveNotification.bulkCreate(notifications);
        }

        // Check sync schedules
        const syncRules = await base44.asServiceRole.entities.GoogleDriveAutomation.filter({
            type: 'sync_schedule',
            enabled: true
        });

        console.log('[GoogleDriveMonitor] Found', syncRules.length, 'sync schedules');

        for (const rule of syncRules) {
            const shouldRun = checkIfShouldRun(rule, now);
            
            if (shouldRun) {
                console.log('[GoogleDriveMonitor] Executing sync rule:', rule.name);
                
                try {
                    // Update last run
                    await base44.asServiceRole.entities.GoogleDriveAutomation.update(rule.id, {
                        last_run: now.toISOString(),
                        last_run_status: 'success',
                        run_count: (rule.run_count || 0) + 1
                    });

                    // Create success notification
                    const ruleUser = users.find(u => u.email === rule.created_by);
                    if (ruleUser) {
                        await base44.asServiceRole.entities.GoogleDriveNotification.create({
                            user_id: ruleUser.id,
                            notification_type: 'sync_completed',
                            severity: 'success',
                            message: `Synchronizácia "${rule.name}" bola úspešne dokončená.`,
                            metadata: { rule_id: rule.id, rule_name: rule.name }
                        });
                    }
                } catch (syncError) {
                    console.error('[GoogleDriveMonitor] Sync error:', syncError.message);
                    
                    await base44.asServiceRole.entities.GoogleDriveAutomation.update(rule.id, {
                        last_run: now.toISOString(),
                        last_run_status: 'failed',
                        run_count: (rule.run_count || 0) + 1
                    });

                    // Create error notification
                    const ruleUser = users.find(u => u.email === rule.created_by);
                    if (ruleUser) {
                        await base44.asServiceRole.entities.GoogleDriveNotification.create({
                            user_id: ruleUser.id,
                            notification_type: 'sync_failed',
                            severity: 'error',
                            message: `Synchronizácia "${rule.name}" zlyhala: ${syncError.message}`,
                            metadata: { rule_id: rule.id, rule_name: rule.name, error: syncError.message }
                        });
                    }
                }
            }
        }

        console.log('[GoogleDriveMonitor] Monitoring check completed');

        return Response.json({
            success: true,
            users_checked: usersWithDrive.length,
            notifications_created: notifications.length,
            sync_rules_checked: syncRules.length,
            timestamp: now.toISOString()
        });

    } catch (error) {
        console.error('[GoogleDriveMonitor] Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function checkIfShouldRun(rule, now) {
    if (!rule.rule_config.sync_frequency || !rule.rule_config.sync_time) {
        return false;
    }

    const [targetHour, targetMinute] = rule.rule_config.sync_time.split(':').map(Number);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if we're within 5 minutes of target time
    const isTimeMatch = Math.abs(currentHour - targetHour) === 0 && 
                       Math.abs(currentMinute - targetMinute) < 5;

    if (!isTimeMatch) {
        return false;
    }

    // Check frequency
    const lastRun = rule.last_run ? new Date(rule.last_run) : null;
    if (!lastRun) {
        return true; // First run
    }

    const hoursSinceLastRun = (now - lastRun) / (1000 * 60 * 60);

    switch (rule.rule_config.sync_frequency) {
        case 'hourly':
            return hoursSinceLastRun >= 1;
        case 'daily':
            return hoursSinceLastRun >= 24;
        case 'weekly':
            return hoursSinceLastRun >= 168;
        case 'monthly':
            return hoursSinceLastRun >= 720;
        default:
            return false;
    }
}