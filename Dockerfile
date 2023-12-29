FROM node:16
RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "git"]
RUN ["git", "clone", "https://user:password@github.com/BSSG-ru/root/lottabyteui.git", "--branch", "master", "--single-branch"]
WORKDIR "lottabyteui"
ENV REACT_APP_BASE_API_URL="https://localhost"
ENV REACT_APP_USER_MGT_API_URL="https://localhost"
ENV ESLINT_NO_DEV_ERRORS="true"
RUN echo "REACT_APP_BASE_API_URL=\"https://localhost\"" > .env
RUN echo "REACT_APP_USER_MGT_API_URL=\"https://localhost\"" >> .env
RUN echo "ESLINT_NO_DEV_ERRORS=true" >> .env
RUN ["npm", "install", "react-bootstrap", "bootstrap", "--legacy-peer-deps"]
RUN ["npm", "install", "react", "--legacy-peer-deps"]