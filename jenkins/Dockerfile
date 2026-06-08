# ==========================================================================
# jenkins/Dockerfile — Flend CI/CD için özel Jenkins imajı
#
# Jenkins LTS + Docker CLI (host socket'ine konuşur) + Docker Compose plugin
# + Node.js 20 (backend npm install/test) + curl (smoke test).
# ==========================================================================
FROM jenkins/jenkins:lts-jdk17

USER root

# 1) Temel araçlar + Docker apt deposu
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl gnupg \
 && install -m 0755 -d /etc/apt/keyrings \
 && curl -fsSL https://download.docker.com/linux/debian/gpg \
      | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
 && chmod a+r /etc/apt/keyrings/docker.gpg \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
      > /etc/apt/sources.list.d/docker.list

# 2) Docker CLI + Compose plugin
RUN apt-get update && apt-get install -y --no-install-recommends \
      docker-ce-cli docker-compose-plugin \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# 3) Node.js 20 (NodeSource)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get install -y --no-install-recommends nodejs \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# Not: docker.sock erişimi için container compose'ta `user: root` ile çalışır
# (Windows Docker Desktop'ta en sorunsuz yöntem). Üretimde docker grubu tercih edilir.
USER jenkins
