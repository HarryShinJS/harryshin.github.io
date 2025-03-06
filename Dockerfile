# Stage1
# Build Docker image of react app
From node:20.11.0 as build-stage

# set working directory
RUN mkdir /usr/app
# copy all files from current directory to docker
COPY . /usr/app

WORKDIR /usr/app

RUN npm install

# add '/usr/src/app/node_modules/.bin' to $PATH
ENV PATH /usr/app/node_modules/.bin:$PATH

RUN npm run build

# Stage2
# Copy the react app build above in nginx
From nginx:1.25.3-alpine

# set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

# remove default nginx static assets
RUN rm -rf ./*
# copy static assets build from react app
COPY --from=build-stage /usr/app/build .
# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
# copy nginx config file
COPY ./nginx.conf /etc/nginx/conf.d/default.conf