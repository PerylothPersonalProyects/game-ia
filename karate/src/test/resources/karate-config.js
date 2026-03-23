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
    // Soporta secrets de GitHub Actions como variables de ambiente
    var apiUrl = 
        karate.properties['api.url'] || 
        karate.envVars['KARATE_API_URL'] || 
        karate.envVars['apiUrl'] || 
        karate.envVars['API_URL'] ||
        java.lang.System.getProperty('apiUrl');
        
    var wsUrl = 
        karate.properties['ws.url'] || 
        karate.envVars['KARATE_WS_URL'] || 
        karate.envVars['wsUrl'] || 
        karate.envVars['WS_URL'] ||
        java.lang.System.getProperty('wsUrl');
    
    if (apiUrl) {
        config.baseUrl = apiUrl;
    }
    if (wsUrl) {
        config.wsUrl = wsUrl;
    }
    
    return config;
}
