LPD8806 = require('LPD8806');

lpd = LPD8806.new(32, 3, 4);

function startStacking(speed, width, bgR, bgG, bgB, fgR, fgG, fgB)
  stopStacking();
  local stackedN = 0;
  local pos = lpd:getLedCount();
  tmr.alarm(0, 40, 1, function()
    for i = 0, lpd:getLedCount() do
      if i == pos or i < stackedN then
        --foreground
        lpd:setPixelColor(i, fgR, fgG, fgB);
      elseif i > pos and i < pos+width then
        s = (2*(i-pos));
        lpd:setPixelColor(i, fgR/s, fgG/s, fgB/s);
      else
        --background
        lpd:setPixelColor(i, bgR, bgG, bgB);
      end
    end
    if pos <= stackedN then
      stackedN = stackedN + 1;
      pos = lpd:getLedCount();
    else
      pos = pos - speed;
    end
    if stackedN >= lpd:getLedCount() then
      stackedN = 0;
      pos = lpd:getLedCount();
    end
    lpd:show();
  end)
end

function stopStacking()
  tmr.stop(0);
end
