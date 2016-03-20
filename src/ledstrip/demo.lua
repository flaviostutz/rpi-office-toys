dofile("fading.lua");
dofile("toggling.lua");
dofile("rainbow.lua");
dofile("lining.lua");
dofile("stacking.lua");

n = 0;

tmr.stop(1);

startFadingRainbow(15, 111);

tmr.alarm(1, 30000, 1, function()

    if n==0 then
      startFading(8, 55,0,0, 0,0,0);

    elseif n==1 then
      startRainbow(5, 15, 40);
      
    elseif n==2 then
      startStacking(3, 1, 0,0,0, 44,44,44);
      
    elseif n==3 then
      startLining(70, 4, 0,0,0, 111,111,111);
      
    elseif n==4 then
      startToggling(1000, 111,0,0, 0,0,111);
      
    end

    n = n + 1;
    if n>4 then
      n = 0;
    end
    
end)