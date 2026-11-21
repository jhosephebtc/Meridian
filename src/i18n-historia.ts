/**
 * Full essay translations — O Farol e o Meridiano
 */
import type { Lang } from './i18n';

type BlockMap = Record<string, Record<Lang, string>>;

const B: BlockMap = {
  'oceano.label': {
    pt: 'Narrativa',
    en: 'Narrative',
    es: 'Narrativa',
    fr: 'Récit',
  },
  'oceano.h3': {
    pt: 'Convicção antes do instrumento',
    en: 'Conviction before the instrument',
    es: 'Convicción antes del instrumento',
    fr: 'Conviction avant l’instrument',
  },
  'oceano.body': {
    pt: `<p>Muito antes dos mapas ocuparem mesas de capitães e muito antes de instrumentos dizerem às pessoas exatamente onde estavam, atravessar o oceano era um exercício de convicção.</p>
<p>Navegar significava escolher uma direção e acreditar nela.</p>
<p>O mar não oferecia referências.</p>
<p>O horizonte parecia igual em todas as direções.</p>
<p>Durante o dia, céu e água se confundiam.</p>
<p>Durante a noite, a escuridão apagava quase tudo.</p>`,
    en: `<p>Long before maps covered captains’ tables and long before instruments told people exactly where they were, crossing the ocean was an exercise in conviction.</p>
<p>To navigate meant choosing a direction and believing in it.</p>
<p>The sea offered no references.</p>
<p>The horizon looked the same in every direction.</p>
<p>By day, sky and water blurred together.</p>
<p>By night, darkness erased nearly everything.</p>`,
    es: `<p>Mucho antes de que los mapas ocuparan las mesas de los capitanes y mucho antes de que los instrumentos dijeran a las personas exactamente dónde estaban, cruzar el océano era un ejercicio de convicción.</p>
<p>Navegar significaba elegir una dirección y creer en ella.</p>
<p>El mar no ofrecía referencias.</p>
<p>El horizonte parecía igual en todas las direcciones.</p>
<p>Durante el día, cielo y agua se confundían.</p>
<p>Durante la noche, la oscuridad borraba casi todo.</p>`,
    fr: `<p>Bien avant que les cartes n’occupent les tables des capitaines et bien avant que les instruments ne disent aux gens exactement où ils étaient, traverser l’océan était un exercice de conviction.</p>
<p>Naviguer signifiait choisir une direction et y croire.</p>
<p>La mer n’offrait aucune référence.</p>
<p>L’horizon semblait identique dans toutes les directions.</p>
<p>Le jour, ciel et eau se confondaient.</p>
<p>La nuit, l’obscurité effaçait presque tout.</p>`,
  },
  'desvio.label': { pt: 'Tese', en: 'Thesis', es: 'Tesis', fr: 'Thèse' },
  'desvio.h3': {
    pt: 'O desvio em pequenas medidas',
    en: 'Drift in small degrees',
    es: 'El desvío en pequeñas medidas',
    fr: 'La dérive en petites mesures',
  },
  'desvio.intro': {
    pt: '<p>Era nesse vazio que os navegadores descobriam uma verdade desconfortável:</p>',
    en: '<p>It was in that emptiness that navigators discovered an uncomfortable truth:</p>',
    es: '<p>Era en ese vacío donde los navegadores descubrían una verdad incómoda:</p>',
    fr: '<p>C’est dans ce vide que les navigateurs découvraient une vérité inconfortable&nbsp;:</p>',
  },
  'desvio.pull': {
    pt: 'ninguém se perde de uma vez.',
    en: 'no one is lost all at once.',
    es: 'nadie se pierde de una vez.',
    fr: 'personne ne se perd d’un seul coup.',
  },
  'desvio.cite': {
    pt: 'Ensaio · O Farol e o Meridiano',
    en: 'Essay · The Lighthouse & the Meridian',
    es: 'Ensayo · El Faro y el Meridiano',
    fr: 'Essai · Le Phare et le Méridien',
  },
  'desvio.body': {
    pt: `<p>Ninguém acorda numa manhã e decide abandonar sua rota.</p>
<p>O desvio acontece em pequenas medidas.</p>
<p>Alguns graus hoje. Outros amanhã.</p>
<p>Uma correção aparentemente inofensiva. Uma concessão que parece razoável.</p>
<p>Uma decisão tomada apenas para facilitar a viagem. E então outra. E mais outra.</p>
<p>Até que, semanas depois, a embarcação já não está indo para onde imaginava.</p>
<p>Acontece no mar. Acontece com pessoas. Acontece com empresas. Acontece com qualquer coisa que precise escolher constantemente entre diferentes caminhos.</p>`,
    en: `<p>No one wakes up one morning and decides to abandon their route.</p>
<p>Drift happens in small measures.</p>
<p>A few degrees today. More tomorrow.</p>
<p>A correction that seems harmless. A concession that seems reasonable.</p>
<p>A decision made only to ease the voyage. And then another. And another.</p>
<p>Until weeks later, the vessel is no longer going where it imagined.</p>
<p>It happens at sea. It happens with people. It happens with companies. It happens with anything that must constantly choose between different paths.</p>`,
    es: `<p>Nadie se despierta una mañana y decide abandonar su ruta.</p>
<p>El desvío ocurre en pequeñas medidas.</p>
<p>Algunos grados hoy. Otros mañana.</p>
<p>Una corrección aparentemente inofensiva. Una concesión que parece razonable.</p>
<p>Una decisión tomada solo para facilitar el viaje. Y luego otra. Y otra más.</p>
<p>Hasta que, semanas después, la embarcación ya no va hacia donde imaginaba.</p>
<p>Sucede en el mar. Sucede con personas. Sucede con empresas. Sucede con cualquier cosa que deba elegir constantemente entre distintos caminos.</p>`,
    fr: `<p>Personne ne se réveille un matin en décidant d’abandonner sa route.</p>
<p>La dérive arrive par petites mesures.</p>
<p>Quelques degrés aujourd’hui. D’autres demain.</p>
<p>Une correction apparemment inoffensive. Une concession qui paraît raisonnable.</p>
<p>Une décision prise seulement pour faciliter le voyage. Puis une autre. Puis encore une.</p>
<p>Jusqu’à ce que, des semaines plus tard, le navire n’aille plus là où il pensait.</p>
<p>Cela arrive en mer. Cela arrive aux personnes. Cela arrive aux entreprises. Cela arrive à tout ce qui doit choisir sans cesse entre différents chemins.</p>`,
  },
  'meridianos.label': { pt: 'Referência', en: 'Reference', es: 'Referencia', fr: 'Référence' },
  'meridianos.h3': {
    pt: 'Não bastava ter uma direção',
    en: 'A direction was not enough',
    es: 'No bastaba tener una dirección',
    fr: 'Une direction ne suffisait pas',
  },
  'meridianos.body': {
    pt: `<p>Por isso os antigos navegadores valorizavam uma ideia simples.</p>
<p>Não bastava ter uma direção. Era preciso possuir uma referência.</p>
<p>Algo estável. Algo que permanecesse igual quando tudo ao redor mudasse.</p>
<p>Foi assim que surgiram os meridianos.</p>
<p>Linhas invisíveis. Impossíveis de tocar. Inexistentes aos olhos. Mas capazes de orientar jornadas inteiras.</p>
<p>Curiosamente, ninguém admirava os meridianos. As pessoas admiravam os navios, as grandes travessias, os capitães. Quase ninguém falava sobre as linhas silenciosas que tornavam tudo aquilo possível. Até porque referências raramente recebem aplausos. Elas apenas cumprem seu papel.</p>`,
    en: `<p>That is why the old navigators valued a simple idea.</p>
<p>Having a direction was not enough. You needed a reference.</p>
<p>Something stable. Something that stayed the same when everything around it changed.</p>
<p>That is how meridians came to be.</p>
<p>Invisible lines. Impossible to touch. Invisible to the eye. Yet able to guide entire journeys.</p>
<p>Curiously, nobody admired the meridians. People admired the ships, the great crossings, the captains. Almost no one spoke of the quiet lines that made it all possible. References rarely receive applause. They simply do their job.</p>`,
    es: `<p>Por eso los antiguos navegadores valoraban una idea simple.</p>
<p>No bastaba tener una dirección. Era preciso poseer una referencia.</p>
<p>Algo estable. Algo que permaneciera igual cuando todo alrededor cambiara.</p>
<p>Así surgieron los meridianos.</p>
<p>Líneas invisibles. Imposibles de tocar. Inexistentes a la vista. Pero capaces de orientar viajes enteros.</p>
<p>Curiosamente, nadie admiraba los meridianos. La gente admiraba los barcos, las grandes travesías, los capitanes. Casi nadie hablaba de las líneas silenciosas que lo hacían posible. Porque las referencias rara vez reciben aplausos. Solo cumplen su papel.</p>`,
    fr: `<p>C’est pourquoi les anciens navigateurs prisaient une idée simple.</p>
<p>Avoir une direction ne suffisait pas. Il fallait une référence.</p>
<p>Quelque chose de stable. Quelque chose qui restait le même quand tout autour changeait.</p>
<p>C’est ainsi qu’apparurent les méridiens.</p>
<p>Des lignes invisibles. Impossibles à toucher. Inexistantes à l’œil. Mais capables d’orienter des traversées entières.</p>
<p>Curieusement, personne n’admirait les méridiens. On admirait les navires, les grandes traversées, les capitaines. Presque personne ne parlait des lignes silencieuses qui rendaient tout cela possible. Les références reçoivent rarement des applaudissements. Elles font simplement leur travail.</p>`,
  },
  'farol.label': { pt: 'Personagem', en: 'Character', es: 'Personaje', fr: 'Personnage' },
  'farol.h3': {
    pt: 'Referência que se vê',
    en: 'A reference you can see',
    es: 'Referencia que se ve',
    fr: 'Une référence que l’on voit',
  },
  'farol.body': {
    pt: `<p>Em uma costa distante existia um velho farol construído sobre penhascos escuros.</p>
<p>Ele também era uma referência. Mas, ao contrário dos meridianos, podia ser visto.</p>
<p>Durante tempestades, sua luz atravessava a chuva. Durante neblinas densas, era a única forma reconhecível naquele trecho do oceano. Durante noites absolutamente escuras, quando céu e mar pareciam uma única coisa, ele permanecia aceso.</p>
<p>Curiosamente, o farol não era extraordinário. Sua torre era simples. Suas pedras eram comuns. Não possuía a luz mais potente nem a arquitetura mais impressionante. Outros faróis eram maiores. Outros eram mais modernos. Alguns até mais bonitos.</p>`,
    en: `<p>On a distant coast stood an old lighthouse built on dark cliffs.</p>
<p>It was a reference too. But unlike meridians, it could be seen.</p>
<p>In storms, its light cut through the rain. In dense fog, it was the only recognizable form on that stretch of ocean. On utterly dark nights, when sky and sea seemed one, it stayed lit.</p>
<p>Curiously, the lighthouse was not extraordinary. Its tower was simple. Its stones were ordinary. It did not have the strongest light or the most impressive architecture. Other lighthouses were taller. Others more modern. Some even prettier.</p>`,
    es: `<p>En una costa lejana existía un viejo faro construido sobre acantilados oscuros.</p>
<p>También era una referencia. Pero, a diferencia de los meridianos, podía verse.</p>
<p>Durante las tormentas, su luz atravesaba la lluvia. En neblinas densas, era la única forma reconocible en aquel tramo del océano. En noches absolutamente oscuras, cuando cielo y mar parecían una sola cosa, permanecía encendido.</p>
<p>Curiosamente, el faro no era extraordinario. Su torre era simple. Sus piedras eran comunes. No tenía la luz más potente ni la arquitectura más impresionante. Otros faros eran más grandes. Otros más modernos. Algunos incluso más bonitos.</p>`,
    fr: `<p>Sur une côte lointaine se dressait un vieux phare bâti sur des falaises sombres.</p>
<p>Lui aussi était une référence. Mais, contrairement aux méridiens, on pouvait le voir.</p>
<p>Pendant les tempêtes, sa lumière traversait la pluie. Dans les brouillards denses, c’était la seule forme reconnaissable sur ce trait d’océan. Les nuits absolument noires, quand ciel et mer ne faisaient qu’un, il restait allumé.</p>
<p>Curieusement, le phare n’était pas extraordinaire. Sa tour était simple. Ses pierres étaient ordinaires. Il n’avait ni la lumière la plus puissante ni l’architecture la plus impressionnante. D’autres phares étaient plus grands. D’autres plus modernes. Certains même plus beaux.</p>`,
  },
  'farol.pull': {
    pt: 'Mas nenhum era tão confiável.',
    en: 'But none was so reliable.',
    es: 'Pero ninguno era tan confiable.',
    fr: 'Mais aucun n’était aussi fiable.',
  },
  'farol.cite': {
    pt: 'Reputação merecida · não planejada',
    en: 'Earned reputation · not planned',
    es: 'Reputación merecida · no planificada',
    fr: 'Réputation méritée · non planifiée',
  },
  'farol.body2': {
    pt: `<p>Os navegadores diziam algo estranho sobre ele.</p>
<p>Diziam que não confiavam em sua luz. Confiavam em suas decisões.</p>
<p>A frase parecia sem sentido. Como um farol poderia tomar decisões?</p>
<p>Mas a resposta estava escondida em sua história.</p>`,
    en: `<p>Navigators said something strange about it.</p>
<p>They said they did not trust its light. They trusted its decisions.</p>
<p>The sentence seemed senseless. How could a lighthouse make decisions?</p>
<p>But the answer was hidden in its history.</p>`,
    es: `<p>Los navegadores decían algo extraño sobre él.</p>
<p>Decían que no confiaban en su luz. Confiaban en sus decisiones.</p>
<p>La frase parecía sin sentido. ¿Cómo podía un faro tomar decisiones?</p>
<p>Pero la respuesta estaba escondida en su historia.</p>`,
    fr: `<p>Les navigateurs disaient quelque chose d’étrange à son sujet.</p>
<p>Ils disaient qu’ils ne faisaient pas confiance à sa lumière. Ils faisaient confiance à ses décisions.</p>
<p>La phrase semblait absurde. Comment un phare pourrait-il prendre des décisions&nbsp;?</p>
<p>Mais la réponse était cachée dans son histoire.</p>`,
  },
  'placa.label': { pt: 'Critério', en: 'Criterion', es: 'Criterio', fr: 'Critère' },
  'placa.h3': {
    pt: 'Toda decisão passava por ali',
    en: 'Every decision passed through it',
    es: 'Toda decisión pasaba por ahí',
    fr: 'Toute décision y passait',
  },
  'placa.body': {
    pt: `<p>Ao longo das décadas, inúmeros responsáveis passaram por aquela torre.</p>
<p>Alguns queriam transformá-la em atração turística. Outros queriam torná-la mais lucrativa. Houve quem desejasse substituir sua função original por atividades mais rentáveis.</p>
<p>Todas as propostas pareciam inteligentes. Todas possuíam argumentos convincentes. Todas prometiam alguma espécie de ganho.</p>
<p>Mas havia uma pergunta gravada numa pequena placa de metal perto da sala das lâmpadas. Uma pergunta simples.</p>`,
    en: `<p>Over the decades, countless keepers passed through that tower.</p>
<p>Some wanted to turn it into a tourist attraction. Others wanted to make it more profitable. Some wished to replace its original purpose with more lucrative activities.</p>
<p>Every proposal seemed smart. Every one had convincing arguments. Every one promised some kind of gain.</p>
<p>But there was a question engraved on a small metal plaque near the lamp room. A simple question.</p>`,
    es: `<p>A lo largo de las décadas, innumerables responsables pasaron por aquella torre.</p>
<p>Algunos querían transformarla en atracción turística. Otros querían hacerla más lucrativa. Hubo quien deseaba sustituir su función original por actividades más rentables.</p>
<p>Todas las propuestas parecían inteligentes. Todas tenían argumentos convincentes. Todas prometían alguna clase de ganancia.</p>
<p>Pero había una pregunta grabada en una pequeña placa de metal cerca de la sala de las lámparas. Una pregunta simple.</p>`,
    fr: `<p>Au fil des décennies, d’innombrables responsables passèrent par cette tour.</p>
<p>Certains voulaient en faire une attraction touristique. D’autres voulaient la rendre plus lucrative. Il y en eut qui souhaitaient remplacer sa fonction d’origine par des activités plus rentables.</p>
<p>Toutes les propositions semblaient intelligentes. Toutes avaient des arguments convaincants. Toutes promettaient un gain d’une sorte ou d’une autre.</p>
<p>Mais il y avait une question gravée sur une petite plaque de métal près de la salle des lampes. Une question simple.</p>`,
  },
  'placa.pull': {
    pt: '“Isso ajuda os navegadores a encontrar seu caminho?”',
    en: '“Does this help navigators find their way?”',
    es: '“¿Esto ayuda a los navegadores a encontrar su camino?”',
    fr: '« Cela aide-t-il les navigateurs à trouver leur chemin ? »',
  },
  'placa.cite': {
    pt: 'Critério único · nunca mudava',
    en: 'Single criterion · never changed',
    es: 'Criterio único · nunca cambiaba',
    fr: 'Critère unique · ne changeait jamais',
  },
  'placa.body2': {
    pt: `<p>Nada além disso. Toda decisão passava por ali.</p>
<p>Toda mudança. Toda oportunidade. Todo investimento. Toda inovação. Toda recusa.</p>
<p>A pergunta nunca mudava. E, justamente por isso, o farol nunca se perdia.</p>
<p>Anos se transformaram em décadas. Décadas se transformaram em gerações. Enquanto outros buscavam atenção, o farol buscava alinhamento. Enquanto outros perguntavam “Como podemos crescer?”, o farol perguntava “Como podemos continuar sendo úteis?”. Enquanto outros perseguiam tendências, ele perseguia coerência.</p>`,
    en: `<p>Nothing more. Every decision passed through it.</p>
<p>Every change. Every opportunity. Every investment. Every innovation. Every refusal.</p>
<p>The question never changed. And precisely for that reason, the lighthouse never lost its way.</p>
<p>Years became decades. Decades became generations. While others sought attention, the lighthouse sought alignment. While others asked “How can we grow?”, the lighthouse asked “How can we keep being useful?”. While others chased trends, it chased coherence.</p>`,
    es: `<p>Nada más. Toda decisión pasaba por ahí.</p>
<p>Todo cambio. Toda oportunidad. Toda inversión. Toda innovación. Toda negativa.</p>
<p>La pregunta nunca cambiaba. Y, justamente por eso, el faro nunca se perdía.</p>
<p>Los años se volvieron décadas. Las décadas, generaciones. Mientras otros buscaban atención, el faro buscaba alineación. Mientras otros preguntaban “¿Cómo podemos crecer?”, el faro preguntaba “¿Cómo podemos seguir siendo útiles?”. Mientras otros perseguían tendencias, él perseguía coherencia.</p>`,
    fr: `<p>Rien de plus. Toute décision y passait.</p>
<p>Tout changement. Toute opportunité. Tout investissement. Toute innovation. Tout refus.</p>
<p>La question ne changeait jamais. Et c’est précisément pour cela que le phare ne se perdait jamais.</p>
<p>Les années devinrent des décennies. Les décennies, des générations. Tandis que d’autres cherchaient l’attention, le phare cherchait l’alignement. Tandis que d’autres demandaient « Comment grandir ? », le phare demandait « Comment rester utiles ? ». Tandis que d’autres poursuivaient les tendances, il poursuivait la cohérence.</p>`,
  },
  'placa.life1.t': { pt: 'Critério', en: 'Criterion', es: 'Criterio', fr: 'Critère' },
  'placa.life1.h': {
    pt: 'Útil aos navegadores?',
    en: 'Useful to navigators?',
    es: '¿Útil a los navegadores?',
    fr: 'Utile aux navigateurs ?',
  },
  'placa.life1.p': {
    pt: 'Filtro único para mudança, investimento e recusa.',
    en: 'Single filter for change, investment, and refusal.',
    es: 'Filtro único para cambio, inversión y negativa.',
    fr: 'Filtre unique pour le changement, l’investissement et le refus.',
  },
  'placa.life2.t': {
    pt: 'Atenção × alinhamento',
    en: 'Attention × alignment',
    es: 'Atención × alineación',
    fr: 'Attention × alignement',
  },
  'placa.life2.h': {
    pt: 'Crescer × ser útil',
    en: 'Grow × stay useful',
    es: 'Crecer × ser útil',
    fr: 'Grandir × rester utile',
  },
  'placa.life2.p': {
    pt: 'Outros perseguiam tendência; o farol perseguia coerência.',
    en: 'Others chased trends; the lighthouse chased coherence.',
    es: 'Otros perseguían la tendencia; el faro perseguía la coherencia.',
    fr: 'D’autres poursuivaient la tendance ; le phare poursuivait la cohérence.',
  },
  'placa.life3.t': { pt: 'Padrão', en: 'Pattern', es: 'Patrón', fr: 'Motif' },
  'placa.life3.h': {
    pt: 'Confiança merecida',
    en: 'Earned trust',
    es: 'Confianza merecida',
    fr: 'Confiance méritée',
  },
  'placa.life3.p': {
    pt: 'Reputação não planejada — repetida até ser reconhecida.',
    en: 'Unplanned reputation — repeated until recognized.',
    es: 'Reputación no planificada — repetida hasta ser reconocida.',
    fr: 'Réputation non planifiée — répétée jusqu’à être reconnue.',
  },
  'identidade.label': { pt: 'Princípio', en: 'Principle', es: 'Principio', fr: 'Principe' },
  'identidade.h3': {
    pt: 'A luz como manifestação',
    en: 'Light as manifestation',
    es: 'La luz como manifestación',
    fr: 'La lumière comme manifestation',
  },
  'identidade.body': {
    pt: `<p>Pouco a pouco, uma reputação começou a surgir — não porque tivesse sido planejada, mas porque havia sido merecida. Os navegadores passaram a confiar nele não por causa do que dizia, mas por causa do padrão que repetia.</p>
<p>Quando aparecia uma escolha difícil, ele escolhia a direção. Quando surgia uma distração atraente, ele escolhia a direção. Quando um atalho prometia vantagens imediatas, ele escolhia a direção.</p>
<p>Sempre a direção. Sempre o propósito. Sempre o caminho.</p>
<p>Com o tempo, os marinheiros perceberam algo extraordinário: o verdadeiro valor daquele farol não estava na luz. A luz era apenas a manifestação visível de algo invisível. Assim como um navio seguia um meridiano que ninguém enxergava, o farol também seguia uma linha invisível.</p>
<p>Uma linha feita de princípios. De critérios. De escolhas repetidas. De decisões tomadas quando ninguém estava observando.</p>`,
    en: `<p>Little by little, a reputation began to form — not because it had been planned, but because it had been earned. Navigators came to trust it not for what it said, but for the pattern it repeated.</p>
<p>When a hard choice appeared, it chose the direction. When an attractive distraction arose, it chose the direction. When a shortcut promised immediate gains, it chose the direction.</p>
<p>Always the direction. Always the purpose. Always the path.</p>
<p>In time, sailors noticed something extraordinary: the true value of that lighthouse was not in the light. The light was only the visible manifestation of something invisible. Just as a ship followed a meridian no one could see, the lighthouse also followed an invisible line.</p>
<p>A line made of principles. Of criteria. Of repeated choices. Of decisions made when no one was watching.</p>`,
    es: `<p>Poco a poco, una reputación empezó a surgir — no porque hubiera sido planificada, sino porque había sido merecida. Los navegadores pasaron a confiar en él no por lo que decía, sino por el patrón que repetía.</p>
<p>Cuando aparecía una elección difícil, elegía la dirección. Cuando surgía una distracción atractiva, elegía la dirección. Cuando un atajo prometía ventajas inmediatas, elegía la dirección.</p>
<p>Siempre la dirección. Siempre el propósito. Siempre el camino.</p>
<p>Con el tiempo, los marineros percibieron algo extraordinario: el verdadero valor de aquel faro no estaba en la luz. La luz era solo la manifestación visible de algo invisible. Así como un barco seguía un meridiano que nadie veía, el faro también seguía una línea invisible.</p>
<p>Una línea hecha de principios. De criterios. De elecciones repetidas. De decisiones tomadas cuando nadie observaba.</p>`,
    fr: `<p>Peu à peu, une réputation commença à naître — non parce qu’elle avait été planifiée, mais parce qu’elle avait été méritée. Les navigateurs se mirent à lui faire confiance non pour ce qu’il disait, mais pour le motif qu’il répétait.</p>
<p>Quand un choix difficile apparaissait, il choisissait la direction. Quand une distraction séduisante surgissait, il choisissait la direction. Quand un raccourci promettait des avantages immédiats, il choisissait la direction.</p>
<p>Toujours la direction. Toujours le but. Toujours le chemin.</p>
<p>Avec le temps, les marins percèrent quelque chose d’extraordinaire : la vraie valeur de ce phare n’était pas dans la lumière. La lumière n’était que la manifestation visible de quelque chose d’invisible. Tout comme un navire suivait un méridien que personne ne voyait, le phare suivait aussi une ligne invisible.</p>
<p>Une ligne faite de principes. De critères. De choix répétés. De décisions prises quand personne ne regardait.</p>`,
  },
  'identidade.pull': {
    pt: 'As coisas mais importantes quase nunca são visíveis.',
    en: 'The most important things are almost never visible.',
    es: 'Las cosas más importantes casi nunca son visibles.',
    fr: 'Les choses les plus importantes ne sont presque jamais visibles.',
  },
  'identidade.cite': {
    pt: 'Confiança · reputação · convicção · direção · meridiano',
    en: 'Trust · reputation · conviction · direction · meridian',
    es: 'Confianza · reputación · convicción · dirección · meridiano',
    fr: 'Confiance · réputation · conviction · direction · méridien',
  },
  'identidade.body2': {
    pt: `<p>A confiança não é visível. A reputação não é visível. A convicção não é visível. A direção não é visível. O meridiano não é visível. Mas é a existência dessas coisas que determina todo o resto.</p>
<p>Porque uma identidade não nasce quando alguém cria um símbolo, nem quando alguém escreve uma missão, nem quando alguém escolhe uma cor ou um slogan. Uma identidade nasce quando uma decisão encontra outra decisão. E depois outra. E outra. Até formar uma linha tão clara que ninguém mais consegue confundi-la.</p>`,
    en: `<p>Trust is not visible. Reputation is not visible. Conviction is not visible. Direction is not visible. The meridian is not visible. But it is the existence of these things that determines everything else.</p>
<p>Because an identity is not born when someone creates a symbol, nor when someone writes a mission, nor when someone picks a color or a slogan. An identity is born when one decision meets another. And then another. And another. Until it forms a line so clear that no one can mistake it.</p>`,
    es: `<p>La confianza no es visible. La reputación no es visible. La convicción no es visible. La dirección no es visible. El meridiano no es visible. Pero es la existencia de esas cosas lo que determina todo lo demás.</p>
<p>Porque una identidad no nace cuando alguien crea un símbolo, ni cuando alguien escribe una misión, ni cuando alguien elige un color o un eslogan. Una identidad nace cuando una decisión encuentra otra decisión. Y luego otra. Y otra. Hasta formar una línea tan clara que nadie puede confundirla.</p>`,
    fr: `<p>La confiance n’est pas visible. La réputation n’est pas visible. La conviction n’est pas visible. La direction n’est pas visible. Le méridien n’est pas visible. Mais c’est l’existence de ces choses qui détermine tout le reste.</p>
<p>Parce qu’une identité ne naît pas quand quelqu’un crée un symbole, ni quand quelqu’un écrit une mission, ni quand quelqu’un choisit une couleur ou un slogan. Une identité naît quand une décision en rencontre une autre. Puis une autre. Puis encore une. Jusqu’à former une ligne si claire que plus personne ne peut s’y tromper.</p>`,
  },
  'marca.label': { pt: 'Coda', en: 'Coda', es: 'Coda', fr: 'Coda' },
  'marca.h3': {
    pt: 'Por isso Meridian',
    en: 'Why Meridian',
    es: 'Por eso Meridian',
    fr: 'Pourquoi Meridian',
  },
  'marca.body': {
    pt: `<p>No fim, o farol nunca foi lembrado por sua torre. Nunca foi lembrado por sua luz. Nunca foi lembrado por sua aparência. Foi lembrado porque permaneceu alinhado ao seu meridiano. Porque, quando tempestades chegavam, ele continuava sendo aquilo que havia decidido ser.</p>`,
    en: `<p>In the end, the lighthouse was never remembered for its tower. Never for its light. Never for its appearance. It was remembered because it stayed aligned to its meridian. Because when storms came, it kept being what it had decided to be.</p>`,
    es: `<p>Al final, el faro nunca fue recordado por su torre. Nunca por su luz. Nunca por su apariencia. Fue recordado porque permaneció alineado a su meridiano. Porque, cuando llegaban las tormentas, seguía siendo aquello que había decidido ser.</p>`,
    fr: `<p>À la fin, le phare ne fut jamais rappelé pour sa tour. Jamais pour sa lumière. Jamais pour son apparence. Il fut rappelé parce qu’il resta aligné sur son méridien. Parce que, quand les tempêtes arrivaient, il continuait d’être ce qu’il avait décidé d’être.</p>`,
  },
  'marca.pull': {
    pt: 'E talvez essa seja a definição mais simples de uma grande marca.',
    en: 'And perhaps that is the simplest definition of a great brand.',
    es: 'Y tal vez esa sea la definición más simple de una gran marca.',
    fr: 'Et peut-être est-ce la définition la plus simple d’une grande marque.',
  },
  'marca.cite': {
    pt: 'Não algo que chama atenção — algo que mantém a direção',
    en: 'Not something that grabs attention — something that keeps direction',
    es: 'No algo que llama la atención — algo que mantiene la dirección',
    fr: 'Pas quelque chose qui attire l’attention — quelque chose qui maintient la direction',
  },
  'marca.body2': {
    pt: `<p>Não algo que chama atenção. Mas algo que mantém a direção.</p>
<p>Por tempo suficiente para que os outros confiem nela.</p>
<p>O design system herda essa pergunta: cada token, cada superfície e cada gesto precisam ajudar quem navega a interface a encontrar o caminho — sem ruído, sem desvio, com uma só tinta e uma referência estável.</p>`,
    en: `<p>Not something that grabs attention. But something that keeps the direction.</p>
<p>Long enough for others to trust it.</p>
<p>The design system inherits this question: every token, surface, and gesture must help whoever navigates the interface find the way — no noise, no drift, one ink, one stable reference.</p>`,
    es: `<p>No algo que llama la atención. Sino algo que mantiene la dirección.</p>
<p>El tiempo suficiente para que los demás confíen en ella.</p>
<p>El design system hereda esta pregunta: cada token, superficie y gesto debe ayudar a quien navega la interfaz a encontrar el camino — sin ruido, sin desvío, con una sola tinta y una referencia estable.</p>`,
    fr: `<p>Pas quelque chose qui attire l’attention. Mais quelque chose qui maintient la direction.</p>
<p>Assez longtemps pour que les autres lui fassent confiance.</p>
<p>Le design system hérite de cette question : chaque token, surface et geste doit aider qui navigue l’interface à trouver le chemin — sans bruit, sans dérive, une seule encre, une référence stable.</p>`,
  },
  'aside.cap1': {
    pt: 'Plate · Farol · elevação plotter D2 · stroke 1u',
    en: 'Plate · Lighthouse · plotter D2 elevation · stroke 1u',
    es: 'Plate · Faro · elevación plotter D2 · stroke 1u',
    fr: 'Plate · Phare · élévation plotter D2 · stroke 1u',
  },
  'aside.glance': { pt: 'At a glance', en: 'At a glance', es: 'At a glance', fr: 'At a glance' },
  'aside.f1.t': { pt: 'Oceano', en: 'Ocean', es: 'Océano', fr: 'Océan' },
  'aside.f1.b': {
    pt: 'Sem mapa, navegar é escolher uma direção e acreditar nela.',
    en: 'Without a map, to navigate is to choose a direction and believe in it.',
    es: 'Sin mapa, navegar es elegir una dirección y creer en ella.',
    fr: 'Sans carte, naviguer c’est choisir une direction et y croire.',
  },
  'aside.f1.l': { pt: 'Ver seção 01 ↗', en: 'See section 01 ↗', es: 'Ver sección 01 ↗', fr: 'Voir section 01 ↗' },
  'aside.f2.t': { pt: 'Meridianos', en: 'Meridians', es: 'Meridianos', fr: 'Méridiens' },
  'aside.f2.b': {
    pt: 'Referências invisíveis — raramente recebem aplausos; apenas cumprem o papel.',
    en: 'Invisible references — they rarely get applause; they simply do the job.',
    es: 'Referencias invisibles — rara vez reciben aplausos; solo cumplen el papel.',
    fr: 'Références invisibles — elles reçoivent rarement des applaudissements ; elles font le travail.',
  },
  'aside.f2.l': { pt: 'Ver seção 03 ↗', en: 'See section 03 ↗', es: 'Ver sección 03 ↗', fr: 'Voir section 03 ↗' },
  'aside.f3.t': { pt: 'Placa', en: 'Plaque', es: 'Placa', fr: 'Plaque' },
  'aside.f3.b': {
    pt: '“Isso ajuda os navegadores a encontrar seu caminho?”',
    en: '“Does this help navigators find their way?”',
    es: '“¿Esto ayuda a los navegadores a encontrar su camino?”',
    fr: '« Cela aide-t-il les navigateurs à trouver leur chemin ? »',
  },
  'aside.f3.l': { pt: 'Ver seção 05 ↗', en: 'See section 05 ↗', es: 'Ver sección 05 ↗', fr: 'Voir section 05 ↗' },
  'aside.cap2': {
    pt: 'Plate · Meridianos · linha invisível · coerência',
    en: 'Plate · Meridians · invisible line · coherence',
    es: 'Plate · Meridianos · línea invisible · coherencia',
    fr: 'Plate · Méridiens · ligne invisible · cohérence',
  },
  'sec.01': { pt: '01 · Oceano', en: '01 · Ocean', es: '01 · Océano', fr: '01 · Océan' },
  'sec.02': { pt: '02 · Desvio', en: '02 · Drift', es: '02 · Desvío', fr: '02 · Dérive' },
  'sec.03': { pt: '03 · Meridianos', en: '03 · Meridians', es: '03 · Meridianos', fr: '03 · Méridiens' },
  'sec.04': { pt: '04 · Farol', en: '04 · Lighthouse', es: '04 · Faro', fr: '04 · Phare' },
  'sec.05': { pt: '05 · Placa', en: '05 · Plaque', es: '05 · Placa', fr: '05 · Plaque' },
  'sec.06': { pt: '06 · Identidade', en: '06 · Identity', es: '06 · Identidad', fr: '06 · Identité' },
  'sec.07': { pt: '07 · Marca', en: '07 · Brand', es: '07 · Marca', fr: '07 · Marque' },
};

function setHtml(sel: string, html: string): void {
  const el = document.querySelector(sel);
  if (el) el.innerHTML = html;
}

function setText(sel: string, text: string): void {
  const el = document.querySelector(sel);
  if (el) el.textContent = text;
}

export function applyHistoriaEssay(lang: Lang): void {
  const g = (key: string) => B[key]?.[lang] ?? B[key]?.pt ?? '';

  setText('[data-hist="oceano.label"]', g('oceano.label'));
  setHtml('[data-hist="oceano.h3"]', g('oceano.h3'));
  setHtml('[data-hist="oceano.body"]', g('oceano.body'));

  setText('[data-hist="desvio.label"]', g('desvio.label'));
  setHtml('[data-hist="desvio.h3"]', g('desvio.h3'));
  setHtml('[data-hist="desvio.intro"]', g('desvio.intro'));
  setText('[data-hist="desvio.pull"]', g('desvio.pull'));
  setText('[data-hist="desvio.cite"]', g('desvio.cite'));
  setHtml('[data-hist="desvio.body"]', g('desvio.body'));

  setText('[data-hist="meridianos.label"]', g('meridianos.label'));
  setHtml('[data-hist="meridianos.h3"]', g('meridianos.h3'));
  setHtml('[data-hist="meridianos.body"]', g('meridianos.body'));

  setText('[data-hist="farol.label"]', g('farol.label'));
  setHtml('[data-hist="farol.h3"]', g('farol.h3'));
  setHtml('[data-hist="farol.body"]', g('farol.body'));
  setText('[data-hist="farol.pull"]', g('farol.pull'));
  setText('[data-hist="farol.cite"]', g('farol.cite'));
  setHtml('[data-hist="farol.body2"]', g('farol.body2'));

  setText('[data-hist="placa.label"]', g('placa.label'));
  setHtml('[data-hist="placa.h3"]', g('placa.h3'));
  setHtml('[data-hist="placa.body"]', g('placa.body'));
  setText('[data-hist="placa.pull"]', g('placa.pull'));
  setText('[data-hist="placa.cite"]', g('placa.cite'));
  setHtml('[data-hist="placa.body2"]', g('placa.body2'));
  setText('[data-hist="placa.life1.t"]', g('placa.life1.t'));
  setText('[data-hist="placa.life1.h"]', g('placa.life1.h'));
  setText('[data-hist="placa.life1.p"]', g('placa.life1.p'));
  setText('[data-hist="placa.life2.t"]', g('placa.life2.t'));
  setText('[data-hist="placa.life2.h"]', g('placa.life2.h'));
  setText('[data-hist="placa.life2.p"]', g('placa.life2.p'));
  setText('[data-hist="placa.life3.t"]', g('placa.life3.t'));
  setText('[data-hist="placa.life3.h"]', g('placa.life3.h'));
  setText('[data-hist="placa.life3.p"]', g('placa.life3.p'));

  setText('[data-hist="identidade.label"]', g('identidade.label'));
  setHtml('[data-hist="identidade.h3"]', g('identidade.h3'));
  setHtml('[data-hist="identidade.body"]', g('identidade.body'));
  setText('[data-hist="identidade.pull"]', g('identidade.pull'));
  setText('[data-hist="identidade.cite"]', g('identidade.cite'));
  setHtml('[data-hist="identidade.body2"]', g('identidade.body2'));

  setText('[data-hist="marca.label"]', g('marca.label'));
  setHtml('[data-hist="marca.h3"]', g('marca.h3'));
  setHtml('[data-hist="marca.body"]', g('marca.body'));
  setText('[data-hist="marca.pull"]', g('marca.pull'));
  setText('[data-hist="marca.cite"]', g('marca.cite'));
  setHtml('[data-hist="marca.body2"]', g('marca.body2'));

  setText('[data-hist="aside.cap1"]', g('aside.cap1'));
  setText('[data-hist="aside.glance"]', g('aside.glance'));
  setText('[data-hist="aside.f1.t"]', g('aside.f1.t'));
  setText('[data-hist="aside.f1.b"]', g('aside.f1.b'));
  setText('[data-hist="aside.f1.l"]', g('aside.f1.l'));
  setText('[data-hist="aside.f2.t"]', g('aside.f2.t'));
  setText('[data-hist="aside.f2.b"]', g('aside.f2.b'));
  setText('[data-hist="aside.f2.l"]', g('aside.f2.l'));
  setText('[data-hist="aside.f3.t"]', g('aside.f3.t'));
  setText('[data-hist="aside.f3.b"]', g('aside.f3.b'));
  setText('[data-hist="aside.f3.l"]', g('aside.f3.l'));
  setText('[data-hist="aside.cap2"]', g('aside.cap2'));

  setText('#oceano .gann-eyebrow', g('sec.01'));
  setText('#desvio .gann-eyebrow', g('sec.02'));
  setText('#meridianos .gann-eyebrow', g('sec.03'));
  setText('#farol .gann-eyebrow', g('sec.04'));
  setText('#placa .gann-eyebrow', g('sec.05'));
  setText('#identidade .gann-eyebrow', g('sec.06'));
  setText('#marca .gann-eyebrow', g('sec.07'));
}
