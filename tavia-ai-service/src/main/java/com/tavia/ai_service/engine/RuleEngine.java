package com.tavia.ai_service.engine;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Mock Rule Engine — evaluates enriched order data and produces actionable suggestions.
 * Designed to be extensible: each rule is a simple method that can be swapped with
 * a more sophisticated engine in the future.
 */
@Slf4j
@Component
public class RuleEngine {

    /**
     * Evaluate all rules against the given enriched context and return suggestions.
     */
    public List<String> evaluate(String weather, String loyaltyLevel, String activeEvent,
                                  String competitorIntensity) {
        List<String> suggestions = new ArrayList<>();

        // Rule 1: Rainy weather + Gold loyalty → increase premium product pricing
        if ("RAINY".equalsIgnoreCase(weather) && "GOLD".equalsIgnoreCase(loyaltyLevel)) {
            suggestions.add("Increase Latte price by 5%");
            log.info("Rule triggered: RAINY + GOLD → Increase Latte price by 5%");
        }

        // Rule 2: High competitor intensity → apply discount campaign
        if ("HIGH".equalsIgnoreCase(competitorIntensity)) {
            suggestions.add("Apply discount campaign");
            log.info("Rule triggered: HIGH competitor intensity → Apply discount campaign");
        }

        // Rule 3: Holiday event + any loyalty → push seasonal offers
        if ("HOLIDAY".equalsIgnoreCase(activeEvent)) {
            suggestions.add("Launch holiday seasonal promotion");
            log.info("Rule triggered: HOLIDAY event → Launch seasonal promotion");
        }

        // Rule 4: Exam week + low competitor → increase study-related product prices
        if ("EXAM_WEEK".equalsIgnoreCase(activeEvent) && "LOW".equalsIgnoreCase(competitorIntensity)) {
            suggestions.add("Increase study snack prices by 3%");
            log.info("Rule triggered: EXAM_WEEK + LOW competition → Increase study snack prices");
        }

        // Rule 5: Sunny weather + Bronze loyalty → send engagement offer
        if ("SUNNY".equalsIgnoreCase(weather) && "BRONZE".equalsIgnoreCase(loyaltyLevel)) {
            suggestions.add("Send loyalty upgrade offer to customer");
            log.info("Rule triggered: SUNNY + BRONZE → Send loyalty upgrade offer");
        }

        // Rule 6: Cloudy weather + Silver loyalty + Medium competition → maintain prices
        if ("CLOUDY".equalsIgnoreCase(weather) && "SILVER".equalsIgnoreCase(loyaltyLevel)
                && "MEDIUM".equalsIgnoreCase(competitorIntensity)) {
            suggestions.add("Maintain current pricing strategy");
            log.info("Rule triggered: CLOUDY + SILVER + MEDIUM → Maintain pricing");
        }

        // Default: no rules matched
        if (suggestions.isEmpty()) {
            suggestions.add("No actionable suggestion — maintain status quo");
            log.info("No rules matched — maintaining status quo");
        }

        return suggestions;
    }
}
