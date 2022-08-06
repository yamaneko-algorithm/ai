const stage = document.getElementById("stage");
const squareTemplate = document.getElementById("square-template");

const createSquares = () => {
  for (let i = 0; i < 64; i++) {
    const square = squareTemplate.cloneNode(true); //テンプレートから要素をクローン
    square.removeAttribute("id"); //テンプレート用のid属性を削除
    stage.appendChild(square); //マス目のHTML要素を盤に追加
  }
};

window.onload = () => {
  createSquares();
};
