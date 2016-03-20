LPD8806 = require('LPD8806');

lpd = LPD8806.new(32, 3, 4);

function startLining(speed, width, bgR, bgG, bgB, fgR, fgG, fgB)
  stopLining();
  local pos100 = 0;
  tmr.alarm(0, 40, 1, function()
    pos = pos100/100;
    for i = 0, lpd:getLedCount() do
      if i == pos then
        --foreground
        lpd:setPixelColor(i, fgR, fgG, fgB);
      elseif i > pos-width and i < pos then
        s = (2*(pos-i));
        lpd:setPixelColor(i, fgR/s, fgG/s, fgB/s);
      else
        --background
        lpd:setPixelColor(i, bgR, bgG, bgB);
      end
    end
    if pos >= lpd:getLedCount() then
      pos100 = 0;
    else
      pos100 = pos100 + speed;
    end
    lpd:show();
  end)
end

function stopLining()
  tmr.stop(0);
end
