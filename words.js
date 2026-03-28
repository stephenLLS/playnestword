const WORD_BANK = {
  nature:["THUNDERSTORM","WILDERNESS","WATERFALL","EVERGREEN","SUNFLOWER","BUTTERFLY","GRASSLAND","BLUEBERRY","RASPBERRY","SNOWFLAKE","RAINFOREST","DRAGONFLY","PINECONE","HEDGEHOG","PORCUPINE","BLACKBIRD","WHIRLPOOL","TREELINE","CLOUDBANK","SHORELINE","DRIFTWOOD","EARTHWORM","MARSHLAND","STARLIGHT","SALTWATER","FOXGLOVE","SANDSTONE"],
  canadian:["PARLIAMENT","LAKESHORE","PROVINCES","TERRITORY","WILDERNESS","TUNDRA","CARIBOU","SNOWMOBILE","LUMBERJACK","TOBOGGANING","CANOEIST","PRAIRIES","BLACKBERRY","BLUEBERRY","PERMAFROST","PORTAGE","FIREWOOD","SNOWDRIFT","TRAPPER","STAMPEDE","PIPELINE","HINTERLAND","ARROWHEAD","BIRCHBARK","WHITEWATER"],
  food:["BREADCRUMB","PEPPERCORN","BUTTERSCOTCH","ARTICHOKE","GINGERBREAD","STRAWBERRY","BLACKBERRY","BLUEBERRY","MARMALADE","SHORTBREAD","CORNSTARCH","CHEESECAKE","BUTTERMILK","SOURDOUGH","WATERMELON","PINEAPPLE","CHOCOLATE","SPEARMINT","ROSEMARY","TANGERINE","ELDERBERRY","BUTTERNUT","PERSIMMON","GRAPEFRUIT","CARDAMOM","SUNFLOWER","CORNBREAD","APPLESAUCE"],
  sports:["TOUCHDOWN","GOALKEEPER","WRESTLING","SPRINGBOARD","BACKSTROKE","FOREHAND","MARATHON","BASKETBALL","VOLLEYBALL","SKATEBOARD","SNOWBOARD","LACROSSE","SCOREBOARD","UNDERHAND","CROSSBAR","SPRINTER","HALFPIPE","OVERTIME","SIDELINE","PLAYMAKER","GOALPOST","DROPKICK","LEFTHOOK","UPPERCUT"],
  farming:["FARMSTEAD","LIVESTOCK","HAYSTACK","PITCHFORK","CORNFIELD","SCARECROW","THRESHING","POLLINATE","HARVESTER","WINDMILL","SHEEPDOG","GREENHOUSE","SEEDLING","BARNYARD","IRRIGATION","PLOWSHARE","ORCHARD","COMPOST","BEEKEEPER","HENHOUSE","CATTLEMAN","SUNFLOWER","FARMHOUSE","HAYMAKER","CROPLAND","SHEPHERD","CULTIVATOR"],
  trades:["BLACKSMITH","STEELWORK","FRAMEWORK","BLUEPRINT","CARPENTER","IRONWORKS","SCAFFOLDING","FOUNDATION","BRICKWORK","WORKBENCH","IRONCLAD","METALWORK","MILLWRIGHT","PIPEFITTER","SPARKPLUG","CRANKSHAFT","DRIVESHAFT","FLYWHEEL","TOOLMAKER","SLEDGEHAMMER","GRINDSTONE","SANDPAPER","TINSMITH","COPPERWORK","STEELPLATE","WORKSHOP","IRONFORGE"],
  outdoors:["CAMPGROUND","BACKPACKER","TRAILHEAD","STARGAZER","RIVERBANK","MOUNTAINTOP","PATHFINDER","TREEHOUSE","HAMMOCK","KAYAKING","TRAILBLAZER","LAKESHORE","RAPPELLING","GLAMPING","OVERLANDER","BUSHCRAFT","WAYFINDER","CAMPSITE","BASECAMP","WOODCRAFT","SNOWSHOEING","CLIFFSIDE","RIDGELINE","WILDERNESS","FLATWATER","DOWNRIVER","SCOUTING"],
  general:["THUNDERCLAP","ADVENTURE","KNOWLEDGE","REMARKABLE","CROSSWORD","DISCOVERY","WONDERFUL","CHALLENGE","FANTASTIC","YESTERDAY","SOMETHING","BEAUTIFUL","BREAKFAST","CARPENTER","DANGEROUS","AFTERNOON","EVERYBODY","FORGOTTEN","GRANDFATHER","IMAGINATION","JELLYFISH","NIGHTMARE","OVERBOARD","PASSENGER","QUICKSAND","SHIPWRECK","TRANSFORM","WAREHOUSE","BIRTHPLACE","UNDERSTAND"]
};
const THEMES={
  nature:{name:"Nature Week",color:"#4ae89a",emoji:"🌿",desc:"Words from the natural world"},
  canadian:{name:"Canada Week",color:"#e84a4a",emoji:"🍁",desc:"Proudly Canadian words"},
  food:{name:"Food Week",color:"#e8c84a",emoji:"🍞",desc:"From kitchen to table"},
  sports:{name:"Sports Week",color:"#4a9ae8",emoji:"⚡",desc:"Get in the game"},
  farming:{name:"Farm Week",color:"#a0e84a",emoji:"🌾",desc:"From the land"},
  trades:{name:"Trades Week",color:"#e8844a",emoji:"🔧",desc:"Built with skill"},
  outdoors:{name:"Outdoors Week",color:"#4ae8d8",emoji:"⛺",desc:"Wild and free"},
  general:{name:"Word Fest",color:"#c84ae8",emoji:"✨",desc:"The best of everything"}
};
const THEME_ORDER=["trades","nature","food","sports","farming","canadian","outdoors","general"];
function getTodayTheme(){
  // Use local date so word changes at local midnight, not UTC midnight
  const now=new Date();
  const localStart=new Date(2024,0,1); // Jan 1 2024 local time
  const localNow=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const w=Math.floor((localNow-localStart)/(7*24*60*60*1000));
  return THEME_ORDER[w%THEME_ORDER.length];
}
function getTodayWord(){
  const now=new Date();
  const t=getTodayTheme(),words=WORD_BANK[t];
  // Seed based on local date components — changes at local midnight
  const seed=now.getFullYear()*10000+((now.getMonth()+1)*100)+now.getDate();
  return words[seed%words.length].replace(/\s/g,"");
}
function getTodayDateStr(){return new Date().toLocaleDateString("en-CA",{weekday:"long",year:"numeric",month:"long",day:"numeric"});}
function getDayNumber(){
  // Local midnight to local midnight
  const now=new Date();
  const localToday=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const localStart=new Date(2024,0,1);
  return Math.floor((localToday-localStart)/(864e5));
}
