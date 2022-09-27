'use strict'

const add = (a, b) => [a[0] + b[0], a[1] + b[1]]; //配列の足し算
function myInclude(arr, elem) { //配列が配列を含むかの判定
  let flag = false;
  arr.forEach(elem2 => {
    if (JSON.stringify(elem2) === JSON.stringify(elem)){
      flag = true;
    }
  })
  return flag;
}
function myIndex(arr, elem) { //配列が配列を含むときのそのindexを返す
  let ind = null;
  arr.forEach((elem2,index) => {
    if (JSON.stringify(elem2) === JSON.stringify(elem)){
      ind = index;
    }
  })
  return ind;
}
function myDelete(arr, elem) { //配列が配列を含むときその配列を消す
  const index = myIndex(arr, elem);
  arr.splice(index, 1);
}

const a = [[1, 0], [1, 1], [0, 1], [-1, 0], [-1, -1], [0, -1]]; //単位ベクトル

const initialState = [[2, 2], [4, 2], [6, 2], [8, 4], [4, 4], [8, 8], [4, 8], [6, 10], [8, 10], [10, 10], [10, 8], [6, 8], [6, 4], [2, 4]];
let STATE = [];
let STOP; 
let WIN;
let CLICK_FLAG = false;
let TURN_NUMBER = 1;
let EVAL_FLAG = false;


// 盤面の作成
function createBoard() {
  const board = document.getElementById("board");
  const hexagonTemplate = document.getElementById("hexagon-template");

  for (let j = 1; j < 12; j++) {
    const diff = Math.abs(6 - j);
    const start = (j < 6) ? 1 : 1 + diff;
    const end = (j < 6) ? 11 - diff : 11;
    for (let i = start; i <= end ; i++) {
      const hexagon = hexagonTemplate.cloneNode(true);
      hexagon.id = `${i}-${j}-hexagon`;
      const piece = hexagon.querySelector(".piece");
      piece.id = `${i}-${j}-piece`;
      piece.addEventListener('click', () => {
        onClick([i,j]);
      })
      hexagon.style.top = (12 - j) * 42 + "px";
      hexagon.style.left = ((6 - j) * 24 + i * 48) + "px";
      if (i === start || i === end || j === 1 || j === 11) {
        hexagon.style.background = "yellow";
      }
      board.appendChild(hexagon);
    }
  }
  const array = [[1, 1], [6, 1], [11, 6], [11, 11], [6, 11], [1, 6]];
  array.forEach((elem) => {
    const delHexagon = document.getElementById(`${elem[0]}-${elem[1]}-hexagon`);
    delHexagon.style.display = "none";
  });
}

// ボードの状態値の作成
function createStateValue(state) {
  const stateValue = {};
  for (let i = 0; i < 13; i++) {
    for(let j = 0; j < 13; j++) {
      stateValue[[i, j]] = "□";
    }
  }
  for (let i = 0; i < 6; i++) { // 壁を仮想マスにする
    stateValue[[i, 0]] = " "
    stateValue[[6+i, i]] = " "
    stateValue[[12, 6+i]] = " "
    stateValue[[12-i, 12]] = " "
    stateValue[[6-i, 12-i]] = " "
    stateValue[[0, 6-i]] = " " 
  }
    for (let i = 0; i < 5; i++) { // 点線マス
      stateValue[[i+1, 1]] = "&"
      stateValue[[6+i, i+1]] = "&"
      stateValue[[11, 6+i]] = "&"
      stateValue[[11-i, 11]] = "&"
      stateValue[[6-i, 11-i]] = "&"
      stateValue[[1, 6-i]] = "&"
    }
    const arr = [[1, 1], [6, 1], [11, 6], [11, 11], [6, 11], [1, 6]];
    arr.forEach(elem => stateValue[elem] = " ");
    state.forEach((elem, index) => {
      if (index <= 2) {
        stateValue[elem] = "*";
      } else if (index <= 6) {
        stateValue[elem] = "x";
      } else if (index <= 9) {
        stateValue[elem] = "●";
      } else {
        stateValue[elem] = "◎";
      }
    });
  return stateValue;
}

// 支配領域数の計算
// 1.止まれるマス 2.支配領域数 3.王手している相手の王様の数 4.タッチできる王様とその動き
function dominationTerritory(state, analysisFlag) {
  const stopKing = [[], [], []];
  const kingCount = new Set(); //自分の支配領域にいる相手の王様の座標の集合
  const win = []; //相手の王様にタッチできる自分の王様iと止まるマスyの組[i,y]たち
  const stateValue = createStateValue(state);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (j != i) {
        stateValue[state[j]] = "&"; //自分の王様も障害物とみなす
      }
    }
    stateValue[state[i]] = "*";
    const stack =[state[i]];
    while (stack.length) { //深さ優先探索
      const startPoint = stack.pop(-1);
      for (let j = 0; j < 6; j++) {
        let collentPoint = startPoint;
        const throughPoints = [];
        while (true) {
          const nextPoint = add(collentPoint, a[j]);
          if (stateValue[nextPoint] === "●") {
            win.push([i,collentPoint]);
          }
          if (stateValue[nextPoint] === "*") {
            break;
          } else if (stateValue[nextPoint] === "◎" || stateValue[nextPoint] === "&" || stateValue[nextPoint] === " "  || (stateValue[nextPoint] === "●" && analysisFlag)) {
            if (!myInclude(stopKing[i],collentPoint) && throughPoints.length) {
              stopKing[i].push(collentPoint);
            }
            throughPoints.forEach(elem => {
              if (stateValue[elem] != "●") {
                stateValue[elem] = 0;
              } else {
                kingCount.add(elem);
              }
            });
            break;
          } else if (stateValue[nextPoint] === "x") {
            if (!myInclude(stopKing[i],collentPoint) && throughPoints.length) {
              stopKing[i].push(collentPoint);
              stack.push(collentPoint);
              throughPoints.forEach(elem => {
                if (stateValue[elem] != "●") {
                  stateValue[elem] = 0;
                } else {
                  kingCount.add(elem);
                }
              });
            }
            break;
          } else {
            throughPoints.push(nextPoint);
            collentPoint = nextPoint;
          }
        }
      }
    }
  }
  // for (let i = 0; i < 3; i++) { //stopKingリストに相手の王様の座標が被らないようにする
  //   for (let j = 7; j < 10; j++) {
  //     if (myInclude(stopKing[i], state[j])) {
  //       myDelete(stopKing[i], state[j]);
  //     }
  //   }
  // }
  for (let elem of kingCount) { //支配領域と相手の王様が被っていた場合を修正
    stateValue[elem] = 0;
  }
  let areaCount = 0; //支配領域の数
  for (let i = 2; i < 11; i++) {
    for (let j = 2; j < 11; j++) {
      if (stateValue[[i,j]] === 0) {
        areaCount++;
      }
    }
  }
  for (let i = 0; i < 3; i++) {
    stateValue[state[i]] = "*";
  }
  return [stopKing, areaCount, kingCount.size, win];
}

// 状態解析
function analysisState(state) {
  const stopStone = [[], [], [], []]; 
  const stateValue = createStateValue(state);
  for (let i = 3; i < 7; i++) {
    for (let j = 0; j < 6; j++) {
      const mass = add(state[i],a[j]);
      if (stateValue[mass] === "□" || stateValue[mass] === "&") {
        stopStone[i-3].push(mass);
      }
    }
  }
  const result = dominationTerritory(state, true);
  const stopKing = result[0];
  STOP = [...stopKing, ...stopStone];
  WIN = result[3];
}

// 状態の初期化
function showInitialState(state) {
  STATE.forEach(elem => {
    const delDiv = document.getElementById(`${elem[0]}-${elem[1]}-piece`);
    delete delDiv.dataset.state
  });
  STATE = Array.from(state);
  analysisState(STATE);
  STATE.forEach((elem, index) => {
    const div = document.getElementById(`${elem[0]}-${elem[1]}-piece`);
    if (index < 3) {
      div.dataset.state = "1";
    } else if (index < 7) {
      div.dataset.state = "2";
    } else if (index < 10) {
      div.dataset.state = "3";
    } else {
      div.dataset.state = "4";
    }
  });
}

function mySwitch(div) {
  div.classList.toggle("scale");
  STOP[CLICK_FLAG].forEach(elem => {
    const div2 = document.getElementById(`${elem[0]}-${elem[1]}-piece`);
    div2.classList.toggle("movableMass");
  });
}

function onClick(index) {
  const div = document.getElementById(`${index[0]}-${index[1]}-piece`);
  if (CLICK_FLAG === false) {
    if (myInclude(STATE.slice(0,7), index)) {
      CLICK_FLAG = myIndex(STATE.slice(0,7), index);
      mySwitch(div);
    } else {
      return;
    }
  } else {
    if (JSON.stringify(STATE[CLICK_FLAG]) === JSON.stringify(index)) {
      mySwitch(div);
      CLICK_FLAG = false;
    } else if (myInclude(STOP[CLICK_FLAG], index)) {
      const beforeDiv = document.getElementById(`${STATE[CLICK_FLAG][0]}-${STATE[CLICK_FLAG][1]}-piece`);
      mySwitch(beforeDiv);
      move(CLICK_FLAG, index);
      if (myInclude(WIN, [CLICK_FLAG,index])) { //勝ち判定
        document.getElementById("win_lose").textContent = "YOU_WIN!";
        CLICK_FLAG = false;
        // setTimeout(showInitialState, 3000);
        return;
      }
      CLICK_FLAG = false;
      changeTurn();
    }
      else {
      return;
    }
  }
}

function changeTurn() {
  TURN_NUMBER++;
  STATE = [...STATE.slice(7, 14), ...STATE.slice(0, 7)];
  analysisState(STATE);
  if (TURN_NUMBER % 2 === 0) { 
    document.documentElement.style.setProperty('--player-color', 'blue');
  } else {
    document.documentElement.style.setProperty('--player-color', 'red');
  }
  if (TURN_NUMBER % 2 === 0) {
    setTimeout("cpu(STATE, false)", 1000);
  }
  // setTimeout("cpu(STATE, true)", 1000);
}

function cpu(state, randFlag) {
  if (WIN.length) {
    move(WIN[0][0], WIN[0][1]);
    document.getElementById("win_lose").textContent = `CPU${((TURN_NUMBER + 1) % 2) + 1}_WIN`;
    return;
  }
  let firstFlag = true;
  let secondFlag = true;
  let bestEval;
  let secondEval;
  for (let i = 0; i < 7; i++) { //最善手の計算
    STOP[i].forEach(elem => {
      const nextState = Array.from(state);
      nextState[i] = elem;
      const nextState2 = [...nextState.slice(7, 14), ...nextState.slice(0, 7)];
      const result = dominationTerritory(nextState, false);
      const result2 = dominationTerritory(nextState2, false);
      const currentEval = [i, elem, result2[2], result[2], result[1]];
      if (firstFlag) {
        bestEval = Array.from(currentEval);
        firstFlag = false;
      } else { //評価方法 1.王手をかけられている自分の王様の数 2.王手をかけている相手の王様の数 3.自分の支配領域の数
        if ((currentEval[2] < bestEval[2]) ||
        ((currentEval[2] === bestEval[2]) && (currentEval[3] > bestEval[3])) ||
        ((currentEval[2] === bestEval[2]) && (currentEval[3] === bestEval[3]) && (currentEval[4] > bestEval[4]))) {
          secondEval = bestEval;
          bestEval = currentEval;
        } else {
          if (secondFlag) {
            secondEval = currentEval;
            secondFlag = false;
          }
        }
      }
    });
  }
  if (!randFlag) {
    move(bestEval[0], bestEval[1]);
  } else {
    if (Math.floor(Math.random() * 2) === 0 && secondEval[2] === 0) {
      move(secondEval[0], secondEval[1]);
    } else {
      move(bestEval[0], bestEval[1]);
    }
  }
  changeTurn();
}

function move(beforeNumber, afterIndex) {
  const beforeDiv = document.getElementById(`${STATE[beforeNumber][0]}-${STATE[beforeNumber][1]}-piece`);
  const afterDiv = document.getElementById(`${afterIndex[0]}-${afterIndex[1]}-piece`);

  delete beforeDiv.dataset.state 
  if (beforeNumber < 3) {
    if (TURN_NUMBER % 2 === 1) {
      afterDiv.dataset.state = "1";
    } else {
      afterDiv.dataset.state = "3";
    }
  } else {
    if (TURN_NUMBER % 2 === 1) {
      afterDiv.dataset.state = "2";
    } else {
      afterDiv.dataset.state = "4";
    }
  }
  STATE[beforeNumber] = afterIndex;
}

function evaluationValue(state) {
  EVAL_FLAG = true;
  let count = 0;
  let cpu1Win = 0;
    showInitialState();
    cpu(STATE, true);
  return cpu1Win;
}






createBoard();
showInitialState(initialState);
// cpu(STATE, true);












