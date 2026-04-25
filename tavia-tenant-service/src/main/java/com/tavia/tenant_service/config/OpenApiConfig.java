package com.tavia.tenant_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI tenantServiceOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Tavia Tenant Service API")
                        .description("Tenant kayit, giris ve yonetim endpointleri")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Tavia Team")
                                .email("admin@tavia.com")));
    }
}
