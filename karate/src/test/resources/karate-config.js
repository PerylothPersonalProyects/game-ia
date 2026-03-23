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
    
    // Si hay variables de entorno o propiedades del sistema, usarlas
    var apiUrl = karate.properties['api.url'] || karate.envVars['KARATE_API_URL'] || karate.envVars['api_url'];
    var wsUrl = karate.properties['ws.url'] || karate.envVars['KARATE_WS_URL'] || karate.envVars['ws_url'];
    
    if (apiUrl) {
        config.baseUrl = apiUrl;
    }
    if (wsUrl) {
        config.wsUrl = wsUrl;
    }
    
    return config;
}
