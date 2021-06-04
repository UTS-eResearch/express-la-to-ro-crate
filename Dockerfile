FROM node:14
ENV node_env production
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
VOLUME /etc/share
WORKDIR /home/node
COPY . .
# Install the express app first
RUN npm install
EXPOSE 8080
USER node
CMD NODE_ENV=$node_env npm start
