// elementos utilizados para el memori y el juego de palabras

const elementos = [
  {
    id: 0,
    palabras: ["cero", "zero", "zero"],
    imagen: "../../assets/img/iconos/0.png",
  },
  {
    id: 2,
    palabras: ["dos", "dos", "two"],
    imagen: "../../assets/img/iconos/2.png",
  },
  {
    id: 1,
    palabras: ["uno", "un", "one"],
    imagen: "../../assets/img/iconos/1.png",
  },
  {
    id: 3,
    palabras: ["tres", "tres", "three"],
    imagen: "../../assets/img/iconos/3.png",
  },
  {
    id: 4,
    palabras: ["cuatro", "quatre", "four"],
    imagen: "../../assets/img/iconos/4.png",
  },
  {
    id: 5,
    palabras: ["cinco", "cinc", "five"],
    imagen: "../../assets/img/iconos/5.png",
  },
  {
    id: 6,
    palabras: ["seis", "sis", "six"],
    imagen: "../../assets/img/iconos/6.png",
  },
  {
    id: 7,
    palabras: ["siete", "set", "seven"],
    imagen: "../../assets/img/iconos/7.png",
  },
  {
    id: 8,
    palabras: ["ocho", "vuit", "eight"],
    imagen: "../../assets/img/iconos/8.png",
  },
  {
    id: 9,
    palabras: ["nueve", "nou", "nine"],
    imagen: "../../assets/img/iconos/9.png",
  },
  {
    id: 10,
    palabras: ["cohete", "coet", "rocket"],
    imagen: "../../assets/img/iconos/cohete.png",
  },
  {
    id: 11,
    palabras: ["calabaza", "carbassa", "pumpkin"],
    imagen: "../../assets/img/iconos/calabaza.png",
  },
  {
    id: 12,
    palabras: ["canasta", "sistella", "basket"],
    imagen: "../../assets/img/iconos/canasta.png",
  },
  {
    id: 13,
    palabras: ["bandera", "bandera", "flag"],
    imagen: "../../assets/img/iconos/bandera.png",
  },
  {
    id: 14,
    palabras: ["carne", "carn", "meat"],
    imagen: "../../assets/img/iconos/bife.png",
  },
  {
    id: 15,
    palabras: ["caca", "caca", "poop"],
    imagen: "../../assets/img/iconos/caca.png",
  },
  {
    id: 16,
    palabras: ["cactus", "cactus", "cactus"],
    imagen: "../../assets/img/iconos/cactus.png",
  },
  {
    id: 17,
    palabras: ["maleta", "maleta", "suitcase"],
    imagen: "../../assets/img/iconos/maleta.png",
  },
  {
    id: 18,
    palabras: ["gamba", "gamba", "shrimp"],
    imagen: "../../assets/img/iconos/camaron.png",
  },
  {
    id: 19,
    palabras: ["piruleta", "piruleta", "lollipop"],
    imagen: "../../assets/img/iconos/candy.png",
  },
  {
    id: 20,
    palabras: ["campana", "campana", "bell"],
    imagen: "../../assets/img/iconos/cencerro.png",
  },
  {
    id: 21,
    palabras: ["cereza", "cirera", "cherry"],
    imagen: "../../assets/img/iconos/cereza.png",
  },
  {
    id: 22,
    palabras: ["martillo", "martell", "hammer"],
    imagen: "../../assets/img/iconos/martillo.png",
  },
  {
    id: 23,
    palabras: ["bicicleta", "bicicleta", "bike"],
    imagen: "../../assets/img/iconos/ciclismo.png",
  },
  {
    id: 24,
    palabras: ["telefono", "teléfon", "phone"],
    imagen: "../../assets/img/iconos/telefono.png",
  },
  {
    id: 25,
    palabras: ["carta", "carta", "letter"],
    imagen: "../../assets/img/iconos/sobre.png",
  },
  {
    id: 26,
    palabras: ["dado", "dao", "dice"],
    imagen: "../../assets/img/iconos/dado.png",
  },
  {
    id: 27,
    palabras: ["guitarra", "guitarra", "guitar"],
    imagen: "../../assets/img/iconos/guitarra.png",
  },
  {
    id: 28,
    palabras: ["balanza", "balança", "scale"],
    imagen: "../../assets/img/iconos/igualdad.png",
  },
  {
    id: 29,
    palabras: ["semaforo", "semàfor", "traffic light"],
    imagen: "../../assets/img/iconos/semaforo.png",
  },
  {
    id: 30,
    palabras: ["palmera", "palmera", "palm"],
    imagen: "../../assets/img/iconos/palmera.png",
  },
  {
    id: 31,
    palabras: ["labios", "llabis", "lips"],
    imagen: "../../assets/img/iconos/labios.png",
  },
  {
    id: 32,
    palabras: ["coche", "cotxe", "car"],
    imagen: "../../assets/img/iconos/coche.png",
  },
  {
    id: 33,
    palabras: ["helicoptero", "helicòpter", "helicopter"],
    imagen: "../../assets/img/iconos/helicoptero.png",
  },
  {
    id: 34,
    palabras: ["lapiz", "llapis", "pencil"],
    imagen: "../../assets/img/iconos/lapiz.png",
  },
  {
    id: 35,
    palabras: ["libro", "llibre", "book"],
    imagen: "../../assets/img/iconos/libro.png",
  },
  {
    id: 36,
    palabras: ["limon", "llimona", "lemon"],
    imagen: "../../assets/img/iconos/limon.png",
  },
  {
    id: 37,
    palabras: ["olla", "olla", "pot"],
    imagen: "../../assets/img/iconos/maceta.png",
  },
  {
    id: 38,
    palabras: ["meteorito", "meteorit", "meteorite"],
    imagen: "../../assets/img/iconos/meteorito.png",
  },
  {
    id: 39,
    palabras: ["dinero", "dines", "money"],
    imagen: "../../assets/img/iconos/monedas.png",
  },
  {
    id: 40,
    palabras: ["cangrejo", "crang", "crab"],
    imagen: "../../assets/img/iconos/cangrejo.png",
  },
  {
    id: 41,
    palabras: ["nadar", "nedar", "swin"],
    imagen: "../../assets/img/iconos/nadador.png",
  },
  {
    id: 42,
    palabras: ["lluvia", "pluja", "rain"],
    imagen: "../../assets/img/iconos/lluvia.png",
  },
  {
    id: 43,
    palabras: ["oreja", "orella", "ear"],
    imagen: "../../assets/img/iconos/oido.png",
  },
  {
    id: 44,
    palabras: ["ojos", "ulls", "eyes"],
    imagen: "../../assets/img/iconos/ojos.png",
  },
  {
    id: 45,
    palabras: ["sombrilla", "para-sol", "parasol"],
    imagen: "../../assets/img/iconos/sombrilla.png",
  },
  {
    id: 46,
    palabras: ["bocadillo", "entrapà", "sandwich"],
    imagen: "../../assets/img/iconos/sandwich.png",
  },
  {
    id: 47,
    palabras: ["planeta", "planeta", "planet"],
    imagen: "../../assets/img/iconos/planeta.png",
  },
  {
    id: 48,
    palabras: ["puerta", "porta", "door"],
    imagen: "../../assets/img/iconos/puerta.png",
  },
  {
    id: 49,
    palabras: ["reloj", "rellotge", "watch"],
    imagen: "../../assets/img/iconos/reloj.png",
  },
  {
    id: 50,
    palabras: ["tomate", "tomàquet", "tomato"],
    imagen: "../../assets/img/iconos/tomate.png",
  },
  {
    id: 51,
    palabras: ["rayo", "llamp", "lightning"],
    imagen: "../../assets/img/iconos/rayo.png",
  },
  {
    id: 52,
    palabras: ["castillo", "castell", "castle"],
    imagen: "../../assets/img/iconos/castillo.png",
  },
  {
    id: 53,
    palabras: ["extraterrestre", "extraterrestre", "alien"],
    imagen: "../../assets/img/iconos/alien.png",
  },
  {
    id: 54,
    palabras: ["robot", "robot", "robot"],
    imagen: "../../assets/img/iconos/robot.png",
  },
  {
    id: 55,
    palabras: ["fabrica", "fabrica", "factory"],
    imagen: "../../assets/img/iconos/fabrica.png",
  },
  {
    id: 56,
    palabras: ["volcan", "volca", "volcano"],
    imagen: "../../assets/img/iconos/volcan.png",
  },
];
