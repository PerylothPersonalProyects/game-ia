package com.idleclicker;

import com.intuit.karate.junit5.Karate;

/**
 * Test runner para Karate - Idle Clicker Game API Tests
 * 
 * Ejecutar con: gradle test
 * o: gradle karate --tests=com.idleclicker.GameKarateTest
 */
class GameKarateTest {
    
    @Karate.Test
    Karate testGameAPI() {
        return Karate.run("classpath:game.feature")
            .relativeTo(getClass());
    }
}
