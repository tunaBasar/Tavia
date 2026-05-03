const CITIES = ['ISTANBUL', 'ANKARA', 'IZMIR', 'BURSA', 'ANTALYA', 'ADANA', 'KONYA', 'SANLIURFA', 'GAZIANTEP', 'KOCAELI', 'ESKISEHIR', 'ISPARTA'];
const MACHINE_TYPES = ['BREWER', 'FETCHER', 'CLEANER'];
const BASE_URL = 'http://localhost:8080/api/v1';

async function seed() {
    console.log("Starting Tavia V2 DB Seeding...");
    
    // 1. Create 10 Tenants
    const tenantIds = [];
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

    if (tenantIds.length === 0) {
        console.error("No tenants created. Gateway might be down or DB unavailable. Aborting.");
        return;
    }

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
        if (res.ok) {
            console.log(`Created Bound Customer ${i} for Tenant ID: ${tenantId}`);
        } else {
            console.error(`Failed to create Bound Customer ${i}:`, await res.text());
        }
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
        if (res.ok) {
            console.log(`Created Global Customer ${i}`);
        } else {
            console.error(`Failed to create Global Customer ${i}:`, await res.text());
        }
    }

    // 4. Create Machines & Inventory Limits for each tenant
    for (let i = 0; i < tenantIds.length; i++) {
        const tenantId = tenantIds[i];

        // Machines (1 of each type)
        for (let j = 0; j < MACHINE_TYPES.length; j++) {
            const type = MACHINE_TYPES[j];
            const hexI = i.toString(16).padStart(2, '0');
            const hexJ = j.toString(16).padStart(2, '0');
            const res = await fetch(`${BASE_URL}/iot/machines`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Tenant-ID': tenantId
                },
                body: JSON.stringify({
                    name: `${type} Machine - Tenant ${i+1}`,
                    macAddress: `00:11:22:33:${hexI}:${hexJ}`,
                    machineType: type
                })
            });
            if (res.ok) {
                console.log(`Created ${type} Machine for Tenant ID: ${tenantId}`);
            } else {
                console.error(`Failed to create ${type} Machine for Tenant ID: ${tenantId}:`, await res.text());
            }
        }

        // Inventory Limits (Prevents order crashes based on Domain Laws)
        const inventoryItems = [
            { name: "Coffee Beans", unit: "GRAM", stockQuantity: 10000 },
            { name: "Milk", unit: "MILLILITER", stockQuantity: 10000 },
            { name: "Water", unit: "MILLILITER", stockQuantity: 20000 },
            { name: "Cups", unit: "PIECE", stockQuantity: 500 }
        ];

        for (const item of inventoryItems) {
            const res = await fetch(`${BASE_URL}/inventory`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Tenant-ID': tenantId
                },
                body: JSON.stringify(item)
            });
            if (res.ok) {
                console.log(`Added Inventory ${item.name} for Tenant ID: ${tenantId}`);
            } else {
                console.error(`Failed to add Inventory ${item.name} for Tenant ID: ${tenantId}:`, await res.text());
            }
        }
    }

    console.log("Seeding completed successfully!");
}

seed().catch(console.error);
