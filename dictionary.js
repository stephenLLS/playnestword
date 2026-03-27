// NestWord — Dictionary + Scoring Engine v2
//
// WORD TYPES:
//   consecutive  — letters appear in-order inside the big word (forward or reverse)
//   rearranged   — letters used but scrambled (not consecutive)
//
// CONSECUTIVE scoring (base by length, no bonuses):
//   3=1  4=2  5=3  6+=5
//
// REARRANGED scoring (base + stacking length bonuses):
//   Base:        3=2  4=3  5=4  6+=6
//   +3 bonus if word uses >= 50% of big word's letters
//   +6 bonus if word uses >= 75% of big word's letters
//   +10 bonus if word uses ALL letters AND is genuinely rearranged
//              (not a consecutive slice — must fail both fwd + rev checks)
//
// SPEED CHAIN (managed in index.html, passed in via checkWord):
//   Find a word within 8s of last = +1 speed pt
//   Every 3 consecutive quick finds = next word x2

function getConsPts(l)   { return l >= 6 ? 5 : ({3:1,4:2,5:3}[l] || 1); }
function getRearrBase(l) { return l >= 6 ? 6 : ({3:2,4:3,5:4}[l] || 2); }

function isContained(small, big) {
  const a = {};
  for (const c of big.toLowerCase()) a[c] = (a[c]||0) + 1;
  for (const c of small.toLowerCase()) { if (!a[c]) return false; a[c]--; }
  return true;
}

function isFwdConsec(small, big) { return big.toLowerCase().includes(small.toLowerCase()); }
function isRevConsec(small, big) { return big.toLowerCase().split("").reverse().join("").includes(small.toLowerCase()); }

function letterUsagePct(word, bigWord) { return word.length / bigWord.length; }

function isFullRearrange(word, bigWord) {
  if (word.length !== bigWord.length) return false;
  if (isFwdConsec(word, bigWord)) return false;
  if (isRevConsec(word, bigWord)) return false;
  return isContained(word, bigWord);
}

// speedMultiplier: 1 = normal, 2 = chain active (passed from game state)
function scoreWord(word, bigWord, speedMultiplier) {
  speedMultiplier = speedMultiplier || 1;
  const w = word.toLowerCase(), b = bigWord.toLowerCase();
  const fwd = isFwdConsec(w, b);
  const rev = !fwd && isRevConsec(w, b);
  const isConsecutive = fwd || rev;

  let pts = 0, lengthBonus = 0, wordType, breakdown = [];

  if (isConsecutive) {
    pts = getConsPts(word.length);
    wordType = fwd ? 'consecutive-fwd' : 'consecutive-rev';
    breakdown.push({ label: fwd ? 'In-order (forward)' : 'In-order (reverse)', val: pts });
  } else {
    const base = getRearrBase(word.length);
    pts = base;
    wordType = 'rearranged';
    breakdown.push({ label: 'Rearranged (base)', val: base });

    const pct = letterUsagePct(word, bigWord);
    if (isFullRearrange(word, bigWord)) {
      lengthBonus = 10;
      wordType = 'rearranged-full';
      breakdown.push({ label: '🏆 Full rearrange! (all letters)', val: lengthBonus });
    } else if (pct >= 0.75) {
      lengthBonus = 6;
      wordType = 'rearranged-75';
      breakdown.push({ label: '75%+ letters used (+6)', val: lengthBonus });
    } else if (pct >= 0.50) {
      lengthBonus = 3;
      wordType = 'rearranged-50';
      breakdown.push({ label: '50%+ letters used (+3)', val: lengthBonus });
    }
    pts += lengthBonus;
  }

  const baseTotal = pts;
  if (speedMultiplier > 1) {
    pts = pts * speedMultiplier;
    breakdown.push({ label: '⚡ Speed chain ×' + speedMultiplier, val: pts - baseTotal });
  }

  return { pts, wordType, isConsecutive, lengthBonus, breakdown };
}

function checkWord(word, bigWord, speedMultiplier) {
  if (!word || word.length < 3) return { valid: false };
  if (!isValidWord(word)) return { valid: false };
  if (!isContained(word, bigWord)) return { valid: false };
  return { valid: true, ...scoreWord(word, bigWord, speedMultiplier || 1) };
}

function analyzeWord(bigWord) {
  const results = []; let total = 0;
  for (const w of DICTIONARY) {
    if (w.length < 3 || w.length > bigWord.length) continue;
    if (!isContained(w, bigWord)) continue;
    const score = scoreWord(w, bigWord, 1);
    results.push({ word: w.toUpperCase(), ...score });
    total += score.pts;
  }
  results.sort((a, b) => b.pts - a.pts || a.word.localeCompare(b.word));
  return { words: results, totalPoints: total };
}

function isValidWord(w) { return w && w.length >= 3 && DICTIONARY.has(w.toLowerCase()); }

const DICTIONARY = new Set([
"ace","act","add","age","ago","aid","aim","air","ale","all","and","ant","ape","arc","are","ark","arm","art","ash","ask","ate","awe","axe","aye",
"bad","bag","ban","bar","bat","bay","bed","bet","bid","big","bit","bog","bow","box","boy","bud","bug","bun","bus","but","buy",
"cab","can","cap","car","cat","cob","cod","cop","cot","cow","cry","cub","cup","cut",
"dam","den","dew","did","dig","dim","dip","dog","dot","dry","dub","due","dug","dun","duo",
"ear","eat","eel","egg","ego","elf","elk","elm","end","era","eve","ewe","eye",
"fan","far","fat","fax","fee","few","fig","fin","fit","fix","fly","fog","for","fox","fry","fun","fur",
"gag","gap","gas","gel","gem","get","gin","god","got","gum","gun","gut","guy",
"had","ham","has","hat","hay","hem","hen","her","hew","hid","him","hip","his","hit","hoe","hog","hop","hot","how","hub","hug","hum","hut",
"ice","icy","ill","imp","ink","inn","ion","ire","ivy",
"jab","jag","jam","jar","jaw","jay","jet","jig","job","jot","joy","jug","jut",
"keg","key","kid","kin","kit","lab","lag","lap","law","lax","lay","lea","led","leg","let","lid","lip","lit","log","lot","low",
"mad","man","map","mar","mat","maw","men","met","mob","mod","mop","mud","mug","mum",
"nab","nag","nap","net","new","nil","nip","nit","nod","nor","not","now","nun","nut",
"oak","oar","oat","odd","ode","off","oil","old","one","opt","orb","ore","our","out","owe","owl","own",
"pad","pal","pan","par","pat","paw","pay","pea","peg","pen","pep","per","pet","pie","pig","pin","pit","ply","pod","pop","pot","pow","pro","pub","pun","pup","put",
"ram","ran","rap","rat","raw","ray","red","ref","rep","rid","rig","rim","rip","rob","rod","rot","row","rub","rug","rum","run","rut","rye",
"sad","sag","sap","sat","saw","say","sea","set","sew","shy","sin","sip","sir","sit","six","ski","sky","sly","sob","sod","son","sop","sow","soy","spa","spy","sub","sum","sun","sup",
"tab","tan","tap","tar","tax","tea","ten","tie","tin","tip","toe","ton","too","top","toy","try","tub","tug","two",
"urn","use","van","vat","vet","vow",
"wad","war","was","wax","way","web","wed","wet","who","why","wig","win","wit","woe","wok","won","woo","wry",
"yak","yam","yap","yew","you","zap","zen","zip","zoo",
"able","ache","acid","acre","aged","also","arch","area","arid","army","atop","aunt","auto","avid","away","awed",
"back","bail","bait","bake","bald","bale","ball","balm","band","bane","bang","bank","bare","bark","barn","base","bash","bask","bass","bath","bawl","beam","bean","bear","beat","beef","been","beer","bell","belt","bend","best","bile","bill","bind","bird","bite","blot","blow","blue","blur","boar","boat","body","bold","bolt","bond","bone","book","boom","boot","bore","born","both","bout","brag","bran","brat","brew","brim","brow","bull","bump","bunk","burn","bury","bush","busy",
"cage","cake","call","calm","came","cane","card","care","carp","cart","case","cash","cast","cave","cell","cent","chap","char","chat","chef","chew","chip","chop","cite","city","clad","clam","clap","claw","clay","clip","clod","clog","clot","club","clue","coal","coat","coil","coin","coke","cold","colt","come","cone","cook","cool","cord","core","cork","corn","cost","cove","crab","cram","crew","crop","crow","cube","cure","curl","curt",
"dace","dale","dame","dare","dark","dart","dash","data","date","dawn","dead","deaf","deal","dean","dear","deed","deem","deep","deer","deft","dent","deny","desk","dial","dice","diet","dire","dirt","disk","dock","dole","dome","done","doom","door","dorm","dose","dote","dove","down","drab","drag","dram","draw","drew","drip","drop","drum","dual","dull","duly","dumb","dump","dunk","dusk","dust",
"each","earl","earn","ease","east","easy","edge","edit","emit","envy","epic","even","ever","evil","exam","exit",
"face","fact","fade","fail","fair","fall","fame","farm","fast","fate","fawn","fear","feat","feel","feet","fell","felt","fern","file","fill","film","find","fine","fire","firm","fish","fist","flag","flat","flaw","flea","flew","flex","flip","flit","flow","foam","foil","fold","folk","fond","font","fool","foot","ford","fore","fork","form","fort","foul","fowl","free","frog","from","fuel","full","fume","fund","fuse",
"gale","game","gang","gaze","gear","gift","gild","gilt","give","glad","glee","glen","glib","glob","glow","glue","goal","goat","goes","gold","golf","gone","good","gore","gown","grab","gray","grew","grim","grin","grip","grit","grow","grub","gulf","gull","gulp","gust",
"hack","hail","hair","half","hall","halt","hand","hang","hard","hare","harm","harp","hash","hate","have","hawk","head","heal","heap","hear","heat","heel","heir","held","helm","help","herb","herd","here","hero","hide","high","hill","hilt","hint","hire","hoax","hold","hole","home","hone","hood","hoof","hook","hoop","hope","horn","hose","host","hour","huge","hull","hump","hung","hunt","hurt","husk",
"idea","idle","info","into","iron","isle",
"jade","jail","jest","join","joke","jolt","junk","jury","just",
"keel","keen","kept","kick","kill","kind","king","kiss","knob","knot","know",
"lack","laid","lake","lamb","lame","land","lane","lark","lash","last","late","lean","leap","left","lend","lens","lest","levy","lick","life","lift","like","lime","limp","line","link","lion","list","live","load","loan","lock","loft","lone","long","look","loom","loop","lord","lore","lose","loss","lost","loud","lout","love","luck","lull","lump","lure","lurk","lust",
"mace","made","mail","main","make","male","mall","malt","mane","mare","mark","mast","mate","math","maze","meal","mean","meat","melt","memo","menu","mere","mesh","mild","milk","mill","mime","mind","mine","mint","mire","mist","moat","mock","mode","mold","mole","monk","mood","moon","moor","more","morn","moss","most","moth","move","much","mule","must",
"nail","name","nape","near","neat","neck","need","nest","news","next","nice","nine","node","noon","norm","nose","note","noun","nude",
"odds","odor","once","only","open","oral","oval","oven","over",
"pace","pack","page","paid","pain","pale","palm","pane","park","part","pass","past","path","pave","peak","peal","peel","pelt","pest","pick","pier","pile","pine","pipe","plan","play","plea","plot","plow","ploy","plug","plum","plus","poem","poet","poke","pole","poll","pond","pore","pork","pose","pour","pray","prey","prim","prod","prop","pull","pump","pure","push",
"rack","rage","rail","rain","rake","rank","rant","rare","rash","rate","rave","read","real","reap","reel","rein","rely","rent","rest","rice","rich","ride","rife","rift","ring","riot","rise","risk","rite","road","roam","roar","robe","rock","role","roll","roof","rook","room","rope","rose","rout","rule","ruse","rush","rust",
"safe","sage","sail","sake","sale","salt","same","sand","sane","sang","sank","save","scan","scar","seat","seed","seep","self","sell","send","sent","shed","shin","ship","shoe","shot","show","shut","sick","side","sigh","silk","sill","silt","sing","sink","site","size","skin","skip","slab","slap","slat","sled","slew","slim","slip","slit","slop","slot","slow","slug","slum","slur","snap","snob","snot","snow","snub","soak","sock","soft","soil","sole","some","song","soon","soot","sore","sort","soul","soup","sour","span","spar","spin","spit","spot","spun","stab","stag","star","stay","stem","step","stew","stir","stop","stub","stud","stun","such","suit","sulk","sung","sunk","sure","surf","swam","swan","swap","swat","sway","swim",
"tack","tale","talk","tall","tame","tang","tape","task","tart","teal","tear","tell","tend","tent","term","test","text","tick","tide","tidy","tier","tile","till","time","tiny","tire","toad","told","toll","tomb","tome","tone","took","torn","toss","tour","town","trek","trim","trio","trip","trod","true","tuck","tuna","tune","turf","turn","tusk",
"ugly","undo","unit","upon","used","user","vain","vale","vary","vast","veil","vein","very","vest","vibe","vice","view","vile","vine","void","volt","vote",
"wade","wage","wail","wait","wake","walk","wall","wane","want","ward","warm","warn","warp","wart","wasp","wave","weak","wean","weed","week","weep","weld","well","went","were","west","whim","whip","wide","wife","wild","will","wilt","wind","wine","wing","wire","wise","wish","with","woke","wolf","wood","wool","word","wore","work","worm","worn","wove","wrap","wren","writ",
"yard","yarn","yawn","year","yell","your","zeal","zero","zone",
"abbey","abide","about","above","abuse","acorn","acute","adage","adapt","adept","admit","after","again","agent","agile","agree","ahead","alarm","album","alert","alien","align","alike","alive","allay","allot","allow","alone","along","aloof","aloud","altar","alter","amber","amend","angel","anger","angle","angry","ankle","annex","anvil","apart","apple","apply","apron","argue","arise","armor","aroma","arose","array","arrow","asset","avoid","awake","award","aware",
"bacon","badge","badly","baton","beach","beard","beast","began","begin","being","below","bench","berth","birch","bison","black","blade","blame","bland","blank","blast","blaze","bleak","bleed","bless","blind","block","blood","bloom","blown","board","boast","bonus","boxer","braid","brake","brand","brave","brawl","break","breed","brick","bride","brief","brine","bring","brink","brisk","broth","brown","brute","build","built","bulge","bunch","buyer",
"cabin","candy","carry","cedar","chain","chair","chalk","chant","chaos","charm","chase","cheap","check","cheek","cheer","chess","chest","chief","child","china","choir","chord","churn","cigar","civic","civil","claim","clamp","clash","class","clean","clear","clerk","click","cliff","climb","cling","clock","clone","close","cloth","cloud","coach","cobra","comet","coral","count","court","cover","crane","crash","creak","cream","crest","crisp","cross","crown","cruel","crush","crypt","cubic",
"daily","dairy","daisy","dance","dandy","debut","decoy","delta","depot","depth","derby","devil","dirty","ditch","diver","dizzy","dodge","drain","drape","drawl","dread","dream","dress","dried","drill","drink","drive","drove","drown","druid","dryer","dwarf","dwell","dying",
"eagle","early","earth","eight","elder","elbow","elite","ember","empty","enemy","enter","entry","equip","erupt","essay","event","every","exact","excel","exile","extra",
"fable","faint","faith","false","fancy","fatal","favor","feast","fence","fetch","fever","fiber","field","fiend","fiery","fifth","fifty","fight","filth","final","first","flair","flame","flank","flare","flesh","fling","float","flock","flood","floor","flour","flown","flute","folks","force","forge","forth","found","frame","frank","fraud","fresh","front","froze","fruit","fully",
"genre","ghost","giant","given","gland","glare","glass","glean","glide","glint","gloat","globe","gloss","glove","grain","grand","grant","grape","grasp","grass","grate","grave","graze","greed","green","greet","grief","gripe","groan","groin","grope","gross","grout","grove","gruel","gruff","guile","guise","gusto",
"habit","halve","happy","harsh","hatch","haunt","haven","heard","heart","heavy","hedge","hence","heron","hinge","hippo","hoist","honor","horse","hotel","hound","house","human","humor","hurry",
"ideal","image","imply","inept","infer","inlet","inner","input","inter","intro",
"jaunt","jewel","joust","judge","juice","juicy","jumbo","jumpy","kayak","kneel","knelt","knife","knock","known",
"lance","lapse","large","laser","latch","later","lathe","laugh","layer","leach","leafy","learn","lease","least","leave","ledge","legal","lemon","level","light","liner","lingo","liver","local","lodge","logic","loose","lover","lower","loyal","lucid","lucky","lunge","lusty",
"magic","maker","manor","maple","march","marry","match","mayor","media","mercy","merit","metal","miner","minor","minus","mirth","miser","model","money","moral","mossy","motif","motor","mount","mourn","mouth","music","musty",
"naive","needs","nerve","never","night","noble","north","noted","notch","novel",
"ocean","offer","often","onset","opera","order","other","outer","outdo","overt","owned",
"paint","panic","paper","patch","pause","peace","peach","pearl","pedal","penny","perch","piano","pinch","pixel","place","plain","plane","plank","plant","plate","plaza","plead","pleat","pluck","plumb","point","poker","polar","poppy","porch","pouch","pound","power","press","price","prick","pride","prime","print","prior","prize","probe","prone","prude","prune","pulse","purse",
"queen","quest","queue","quota","quote",
"racer","radar","radio","raise","rally","ranch","range","rapid","raven","reach","ready","realm","rebel","refer","reign","relax","repel","repay","ripen","risen","river","rivet","robot","rocky","rough","round","rouge","route","rover","ruler","rumor",
"sadly","saint","salad","salve","sandy","sauce","scale","scene","scope","score","scout","scram","scrap","screw","scrub","seize","sense","serve","seven","sever","shaft","shake","shale","shall","shame","shape","share","sharp","shave","shawl","shear","sheen","sheep","sheer","shelf","shell","shift","shirt","shock","shore","short","shout","shove","sight","since","sixth","sixty","skill","skull","slain","slang","slave","sleep","sleet","sleek","slept","slice","slick","slope","sloth","small","smart","smash","smear","smell","smile","smirk","smoke","snail","snake","snare","sneak","sniff","solar","solid","sorry","south","space","spare","spark","spawn","speak","spear","speed","spell","spend","spice","spill","spite","spoil","spook","spore","sport","spray","spree","squad","squat","squid","staff","stain","stale","stalk","stall","stamp","stand","stare","stark","start","state","stave","steal","steam","steed","steel","steep","steer","stern","stock","stoic","stone","stood","store","storm","story","stout","stove","strap","straw","stray","strip","stump","style","suite","sunny","super","surge","swamp","swear","sweat","sweep","sweet","swept","swift","swill","swine","swirl","sword","sworn",
"table","talon","taunt","teach","tempt","tense","those","three","threw","throw","tiger","title","toast","tonic","topaz","total","totem","touch","tough","trace","track","trade","trail","train","trait","tramp","trash","trawl","treat","trial","tribe","trick","trite","troop","trout","truck","truly","trump","trunk","trust","truth","tweed","tweet","twice","twirl","twist","tying",
"ulcer","ultra","uncut","under","undue","unfit","unify","union","unite","unity","unlit","until","upper","upset","usage",
"vague","valid","valor","value","valve","vapid","vault","vigor","viper","viral","vital","vivid","vocal","voter",
"wader","watch","water","weary","weave","wedge","weedy","weigh","weird","whale","whack","wheat","wheel","where","which","while","white","whole","whose","widen","widow","witch","woman","women","world","worry","worse","worst","worth","would","wound","wrath","wring","wrote",
"yacht","yearn","yield","young","youth","yummy","zesty","zilch","zippy",
"smith","black","slack","slick","silk","slim","skit","skill","skim","skip",
"latch","larch","march","marsh","shard","shark","sharp","charm","chart",
"straw","stray","strap","stark","steam","steel","steep","steer",
"brand","braid","brake","brave","brawl","break","breed","brick","bride","brief","brine",
"grain","grant","grape","grasp","grass","grate","grave","graze","greed","green",
"crane","crash","creak","cream","crest","crisp","cross","crown","cruel","crush",
"plain","plane","plank","plant","plate","plaza","plead","pleat","pluck","plumb",
"flame","flank","flare","flesh","fling","float","flock","flood","floor","flour","flown",
"snare","sneak","sniff","snake","snail",
"blanket","blunder","chapter","charter","flatten","plaster","slander","slender",
"chamber","charmed","grander","granted","grasped",
"blackout","blacken","smithing","landmark","workmate","workload","workshop",
"farmland","farmyard","farmhand","snowfall","snowbank","snowdrift","snowflake","snowstorm",
"sunburn","sundown","sunbeam","sunblock","sunburst","sunlight","sunrise","sunset","sunshine",
"seabird","seafood","seahorse","seaport","seashell","seashore","seaside","seawall","seaweed"
]);
