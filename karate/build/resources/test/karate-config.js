function() {
    var config = {
        // URLs base - cambiar según el entorno
        baseUrl: 'http://localhost:3000/api',
        wsUrl: 'ws://localhost:3000',
        
        // Configuración de timeouts
        timeout: 10000,
        
        // Generar ID único para tests
        uuid: function() {
            return java.util.UUID.randomUUID().toString();
        }
    };
    
    // Si hay variables de entorno, usarlas
    if (karate.properties['api.url']) {
        config.baseUrl = karate.properties['api.url'];
    }
    if (karate.properties['ws.url']) {
        config.wsUrl = karate.properties['ws.url'];
    }
    
    return config;
}
