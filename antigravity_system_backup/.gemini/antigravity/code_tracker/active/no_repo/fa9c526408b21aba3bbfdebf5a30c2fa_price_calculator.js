‰/**
 * Serverless Function: Price Calculator for Konfiga Configuration
 * 
 * Logic:
 * 1. Receives a Konfiga_Configuration object.
 * 2. Iterates through 'items' array.
 * 3. Calculates sum: quantity * unit_price.
 * 4. Applies 'discount_percentage' (if any).
 * 5. Updates 'total_price' in the configuration.
 */

// Simulated Base44 SDK interaction
// In a real Base44 environment, 'entry' would be the entity trigger payload or passed directly.

async function calculateConfigurationPrice(configurationId, context) {
    const { entities } = context; // Assuming context provides access to SDK/Entities
    
    try {
        // 1. Fetch current configuration (if not passed fully in payload)
        const config = await entities.Konfiga_Configuration.get(configurationId);
        
        if (!config || !config.items || !Array.isArray(config.items)) {
            console.log("Invalid configuration or no items found.");
            return;
        }

        // 2. Calculate Subtotal
        let subtotal = 0;
        config.items.forEach(item => {
            const quantity = item.quantity || 0;
            const price = item.unit_price || 0;
            subtotal += (quantity * price);
        });

        // 3. Apply Discount
        const discountPercent = config.discount_percentage || 0;
        const discountAmount = subtotal * (discountPercent / 100);
        const totalPrice = subtotal - discountAmount;

        // 4. Update Configuration
        await entities.Konfiga_Configuration.update(configurationId, {
            total_price: parseFloat(totalPrice.toFixed(2)), // Ensure 2 decimal precision
            updated_date: new Date().toISOString()
        });

        console.log(`Updated configuration ${configurationId}: Subtotal=${subtotal}, Discount=${discountPercent}%, Total=${totalPrice}`);
        return totalPrice;

    } catch (error) {
        console.error("Error calculating price:", error);
        throw error;
    }
}

// Export for usage in Base44 FaaS environment
module.exports = calculateConfigurationPrice;
‰*cascade082`file:///Users/richardkovac/Documents/Konfiga_ARES_Extension/serverless_logic/price_calculator.js