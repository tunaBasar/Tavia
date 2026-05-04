package com.tavia.trafficsimulator.service;

import com.tavia.trafficsimulator.client.*;
import com.tavia.trafficsimulator.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Slf4j
@RequiredArgsConstructor
public class TrafficSimulationService {

    private final TenantClient tenantClient;
    private final CrmClient crmClient;
    private final CatalogClient catalogClient;
    private final OrderClient orderClient;
    private final IotClient iotClient;
    private final SimulatorEventBus eventBus;

    private final AtomicBoolean running = new AtomicBoolean(false);
    private final AtomicLong totalOrdersPlaced = new AtomicLong(0);
    private final AtomicLong totalTelemetrySent = new AtomicLong(0);
    private final AtomicLong totalFailures = new AtomicLong(0);
    private final AtomicLong cycleCount = new AtomicLong(0);

    private final Map<UUID, List<CustomerDto>> tenantCustomerCache = new ConcurrentHashMap<>();
    private final Map<UUID, List<RecipeDto>> tenantCatalogCache = new ConcurrentHashMap<>();
    private final Map<UUID, List<MachineDto>> tenantMachineCache = new ConcurrentHashMap<>();
    private volatile List<TenantResponse> cachedTenants = Collections.emptyList();
    private volatile long lastCacheRefresh = 0;

    private static final long CACHE_TTL_MS = 60_000;

    private static final BigDecimal MIN_PRICE = new BigDecimal("15.00");
    private static final BigDecimal MAX_PRICE = new BigDecimal("120.00");

    public void start() {
        running.set(true);
        log.info("Traffic simulation STARTED");
        eventBus.publish(new SimulatorEvent("SIMULATOR_STARTED", "Simulation started"));
    }

    public void stop() {
        running.set(false);
        log.info("Traffic simulation STOPPED");
        eventBus.publish(new SimulatorEvent("SIMULATOR_STOPPED", "Simulation stopped"));
    }

    public boolean isRunning() {
        return running.get();
    }

    public Map<String, Object> getStats() {
        return Map.of(
                "running", running.get(),
                "cycles", cycleCount.get(),
                "ordersPlaced", totalOrdersPlaced.get(),
                "telemetrySent", totalTelemetrySent.get(),
                "failures", totalFailures.get(),
                "cachedTenants", cachedTenants.size()
        );
    }

    public void refreshCaches() {
        lastCacheRefresh = 0;
        tenantCustomerCache.clear();
        tenantCatalogCache.clear();
        tenantMachineCache.clear();
        log.info("All caches cleared — next cycle will re-fetch");
        eventBus.publish(new SimulatorEvent("CACHE_REFRESHED", "All caches cleared"));
    }

    @Scheduled(fixedDelayString = "${simulator.cycle-delay-ms:8000}")
    public void simulateCycle() {
        if (!running.get()) return;

        long cycle = cycleCount.incrementAndGet();
        log.info("=== Simulation cycle #{} at {} ===", cycle, Instant.now());
        eventBus.publish(new SimulatorEvent("CYCLE_START", "Cycle #" + cycle));

        try {
            ensureCaches();
            if (cachedTenants.isEmpty()) {
                log.warn("No tenants available — skipping cycle");
                return;
            }

            int volume = resolveTrafficVolume();
            log.info("Traffic volume for this cycle: {} orders", volume);
            eventBus.publish(new SimulatorEvent("CYCLE_VOLUME", "Cycle #" + cycle + " \u2014 volume: " + volume));

            for (int i = 0; i < volume; i++) {
                TenantResponse tenant = pickRandom(cachedTenants);
                if (!tenant.isActive()) continue;

                processOrderForTenant(tenant);
            }

        } catch (Exception e) {
            totalFailures.incrementAndGet();
            log.error("Simulation cycle #{} failed", cycle, e);
            eventBus.publish(new SimulatorEvent("CYCLE_FAILED", "Cycle #" + cycle + " failed: " + e.getMessage()));
        }
    }

    private void ensureCaches() {
        long now = System.currentTimeMillis();
        if (now - lastCacheRefresh < CACHE_TTL_MS && !cachedTenants.isEmpty()) return;

        log.debug("Refreshing tenant cache...");
        ApiResponse<List<TenantResponse>> tenantResp = tenantClient.getAllTenants();
        cachedTenants = extractData(tenantResp, "tenants");
        if (cachedTenants.isEmpty()) return;

        for (TenantResponse tenant : cachedTenants) {
            if (!tenant.isActive()) continue;
            String tid = tenant.getId().toString();

            try {
                ApiResponse<List<CustomerDto>> custResp = crmClient.getCustomersByTenant(tid);
                List<CustomerDto> customers = extractData(custResp, "customers for tenant " + tenant.getName());
                if (!customers.isEmpty()) {
                    tenantCustomerCache.put(tenant.getId(), customers);
                }
            } catch (Exception e) {
                log.warn("Failed to fetch customers for tenant {}: {}", tenant.getName(), e.getMessage());
            }

            try {
                ApiResponse<List<RecipeDto>> catResp = catalogClient.getActiveRecipes(tid);
                List<RecipeDto> recipes = extractData(catResp, "recipes for tenant " + tenant.getName());
                if (!recipes.isEmpty()) {
                    tenantCatalogCache.put(tenant.getId(), recipes);
                }
            } catch (Exception e) {
                log.warn("Failed to fetch catalog for tenant {}: {}", tenant.getName(), e.getMessage());
            }

            try {
                List<MachineDto> machines = iotClient.getMachines(tid);
                if (machines != null && !machines.isEmpty()) {
                    tenantMachineCache.put(tenant.getId(), machines);
                }
            } catch (Exception e) {
                log.warn("Failed to fetch machines for tenant {}: {}", tenant.getName(), e.getMessage());
            }
        }

        lastCacheRefresh = now;
        log.info("Cache refreshed: {} tenants, {} tenant-customer mappings, {} tenant-catalog mappings",
                cachedTenants.size(), tenantCustomerCache.size(), tenantCatalogCache.size());
        eventBus.publish(new SimulatorEvent("CACHE_REFRESHED", "Cache refreshed"));
    }

    private void processOrderForTenant(TenantResponse tenant) {
        UUID tenantId = tenant.getId();

        List<CustomerDto> customers = tenantCustomerCache.get(tenantId);
        if (customers == null || customers.isEmpty()) {
            log.debug("No customers for tenant {} — skipping", tenant.getName());
            return;
        }

        List<RecipeDto> recipes = tenantCatalogCache.get(tenantId);
        if (recipes == null || recipes.isEmpty()) {
            log.debug("No active recipes for tenant {} — skipping", tenant.getName());
            return;
        }

        CustomerDto customer = pickRandom(customers);
        RecipeDto recipe = pickRandom(recipes);
        int quantity = resolveQuantity();
        BigDecimal price = resolvePrice();

        try {
            CreateOrderRequest orderRequest = CreateOrderRequest.builder()
                    .customerId(customer.getId())
                    .productName(recipe.getProductName())
                    .quantity(quantity)
                    .price(price)
                    .build();

            log.debug("Order → Tenant: {}, Customer: {}, Product: {} x{}, Price: {}",
                    tenant.getName(), customer.getName(), recipe.getDisplayName(), quantity, price);

            orderClient.createOrder(tenantId.toString(), orderRequest);
            totalOrdersPlaced.incrementAndGet();
            eventBus.publish(new SimulatorEvent("ORDER_PLACED", tenant.getCity().name(), tenant.getName(),
                    recipe.getDisplayName() + " x" + quantity + " @ " + price + " TRY \u2192 " + customer.getName()));

            simulateMachineTelemetry(tenant);

        } catch (Exception e) {
            totalFailures.incrementAndGet();
            eventBus.publish(new SimulatorEvent("ORDER_FAILED", tenant.getCity().name(), tenant.getName(), e.getMessage()));
            log.warn("Order failed for tenant {}: {}", tenant.getName(), e.getMessage());
        }
    }

    private void simulateMachineTelemetry(TenantResponse tenant) {
        UUID tenantId = tenant.getId();
        String tid = tenantId.toString();

        List<MachineDto> machines = tenantMachineCache.get(tenantId);
        if (machines == null || machines.isEmpty()) return;

        MachineDto machine = pickRandom(machines);
        ThreadLocalRandom rng = ThreadLocalRandom.current();

        String errorCode = null;
        if (rng.nextDouble() < 0.05) {
            errorCode = "ERR_" + (100 + rng.nextInt(900));
            log.warn("\u26a0 Machine {} ({}) at tenant {} error: {}",
                    machine.getName(), machine.getMachineType(), tenant.getName(), errorCode);
            eventBus.publish(new SimulatorEvent("MACHINE_ERROR", tenant.getCity().name(), tenant.getName(),
                    machine.getName() + " (" + machine.getMachineType() + ") \u2192 " + errorCode));
        }

        try {
            MachineTelemetryDto telemetry = MachineTelemetryDto.builder()
                    .machineId(machine.getId())
                    .timestamp(Instant.now())
                    .batteryLevel(60.0 + rng.nextDouble() * 40.0)
                    .cpuTemperature(35.0 + rng.nextDouble() * 45.0)
                    .coordinatesX(28.5 + rng.nextDouble() * 12.0)
                    .coordinatesY(36.5 + rng.nextDouble() * 6.0)
                    .networkSignalStrength(-30.0 - rng.nextDouble() * 60.0)
                    .currentErrorCode(errorCode)
                    .sensorPayload(Map.of(
                            "vibration", rng.nextDouble() * 5.0,
                            "pressure", 8.0 + rng.nextDouble() * 4.0,
                            "humidity", 30.0 + rng.nextDouble() * 50.0
                    ))
                    .build();

            iotClient.sendTelemetry(tid, telemetry);
            totalTelemetrySent.incrementAndGet();
            eventBus.publish(new SimulatorEvent("TELEMETRY_SENT", tenant.getCity().name(), tenant.getName(),
                    machine.getName() + " \u2192 OK"));

        } catch (Exception e) {
            log.warn("Telemetry failed for machine {} at tenant {}: {}",
                    machine.getName(), tenant.getName(), e.getMessage());
        }
    }

    private int resolveTrafficVolume() {
        int hour = LocalTime.now().getHour();
        ThreadLocalRandom rng = ThreadLocalRandom.current();

        if (hour >= 7 && hour <= 10) return rng.nextInt(8, 16);
        if (hour >= 12 && hour <= 14) return rng.nextInt(5, 12);
        if (hour >= 17 && hour <= 19) return rng.nextInt(4, 10);
        if (hour >= 22 || hour <= 5) return rng.nextInt(0, 2);
        return rng.nextInt(2, 6);
    }

    private int resolveQuantity() {
        ThreadLocalRandom rng = ThreadLocalRandom.current();
        double roll = rng.nextDouble();
        if (roll < 0.65) return 1;
        if (roll < 0.85) return 2;
        if (roll < 0.95) return 3;
        return rng.nextInt(4, 7);
    }

    private BigDecimal resolvePrice() {
        double val = ThreadLocalRandom.current().nextDouble(
                MIN_PRICE.doubleValue(), MAX_PRICE.doubleValue());
        return BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP);
    }

    private <T> T pickRandom(List<T> list) {
        return list.get(ThreadLocalRandom.current().nextInt(list.size()));
    }

    public List<Map<String, String>> getCachedTenantSummary() {
        return cachedTenants.stream()
                .map(t -> Map.of(
                        "name", t.getName(),
                        "city", t.getCity() != null ? t.getCity().name() : "UNKNOWN",
                        "active", String.valueOf(t.isActive())
                ))
                .toList();
    }

    private <T> List<T> extractData(ApiResponse<List<T>> response, String label) {
        if (response == null || response.getData() == null) {
            log.warn("Empty API response for {}", label);
            return Collections.emptyList();
        }
        return response.getData();
    }
}
