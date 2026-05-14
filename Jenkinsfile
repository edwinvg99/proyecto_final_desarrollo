pipeline {
  agent any

  environment {
    COMPOSE_PROJECT_NAME = 'energia-clara'
    FRONTEND_IMAGE       = 'energia-clara-frontend:latest'
    BACKEND_IMAGE        = 'energia-clara-backend:latest'
  }

  stages {

    stage('Checkout') {
      steps {
        echo 'Obteniendo código fuente...'
        checkout scm
      }
    }

    stage('Build Images') {
      parallel {
        stage('Frontend') {
          steps {
            echo 'Construyendo imagen del frontend...'
            sh 'docker build -t $FRONTEND_IMAGE ./client'
          }
        }
        stage('Backend') {
          steps {
            echo 'Construyendo imagen del backend...'
            sh 'docker build -t $BACKEND_IMAGE ./server'
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        echo 'Desplegando con docker-compose...'
        withCredentials([file(credentialsId: 'server-env-file', variable: 'ENV_FILE')]) {
          sh 'chmod -R 777 server && cp $ENV_FILE server/.env'
        }
        sh 'docker-compose down --remove-orphans || true'
        sh 'docker-compose up -d'
      }
    }

    stage('Health Check') {
      steps {
        echo 'Verificando que el backend responde...'
        sh 'sleep 15'
        sh 'curl -f http://localhost:5000/api/health || exit 1'
        echo 'Backend saludable'
      }
    }

  }

  post {
    success {
      echo '✅ Pipeline completado. Energía Clara corriendo en http://localhost'
    }
    failure {
      echo '❌ Pipeline falló — revisa los logs de las etapas anteriores.'
      sh 'docker-compose logs --tail=50 || true'
    }
  }
}
