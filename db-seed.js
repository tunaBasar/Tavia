const CITIES = ['ISTANBUL', 'ANKARA', 'IZMIR', 'BURSA', 'ANTALYA', 'ADANA', 'KONYA', 'SANLIURFA', 'GAZIANTEP', 'KOCAELI', 'ESKISEHIR', 'ISPARTA'];
const MACHINE_TYPES = ['BREWER', 'FETCHER', 'CLEANER'];
const BASE_URL = 'http://localhost:8080/api/v1';

async function seed() {
    console.log("Starting Tavia V2 DB Seeding...");
    
    let tenantIds = [];

    // YENİ ADIM: Önce veritabanında halihazırda var olan tenantları çek
    try {
        console.log("Checking for existing tenants...");
        const getRes = await fetch(`${BASE_URL}/tenants`);
        if (getRes.ok) {
            const resJson = await getRes.json();
            if (resJson.success && resJson.data && resJson.data.length > 0) {
                // Var olan tenantların ID'lerini listeye ekle
                tenantIds = resJson.data.map(t => t.id);
                console.log(`Found ${tenantIds.length} existing tenants. Skipping creation step.`);
            }
        }
    } catch (err) {
        console.log("Could not fetch existing tenants, will attempt to create them.");
    }

    // 1. Create 10 Tenants (Sadece içeride hiç tenant yoksa çalışır)
    if (tenantIds.length === 0) {
        console.log("No existing tenants found. Creating new ones...");
        for (let i = 1; i <= 10; i++) {
            const city = CITIES[i % CITIES.length];
            const res = await fetch(`${BASE_URL}/tenants/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `Tenant ${i}`,
                    city: city,
                    username: `tenant${i}`,
                    password: `password123`,
                    subscriptionPlan: 'PRO'
                })
            });
            
            try {
                const data = await res.json();
                if (res.ok && data.success && data.data && data.data.id) {
                    tenantIds.push(data.data.id);
                    console.log(`Created Tenant ${i} - ID: ${data.data.id}`);
                } else {
                    console.error(`Failed to create Tenant ${i}:`, data);
                }
            } catch (err) {
                console.error(`Failed to parse Tenant ${i} response:`, err);
            }
        }
    }

    if (tenantIds.length === 0) {
        console.error("No tenants found or created. Gateway might be down or DB unavailable. Aborting.");
        return;
    }

    console.log("Proceeding to seed Customers, Machines, Inventory, and Products...");

    // 2. Create 50 Bound Customers
    for (let i = 1; i <= 50; i++) {
        const tenantId = tenantIds[i % tenantIds.length];
        const city = CITIES[i % CITIES.length];
        const res = await fetch(`${BASE_URL}/crm/customers`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Tenant-ID': tenantId
            },
            body: JSON.stringify({
                name: `Bound Customer ${i}`,
                email: `bound${i}@tavia.local`,
                city: city
            })
        });
        if (res.ok) console.log(`Created Bound Customer ${i} for Tenant ID: ${tenantId}`);
    }

    // 3. Create 50 Global Customers
    for (let i = 1; i <= 50; i++) {
        const city = CITIES[i % CITIES.length];
        const res = await fetch(`${BASE_URL}/crm/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: `Global Customer ${i}`,
                email: `global${i}@tavia.local`,
                password: `password123`,
                city: city
            })
        });
        if (res.ok) console.log(`Created Global Customer ${i}`);
    }

    // 4. Create Machines & Inventory Limits for each tenant
    for (let i = 0; i < tenantIds.length; i++) {
        const tenantId = tenantIds[i];

        // Machines
        for (let j = 0; j < MACHINE_TYPES.length; j++) {
            const type = MACHINE_TYPES[j];
            const hexI = i.toString(16).padStart(2, '0');
            const hexJ = j.toString(16).padStart(2, '0');
            const res = await fetch(`${BASE_URL}/iot/machines`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenantId },
                body: JSON.stringify({
                    name: `${type} Machine - Tenant ${i+1}`,
                    macAddress: `00:11:22:33:${hexI}:${hexJ}`,
                    machineType: type
                })
            });
            if (res.ok) console.log(`Created ${type} Machine for Tenant ID: ${tenantId}`);
        }

        // Inventory Limits
        const inventoryItems = [
            { name: "Coffee Beans", unit: "GRAM", stockQuantity: 10000 },
            { name: "Milk", unit: "MILLILITER", stockQuantity: 10000 },
            { name: "Water", unit: "MILLILITER", stockQuantity: 20000 },
            { name: "Cups", unit: "PIECE", stockQuantity: 500 }
        ];

        for (const item of inventoryItems) {
            const res = await fetch(`${BASE_URL}/inventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenantId },
                body: JSON.stringify(item)
            });
            if (res.ok) console.log(`Added Inventory ${item.name} for Tenant ID: ${tenantId}`);
        }
    }

    // 5. Create Recipes (Products) for each tenant
    const recipes = [
        { productName: "LATTE", displayName: "Latte", category: "ESPRESSO_BASED", description: "Classic espresso with steamed milk", active: true, ingredients: [ { rawMaterialName: "Coffee Beans", quantity: 18, unit: "GRAM" }, { rawMaterialName: "Milk", quantity: 200, unit: "MILLILITER" }, { rawMaterialName: "Water", quantity: 40, unit: "MILLILITER" }, { rawMaterialName: "Cups", quantity: 1, unit: "PIECE" } ] },
        { productName: "AMERICANO", displayName: "Americano", category: "ESPRESSO_BASED", description: "Espresso diluted with hot water", active: true, ingredients: [ { rawMaterialName: "Coffee Beans", quantity: 18, unit: "GRAM" }, { rawMaterialName: "Water", quantity: 200, unit: "MILLILITER" }, { rawMaterialName: "Cups", quantity: 1, unit: "PIECE" } ] },
        { productName: "CAPPUCCINO", displayName: "Cappuccino", category: "ESPRESSO_BASED", description: "Equal parts espresso, steamed milk, and foam", active: true, ingredients: [ { rawMaterialName: "Coffee Beans", quantity: 18, unit: "GRAM" }, { rawMaterialName: "Milk", quantity: 150, unit: "MILLILITER" }, { rawMaterialName: "Water", quantity: 40, unit: "MILLILITER" }, { rawMaterialName: "Cups", quantity: 1, unit: "PIECE" } ] },
        { productName: "TURKISH_TEA", displayName: "Turkish Tea", category: "TEA", description: "Traditional double-brewed black tea", active: true, ingredients: [ { rawMaterialName: "Water", quantity: 200, unit: "MILLILITER" }, { rawMaterialName: "Cups", quantity: 1, unit: "PIECE" } ] },
        { productName: "ICED_COFFEE", displayName: "Iced Coffee", category: "COLD_BEVERAGE", description: "Chilled espresso served over ice with milk", active: true, ingredients: [ { rawMaterialName: "Coffee Beans", quantity: 18, unit: "GRAM" }, { rawMaterialName: "Milk", quantity: 100, unit: "MILLILITER" }, { rawMaterialName: "Water", quantity: 100, unit: "MILLILITER" }, { rawMaterialName: "Cups", quantity: 1, unit: "PIECE" } ] }
    ];

    for (let i = 0; i < tenantIds.length; i++) {
        const tenantId = tenantIds[i];
        for (const recipe of recipes) {
            const res = await fetch(`${BASE_URL}/catalog/recipes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenantId },
                body: JSON.stringify(recipe)
            });
            if (res.ok) console.log(`Created Recipe ${recipe.displayName} for Tenant ID: ${tenantId}`);
        }
    }

    console.log("Seeding completed successfully!");
}

seed().catch(console.error);