pipeline {
    agent any
    
    environment {
        // Docker Hub credentials (configure in Jenkins)
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        
        // SonarQube environment
        SONAR_HOST_URL = 'http://sonarqube.imcc.com/'
        SONAR_TOKEN = credentials('sqp_51dc6dfb789de440cbc3320e8591365708d7018b')
        
        // Project details
        PROJECT_NAME = 'blockvote'
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/blockvote-backend"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/blockvote-frontend"
        
        // Node version
        NODE_VERSION = '20'
    }
    
    tools {
        nodejs "${NODE_VERSION}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code...'
                checkout scm
                sh 'git rev-parse --short HEAD > .git/commit-id'
                script {
                    env.GIT_COMMIT_SHORT = readFile('.git/commit-id').trim()
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        echo '📦 Installing Backend dependencies...'
                        dir('Backend') {
                            sh 'npm ci'
                        }
                    }
                }
                
                stage('Frontend Dependencies') {
                    steps {
                        echo '📦 Installing Frontend dependencies...'
                        dir('Frontend') {
                            sh 'npm ci'
                        }
                    }
                }
                
                stage('Root Dependencies') {
                    steps {
                        echo '📦 Installing Root dependencies for SonarQube...'
                        sh 'npm install'
                    }
                }
            }
        }
        
        stage('Lint & Code Quality') {
            parallel {
                stage('Backend Lint') {
                    steps {
                        echo '🔍 Linting Backend code...'
                        dir('Backend') {
                            sh 'npm run lint || true'
                        }
                    }
                }
                
                stage('Frontend Lint') {
                    steps {
                        echo '🔍 Linting Frontend code...'
                        dir('Frontend') {
                            sh 'npm run lint || true'
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        echo '🏗️ Building Frontend...'
                        dir('Frontend') {
                            sh 'npm run build'
                        }
                    }
                }
                
                stage('Verify Backend') {
                    steps {
                        echo '✅ Verifying Backend...'
                        dir('Backend') {
                            sh 'node --version'
                            sh 'npm --version'
                        }
                    }
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                echo '📊 Running SonarQube analysis...'
                script {
                    sh 'node sonar-project.js'
                }
            }
        }
        
        stage('Security Scan') {
            parallel {
                stage('Backend Security') {
                    steps {
                        echo '🔒 Scanning Backend for vulnerabilities...'
                        dir('Backend') {
                            sh 'npm audit --audit-level=moderate || true'
                        }
                    }
                }
                
                stage('Frontend Security') {
                    steps {
                        echo '🔒 Scanning Frontend for vulnerabilities...'
                        dir('Frontend') {
                            sh 'npm audit --audit-level=moderate || true'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            when {
                branch 'main'
            }
            parallel {
                stage('Build Backend Image') {
                    steps {
                        echo '🐳 Building Backend Docker image...'
                        script {
                            dir('Backend') {
                                docker.build("${BACKEND_IMAGE}:${env.GIT_COMMIT_SHORT}")
                                docker.build("${BACKEND_IMAGE}:latest")
                            }
                        }
                    }
                }
                
                stage('Build Frontend Image') {
                    steps {
                        echo '🐳 Building Frontend Docker image...'
                        script {
                            dir('Frontend') {
                                docker.build("${FRONTEND_IMAGE}:${env.GIT_COMMIT_SHORT}")
                                docker.build("${FRONTEND_IMAGE}:latest")
                            }
                        }
                    }
                }
            }
        }
        
        stage('Push Docker Images') {
            when {
                branch 'main'
            }
            steps {
                echo '📤 Pushing Docker images to registry...'
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", "${DOCKER_CREDENTIALS_ID}") {
                        // Push Backend images
                        docker.image("${BACKEND_IMAGE}:${env.GIT_COMMIT_SHORT}").push()
                        docker.image("${BACKEND_IMAGE}:latest").push()
                        
                        // Push Frontend images
                        docker.image("${FRONTEND_IMAGE}:${env.GIT_COMMIT_SHORT}").push()
                        docker.image("${FRONTEND_IMAGE}:latest").push()
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo '🚀 Deploying application...'
                script {
                    // Option 1: Deploy using docker-compose
                    sh '''
                        docker-compose down || true
                        docker-compose pull
                        docker-compose up -d
                    '''
                    
                    // Option 2: Deploy to Kubernetes (uncomment if using K8s)
                    // sh 'kubectl apply -f k8s/'
                    // sh 'kubectl rollout status deployment/blockvote-backend'
                    // sh 'kubectl rollout status deployment/blockvote-frontend'
                }
            }
        }
        
        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                echo '🏥 Performing health checks...'
                script {
                    sleep(time: 10, unit: 'SECONDS')
                    
                    // Check Backend health
                    sh '''
                        curl -f http://localhost:5000/api/health || exit 1
                    '''
                    
                    // Check Frontend health
                    sh '''
                        curl -f http://localhost:80 || exit 1
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up...'
            cleanWs()
        }
        
        success {
            echo '✅ Pipeline completed successfully!'
            // Send success notification (configure email/Slack)
            // emailext subject: "✅ BlockVote Build #${BUILD_NUMBER} - SUCCESS",
            //          body: "Build completed successfully!",
            //          to: "team@example.com"
        }
        
        failure {
            echo '❌ Pipeline failed!'
            // Send failure notification
            // emailext subject: "❌ BlockVote Build #${BUILD_NUMBER} - FAILED",
            //          body: "Build failed. Please check Jenkins logs.",
            //          to: "team@example.com"
        }
        
        unstable {
            echo '⚠️ Pipeline is unstable!'
        }
    }
}
