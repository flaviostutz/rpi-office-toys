FROM flaviostutz/rpi-johnny-five

ADD /src /opt/src
WORKDIR /opt/src
RUN npm install -g

CMD ["node", "main.js"]

