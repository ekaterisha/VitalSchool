const POSSIBLE_TYPES = ["none","rock"];
const POSSIBLE_THINGS = ["nothing","boy","apples","apple-tree","red-cherry-tree","red-cherry","yellow-cherry-tree","yellow-cherry","stump"];
const POSSIBLE_DIRS = ["N","S","E","W"];
const POSSIBLE_STATES = ["walking","waiting","recovering","hitting"];

class Cell
{
  constructor(x,y,type)
  {
    this.x = x;
    this.y = y;
    this.type = type || "none";
    this.isWall = ((this.x*this.y) % 2 === 0);
  }
  checkPassable()
  {
    return (this.type==="none") && (this.getThing()===nothing);
  }
  setType(newType)
  {
    this.type=newType;
    switch (newType) {
      case "rock":
      this.description = "Каменная стена. Ничего не могу с ней сделать.";
      break;
    }
    return this;
  }
  getNext()
  {
      switch (boy.dir)
      {
        case "N": return cells[this.x][this.y+1];
        case "S": return cells[this.x][this.y-1];
        case "E": return cells[this.x+1][this.y];
        case "W": return cells[this.x-1][this.y];
      }
  }
  getDescription()
  {
  return (this.isWall)
  ?(this.checkPassable())
  ?this.getNext().getDescription()
  :this.description
  :this.getThing().description;
  }
  addThing(Cl,props)
  {
    return new Cl(this,props);// TODO: check available space
  }
  getThing()
  {
    return (things.filter(thing=>thing.cell===this).length!==0)
    ?things.filter(thing=>thing.cell===this)[0]
    :nothing;
  }
  getContainer()
  {
    return document.querySelector(`.c${13+this.x-boy.cell.x}.r${13-this.y+boy.cell.y}`);
  }
  updateSelf()
  {
    changeClass(this.getContainer(),POSSIBLE_TYPES,this.type);
    if(this.getThing()===nothing)
    {
      removeClassList(this.getContainer(),POSSIBLE_THINGS);
      removeLabel(this.getContainer());
    }
  }
}
class Fact
{
  constructor (target, action, lifeTime)
  {
    this.target = target;
    this.birth = boy.age;
    this.lifeTime = lifeTime;
    this.explode = action;
    facts.push(this);
  }
  evolve()
  {
    if (this.lifeTime--<=0)
    {
      this.explode.call(this.target);
      kick(facts,this);
    }
    if (!this.target.checkExistance()) kick(facts,this);
  }
}
class Thing
{
  constructor(cell,props)
  {
    this.cell = cell;
    this.gotHit = false;
    if(!!props) Object.entries(props).forEach(prop => this[prop[0]] = prop[1]);
    things.push(this);
  }
  checkExistance() {return (things.indexOf(this)!==-1);}
  suffer(damage)
  {
    damage = damage || 1;
    if (this.state==="waiting") damage = Math.ceil(damage/2);
    logs.add(`${this.name} получил ${damage} повреждений,${(this.state==="waiting")?" 50% заблокировано,":""} осталось ${this.hp} жизней.`);
    this.set("hp",this.hp-damage);
    this.state = "recovering";
    this.gotHit = true;
    if (this.hp<=0) this.die();
  }
  respawn()
  {
    kick(things,this);
    this.cell.addThing(this.owner.constructor);
  }
  die()
  {
    kick(things,this);
    if (!!this.body) new Fact(this.cell.addThing(this.body,{owner:this}),this.respawn,dice(this.hp*this.xpPrice,this.hp*this.xpPrice*3,"low"));
    logs.add(this.necrolog);
    boy.getXp(this.xpPrice);
    this.hp=0;
  }
  set(k, v)
  {
    this[k]=v;
    if (k===this.labelName) this.label = v;
    return this;
  }
  updateSelf()
  {
    changeClass(this.cell.getContainer(),POSSIBLE_THINGS,this.type);
    if(!!this.dir)
    changeClass(this.cell.getContainer(),POSSIBLE_DIRS,this.dir);
    if(!!this.state)
    changeClass(this.cell.getContainer(),POSSIBLE_STATES,this.state);
    if(!!this.label)
    changeLabel(this.cell.getContainer(), this.label);
    else removeLabel(this.cell.getContainer());
    if(this.gotHit)
    {
      flashClass(this.cell.getContainer(),"red-pulse");
      this.gotHit = false;
    }
  }
  linkLabel(lbl)
  {
    this.labelName = lbl;
    this.label = this[lbl];
  }
}
class Tree extends Thing
{
  constructor(cell,props)
  {
    super(cell,props);
    this.chops = 0;
    this.body=Stump;
  }
  checkNumberOfChops()
  {
    if (this.chops/6===this.hp) this.die();
    else boy.suffer(dice(5,15,"flat"));
    this.chops=0;
  }
  getChoppedGenerator(multiplicator)
  {
    return () =>
    {
      let fact = facts.find(fact=>fact.target===this) || new Fact(this,this.checkNumberOfChops,1);
      fact.lifeTime=1;
      fact.target.chops+=6/multiplicator;
      this.gotHit = true;
    }
  }
}
class AppleTree extends Tree
{
  constructor(cell,props)
  {
    super(cell,props);
    this.type = "apple-tree";
    this.hp = dice(1,100,"low");
    this.linkLabel("hp");
    this.xpPrice = 5;
    this.getHit=this.getChoppedGenerator(1);
    this.name="Яблоня";
    this.description = `Яблоня с <b>${this.hp}</b> яблоками. Чтобы срубить её и заполучить яблоки, нужно ударить по ней столько раз, сколько на ней яблок. Ошибешься - прилетит веткой.`;
    this.necrolog = `Я срубил яблоню с ${this.hp} яблоками.`;
  }
}
class RedCherryTree extends Tree
{
  constructor(cell,props)
  {
    super(cell,props);
    this.type = "red-cherry-tree";
    this.hp = dice(1,10,"high");
    this.linkLabel("hp");
    this.xpPrice = 10;
    this.getHit=this.getChoppedGenerator(2);
    this.name="Красная вишня";
    this.description = `Вишневое дерево с <b>${this.hp}</b> гроздьями по 2 красные вишни. Чтобы срубить её и заполучить ягоды, нужно ударить по ней столько раз, сколько на ней вишен. Ошибешься - прилетит веткой.`;
    this.necrolog = `Я срубил вишневое дерево с ${this.hp*2} красными вишнями.`;
  }
}
class YellowCherryTree extends Tree
{
  constructor(cell,props)
  {
    super(cell,props);
    this.type = "yellow-cherry-tree";
    this.hp = dice(1,10,"high");
    this.linkLabel("hp");
    this.xpPrice = 15;
    this.getHit=this.getChoppedGenerator(3);
    this.name="Желтая вишня";
    this.description = `Вишневое дерево с <b>${this.hp}</b> гроздьями по 3 желтые вишни. Чтобы срубить её и заполучить ягоды, нужно ударить по ней столько раз, сколько на ней вишен. Ошибешься - прилетит веткой.`;
    this.necrolog = `Я срубил вишневое дерево с ${this.hp*3} желтыми вишнями.`;
  }
}
class Stump extends Thing
{
  constructor(cell,props)
  {
    super(cell,props);
    this.type = "stump";
    this.hp = 10;
    this.xpPrice = 1;
    this.getHit=this.suffer;
    this.name="Пень";
    this.description = `Когда-то здесь стояла <b>${this.owner.name}</b>, остался только пенёк. Его можно срубить за 10 ударов, если он мешает проходу. Но лучше оставить его в покое и скоро здесь вырастет новое дерево.`;
    this.necrolog = `Я зачем-то срубил пень.`;
  }
}

const cells = Array.from({length:100}, (v,x)=>Array.from({length:100}, (v,y)=>new Cell(x,y)));;
const things = [];
const facts = [];
const logs = [];

logs.add = line => logs.unshift(`(ход: ${boy.age}) `+ line);

const nothing = new Thing(cells[0][0],{description: "Ничего."});

const boy = new Thing(cells[51][51],{
  type: "boy",
  dir: "S",
  state: "walking",
  name: "Я",
  necrolog: "Я умер.",
  body: "deadBoy",
  hp: 30,
  xp:0,
  age: 0,
  xpPrice: 0});

boy.move = dir =>
{
  if (boy.state==="recovering") return boy.set("state","walking");
  switch (boy.dir+"->"+dir)
  {
    case "S->E": case "E->N": case "N->W": case "W->S": boy.turn("left"); break;
    case "E->S": case "N->E": case "W->N": case "S->W": boy.turn("right"); break;
    case "N->N": case "S->S": case "E->E": case "W->W": boy.hit(boy.cell.getNext()); break;
    case "N->S": case "S->N": case "E->W": case "W->E": boy.wait(); break;
  }
}

boy.stepForward = () =>
{
  boy.set("state","walking");
  boy.cell=boy.cell.getNext().getNext();
}

boy.turn = side =>
{
  boy.set("state","walking");
  switch (boy.dir+"->"+side)
  {
    case "N->right": case "S->left": boy.set("dir","E"); break;
    case "S->right": case "N->left": boy.set("dir","W"); break;
    case "W->right": case "E->left": boy.set("dir","N"); break;
    case "E->right": case "W->left": boy.set("dir","S"); break;
  }
}

boy.wait = () =>
{
  boy.set("state","waiting");
}

boy.hit = cell =>
{
  if(cell.isWall)
    if(cell.checkPassable()) boy.hit(cell.getNext());
    else return;
  else  if (cell.checkPassable()) boy.stepForward();
        else
        {
          boy.set("state","hitting");
          cell.getThing().getHit();
        }
}

boy.getXp = xp =>
{
  boy.xp+=xp;
  logs.add(`Я получил ${xp} опыта.`);
}

const initWorld = (option) =>
{
  cells.forEach((row,x)=>row.forEach((cell,y)=>
  {
      if ((x===20)&&(y>=20)&&(y<=80)) cell.setType("rock");
      if ((x===80)&&(y>=20)&&(y<=80)) cell.setType("rock");
      if ((y===20)&&(x>=20)&&(x<=80)) cell.setType("rock");
      if ((y===80)&&(x>=20)&&(x<=80)) cell.setType("rock");
      if ((x===42)&&(y>=42)&&(y<=60)) cell.setType("rock");
      if ((x===60)&&(y>=42)&&(y<=60)) cell.setType("rock");
      if ((y===42)&&(((x>=42)&&(x<=48))||((x>=54)&&(x<=60)))) cell.setType("rock");
      if ((y===60)&&(x>=42)&&(x<=60)) cell.setType("rock");
  }));
  let toAdd = [];
  switch (option) {
    case "mixed":
      toAdd.push(AppleTree, RedCherryTree, YellowCherryTree);
      break;
    case "apples":
      toAdd.push(AppleTree);
      break;
    case "red-cherries":
      toAdd.push(RedCherryTree);
      break;
    case "yellow-cherries":
      toAdd.push(YellowCherryTree);
      break;
    default:

  }
  for(let i = 0; i<4;cells[dice(21,29)*2+1][43+2*i++].addThing(toAdd[dice(0,toAdd.length-1)]));
  for(let i = 0; i<4;cells[dice(21,29)*2+1][53+2*i++].addThing(toAdd[dice(0,toAdd.length-1)]));
}

const redraw = () =>
{
  facts
  .forEach(fact=>fact.evolve());
  cells
  .slice(boy.cell.x-13,boy.cell.x+14)
  .map(el=>el.slice(boy.cell.y-13,boy.cell.y+14))
  .forEach(row=>row.forEach(cell=>cell.updateSelf()));
  things
  .filter(thing=> (thing.cell.x>=boy.cell.x-13)
                &&(thing.cell.x<=boy.cell.x+13)
                &&(thing.cell.y>=boy.cell.y-13)
                &&(thing.cell.y<=boy.cell.y+13))
  .forEach(thing=>thing.updateSelf());
  updateHTML("target-description",boy.cell.getNext().getDescription());
  updateHTML("log",logs.join("\r"));
  updateHTML("hp",boy.hp);
  updateHTML("xp",boy.xp);
  updateHTML("age",++boy.age);
};

document.getElementById("fWorldSetup").addEventListener('submit', evt =>
{
	evt.preventDefault();
  initWorld(document.getElementById("inOption").value);
  redraw();
  removeClass(document.getElementById("gameContainer"),"hidden");
  addClass(document.getElementById("setup"),"hidden");

  document.addEventListener('keydown',eKey =>
                                            {
                                              if (eKey.repeat) {return;}
                                              if (!boy.checkExistance()) {return;}
                                              switch (eKey.code)
                                              {
                                                case "ArrowUp": case "KeyW":
                                                  boy.move("N");
                                                  break;
                                                case "ArrowDown": case "KeyS":
                                                  boy.move("S");
                                                  break;
                                                case "ArrowRight": case "KeyD":
                                                  boy.move("E");
                                                  break;
                                                case "ArrowLeft": case "KeyA":
                                                  boy.move("W");
                                                  break;
                                                default:
                                                  return;
                                              }
                                              eKey.preventDefault();
                                              redraw();
                                            });
});
