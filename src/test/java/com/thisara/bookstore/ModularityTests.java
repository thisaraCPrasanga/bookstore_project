package com.thisara.bookstore;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ModularityTests {

    private static final ApplicationModules MODULES = ApplicationModules.of(BookstoreApplication.class);

    @Test
    void modulesFollowTheRules() {
        MODULES.verify();
    }

    @Test
    void printModules() {
        MODULES.forEach(System.out::println);
    }
}