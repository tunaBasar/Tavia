package com.tavia.catalog_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class TaviaCatalogServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaviaCatalogServiceApplication.class, args);
	}

}
