// Estrutura e Textos da Bíblia Sagrada ACF (Almeida Corrigida Fiel)
export const bibleBooks = [
  // Antigo Testamento
  { id: "gn", name: "Gênesis", group: "Pentateuco", chapters: 50 },
  { id: "ex", name: "Êxodo", group: "Pentateuco", chapters: 40 },
  { id: "lv", name: "Levítico", group: "Pentateuco", chapters: 27 },
  { id: "nm", name: "Números", group: "Pentateuco", chapters: 36 },
  { id: "dt", name: "Deuteronômio", group: "Pentateuco", chapters: 34 },
  { id: "js", name: "Josué", group: "Históricos", chapters: 24 },
  { id: "jz", name: "Juízes", group: "Históricos", chapters: 21 },
  { id: "rt", name: "Rute", group: "Históricos", chapters: 4 },
  { id: "1sm", name: "1 Samuel", group: "Históricos", chapters: 31 },
  { id: "2sm", name: "2 Samuel", group: "Históricos", chapters: 24 },
  { id: "1rs", name: "1 Reis", group: "Históricos", chapters: 22 },
  { id: "2rs", name: "2 Reis", group: "Históricos", chapters: 25 },
  { id: "1cr", name: "1 Crônicas", group: "Históricos", chapters: 29 },
  { id: "2cr", name: "2 Crônicas", group: "Históricos", chapters: 36 },
  { id: "ed", name: "Esdras", group: "Históricos", chapters: 10 },
  { id: "ne", name: "Neemias", group: "Históricos", chapters: 13 },
  { id: "et", name: "Ester", group: "Históricos", chapters: 10 },
  { id: "jo", name: "Jó", group: "Poéticos", chapters: 42 },
  { id: "sl", name: "Salmos", group: "Poéticos", chapters: 150 },
  { id: "pv", name: "Provérbios", group: "Poéticos", chapters: 31 },
  { id: "ec", name: "Eclesiastes", group: "Poéticos", chapters: 12 },
  { id: "ct", name: "Cânticos", group: "Poéticos", chapters: 8 },
  { id: "is", name: "Isaías", group: "Profetas Maiores", chapters: 66 },
  { id: "jr", name: "Jeremias", group: "Profetas Maiores", chapters: 52 },
  { id: "lm", name: "Lamentações", group: "Profetas Maiores", chapters: 5 },
  { id: "ez", name: "Ezequiel", group: "Profetas Maiores", chapters: 48 },
  { id: "dn", name: "Daniel", group: "Profetas Maiores", chapters: 12 },
  { id: "os", name: "Oseias", group: "Profetas Menores", chapters: 14 },
  { id: "jl", name: "Joel", group: "Profetas Menores", chapters: 3 },
  { id: "am", name: "Amós", group: "Profetas Menores", chapters: 9 },
  { id: "ob", name: "Obadias", group: "Profetas Menores", chapters: 1 },
  { id: "jn", name: "Jonas", group: "Profetas Menores", chapters: 4 },
  { id: "mq", name: "Miqueias", group: "Profetas Menores", chapters: 7 },
  { id: "na", name: "Naum", group: "Profetas Menores", chapters: 3 },
  { id: "hc", name: "Habacuque", group: "Profetas Menores", chapters: 3 },
  { id: "sf", name: "Sofonias", group: "Profetas Menores", chapters: 3 },
  { id: "ag", name: "Ageu", group: "Profetas Menores", chapters: 2 },
  { id: "zc", name: "Zacarias", group: "Profetas Menores", chapters: 14 },
  { id: "ml", name: "Malaquias", group: "Profetas Menores", chapters: 4 },

  // Novo Testamento
  { id: "mt", name: "Mateus", group: "Evangelhos", chapters: 28 },
  { id: "mc", name: "Marcos", group: "Evangelhos", chapters: 16 },
  { id: "lc", name: "Lucas", group: "Evangelhos", chapters: 24 },
  { id: "joao", name: "João", group: "Evangelhos", chapters: 21 },
  { id: "at", name: "Atos", group: "Histórico NT", chapters: 28 },
  { id: "rm", name: "Romanos", group: "Cartas Paulinas", chapters: 16 },
  { id: "1co", name: "1 Coríntios", group: "Cartas Paulinas", chapters: 16 },
  { id: "2co", name: "2 Coríntios", group: "Cartas Paulinas", chapters: 13 },
  { id: "gl", name: "Gálatas", group: "Cartas Paulinas", chapters: 6 },
  { id: "ef", name: "Efésios", group: "Cartas Paulinas", chapters: 6 },
  { id: "fp", name: "Filipenses", group: "Cartas Paulinas", chapters: 4 },
  { id: "cl", name: "Colossenses", group: "Cartas Paulinas", chapters: 4 },
  { id: "1ts", name: "1 Tessalonicenses", group: "Cartas Paulinas", chapters: 5 },
  { id: "2ts", name: "2 Tessalonicenses", group: "Cartas Paulinas", chapters: 3 },
  { id: "1tm", name: "1 Timóteo", group: "Cartas Pastorais", chapters: 6 },
  { id: "2tm", name: "2 Timóteo", group: "Cartas Pastorais", chapters: 4 },
  { id: "tt", name: "Tito", group: "Cartas Pastorais", chapters: 3 },
  { id: "fm", name: "Filemom", group: "Cartas Paulinas", chapters: 1 },
  { id: "hb", name: "Hebreus", group: "Cartas Gerais", chapters: 13 },
  { id: "tg", name: "Tiago", group: "Cartas Gerais", chapters: 5 },
  { id: "1pe", name: "1 Pedro", group: "Cartas Gerais", chapters: 5 },
  { id: "2pe", name: "2 Pedro", group: "Cartas Gerais", chapters: 3 },
  { id: "1jo", name: "1 João", group: "Cartas Gerais", chapters: 5 },
  { id: "2jo", name: "2 João", group: "Cartas Gerais", chapters: 1 },
  { id: "3jo", name: "3 João", group: "Cartas Gerais", chapters: 1 },
  { id: "jd", name: "Judas", group: "Cartas Gerais", chapters: 1 },
  { id: "ap", name: "Apocalipse", group: "Profético NT", chapters: 22 }
];

export const acfTexts = {
  "sl_150": {
    book: "Salmos",
    chapter: 150,
    title: "O Grande Hino de Louvor com Instrumentos",
    verses: [
      { v: 1, text: "Louvai ao Senhor. Louvai a Deus no seu santuário; louvai-o no firmamento do seu poder." },
      { v: 2, text: "Louvai-o pelos seus atos poderosos; louvai-o conforme a excelência da sua grandeza." },
      { v: 3, text: "Louvai-o com o som de trombeta; louvai-o com o saltério e a harpa." },
      { v: 4, text: "Louvai-o com o adufe e a flauta; louvai-o com instrumentos de cordas e com órgãos." },
      { v: 5, text: "Louvai-o com os címbalos sonoros; louvai-o com címbalos altissonantes." },
      { v: 6, text: "Tudo quanto tem fôlego louve ao Senhor. Louvai ao Senhor." }
    ]
  },
  "sl_33": {
    book: "Salmos",
    chapter: 33,
    title: "A Habilidade e Louvor com Instrumentos",
    verses: [
      { v: 1, text: "Regozijai-vos no Senhor, vós justos, pois aos retos convém o louvor." },
      { v: 2, text: "Louvai ao Senhor com harpa, cantai a ele com o saltério e um instrumento de dez cordas." },
      { v: 3, text: "Cantai-lhe um cântico novo; tocai bem e com júbilo." },
      { v: 4, text: "Porque a palavra do Senhor é reta, e todas as suas obras são fiéis." },
      { v: 5, text: "Ele ama a justiça e o juízo; a terra está cheia da bondade do Senhor." }
    ]
  },
  "sl_23": {
    book: "Salmos",
    chapter: 23,
    title: "O Bom Pastor",
    verses: [
      { v: 1, text: "O Senhor é o meu pastor, nada me faltará." },
      { v: 2, text: "Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas." },
      { v: 3, text: "Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome." },
      { v: 4, text: "Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam." },
      { v: 5, text: "Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo, o meu cálice transborda." },
      { v: 6, text: "Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na casa do Senhor por longos dias." }
    ]
  },
  "sl_98": {
    book: "Salmos",
    chapter: 98,
    title: "Cântico de Alegria e Instrumentos",
    verses: [
      { v: 1, text: "Cantai ao Senhor um cântico novo, porque fez maravilhas; a sua destra e o seu braço santo lhe alcançaram a salvação." },
      { v: 4, text: "Exultai no Senhor toda a terra; exclamai e alegrai-vos de prazer, e cantai louvores." },
      { v: 5, text: "Cantai louvores ao Senhor com a harpa; com a harpa e a voz do canto." },
      { v: 6, text: "Com trombetas e som de cornetas, exultai perante a face do Senhor, o Rei." }
    ]
  },
  "sl_100": {
    book: "Salmos",
    chapter: 100,
    title: "Ação de Graças",
    verses: [
      { v: 1, text: "Celebrai com júbilo ao Senhor, todas as terras." },
      { v: 2, text: "Servi ao Senhor com alegria; e entrai diante dele com canto." },
      { v: 3, text: "Sabei que o Senhor é Deus; foi ele que nos fez, e não nós a nós mesmos; somos povo seu e ovelhas do seu pasto." },
      { v: 4, text: "Entrai pelas portas dele com gratidão, e em seus átrios com louvor; louvai-o, e bendizei o seu nome." },
      { v: 5, text: "Porque o Senhor é bom, e eterna a sua misericórdia; e a sua verdade dura de geração em geração." }
    ]
  },
  "ef_5": {
    book: "Efésios",
    chapter: 5,
    title: "O Louvor Espiritual",
    verses: [
      { v: 18, text: "E não vos embriagueis com vinho, no qual há devassidão, mas enchei-vos do Espírito;" },
      { v: 19, text: "Falando entre vós em salmos, e hinos, e cânticos espirituais; cantando e salmodiando ao Senhor no vosso coração;" },
      { v: 20, text: "Dando sempre graças por tudo a nosso Deus e Pai, em nome de nosso Senhor Jesus Cristo." }
    ]
  },
  "1cr_25": {
    book: "1 Crônicas",
    chapter: 25,
    title: "A Ordem dos Músicos de Davi",
    verses: [
      { v: 1, text: "E Davi, juntamente com os capitães do exército, separou para o ministério os filhos de Asafe, e de Hemã, e de Jedutum, para profetizarem com harpas, com saltérios, e com címbalos..." },
      { v: 6, text: "Todos estes estavam sob a direção de seu pai, para a música da casa do Senhor, com címbalos, saltérios e harpas, para o ministério da casa de Deus..." },
      { v: 7, text: "E era o número deles, juntamente com seus irmãos instruídos no canto ao Senhor, todos eles mestres, duzentos e oitenta e oito." }
    ]
  },
  "cl_3": {
    book: "Colossenses",
    chapter: 3,
    title: "A Palavra de Cristo e a Música",
    verses: [
      { v: 16, text: "A palavra de Cristo habite em vós abundantemente, em toda a sabedoria, ensinando-vos e admoestando-vos uns aos outros, com salmos, hinos e cânticos espirituais, cantando ao Senhor com graça em vosso coração." },
      { v: 17, text: "E, quanto fizerdes por palavras ou por obras, fazei tudo em nome do Senhor Jesus, dando por ele graças a Deus Pai." }
    ]
  }
};

export const devocionaisInstrumentista = [
  {
    ref: "Salmos 33:3",
    verse: "Cantai-lhe um cântico novo; tocai bem e com júbilo.",
    title: "A Excelência e o Coração",
    reflection: "Deus não pede apenas técnica fria ('tocai bem') e nem apenas emoção desordenada ('com júbilo'). Ele une os dois: dedicação ao ensaio, respeito ao instrumento e adoração genuína na presença dEle."
  },
  {
    ref: "1 Crônicas 25:7",
    verse: "E era o número deles... todos eles mestres, duzentos e oitenta e oito.",
    title: "O Chamado do Ministro Instrumentista",
    reflection: "No templo, os músicos eram consagrados e separados. Como instrumentista, suas mãos no violão ou no baixo não apenas produzem notas musicais, mas conduzem a igreja aos átrios do Senhor."
  },
  {
    ref: "1 Samuel 16:23",
    verse: "E sucedia que, quando o espírito mau da parte de Deus vinha sobre Saul, Davi tomava a harpa, e a tocava com a sua mão; então Saul sentia alívio...",
    title: "A Unção no Instrumento",
    reflection: "O instrumento dedilhado sob a unção do Espírito traz paz, quebrantamento e liberta ambientes. A afinação do seu coração com Deus é tão importante quanto a afinação das cordas do seu violão ou contrabaixo."
  }
];
