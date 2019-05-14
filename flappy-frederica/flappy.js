/*
 * runstant
 */
phina.globalize();

let ASSETS = {
  image:{
    bg:"assets/bg2.png",
    fre:"assets/fre.png",
    ueki1:"assets/ob1.png",
    ueki2:"assets/ob2.png",
    share:"assets/Twitter.png",
    restart:"assets/restart.png",
    dokaeki:"assets/dokaeki.png",
    pause:"assets/pause.png",
    pause_on:"assets/pause_on.png"
  }
};

let SPEED = 1;
let SCREEN_WIDTH = 300;  
let SCREEN_HEIGHT = 465;
let BG_WIDTH = 321;


//背景
phina.define('BackGround',{
  superClass: 'DisplayElement',
  
  //初期化
  init:function(){
    this.superInit();
    
    //背景を無限スクロールする為に2枚をつなげる
    let bg = Sprite("bg").addChildTo(this);
    bg.setOrigin(0,0); 
    bg.update = function(){
      bg.x -= SPEED;
      if(bg.x <= -1 * BG_WIDTH){
        bg.x = BG_WIDTH;
      }
    }
    
    let bg2 = Sprite("bg").addChildTo(this);
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

//スコア判定用Shape
let scoreCol;
phina.define('ScoreCol',{
  superClass:'DisplayElement',
  init:function(){
    this.superInit();

    scoreCol = Shape({
      width: 23,
      height: SCREEN_HEIGHT,
    }).addChildTo(this);
    scoreCol.setOrigin(0,0);
    scoreCol.alpha = 0;
  }
});

//TODO:ココらへんは配列にした方が良さげ
let ob1;
let ob2;
let ob3;
let ob4;
const RAND_MIN = 25;
const RAND_MAX = 290;
phina.define('Obstacle',{
  superClass:'DisplayElement',
  
  init:function(){
    this.superInit();
    
    ob1 = Sprite("ueki1").addChildTo(this);
    ob1.width = 25;
    ob1.height = 400;
    ob1.setOrigin(0,0);
    let rand = Math.randint(RAND_MIN,RAND_MAX);
    ob1.setPosition(200,rand - ob1.height);
    
    ob2 = Sprite("ueki2").addChildTo(this);
    ob2.setOrigin(0,0);
    ob2.setPosition(200,rand + 150);
    
    ob3 =Sprite("ueki1").addChildTo(this);
    ob3.setOrigin(0,0);
    rand = Math.randint(RAND_MIN,RAND_MAX);
    ob3.setPosition(425,rand - ob3.height);
    
    ob4 = Sprite("ueki2").addChildTo(this);
    ob4.setOrigin(0,0);
    ob4.setPosition(425,rand + 150);
  },
  
  update : function(){
    ob1.x -= SPEED * 3;
    ob2.x = ob1.x;
    if(ob1.x <= -1 * ob1.width){
      let rand = Math.randint(RAND_MIN,RAND_MAX);
      ob1.setPosition(425,rand - ob1.height)
      ob2.setPosition(425,rand + 150);
      ob1.hitted = false;
    }
    
    ob3.x -= SPEED * 3;
    ob4.x = ob3.x;
    if(ob3.x <= -1 * ob3.width){
      rand = Math.randint(RAND_MIN,RAND_MAX);
      ob3.setPosition(425,rand - ob3.height)
      ob4.setPosition(425,rand + 150);
      ob3.hitted = false;
    }
  }
});

let player;
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
    let bg = Sprite("bg").addChildTo(this);
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
    ob1.setPosition(200,-250);
    
    ob2 = Sprite("ueki2").addChildTo(this);
    ob2.setOrigin(0,0);
    ob2.setPosition(200,350);
    
    Label(
      {
        text:'Flappy Frederica',
        fontSize: 20,
      }).addChildTo(this).setPosition(150,200);
  },
  onclick:function(){
    this.exit();
  }
})

//メインシーン
let score = 0;
let rank = "実装中...";
const SCORE_PREFIX = "Score:";
let scoreLab;
let pauseFlag = false;
phina.define('MainScene', {
  superClass: 'DisplayScene',
  
  init: function() {
    this.superInit();
    
    BackGround().addChildTo(this);
    Obstacle().addChildTo(this);
    Player().addChildTo(this);
    ScoreCol().addChildTo(this);

    this.onpointstart = function(){
      player.physical.velocity.y = -10;
    };
    
    scoreLab = Label({
      text: SCORE_PREFIX + score,
      fontSize: 20,
      fill: 'red',
      align:'left'
    }).addChildTo(this).setPosition(2,11);
    
    score = 0;

    let self = this;
    let pauseButton = Sprite("pause").addChildTo(this);
    pauseButton.width = 25;
    pauseButton.height = 25;
    pauseButton.setOrigin(0,0);
    pauseButton.setPosition(270,7);
    pauseButton.setInteractive(true);
    pauseButton.onpointstart = function(){
      self.app.pushScene(PauseScene());
    }
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
    
    if(ob1.hitTestElement(scoreCol) && !ob1.hitted){
      score++;
      ob1.hitted = true;
    }

    if(ob3.hitTestElement(scoreCol) && !ob3.hitted){
      score++;
      ob3.hitted = true;
    }

    scoreLab.text = SCORE_PREFIX + score;
  }
});

//Resultシーン
let rankFlag = false;
const RANK_PREFIX = "Rank:";
const RANK_LOADING = "ランキング取得中...";
const RANK_API_URL = "https://script.google.com/macros/s/AKfycby4M9bLLuhzD32gZz2bplpykUVe6V3V5N0mvxT5NsN7xqGvMjc/exec?score=";
phina.define('ResultScene',{
  superClass: 'DisplayScene',
  
  init: function() {
    this.superInit();

    let scoreLabel = Label({
      text: SCORE_PREFIX + score,
      fontSize: 20,
      align:'left'
    }).addChildTo(this).setPosition(100,100);
    
    let rankLabel = Label({
      text: RANK_LOADING,
      fontSize: 20,
      align:'left'
    }).addChildTo(this).setPosition(100,130);

    rankFlag = false;
    
    fetch(RANK_API_URL + score).then(function(response){
      return response.json();
    }).then(function(json){
      rankFlag = true;
      rankLabel.text = RANK_PREFIX + json.rank;
    });
    
    let fre = Sprite("fre").addChildTo(this);
    fre.width = 63;
    fre.height = 106;
    fre.setOrigin(0,0);
    fre.setPosition(120,179);
    fre.update = function(){
      if(fre.y != 150){
        fre.y += -0.5;
      }
    }

    let dokaeki = Sprite("dokaeki").addChildTo(this);
    dokaeki.width = 80;
    dokaeki.height = 60;
    dokaeki.setOrigin(0,0);
    dokaeki.setPosition(110,225);

    let share = Sprite("share").addChildTo(this);
    share.width = 64;
    share.height = 64;
    share.alpha = 0.5;
    share.setOrigin(0,0);
    share.setPosition(50,300);
    share.setInteractive(true);
    share.onpointstart = function(){
      if(rankFlag){
        let url = phina.social.Twitter.createURL({
          text: 'Flappy Fredericaで遊んだよ！\r\n'+scoreLabel.text+'\r\n'+rankLabel.text+'\r\n',
          hashtags: 'imas_cg,宮本フレデリカ,ふらフレ',
          url: 'https://y-osaru.github.io/flappy-frederica/flappy.html'
        });
        window.location.href = url;
      }
    };
    share.update = function(){
      if(rankFlag){
        share.alpha = 1.0;
      } 
    }
    
    let self = this;
    let restart = Sprite("restart").addChildTo(this);
    restart.width = 64;
    restart.height = 64;
    restart.setOrigin(0,0);
    restart.setPosition(186,300);
    restart.setInteractive(true);
    restart.onpointstart = function(){
      self.exit();
    }

    this.backgroundColor = "#ff69b4";
  },
});

//ポーズシーン
const BUTTON_PARAM = {
  text:"ポーズ解除",
  fontSize:16,
  width:100,
  hight:10
};
phina.define("PauseScene",{
  superClass:"DisplayScene",
  init:function(){
    this.superInit();
    this.backgroundColor = "rgba(0,0,0,0.7)";
    var self = this;
    let pauseButton = Sprite("pause_on").addChildTo(this);
    pauseButton.width = 100;
    pauseButton.height = 100;
    pauseButton.setOrigin(0,0);
    pauseButton.setPosition(105,182);
    pauseButton.setInteractive(true);
    pauseButton.onpointstart = function(){
      //美しくないがタップの速度を消してあげる
      player.physical.velocity.y = 0;
      self.exit();
    }
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

//実行
phina.main(function() {
  let app = GameApp({
    startLabel: 'title',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    assets: ASSETS,
    scenes: myScenes,
  });
  app.run();
});
