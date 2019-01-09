$(function(){
  let expireUpdateFlg = false;
  const lastParams = getLastParams("last_params");
  const now = new Date();
  //ローカルストレージにデータがあり、現在時刻が期限時刻より前なら自動設定する。ミリ秒比較になるが、アタポンイベは連続しないのでOK  
  if(lastParams != null && now < new Date(lastParams.expireDate)){
    $("#days").val(lastParams.days);
    $("#daysPast").val(lastParams.daysPast);
    $("#goalPoint").val(lastParams.goalPoint);
    $("input[name='normalRate']").val([String(lastParams.normalRate)]);
    $("input[name='eventRate']").val([String(lastParams.eventRate)]);
  }else{
    expireUpdateFlg = true;
  }
  
  //ローカルストレージに保存したパラメータデータを取得
  function getLastParams(key){
    const lastParamsJson = localStorage.getItem(key);
    if(lastParamsJson == null){
      return null;
    }else{
      return JSON.parse(lastParamsJson);
    }
  }
  
  //入力チェック
  function inputCheck(){
    if(!$.isNumeric($("#days").val()) ||
    !$.isNumeric($("#daysPast").val()) ||  
    !$.isNumeric($("#nowPoint").val()) || 
    !$.isNumeric($("#goalPoint").val()) ||
    !$.isNumeric($("#nowItem").val()) ||
    !$.isNumeric($("input[name='normalRate']:checked").val()) ||
    !$.isNumeric($("input[name='eventRate']:checked").val())){
      //radioがnumberじゃなくなる事は無いはずだが、むりやり消した場合/Edgeのラジオボタン消失バグの対策。
      alert("入力内容のいずれかが不正です。全て半角数字で入力して下さい。")
      return false;
    }else{
      return true;
    }
  }
  
  let countNormal;
  let countEvent1;
  let countEvent2;
  let countEvent4;
  let totalPoint;
  let totalItem;
  let restItem;
  function calc(days,daysPast,nowPoint,goalPoint,nowItem,normalRate,eventRate){
    const pointNormal = 53;
    const login = 300;
    let itemNormal = 53 * normalRate;
    let itemEvent = 150 * eventRate;
    let pointEvent = 320 * eventRate;
    countNormal = Math.floor((itemEvent * (goalPoint - nowPoint) - pointEvent * ( login * (days - daysPast) + nowItem))
                      /(pointNormal * itemEvent + pointEvent * itemNormal));
    if(countNormal < 0){
      countNormal = 0;
    }
    let countEvent = Math.floor((itemNormal * countNormal + login * (days - daysPast) + nowItem)/itemEvent);
    
    restItem = itemNormal * countNormal + login * (days - daysPast) + nowItem - itemEvent * countEvent;
    totalPoint = pointNormal * countNormal + pointEvent * countEvent + nowPoint;

    //目標ポイントに到達していなければ、調整開始。
    //初期化
    countEvent1 = 0;
    countEvent2 = 0;
    countEvent4 = 0;
    if(goalPoint > totalPoint){
      let endFlag = false;
      //マジックナンバー半端ないが、デレステやってれば一発で分かる閾値であり、変わる事は無いのでOKにする。
      while(!endFlag){
        if(restItem < 150){
          //通常楽曲プレイ
          countNormal++;
          restItem += itemNormal;
          totalPoint += pointNormal;
        }else if(restItem >= 150 && restItem < 300){
          //等倍プレイ
          countEvent1++;
          restItem -= 150;
          totalPoint += 320;
        }else if(restItem >= 300 && restItem < 600){
          //2倍プレイ
          countEvent2++;
          restItem -= 300;
          totalPoint += 640;
        }else if(restItem >= 600){
          //4倍プレイ
          countEvent4++;
          restItem -= 600;
          totalPoint += 1280;
        }

        if(totalPoint >= goalPoint){
          endFlag = true;
        }
      }
    }
    
    //回数が確定した為、総アイテム数を計算
    totalItem = itemNormal * countNormal + login * (days - daysPast) + nowItem;
    switch(eventRate){
      case 1:
        countEvent1 += countEvent;
        break;
      case 2:
        countEvent2 += countEvent;
        break;
      case 4:
        countEvent4 += countEvent;
        break;
    }
  }

  $("#calc").click(function(){
    if(inputCheck()){
      //入力内容がOKなので値をセット
      let days = Number($("#days").val());
      let daysPast = Number($("#daysPast").val());
      let nowPoint = Number($("#nowPoint").val());
      let goalPoint = Number($("#goalPoint").val());
      let nowItem = Number($("#nowItem").val());
      let normalRate = Number($("input[name='normalRate']:checked").val())
      let eventRate = Number($("input[name='eventRate']:checked").val())

      //計算
      calc(days,daysPast,nowPoint,goalPoint,nowItem,normalRate,eventRate);

      //表示部分にセット
      $("#countNormal").text(countNormal);
      $("#countEvent1").text(countEvent1);
      $("#countEvent2").text(countEvent2);
      $("#countEvent4").text(countEvent4);
      $("#totalPoint").text(totalPoint);
      $("#totalItem").text(totalItem);
      $("#restItem").text(restItem);
      
      //ローカルストレージに保存
      const expireTerm = 11;
      let newParams;
      if(expireUpdateFlg){
        let expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + expireTerm);
        newParams = {
          'expireDate' : expireDate,
          'days' : days,
          'daysPast' : daysPast,
          'goalPoint' : goalPoint,
          'normalRate' : normalRate,
          'eventRate' : eventRate
        };
      }else{
        newParams = {
          'expireDate' : new Date(lastParams.expireDate),
          'days' : days,
          'daysPast' : daysPast,
          'goalPoint' : goalPoint,
          'normalRate' : normalRate,
          'eventRate' : eventRate
        };
      }
      localStorage.setItem("last_params", JSON.stringify(newParams));
    }
  })
})