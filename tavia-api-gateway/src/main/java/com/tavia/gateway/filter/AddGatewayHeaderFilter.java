package com.tavia.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AddGatewayHeaderFilter implements GlobalFilter, Ordered {
    private static final String TENANT_HEADER = "X-Tenant-ID";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        HttpHeaders headers = exchange.getRequest().getHeaders();
        String tenantId = headers.getFirst(TENANT_HEADER);

        ServerHttpRequest.Builder requestBuilder = exchange.getRequest().mutate()
                .header("X-Tavia-Gateway", "Active");

        // Preserve tenant isolation header explicitly for downstream services.
        if (tenantId != null && !tenantId.isBlank()) {
            requestBuilder.header(TENANT_HEADER, tenantId);
        }

        ServerHttpRequest request = requestBuilder.build();
        
        ServerWebExchange mutatedExchange = exchange.mutate().request(request).build();
        return chain.filter(mutatedExchange);
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
