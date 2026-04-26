package com.tavia.crm_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI crmServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Tavia CRM Service API")
                        .description("Customer relationship management and loyalty tracking service")
                        .version("1.0.0"));
    }
}
