package com.tavia.context_service.service;

import com.tavia.context_service.dto.ContextDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Slf4j
@Service
public class ContextServiceImpl implements ContextService {

    private static final List<String> WEATHER_OPTIONS = List.of("SUNNY", "RAINY", "CLOUDY");
    private static final List<String> EVENT_OPTIONS = List.of("NONE", "EXAM_WEEK", "HOLIDAY");
    private static final List<String> COMPETITOR_OPTIONS = List.of("LOW", "MEDIUM", "HIGH");

    private final Random random = new Random();

    @Override
    public ContextDto getCurrentContext() {
        String weather = WEATHER_OPTIONS.get(random.nextInt(WEATHER_OPTIONS.size()));
        String activeEvent = EVENT_OPTIONS.get(random.nextInt(EVENT_OPTIONS.size()));
        String competitorIntensity = COMPETITOR_OPTIONS.get(random.nextInt(COMPETITOR_OPTIONS.size()));

        log.info("Context generated — weather: {}, activeEvent: {}, competitorIntensity: {}",
                weather, activeEvent, competitorIntensity);

        return ContextDto.builder()
                .weather(weather)
                .activeEvent(activeEvent)
                .competitorIntensity(competitorIntensity)
                .build();
    }
}
