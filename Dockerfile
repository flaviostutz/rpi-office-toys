FROM flaviostutz/rpi-johnny-five

ADD /src /opt/src

RUN cd /opt && \
    npm install rpi-office-toys/src/lib/StutzButlerExtension/ \
    npm install rpi-office-toys/src/hamsta/ \
    npm install rpi-office-toys/src/gaugeface

WORKDIR /opt/src

CMD ["node", "gaugeface/main.js", "1"]
