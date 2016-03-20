LPD8806 = require('LPD8806');

lpd = LPD8806.new(32, 3, 4);

function setAllColor(r, g, b)
  for i = 0, lpd:getLedCount() do
    lpd:setPixelColor(i, r, g, b);
  end
  lpd:show();
end

function startFading(speed, c1R, c1G, c1B, c2R, c2G, c2B)
  local n500 = 0
  local dir = 0

  tmr.alarm(0, 40, 1, function()
    n500 = n500 + dir;
    if n500 > 500 then
      dir = -speed;
    elseif n500 <= 1 then
      dir = speed;
    end
    setAllColor(n500*c1R/500, n500*c1G/500, n500*c1B/500);
  end)
end