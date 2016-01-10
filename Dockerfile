FROM flaviostutz/rpi-johnny-five

ADD /src /data/src

CMD ["node", "/data/src/main.js"]
