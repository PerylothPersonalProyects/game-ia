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
    
    // Leer propiedades del sistema (pasadas con -D en gradle)
    // GitHub Actions secrets se pasan como variables de entorno automáticamente
    var apiUrl = 
        karate.properties['api.url'] || 
        java.lang.System.getProperty('api.url');
        
    var wsUrl = 
        karate.properties['ws.url'] || 
        java.lang.System.getProperty('ws.url');
    
    if (apiUrl) {
        config.baseUrl = apiUrl;
    }
    if (wsUrl) {
        config.wsUrl = wsUrl;
    }
    
    return config;
}
