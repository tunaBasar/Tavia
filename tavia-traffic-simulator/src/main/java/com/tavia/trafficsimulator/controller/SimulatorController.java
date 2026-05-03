package com.tavia.trafficsimulator.controller;

import com.tavia.trafficsimulator.service.TrafficSimulationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/simulator")
@RequiredArgsConstructor
public class SimulatorController {

    private final TrafficSimulationService simulationService;

    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> start() {
        simulationService.start();
        return ResponseEntity.ok(simulationService.getStats());
    }

    @PostMapping("/stop")
    public ResponseEntity<Map<String, Object>> stop() {
        simulationService.stop();
        return ResponseEntity.ok(simulationService.getStats());
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(simulationService.getStats());
    }

    @PostMapping("/refresh-cache")
    public ResponseEntity<Map<String, String>> refreshCache() {
        simulationService.refreshCaches();
        return ResponseEntity.ok(Map.of("status", "caches cleared"));
    }
}
