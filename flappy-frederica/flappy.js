/*
 * runstant
 */
phina.globalize();

var ASSETS = {
  image:{
    bg:"assets/bg2.png",
    fre:"assets/fre.png",
    ueki1:"assets/ob1.png",
    ueki2:"assets/ob2.png"
  }
};

var SPEED = 1;
var SCREEN_WIDTH = 300;  
var SCREEN_HEIGHT = 465;
var BG_WIDTH = 321;


//背景
phina.define('BackGround',{
  superClass: 'DisplayElement',
  
  //初期化
  init:function(){
    this.superInit();
    
    //背景を無限スクロールする為に2枚をつなげる
    var bg = Sprite("bg").addChildTo(this);
    bg.setOrigin(0,0); 
    bg.update = function(){
      bg.x -= SPEED;
      if(bg.x <= -1 * BG_WIDTH){
        bg.x = BG_WIDTH;
      }
    }
    
    var bg2 = Sprite("bg").addChildTo(this);
    bg2.setOrigin(0,0);
    bg2.x = BG_WIDTH;//初期位置を幅分ずらす
    bg2.update = function(){
      bg2.x -= SPEED;
      if(bg2.x <= -1 * BG_WIDTH){
        bg2.x = BG_WIDTH;
      }
    }
  }
});

//TODO:ココらへんは配列にした方が良さげ
let ob1;
let ob2;
let ob3;
let ob4;
phina.define('Obstacle',{
  superClass:'DisplayElement',
  
  init:function(){
    this.superInit();
    
    ob1 = Sprite("ueki1").addChildTo(this);
    ob1.width = 25;
    ob1.height = 400;
    ob1.setOrigin(0,0);
    var rand = Math.randint(0,250);
    ob1.setPosition(200,rand - ob1.height);
    
    ob2 = Sprite("ueki2").addChildTo(this);
    ob2.setOrigin(0,0);
    ob2.setPosition(200,rand + 150);
    
    ob3 =Sprite("ueki1").addChildTo(this);
    ob3.setOrigin(0,0);
    rand = Math.randint(0,250);
    ob3.setPosition(425,rand - ob3.height);
    
    ob4 = Sprite("ueki2").addChildTo(this);
    ob4.setOrigin(0,0);
    ob4.setPosition(425,rand + 150);
  },
  
  update : function(){
    ob1.x -= SPEED * 3;
    ob2.x = ob1.x;
    if(ob1.x <= -1 * ob1.width){
      var rand = Math.randint(0,250);
      ob1.setPosition(425,rand - ob1.height)
      ob2.setPosition(425,rand + 150);
    }
    
    ob3.x -= SPEED * 3;
    ob4.x = ob3.x;
    if(ob3.x <= -1 * ob3.width){
      rand = Math.randint(0,250);
      ob3.setPosition(425,rand - ob3.height)
      ob4.setPosition(425,rand + 150);
    }
  }
});

let player;
let lab;
phina.define('Player',{
  superClass:'DisplayElement',
  init:function(){
    this.superInit();
    
    player = Sprite("fre").addChildTo(this);
    player.width = 45;
    player.height = 75;
    player.setOrigin(0,0);
    player.setPosition(50,250);
    player.physical.gravity.y = 1;
  }
});

//タイトルシーン
phina.define('TitleScene',{
  superClass:'DisplayScene',
  init:function(){
    this.superInit();
    //背景画像
    var bg = Sprite("bg").addChildTo(this);
    bg.setOrigin(0,0); 
    
    //キャラ
    player = Sprite("fre").addChildTo(this);
    player.width = 45;
    player.height = 75;
    player.setOrigin(0,0);
    player.setPosition(50,250);
    
    ob1 = Sprite("ueki1").addChildTo(this);
    ob1.width = 25;
    ob1.height = 400;
    ob1.setOrigin(0,0);
    var rand = Math.randint(0,250);
    ob1.setPosition(200,rand - ob1.height);
    
    ob2 = Sprite("ueki2").addChildTo(this);
    ob2.setOrigin(0,0);
    ob2.setPosition(200,rand + 150);
    
    var label = Label(
      {
        text:'Flappy Frederica',
        fontSize: 20,
      }).addChildTo(this);
    label.setPosition(150,200)
  },
  onclick:function(){
    this.exit();
  }
})

//メインシーン
let score = 0;
const SCORE_PREFIX = "Score:";
phina.define('MainScene', {
  superClass: 'DisplayScene',
  
  init: function() {
    this.superInit();
    
    BackGround().addChildTo(this);
    Obstacle().addChildTo(this);
    Player().addChildTo(this);
    
    this.onpointstart = function(){
      player.physical.velocity.y = -10;
    };
    
    lab = Label({
      text: SCORE_PREFIX + score,
      fontSize: 20,
      fill: 'red',
    }).addChildTo(this).setPosition(40,10);
    
    score = 0
  },
  update:function(){
    //当たり判定
    if(player.y > SCREEN_HEIGHT ||
      player.hitTestElement(ob1) || 
      player.hitTestElement(ob2) || 
      player.hitTestElement(ob3) || 
      player.hitTestElement(ob4)){
      this.exit();
    }
    
    if(ob1.x === 20){
      ///フレーム抜けとかありそう。ギリギリに判定用の透明オブジェクト必要かも
      score++;
    }
    if(ob3.x === 20){
      ///フレーム抜けとかありそう。ギリギリに判定用の透明オブジェクト必要かも
      score++;
    }
    
    lab.text = SCORE_PREFIX + score;
  }
});

phina.define('ResultScene',{
  superClass: 'DisplayScene',
  
  init: function() {
    this.superInit();
    
    Label({
      text: SCORE_PREFIX + score,
      fontSize: 20,
    }).addChildTo(this).setPosition(150,100);
    
    var fre = Sprite("fre").addChildTo(this);
    fre.setOrigin(0,0);
    fre.setPosition(80,150);

    var dokan = Sprite("ueki2").addChildTo(this);
    dokan.setOrigin(0,0);
    dokan.setPosition(50,300);
    dokan.width = 200;   
    dokan.height = 3200;

    this.backgroundColor = "#ff69b4";
  },
  onclick: function(){
    this.exit();
  }
});

const myScenes =  [
  {
    label: 'title',
    className: "TitleScene",
    nextLabel:'main',
  },
	{
		label: 'main',
    className: "MainScene",
    nextLabel:'result',
  },
  {
    label:'result',
    className: 'ResultScene',
    nextLabel:'title',
  },
];

phina.main(function() {
  var app = GameApp({
    startLabel: 'title',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    assets: ASSETS,
    scenes: myScenes,
  });
  app.run();
});
