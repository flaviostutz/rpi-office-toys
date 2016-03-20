LPD8806 = require('LPD8806');

lpd = LPD8806.new(32, 3, 4);

color = {};

function startFadingRainbow(speed, strength)
  stopRainbow();
  local n6000 = 0;
  tmr.alarm(0, 30, 1, function()

    local color = calculateRainbowColor(n6000/10, strength);

    for i = 0, lpd:getLedCount() do
      lpd:setPixelColor(i, color.r, color.g, color.b);
    end
    lpd:show();
    
    n6000 = n6000 + speed;
    if n6000 > 6000 then
      --smooth transition
      n6000 = n6000 - 6000;
    end
  end)
end

function startRainbow(speed, width, strength)
  stopRainbow();
  local n = 0;
  tmr.alarm(0, 40, 1, function()
    showRainbow(n, width, strength);
    n = n + speed;
    if n > 600 then
      --smooth transition
      n = n - 600;
    end
  end)
end

function stopRainbow()
  tmr.stop(0);
end

--offset 0-600
--strength 0-127
--width 0-600
function showRainbow(offset, width, strength)
  for i = 0, lpd:getLedCount() do
    local color = calculateRainbowColor((width*i) + offset, strength);
    lpd:setPixelColor(i, color.r, color.g, color.b);
  end
  lpd:show();
end

--position 0-600
function calculateRainbowColor(position, maxStrength)
  --circle reference
  if position > 600 then
    position = position - 600;
  end
  --divide into 6 regions
  if position >=0 and position <100 then
    color.r = maxStrength;
    color.g = (((100*position)/100) * maxStrength)/100;
    color.b = 0;
    --print("R1 color " .. position .. "-" .. color.r .. "," .. color.g .. "," .. color.b);
  elseif position >=100 and position <200 then
    color.r = maxStrength - (((100*(position-100))/100) * maxStrength)/100;
    color.g = maxStrength;
    color.b = 0;
    --print("R2 color " .. position .. "-" .. color.r .. "," .. color.g .. "," .. color.b);
  elseif position >=200 and position <300 then
    color.r = 0;
    color.g = maxStrength;
    color.b = (((100*(position-200))/100) * maxStrength)/100;
    --print("R3 color " .. position .. "-" .. color.r .. "," .. color.g .. "," .. color.b);
  elseif position >=300 and position <400 then
    color.r = 0;
    color.g = maxStrength - (((100*(position-300))/100) * maxStrength)/100;
    color.b = maxStrength;
    --print("R4 color " .. position .. "-" .. color.r .. "," .. color.g .. "," .. color.b);
  elseif position >=400 and position <500 then
    color.r = (((100*(position-400))/100) * maxStrength)/100;
    color.g = 0;
    color.b = maxStrength;
    --print("R5 color " .. position .. "-" .. color.r .. "," .. color.g .. "," .. color.b);
  else
    color.r = maxStrength;
    color.g = 0;
    color.b = maxStrength - (((100*(position-500))/100) * maxStrength)/100;
    --print("R6 color " .. position .. "-" .. color.r .. "," .. color.g .. "," .. color.b);
  end
  --hack for more red!
  --color.g = (500*color.g)/1000;
  --color.b = (500*color.b)/1000;
  --print("color " .. position .. "-" .. color.r .. "," .. color.g .. "," .. color.b);
  return color;
end
