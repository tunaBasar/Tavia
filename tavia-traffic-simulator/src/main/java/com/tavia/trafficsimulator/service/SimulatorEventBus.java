package com.tavia.trafficsimulator.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tavia.trafficsimulator.dto.SimulatorEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Slf4j
public class SimulatorEventBus {

    private static final List<String> CITIES = List.of(
            "ISTANBUL", "ANKARA", "IZMIR", "BURSA", "ANTALYA", "ADANA",
            "KONYA", "SANLIURFA", "GAZIANTEP", "KOCAELI", "ESKISEHIR", "ISPARTA"
    );

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final ObjectMapper objectMapper;

    private final ConcurrentHashMap<String, AtomicLong> cityOrders = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, AtomicLong> cityTelemetry = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, AtomicLong> cityErrors = new ConcurrentHashMap<>();

    public SimulatorEventBus(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("{\"message\":\"Mission Control stream connected\"}"));
        } catch (Exception e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    public void publish(SimulatorEvent event) {
        if (event.city() != null) {
            String city = event.city().toUpperCase();
            switch (event.type()) {
                case "ORDER_PLACED" -> cityOrders.computeIfAbsent(city, k -> new AtomicLong()).incrementAndGet();
                case "TELEMETRY_SENT" -> cityTelemetry.computeIfAbsent(city, k -> new AtomicLong()).incrementAndGet();
                case "MACHINE_ERROR" -> cityErrors.computeIfAbsent(city, k -> new AtomicLong()).incrementAndGet();
                default -> { }
            }
        }
        broadcast(event.type(), event);
    }

    @Scheduled(fixedRate = 15000)
    public void heartbeat() {
        if (emitters.isEmpty()) return;
        broadcast("HEARTBEAT", Map.of("ts", System.currentTimeMillis()));
    }

    public Map<String, Map<String, Long>> getCityStats() {
        Map<String, Map<String, Long>> stats = new LinkedHashMap<>();
        for (String city : CITIES) {
            stats.put(city, Map.of(
                    "orders", cityOrders.getOrDefault(city, new AtomicLong()).get(),
                    "telemetry", cityTelemetry.getOrDefault(city, new AtomicLong()).get(),
                    "errors", cityErrors.getOrDefault(city, new AtomicLong()).get()
            ));
        }
        return stats;
    }

    public int getSubscriberCount() {
        return emitters.size();
    }

    private void broadcast(String eventName, Object data) {
        List<SseEmitter> dead = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(objectMapper.writeValueAsString(data)));
            } catch (Exception e) {
                dead.add(emitter);
            }
        }
        emitters.removeAll(dead);
    }
}
