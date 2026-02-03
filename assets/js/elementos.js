// elementos utilizados para el memori y el juego de palabras

const elementos = [
  {
    id: 0,
    palabras: ["cero", "zero", "zero", "zero", "zero", "zero"],
    imagen: "../../assets/img/iconos/0.png",
  },
  {
    id: 1,
    palabras: ["uno", "un", "one", "un", "uno", "um"],
    imagen: "../../assets/img/iconos/1.png",
  },
  {
    id: 2,
    palabras: ["dos", "dos", "two", "deux", "due", "dois"],
    imagen: "../../assets/img/iconos/2.png",
  },
  {
    id: 3,
    palabras: ["tres", "tres", "three", "trois", "tre", "tres"],
    imagen: "../../assets/img/iconos/3.png",
  },
  {
    id: 4,
    palabras: ["cuatro", "quatre", "four", "quatre", "quattro", "quatro"],
    imagen: "../../assets/img/iconos/4.png",
  },
  {
    id: 5,
    palabras: ["cinco", "cinc", "five", "cinq", "cinque", "cinco"],
    imagen: "../../assets/img/iconos/5.png",
  },
  {
    id: 6,
    palabras: ["seis", "sis", "six", "six", "sei", "seis"],
    imagen: "../../assets/img/iconos/6.png",
  },
  {
    id: 7,
    palabras: ["siete", "set", "seven", "sept", "sette", "sete"],
    imagen: "../../assets/img/iconos/7.png",
  },
  {
    id: 8,
    palabras: ["ocho", "vuit", "eight", "huit", "otto", "oito"],
    imagen: "../../assets/img/iconos/8.png",
  },
  {
    id: 9,
    palabras: ["nueve", "nou", "nine", "neuf", "nove", "nove"],
    imagen: "../../assets/img/iconos/9.png",
  },

  {
    id: 10,
    palabras: ["cohete", "coet", "rocket", "fusee", "razzo", "foguete"],
    imagen: "../../assets/img/iconos/cohete.png",
  },
  {
    id: 11,
    palabras: [
      "calabaza",
      "carbassa",
      "pumpkin",
      "citrouille",
      "zucca",
      "abobora",
    ],
    imagen: "../../assets/img/iconos/calabaza.png",
  },
  {
    id: 12,
    palabras: ["canasta", "sistella", "basket", "panier", "cesto", "cesto"],
    imagen: "../../assets/img/iconos/canasta.png",
  },
  {
    id: 13,
    palabras: ["bandera", "bandera", "flag", "drapeau", "bandiera", "bandeira"],
    imagen: "../../assets/img/iconos/bandera.png",
  },
  {
    id: 14,
    palabras: ["carne", "carn", "meat", "viande", "carne", "carne"],
    imagen: "../../assets/img/iconos/bife.png",
  },
  {
    id: 15,
    palabras: ["caca", "caca", "poop", "caca", "cacca", "coco"],
    imagen: "../../assets/img/iconos/caca.png",
  },
  {
    id: 16,
    palabras: ["cactus", "cactus", "cactus", "cactus", "cactus", "cacto"],
    imagen: "../../assets/img/iconos/cactus.png",
  },
  {
    id: 17,
    palabras: ["maleta", "maleta", "suitcase", "valise", "valigia", "mala"],
    imagen: "../../assets/img/iconos/maleta.png",
  },
  {
    id: 18,
    palabras: ["gamba", "gamba", "shrimp", "crevette", "gambero", "camarao"],
    imagen: "../../assets/img/iconos/camaron.png",
  },
  {
    id: 19,
    palabras: [
      "piruleta",
      "piruleta",
      "lollipop",
      "sucette",
      "lecca",
      "pirulito",
    ],
    imagen: "../../assets/img/iconos/candy.png",
  },

  {
    id: 20,
    palabras: ["campana", "campana", "bell", "cloche", "campana", "sino"],
    imagen: "../../assets/img/iconos/cencerro.png",
  },
  {
    id: 21,
    palabras: ["cereza", "cirera", "cherry", "cerise", "ciliegia", "cereja"],
    imagen: "../../assets/img/iconos/cereza.png",
  },
  {
    id: 22,
    palabras: [
      "martillo",
      "martell",
      "hammer",
      "marteau",
      "martello",
      "martelo",
    ],
    imagen: "../../assets/img/iconos/martillo.png",
  },
  {
    id: 23,
    palabras: ["bicicleta", "bicicleta", "bike", "velo", "bici", "bicicleta"],
    imagen: "../../assets/img/iconos/ciclismo.png",
  },
  {
    id: 24,
    palabras: [
      "telefono",
      "telefon",
      "phone",
      "telephone",
      "telefono",
      "telefone",
    ],
    imagen: "../../assets/img/iconos/telefono.png",
  },
  {
    id: 25,
    palabras: ["carta", "carta", "letter", "lettre", "lettera", "carta"],
    imagen: "../../assets/img/iconos/carta.png",
  },
  {
    id: 26,
    palabras: ["dado", "dau", "dice", "de", "dado", "dado"],
    imagen: "../../assets/img/iconos/dado.png",
  },
  {
    id: 27,
    palabras: [
      "guitarra",
      "guitarra",
      "guitar",
      "guitare",
      "chitarra",
      "guitarra",
    ],
    imagen: "../../assets/img/iconos/guitarra.png",
  },
  {
    id: 28,
    palabras: ["balanza", "balanca", "scale", "balance", "bilancia", "balanca"],
    imagen: "../../assets/img/iconos/igualdad.png",
  },
  {
    id: 29,
    palabras: [
      "semaforo",
      "semafor",
      "trafficlight",
      "feu",
      "semaforo",
      "semaforo",
    ],
    imagen: "../../assets/img/iconos/semaforo.png",
  },

  {
    id: 30,
    palabras: ["palmera", "palmera", "palm", "palme", "palma", "palmeira"],
    imagen: "../../assets/img/iconos/palmera.png",
  },
  {
    id: 31,
    palabras: ["labios", "llabis", "lips", "levres", "labbra", "labios"],
    imagen: "../../assets/img/iconos/labios.png",
  },
  {
    id: 32,
    palabras: ["coche", "cotxe", "car", "voiture", "auto", "carro"],
    imagen: "../../assets/img/iconos/coche.png",
  },
  {
    id: 33,
    palabras: [
      "helicoptero",
      "helicopter",
      "helicopter",
      "helicoptere",
      "elicottero",
      "helicoptero",
    ],
    imagen: "../../assets/img/iconos/helicoptero.png",
  },
  {
    id: 34,
    palabras: ["lapiz", "llapis", "pencil", "crayon", "matita", "lapis"],
    imagen: "../../assets/img/iconos/lapiz.png",
  },
  {
    id: 35,
    palabras: ["libro", "llibre", "book", "livre", "libro", "livro"],
    imagen: "../../assets/img/iconos/libro.png",
  },
  {
    id: 36,
    palabras: ["limon", "llimona", "lemon", "citron", "limone", "limao"],
    imagen: "../../assets/img/iconos/limon.png",
  },
  {
    id: 37,
    palabras: ["olla", "olla", "pot", "casserole", "pentola", "panela"],
    imagen: "../../assets/img/iconos/maceta.png",
  },
  {
    id: 38,
    palabras: [
      "meteorito",
      "meteorit",
      "meteorite",
      "meteorite",
      "meteorite",
      "meteorito",
    ],
    imagen: "../../assets/img/iconos/meteorito.png",
  },
  {
    id: 39,
    palabras: ["dinero", "diners", "money", "argent", "soldi", "dinheiro"],
    imagen: "../../assets/img/iconos/monedas.png",
  },

  {
    id: 40,
    palabras: ["cangrejo", "cranc", "crab", "crabe", "granchio", "caranguejo"],
    imagen: "../../assets/img/iconos/cangrejo.png",
  },
  {
    id: 41,
    palabras: ["nadar", "nedar", "swim", "nager", "nuotare", "nadar"],
    imagen: "../../assets/img/iconos/nadador.png",
  },
  {
    id: 42,
    palabras: ["lluvia", "pluja", "rain", "pluie", "pioggia", "chuva"],
    imagen: "../../assets/img/iconos/lluvia.png",
  },
  {
    id: 43,
    palabras: ["oreja", "orella", "ear", "oreille", "orecchio", "orelha"],
    imagen: "../../assets/img/iconos/oido.png",
  },
  {
    id: 44,
    palabras: ["ojos", "ulls", "eyes", "yeux", "occhi", "olhos"],
    imagen: "../../assets/img/iconos/ojos.png",
  },
  {
    id: 45,
    palabras: [
      "sombrilla",
      "para-sol",
      "parasol",
      "parasol",
      "ombrellone",
      "guarda-sol",
    ],
    imagen: "../../assets/img/iconos/sombrilla.png",
  },
  {
    id: 46,
    palabras: [
      "bocadillo",
      "entrapa",
      "sandwich",
      "sandwich",
      "panino",
      "sanduiche",
    ],
    imagen: "../../assets/img/iconos/sandwich.png",
  },
  {
    id: 47,
    palabras: ["planeta", "planeta", "planet", "planete", "pianeta", "planeta"],
    imagen: "../../assets/img/iconos/planeta.png",
  },
  {
    id: 48,
    palabras: ["puerta", "porta", "door", "porte", "porta", "porta"],
    imagen: "../../assets/img/iconos/puerta.png",
  },
  {
    id: 49,
    palabras: ["reloj", "rellotge", "watch", "montre", "orologio", "relogio"],
    imagen: "../../assets/img/iconos/reloj.png",
  },
  {
    id: 50,
    palabras: ["tomate", "tomaquet", "tomato", "tomate", "pomodoro", "tomate"],
    imagen: "../../assets/img/iconos/tomate.png",
  },
  {
    id: 51,
    palabras: ["rayo", "llamp", "lightning", "eclair", "fulmine", "raio"],
    imagen: "../../assets/img/iconos/rayo.png",
  },
  {
    id: 52,
    palabras: [
      "castillo",
      "castell",
      "castle",
      "chateau",
      "castello",
      "castelo",
    ],
    imagen: "../../assets/img/iconos/castillo.png",
  },
  {
    id: 53,
    palabras: [
      "extraterrestre",
      "extraterrestre",
      "alien",
      "alien",
      "alieno",
      "alienigena",
    ],
    imagen: "../../assets/img/iconos/alien.png",
  },
  {
    id: 54,
    palabras: ["robot", "robot", "robot", "robot", "robot", "robo"],
    imagen: "../../assets/img/iconos/robot.png",
  },
  {
    id: 55,
    palabras: ["fabrica", "fabrica", "factory", "usine", "fabbrica", "fabrica"],
    imagen: "../../assets/img/iconos/fabrica.png",
  },
  {
    id: 56,
    palabras: ["volcan", "volca", "volcano", "volcan", "vulcano", "vulcao"],
    imagen: "../../assets/img/iconos/volcan.png",
  },
  {
    id: 57,
    palabras: [
      "dinosaurio",
      "dinosaure",
      "dinosaur",
      "dinossauro",
      "dinosauro",
      "dinossauro",
    ],
    imagen: "../../assets/img/iconos/dinosaurio.png",
  },
  {
    id: 58,
    palabras: ["móvil", "mòbil", "cell", "portable", "cellulare", "telemóvel"],
    imagen: "../../assets/img/iconos/mobil.png",
  },
];
