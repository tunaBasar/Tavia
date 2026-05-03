package com.tavia.trafficsimulator.controller;

import com.tavia.trafficsimulator.service.SimulatorEventBus;
import com.tavia.trafficsimulator.service.TrafficSimulationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final SimulatorEventBus eventBus;
    private final TrafficSimulationService simulationService;

    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamEvents() {
        return eventBus.subscribe();
    }

    @GetMapping("/snapshot")
    public ResponseEntity<Map<String, Object>> snapshot() {
        Map<String, Object> snap = new LinkedHashMap<>();
        snap.put("simulator", simulationService.getStats());
        snap.put("cities", eventBus.getCityStats());
        snap.put("subscribers", eventBus.getSubscriberCount());
        snap.put("tenants", simulationService.getCachedTenantSummary());
        return ResponseEntity.ok(snap);
    }
}
