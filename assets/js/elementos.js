// elementos utilizados para el memori y el juego de palabras

const elementos = [
  {
    id: 0,
    palabras: ["cero", "zero", "zero", "zero", "zero", "zero", "cero", "zero"],
    imagen: "../../assets/img/iconos/0.png",
  },
  {
    id: 1,
    palabras: ["uno", "un", "one", "un", "uno", "um", "un", "bat"],
    imagen: "../../assets/img/iconos/1.png",
  },
  {
    id: 2,
    palabras: ["dos", "dos", "two", "deux", "due", "dois", "dous", "bi"],
    imagen: "../../assets/img/iconos/2.png",
  },
  {
    id: 3,
    palabras: ["tres", "tres", "three", "trois", "tre", "tres", "tres", "hiru"],
    imagen: "../../assets/img/iconos/3.png",
  },
  {
    id: 4,
    palabras: ["cuatro", "quatre", "four", "quatre", "quattro", "quatro", "catro", "lau"],
    imagen: "../../assets/img/iconos/4.png",
  },
  {
    id: 5,
    palabras: ["cinco", "cinc", "five", "cinq", "cinque", "cinco", "cinco", "bost"],
    imagen: "../../assets/img/iconos/5.png",
  },
  {
    id: 6,
    palabras: ["seis", "sis", "six", "six", "sei", "seis", "seis", "sei"],
    imagen: "../../assets/img/iconos/6.png",
  },
  {
    id: 7,
    palabras: ["siete", "set", "seven", "sept", "sette", "sete", "sete", "zazpi"],
    imagen: "../../assets/img/iconos/7.png",
  },
  {
    id: 8,
    palabras: ["ocho", "vuit", "eight", "huit", "otto", "oito", "oito", "zortzi"],
    imagen: "../../assets/img/iconos/8.png",
  },
  {
    id: 9,
    palabras: ["nueve", "nou", "nine", "neuf", "nove", "nove", "nove", "bederatzi"],
    imagen: "../../assets/img/iconos/9.png",
  },
  {
    id: 10,
    palabras: ["cohete", "coet", "rocket", "fusée", "razzo", "foguete", "foguete", "kohete"],
    imagen: "../../assets/img/iconos/cohete.png",
  },
  {
    id: 11,
    palabras: ["fábrica", "fàbrica", "factory", "usine", "fabbrica", "fábrica", "fábrica", "fabrika"],
    imagen: "../../assets/img/iconos/fabrica.svg",
  },
  {
    id: 12,
    palabras: ["ambulancia", "ambulància", "ambulance", "ambulance", "ambulanza", "ambulância", "ambulancia", "anbulantzia"],
    imagen: "../../assets/img/iconos/ambulancia.svg",
  },
  {
    id: 13,
    palabras: ["bandera", "bandera", "flag", "drapeau", "bandiera", "bandeira", "bandeira", "bandera"],
    imagen: "../../assets/img/iconos/bandera.png",
  },
  {
    id: 14,
    palabras: ["microscopio", "microscopi", "microscope", "microscope", "microscopio", "microscópio", "microscopio", "mikroskopio"],
    imagen: "../../assets/img/iconos/microscopio.svg",
  },
  {
    id: 15,
    palabras: ["motocicleta", "motocicleta", "motorcycle", "motocyclette", "motocicletta", "motocicleta", "motocicleta", "motozikleta"],
    imagen: "../../assets/img/iconos/motocicleta.svg",
  },
  {
    id: 16,
    palabras: ["foca", "foca", "seal", "phoque", "foca", "foca", "foca", "foka"],
    imagen: "../../assets/img/iconos/foca.svg",
  },
  {
    id: 17,
    palabras: ["maleta", "maleta", "suitcase", "valise", "valigia", "mala", "maleta", "maleta"],
    imagen: "../../assets/img/iconos/maleta.png",
  },
  {
    id: 18,
    palabras: ["diana", "diana", "target", "cible", "bersaglio", "alvo", "diana", "diana"],
    imagen: "../../assets/img/iconos/diana.png",
  },
  {
    id: 19,
    palabras: ["sandía", "síndria", "watermelon", "pastèque", "anguria", "melancia", "sandía", "sandia"],
    imagen: "../../assets/img/iconos/sandia.png",
  },
  {
    id: 20,
    palabras: ["cuadrado", "quadrat", "square", "carré", "quadrato", "quadrado", "cadrado", "karratu"],
    imagen: "../../assets/img/iconos/cuadrado.png",
  },
  {
    id: 21,
    palabras: ["cereza", "cirera", "cherry", "cerise", "ciliegia", "cereja", "cereixa", "gerezi"],
    imagen: "../../assets/img/iconos/cereza.png",
  },
  {
    id: 22,
    palabras: ["hexágono", "hexàgon", "hexagon", "hexagone", "esagono", "hexágono", "hexágono", "hexagono"],
    imagen: "../../assets/img/iconos/hexagono.png",
  },
  {
    id: 23,
    palabras: ["bicicleta", "bicicleta", "bike", "velo", "bici", "bicicleta", "bicicleta", "bizikleta"],
    imagen: "../../assets/img/iconos/ciclismo.png",
  },
  {
    id: 24,
    palabras: ["teléfono", "telefon", "phone", "telephone", "telefono", "telefone", "teléfono", "telefono"],
    imagen: "../../assets/img/iconos/telefono.png",
  },

    {
    id: 25,
    palabras: ["carta", "carta", "letter", "lettre", "lettera", "carta", "carta", "gutun"],
    imagen: "../../assets/img/iconos/carta.png",
  },
  {
    id: 26,
    palabras: ["dado", "dau", "dice", "de", "dado", "dado", "dado", "dado"],
    imagen: "../../assets/img/iconos/dado.png",
  },
  {
    id: 27,
    palabras: ["guitarra", "guitarra", "guitar", "guitare", "chitarra", "guitarra", "guitarra", "gitarra"],
    imagen: "../../assets/img/iconos/guitarra.png",
  },
  {
    id: 28,
    palabras: ["hoja", "fulla", "leaf", "feuille", "foglia", "folha", "folla", "hosto"],
    imagen: "../../assets/img/iconos/hoja.png",
  },
  {
    id: 29,
    palabras: ["semáforo", "semafor", "trafficlight", "feu", "semaforo", "semaforo", "semáforo", "semaforo"],
    imagen: "../../assets/img/iconos/semaforo.png",
  },
  {
    id: 30,
    palabras: ["estrella", "estrella", "star", "étoile", "stella", "estrela", "estrela", "izar"],
    imagen: "../../assets/img/iconos/estrella.png",
  },
  {
    id: 31,
    palabras: ["candado", "cadenat", "padlock", "cadenas", "lucchetto", "cadeado", "cadeado", "kandadu"],
    imagen: "../../assets/img/iconos/candado.svg",
  },
  {
    id: 32,
    palabras: ["coche", "cotxe", "car", "voiture", "auto", "carro", "coche", "kotxe"],
    imagen: "../../assets/img/iconos/coche.png",
  },
  {
    id: 33,
    palabras: ["helicoptero", "helicopter", "helicopter", "hélicoptère", "elicottero", "helicoptero", "helicóptero", "helikoptero"],
    imagen: "../../assets/img/iconos/helicoptero.png",
  },
  {
    id: 34,
    palabras: ["lapiz", "llapis", "pencil", "crayon", "matita", "lapis", "lapis", "arkatz"],
    imagen: "../../assets/img/iconos/lapiz.png",
  },
  {
    id: 35,
    palabras: ["libro", "llibre", "book", "livre", "libro", "livro", "libro", "liburu"],
    imagen: "../../assets/img/iconos/libro.png",
  },
  {
    id: 36,
    palabras: ["cometa", "estel", "kite", "cerf-volant", "aquilone", "pipa", "cometa", "kometa"],
    imagen: "../../assets/img/iconos/cometa.png",
  },
  {
    id: 37,
    palabras: ["nube", "núvol", "cloud", "nuage", "nuvola", "nuvem", "nube", "hodei"],
    imagen: "../../assets/img/iconos/nube.svg",
  },
  {
    id: 38,
    palabras: ["tambor", "tambor", "drum", "tambour", "tamburo", "tambor", "tambor", "danbolin"],
    imagen: "../../assets/img/iconos/tambor.png",
  },
  {
    id: 39,
    palabras: ["donut", "donut", "donut", "beignet", "ciambella", "donut", "donut", "donaut"],
    imagen: "../../assets/img/iconos/donut.png",
  },
  {
    id: 40,
    palabras: ["campana", "campana", "bell", "cloche", "campana", "sino", "campá", "kanpaia"],
    imagen: "../../assets/img/iconos/campana.png",
  },
  {
    id: 41,
    palabras: ["nadar", "nedar", "swim", "nager", "nuotare", "nadar", "nadar", "igerian"],
    imagen: "../../assets/img/iconos/nadador.png",
  },
  {
    id: 42,
    palabras: ["lluvia", "pluja", "rain", "pluie", "pioggia", "chuva", "choiva", "euri"],
    imagen: "../../assets/img/iconos/lluvia.png",
  },
  {
    id: 43,
    palabras: ["ancla", "àncora", "anchor", "ancre", "ancora", "âncora", "áncora", "aingura"],
    imagen: "../../assets/img/iconos/ancla.png",
  },
  {
    id: 44,
    palabras: ["ojo", "ull", "eye", "œil", "occhio", "olho", "ollo", "begi"],
    imagen: "../../assets/img/iconos/ojo.png",
  },
  {
    id: 45,
    palabras: ["sombrilla", "para-sol", "parasol", "parasol", "ombrellone", "guarda-sol", "sombreiro", "eguzkitako"],
    imagen: "../../assets/img/iconos/sombrilla.png",
  },
  {
    id: 46,
    palabras: ["caramelo", "caramel", "candy", "bonbon", "caramella", "caramelo", "caramelo", "gozoki"],
    imagen: "../../assets/img/iconos/caramelo.png",
  },
  {
    id: 47,
    palabras: ["tijeras", "tisores", "scissors", "ciseaux", "forbici", "tesoura", "tesoiras", "guraize"],
    imagen: "../../assets/img/iconos/tijeras.svg",
  },
  {
    id: 48,
    palabras: ["puerta", "porta", "door", "porte", "porta", "porta", "porta", "ate"],
    imagen: "../../assets/img/iconos/puerta.png",
  },
    {
    id: 49,
    palabras: ["reloj", "rellotge", "watch", "montre", "orologio", "relogio", "reloxo", "erloju"],
    imagen: "../../assets/img/iconos/reloj.png",
  },
  {
    id: 50,
    palabras: ["tornado", "tornado", "tornado", "tornade", "tornado", "tornado", "tornado", "tornado"],
    imagen: "../../assets/img/iconos/tornado.png",
  },
  {
    id: 51,
    palabras: ["rayo", "llamp", "lightning", "eclair", "fulmine", "raio", "raio", "tximista"],
    imagen: "../../assets/img/iconos/rayo.png",
  },
  {
    id: 52,
    palabras: ["castillo", "castell", "castle", "chateau", "castello", "castelo", "castelo", "gaztelu"],
    imagen: "../../assets/img/iconos/castillo.png",
  },
  {
    id: 53,
    palabras: ["fresa", "maduixa", "strawberry", "fraise", "fragola", "morango", "amorodo", "marrubi"],
    imagen: "../../assets/img/iconos/fresa.png",
  },
  {
    id: 54,
    palabras: ["seta", "bolet", "mushroom", "champignon", "fungo", "cogumelo", "cogomelo", "perretxiko"],
    imagen: "../../assets/img/iconos/seta.png",
  },
  {
    id: 55,
    palabras: ["llave", "clau", "key", "clé", "chiave", "chave", "chave", "giltza"],
    imagen: "../../assets/img/iconos/llave.png",
  },
  {
    id: 56,
    palabras: ["regalo", "regal", "gift", "cadeau", "regalo", "presente", "agasallo", "opari"],
    imagen: "../../assets/img/iconos/regalo.png",
  },
  {
    id: 57,
    palabras: ["patines", "patins", "skates", "patins", "pattini", "patins", "patíns", "patinak"],
    imagen: "../../assets/img/iconos/patines.png",
  },
  {
    id: 58,
    palabras: ["móvil", "mòbil", "cellphone", "portable", "cellulare", "telemóvel", "móbil", "mugikor"],
    imagen: "../../assets/img/iconos/mobil.png",
  },
  {
    id: 59,
    palabras: ["pez", "peix", "fish", "poisson", "pesce", "peixe", "peixe", "arrain"],
    imagen: "../../assets/img/iconos/pez.png",
  },
  {
    id: 60,
    palabras: ["taza", "tassa", "cup", "tasse", "tazza", "xícara", "cunca", "katilu"],
    imagen: "../../assets/img/iconos/taza.png",
  },
  {
    id: 61,
    palabras: ["pelota", "pilota", "ball", "ballon", "palla", "bola", "pelota", "pilota"],
    imagen: "../../assets/img/iconos/pelota.png",
  },
  {
    id: 62,
    palabras: ["camión", "camió", "truck", "camion", "camion", "camião", "camión", "kamioi"],
    imagen: "../../assets/img/iconos/camion.png",
  },
  {
    id: 63,
    palabras: ["murciélago", "ratpenat", "bat", "chauve-souris", "pipistrello", "morcego", "morcego", "saguzar"],
    imagen: "../../assets/img/iconos/murcielago.png",
  },
  {
    id: 64,
    palabras: ["mano", "mà", "hand", "main", "mano", "mão", "man", "esku"],
    imagen: "../../assets/img/iconos/mano.png",
  },
  {
    id: 65,
    palabras: ["conejo", "conill", "rabbit", "lapin", "coniglio", "coelho", "coello", "untxi"],
    imagen: "../../assets/img/iconos/conejo.png",
  },
  {
    id: 66,
    palabras: ["flecha", "fletxa", "arrow", "flèche", "freccia", "flecha", "frecha", "gezi"],
    imagen: "../../assets/img/iconos/flecha.png",
  },
  {
    id: 67,
    palabras: ["labios", "llavis", "lips", "lèvres", "labbra", "lábios", "beizos", "ezpainak"],
    imagen: "../../assets/img/iconos/labios.png",
  },
  {
    id: 68,
    palabras: ["botella", "ampolla", "bottle", "bouteille", "bottiglia", "garrafa", "botella", "botila"],
    imagen: "../../assets/img/iconos/botella.png",
  },
  {
    id: 69,
    palabras: ["tren", "tren", "train", "train", "treno", "trem", "tren", "tren"],
    imagen: "../../assets/img/iconos/tren.png",
  },
  {
    id: 70,
    palabras: ["luna", "lluna", "moon", "lune", "luna", "lua", "lúa", "ilargi"],
    imagen: "../../assets/img/iconos/luna.png",
  },
  {
    id: 71,
    palabras: ["sol", "sol", "sun", "soleil", "sole", "sol", "sol", "eguzki"],
    imagen: "../../assets/img/iconos/sol.png",
  },
  {
    id: 72,
    palabras: ["caballo", "cavall", "horse", "cheval", "cavallo", "cavalo", "cabalo", "zaldi"],
    imagen: "../../assets/img/iconos/caballo.png",
  },
  {
    id: 73,
    palabras: ["avión", "avió", "airplane", "avion", "aereo", "avião", "avión", "hegazkin"],
    imagen: "../../assets/img/iconos/avion.png",
  },
    {
    id: 74,
    palabras: ["corazón", "cor", "heart", "cœur", "cuore", "coração", "corazón", "bihotz"],
    imagen: "../../assets/img/iconos/corazon.png",
  },
  {
    id: 75,
    palabras: ["piano", "piano", "piano", "piano", "pianoforte", "piano", "piano", "piano"],
    imagen: "../../assets/img/iconos/piano.png",
  },
  {
    id: 76,
    palabras: ["engranajes", "engranatges", "gears", "engrenages", "ingranaggi", "engrenagens", "engrenaxes", "engranaje"],
    imagen: "../../assets/img/iconos/engranajes.png",
  },
  {
    id: 77,
    palabras: ["planeta", "planeta", "planet", "planète", "pianeta", "planeta", "planeta", "planeta"],
    imagen: "../../assets/img/iconos/planeta.png",
  },
  {
    id: 78,
    palabras: ["arbol", "arbre", "tree", "arbre", "albero", "árvore", "árbore", "zuhaitz"],
    imagen: "../../assets/img/iconos/arbol.png",
  },
  {
    id: 79,
    palabras: ["cadena", "cadena", "chain", "chaîne", "catena", "corrente", "cadea", "kate"],
    imagen: "../../assets/img/iconos/cadena.png",
  },
  {
    id: 80,
    palabras: ["altavoz", "altaveu", "speaker", "haut-parleur", "altoparlante", "alto-falante", "altofalante", "bozgorailu"],
    imagen: "../../assets/img/iconos/altavoz.png",
  },
  {
    id: 81,
    palabras: ["oso", "ós", "bear", "ours", "orso", "urso", "oso", "hartz"],
    imagen: "../../assets/img/iconos/oso.svg",
  },
  {
    id: 82,
    palabras: ["gato", "gat", "cat", "chat", "gatto", "gato", "gato", "katu"],
    imagen: "../../assets/img/iconos/gato.png",
  },
  {
    id: 83,
    palabras: ["perro", "gos", "dog", "chien", "cane", "cão", "can", "txakur"],
    imagen: "../../assets/img/iconos/perro.png",
  },
  {
    id: 84,
    palabras: ["globo", "globus", "balloon", "ballon", "palloncino", "balão", "globo", "globo"],
    imagen: "../../assets/img/iconos/globo.png",
  },
  {
    id: 85,
    palabras: ["círculo", "cercle", "circle", "cercle", "cerchio", "círculo", "círculo", "zirkulu"],
    imagen: "../../assets/img/iconos/circulo.png",
  },
  {
    id: 86,
    palabras: ["calendario", "calendari", "calendar", "calendrier", "calendario", "calendário", "calendario", "egutegi"],
    imagen: "../../assets/img/iconos/calendario.png",
  },
  {
    id: 87,
    palabras: ["araña", "aranya", "spider", "araignée", "ragno", "aranha", "araña", "armiarma"],
    imagen: "../../assets/img/iconos/arana.png",
  },
  {
    id: 88,
    palabras: ["manzana", "poma", "apple", "pomme", "mela", "maçã", "mazá", "sagar"],
    imagen: "../../assets/img/iconos/manzana.png",
  },
  {
    id: 89,
    palabras: ["flor", "flor", "flower", "fleur", "fiore", "flor", "flor", "lore"],
    imagen: "../../assets/img/iconos/flor.png",
  },
  {
    id: 90,
    palabras: ["queso", "formatge", "cheese", "fromage", "formaggio", "queijo", "queixo", "gazta"],
    imagen: "../../assets/img/iconos/queso.png",
  },
  {
    id: 91,
    palabras: ["futbol", "futbol", "football", "football", "calcio", "futebol", "fútbol", "futbol"],
    imagen: "../../assets/img/iconos/futbol.png",
  },
  {
    id: 92,
    palabras: ["submarino", "submarí", "submarine", "sous-marin", "sottomarino", "submarino", "submarino", "itsaspeko"],
    imagen: "../../assets/img/iconos/submarino.png",
  },
  {
    id: 93,
    palabras: ["micrófono", "micròfon", "microphone", "microphone", "microfono", "microfone", "micrófono", "mikrofono"],
    imagen: "../../assets/img/iconos/microfono.png",
  },
  {
    id: 94,
    palabras: ["triángulo", "triangle", "triangle", "triangle", "triangolo", "triângulo", "triángulo", "hiruki"],
    imagen: "../../assets/img/iconos/triangulo.png",
  },
];
