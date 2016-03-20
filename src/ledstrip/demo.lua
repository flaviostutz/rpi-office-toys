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
  tmr.alarm(1, 1000, 1, function()
    for i = 0, lpd:getLedCount() do
      color = calculateRainbowColor(i * 30, 127);
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

--'position' goes from 1 to 6000
function calculateRainbowColor(position, maxStrength)
  color = {};
  --divide into 6 regions
  if position >=0 and position <1000 then
    color.r = maxStrength;
    color.g = (((1000*position)/1000) * maxStrength)/1000;
    color.b = 0;
  elseif position >=1000 and position <2000 then
    color.r = maxStrength - (((1000*(position-1000))/1000) * maxStrength)/1000;
    color.g = maxStrength;
    color.b = 0;
  elseif position >=2000 and position <3000 then
    color.r = 0;
    color.g = maxStrength;
    color.b = (((1000*(position-2000))/1000) * maxStrength)/1000;
  elseif position >=3000 and position <4000 then
    color.r = 0;
    color.g = maxStrength - (((1000*(position-3000))/1000) * maxStrength)/1000;
    color.b = maxStrength;
  elseif position >=4000 and position <5000 then
    color.r = (((1000*(position-4000))/1000) * maxStrength)/1000;
    color.g = 0;
    color.b = maxStrength;
  else
    color.r = maxStrength;
    color.g = 0;
    color.b = maxStrength - (((1000*(position-5000))/1000) * maxStrength)/1000;
  end
  print("color " .. position .. "-" .. color.r .. "," .. color.g .. "," .. color.b);
  return color;
end

lpd_stop();
--lpd_cylon();
--lpd_fade();
--lpd_toggle();
--lpd_stacking(300, 0, 0, 0, 111, 111, 111);
lpd_rainbow(300, width);
--lpd:show();
