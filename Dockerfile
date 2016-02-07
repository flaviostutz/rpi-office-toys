FROM flaviostutz/rpi-johnny-five

#speedup build by optimizing cache usage (may be removed at will)
RUN mkdir -p /opt/src/gaugeface && cd /opt/src/gaugeface && npm install serialport

ADD /src /opt/src

RUN cd /opt/src/gaugeface && npm install

WORKDIR /opt/src

CMD ["node", "gaugeface/main.js", "1"]

