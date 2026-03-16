function fn() {
  var config = {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:3000/api',
    wsUrl: 'ws://localhost:3000',
    
    // Tiempo de espera para operaciones
    timeout: 10000,
    
    // Datos de prueba
    testUsers: {
      user1: 'test-user-1',
      user2: 'test-user-2',
      user3: 'test-user-3'
    },
    
    // Headers por defecto
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  // Configuración de Karate
  karate.configure('logPrettyRequest', true);
  karate.configure('logPrettyResponse', true);
  
  // Configuración de retry
  karate.configure('retry', { count: 3, interval: 1000 });
  
  // Configuración de connect timeout
  karate.configure('connectTimeout', 5000);
  karate.configure('readTimeout', 10000);

  return config;
}
