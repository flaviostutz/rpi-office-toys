LPD8806 = require('LPD8806');

print("STARTING LED DEMO");

lpd = LPD8806.new(32, 3, 4);

function lpd_color(r, g, b)
  for i = 0, 32 do
    lpd:setPixelColor(i, r, g, b);
  end
  lpd:show();
end

function lpd_rainbow(speed, width)
  tmr.alarm(1, 300, 1, function()
    for i = 0, lpd:getLedCount() do
      print("Rainbow " .. i);
      color = calculateRainbowColor(i);
      lpd:setPixelColor(i, color.r, color.g, color.b);
    end
    lpd:show();
  end)
end

function lpd_stacking(speed, bgR, bgG, bgB, fgR, fgG, fgB)
  local stackedN = 0;
  local pos = 32;
  tmr.alarm(0, 30+(970/speed), 1, function()
    for i = 0, 32 do
      if i == pos or i < stackedN then
        --foreground
        lpd:setPixelColor(i, fgR, fgG, fgB);
      else
        --background
        lpd:setPixelColor(i, bgR, bgG, bgB);
      end
    end
    if pos <= stackedN then
      stackedN = stackedN + 1;
      pos = 32;
    else
      pos = pos - 1;
    end
    lpd:show();
  end)
end

function lpd_toggle()
  n = 0;
  tmr.alarm(0, 300, 1, function()
    for i = 0, 32 do
      if n == 0 then
        lpd:setPixelColor(i, 254, 0, 0)
        n = 1;
      else
        lpd:setPixelColor(i, 0, 254, 254)
        n = 0;
      end
    end
    lpd:show();
  end)
end


function lpd_fade()
  local n = 0
  local dir = 0

  tmr.alarm(0, 30, 1, function()
    n = n + dir
    if n > 30 then
      dir = -1
    elseif n <= 1 then
      dir = 1
    end
    lpd_color(0, 0, n*3)
  end)
end

function lpd_cylon()
  local n = 0
  local dir = 0

  tmr.alarm(0, 100, 1, function()
    for i = 0, 32 do
      if i == n then
        lpd:setPixelColor(i, 254, 0, 0)
      else
        lpd:setPixelColor(i, 0, 254, 254)
      end
    end
    n = n + dir
    if n >= 32 then
      dir = -1
    elseif n <= 0 then
      dir = 1
    end
    lpd:show()
  end)
end

function lpd_stop()
  tmr.stop(0)
end

function calculateRainbowColor(position)
  color = {};
  color.r = 111;
  color.g = 0;
  color.b = 0;
  return color;
end

lpd_stop();
--lpd_cylon();
--lpd_fade();
--lpd_toggle();
--lpd_stacking(300, 0, 0, 0, 111, 111, 111);
lpd_rainbow(300, width);
--lpd:show();
