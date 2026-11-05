package com.thisara.bookstore.payment.internal;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(PayHereProperties.class)
class PaymentConfig {
}