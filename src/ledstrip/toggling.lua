LPD8806 = require('LPD8806');

lpd = LPD8806.new(32, 3, 4);

function startToggling(speed, c1R, c1G, c1B, c2R, c2G, c2B)
  local n = 0;
  stopToggling();
  tmr.alarm(0, 40 + (1500-speed), 1, function()
    for i = 0, lpd:getLedCount() do
      if n == 0 then
        lpd:setPixelColor(i, c1R, c1G, c1B)
        n = 1;
      else
        lpd:setPixelColor(i, c2R, c2G, c2B)
        n = 0;
      end
    end
    lpd:show();
  end)
end

function stopToggling()
  tmr.stop(0);
end
