// ==========================================================================
// Jenkinsfile — Flend CI/CD pipeline (Docker'da çalışan Jenkins controller'ı)
//
// Akış:  Checkout → Backend Install & Test → Build Images → Deploy (local)
//        → Smoke Test (/health)
//
// Gereken: jenkins/ klasöründeki özel Jenkins imajı (Docker CLI + Node + curl)
//          ve host docker.sock mount. Deploy, app stack'iyle aynı projeyi
//          (COMPOSE_PROJECT_NAME=flend) yönetir → mevcut veriler korunur.
// ==========================================================================
pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  // Manuel "Build Now" + her ~5 dk'da repo değişikliği kontrolü (poll).
  triggers {
    pollSCM('H/5 * * * *')
  }

  environment {
    // App stack'iyle aynı container/volume'ları yönetmek için sabit proje adı.
    COMPOSE_PROJECT_NAME = 'flend'
    // jenkins/docker-compose.yml tarafından container'a verilen host yolu;
    // docker-compose.ci.yml bunu Postgres bind-mount'larında kullanır.
    HOST_FLEND_DIR = "${env.HOST_FLEND_DIR ?: ''}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'echo "Commit: $(git rev-parse --short HEAD)"'
      }
    }

    stage('Backend: Install & Test') {
      steps {
        dir('backend') {
          // package-lock varsa ci (deterministik), yoksa install fallback.
          sh 'npm ci || npm install'
          // Mevcut test: syntax kontrolü (node --check). İleride gerçek testlerle genişletilebilir.
          sh 'npm test'
        }
      }
    }

    stage('Build Images') {
      steps {
        // Build context workspace'teki kaynaklardan tar'lanıp daemon'a gönderilir.
        sh 'docker compose --profile full build'
      }
    }

    stage('Deploy (local)') {
      steps {
        // ci override → Postgres init mount'ları host mutlak yoluyla.
        sh '''
          docker compose -f docker-compose.yml -f docker-compose.ci.yml \
            --profile full up -d --remove-orphans
        '''
      }
    }

    stage('Smoke Test') {
      steps {
        // Jenkins container'ından host'taki yayınlanmış 5000 portuna eriş.
        sh '''
          ok=0
          for i in $(seq 1 20); do
            code=$(curl -s -o /dev/null -w "%{http_code}" http://host.docker.internal:5000/health || true)
            echo "deneme $i → /health = $code"
            if [ "$code" = "200" ]; then ok=1; break; fi
            sleep 3
          done
          if [ "$ok" != "1" ]; then echo "❌ Smoke test başarısız: /health 200 dönmedi"; exit 1; fi
          echo "✅ Smoke test geçti: /health = 200"
        '''
      }
    }
  }

  post {
    success { echo '✅ Pipeline başarılı — stack ayakta, /health 200.' }
    failure { echo '❌ Pipeline başarısız — yukarıdaki aşama loglarına bakın.' }
    always  { sh 'docker compose --profile full ps || true' }
  }
}
