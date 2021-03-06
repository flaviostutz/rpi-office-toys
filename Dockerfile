FROM flaviostutz/rpi-johnny-five

COPY /src /opt/rpi-office-toys/src

RUN cd /opt && \
    npm install rpi-office-toys/src/lib/StutzButlerExtension \
    npm install rpi-office-toys/src/hamsta \
    npm install rpi-office-toys/src/gaugeface

WORKDIR /opt/

CMD ["node", "rpi-office-toys/src/hamsta"]
