FROM flaviostutz/rpi-johnny-five

ADD /src /opt/src

RUN cp -R /opt/node_modules /opt/src/gaugeface
RUN cd /opt/src/gaugeface && npm install

WORKDIR /opt/src

CMD ["node", "gaugeface/main.js", "1"]

