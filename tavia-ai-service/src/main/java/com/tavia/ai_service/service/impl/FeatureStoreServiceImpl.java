package com.tavia.ai_service.service.impl;

import com.tavia.ai_service.service.FeatureStoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeatureStoreServiceImpl implements FeatureStoreService {

    private final StringRedisTemplate redisTemplate;
    
    private static final String MACHINE_KEY_PREFIX = "machine:state:";
    private static final String SALES_KEY_PREFIX = "sales:hourly:";

    @Override
    public void updateMachineState(UUID machineId, String telemetryJson) {
        String key = MACHINE_KEY_PREFIX + machineId.toString();
        redisTemplate.opsForValue().set(key, telemetryJson, Duration.ofDays(7));
        log.debug("Updated feature store for machine {}", machineId);
    }

    @Override
    public String getMachineState(UUID machineId) {
        String key = MACHINE_KEY_PREFIX + machineId.toString();
        return redisTemplate.opsForValue().get(key);
    }

    @Override
    public void incrementHourlySales(UUID tenantId, double revenue) {
        String hourKey = getCurrentHourKey();
        String key = SALES_KEY_PREFIX + tenantId.toString() + ":" + hourKey;
        redisTemplate.opsForValue().increment(key, revenue);
        redisTemplate.expire(key, Duration.ofHours(24));
    }

    @Override
    public double getHourlySales(UUID tenantId) {
        String hourKey = getCurrentHourKey();
        String key = SALES_KEY_PREFIX + tenantId.toString() + ":" + hourKey;
        String val = redisTemplate.opsForValue().get(key);
        return val != null ? Double.parseDouble(val) : 0.0;
    }
    
    private String getCurrentHourKey() {
        return DateTimeFormatter.ofPattern("yyyyMMddHH")
                .withZone(ZoneId.systemDefault())
                .format(Instant.now());
    }
}
