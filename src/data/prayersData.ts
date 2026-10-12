export interface PrayerItem {
  id: string;
  title: string;
  author?: string;
  subtitle: string;
  moment: 'antes-examen' | 'antes-confesion' | 'despues-confesion';
  sourceType?: 'patristica' | 'magisterio' | 'doctores' | 'liturgica' | 'tradicional';
  isHolySpirit?: boolean;
  text: string;
  latinText?: string;
  notes?: string;
}

export const PRAYERS: PrayerItem[] = [
  // =========================================================================
  // 1. INVOCACIONES AL ESPÍRITU SANTO (PATRÍSTICAS Y MAGISTERIO)
  // =========================================================================
  {
    id: 'veni-sancte-spiritus',
    title: 'Secuencia de Pentecostés (Veni Sancte Spiritus)',
    author: 'Liturgia Romana / Magisterio (Papa Inocencio III / Langton)',
    subtitle: '«Secuencia de Oro» del Magisterio: luz, unción y purificación de las manchas del alma',
    moment: 'antes-examen',
    sourceType: 'magisterio',
    isHolySpirit: true,
    text: `Ven, Espíritu Divino,
manda tu luz desde el cielo.
Padre amoroso del pobre;
don, en tus dones espléndido;
luz que penetra las almas;
fuente del mayor consuelo.

Ven, dulce huésped del alma,
descanso de nuestro esfuerzo,
tregua en el duro trabajo,
brisa en las horas de fuego,
gozo que enjuga las lágrimas
y reconforta en los duelos.

Entra hasta el fondo del alma,
divina luz, y enriquécenos.
Mira el vacío del hombre,
si tú le faltas por dentro;
mira el poder del pecado,
cuando no envías tu aliento.

Riega la tierra en sequía,
sana el corazón enfermo,
lava las manchas, infunde
calor de vida en el hielo,
doma el espíritu indómito,
guía al que tuerce el sendero.

Reparte tus siete dones,
según la fe de tus siervos;
por tu bondad y tu gracia,
dale al esfuerzo su mérito;
salva al que busca salvarse
y danos tu gozo eterno. Amén.`,
    latinText: `Veni, Sancte Spiritus, et emitte caelitus lucis tuae radium. Veni, pater pauperum, veni, dator munerum, veni, lumen cordium... Lava quod est sordidum, riga quod est aridum, sana quod est saucium. Flecte quod est rigidum, fove quod est frigidum, rege quod est devium.`,
    notes: 'Proclamada por la Iglesia como la invocación suprema para purificar la mente y el corazón de las manchas del pecado.',
  },
  {
    id: 'veni-creator',
    title: 'Himno Veni Creator Spiritus',
    author: 'San Rábano Mauro (776 – 856 d.C.) / Magisterio Litúrgico',
    subtitle: 'Himno magisterial para disipar tinieblas y encender los sentidos en la caridad',
    moment: 'antes-examen',
    sourceType: 'magisterio',
    isHolySpirit: true,
    text: `Ven, Espíritu Creador,
visita las almas de tus fieles
y llena de la divina gracia
los corazones que Tú mismo creaste.

Tú eres nuestro Consolador,
don de Dios Altísimo,
fuente viva, fuego, caridad
y espiritual unción.

Tú derramas sobre nosotros los siete dones;
Tú, el dedo de la mano de Dios;
Tú, el prometido del Padre,
pones en nuestros labios los tesoros de tu palabra.

Enciende con tu luz nuestros sentidos;
infunde tu amor en nuestros corazones;
y, con tu perpetuo auxilio,
fortalece nuestra débil carne.

Aleja de nosotros al enemigo,
danos pronto la paz,
sé Tú mismo nuestro guía,
y puestos bajo tu dirección, evitaremos todo lo nocivo.

Por Ti conozcamos al Padre,
y también al Hijo;
y que en Ti, Espíritu de ambos,
creamos en todo tiempo.

Gloria a Dios Padre,
y al Hijo que resucitó,
y al Espíritu Consolador,
por los siglos infinitos. Amén.`,
  },
  {
    id: 'san-agustin-espiritu',
    title: 'Respira en mí, oh Espíritu Santo',
    author: 'San Agustín de Hipona (354 – 430 d.C., Padre y Doctor)',
    subtitle: 'Súplica para consagrar a la santidad los pensamientos y la memoria',
    moment: 'antes-examen',
    sourceType: 'patristica',
    isHolySpirit: true,
    text: `Respira en mí, oh Espíritu Santo,
para que todos mis pensamientos sean santos.

Actúa en mí, oh Espíritu Santo,
para que mi trabajo también sea santo.

Atrae mi corazón, oh Espíritu Santo,
para que ame sólo lo que es santo.

Fortaléceme, oh Espíritu Santo,
para que defienda todo lo que es santo.

Guárdame, pues, oh Espíritu Santo,
para que nunca pierda lo que es santo. Amén.`,
  },
  {
    id: 'san-basilio-espiritu',
    title: 'Invocación para el discernimiento y la pureza interior',
    author: 'San Basilio Magno (329 – 379 d.C., Padre Capadocio)',
    subtitle: 'Petición patrística para descubrir los rincones ocultos de la conciencia',
    moment: 'antes-examen',
    sourceType: 'patristica',
    isHolySpirit: true,
    text: `¡Oh Espíritu Santo, Consolador y Dador de vida! Luz increada, fuente celestial de santificación y discernimiento:

Ven a habitar en nosotros. Ilumina los rincones ocultos de nuestra mente y limpia nuestra conciencia de toda mancha y complicidad con las tinieblas.

Tú que unes lo humano a lo divino, derrama sobre nuestra alma compungida el fuego de tu santa caridad. Danos ojos limpios para ver la magnitud de nuestras faltas y el abismo infinito de tu perdón.

Aparta de nuestro espíritu toda soberbia y disimulo, para que nos presentemos ante Ti en verdad y sencillez. Por Jesucristo nuestro Señor. Amén.`,
  },
  {
    id: 'adsumus-sancte-spiritus',
    title: 'Adsumus, Sancte Spiritus (Estamos ante Ti)',
    author: 'San Isidoro de Sevilla (560 – 636 d.C.) / Concilio Vaticano II',
    subtitle: 'Plegaria del Magisterio de la Iglesia para evitar el extravío y juzgar con rectitud',
    moment: 'antes-examen',
    sourceType: 'magisterio',
    isHolySpirit: true,
    text: `Estamos ante ti, Espíritu Santo,
reunidos en tu nombre.

Ven a nosotros, asístenos,
entra en nuestros corazones.
Enséñanos qué debemos hacer,
muéstranos el camino que debemos seguir.

No permitas que la ignorancia nos arrastre al error,
ni que la simpatía humana desvíe nuestra rectitud,
ni que el amor propio o el temor nos hagan cómplices de la mentira.

Únenos eficazmente a ti con el don de tu gracia,
para que seamos uno en la verdad
y no nos apartemos en nada de la justicia divina. Amén.`,
    notes: 'Oración patrística atribuida a San Isidoro de Sevilla, recitada históricamente en los Concilios de Toledo y en el Concilio Vaticano II para implorar rectitud de juicio.',
  },
  {
    id: 'rey-celestial-bizantino',
    title: 'Invocación del «Rey Celestial» (Trisagio Oriental)',
    author: 'Tradición Patrística Oriental / San Juan Crisóstomo',
    subtitle: 'La súplica bizantina universal al Paráclito para purificarnos de toda mancha',
    moment: 'antes-examen',
    sourceType: 'patristica',
    isHolySpirit: true,
    text: `Rey Celestial, Consolador,
Espíritu de la Verdad,
Tú que estás en todo lugar y lo llenas todo,
Tesoro de bienes y Dador de vida:

Ven y habita en nosotros,
purifícanos de toda mancha de pecado,
y salva, ¡oh Bondadoso!, nuestras almas.

Santo Dios, Santo Fuerte, Santo Inmortal,
ten piedad de nosotros. Amén.`,
  },
  {
    id: 'san-juan-pablo-ii-espiritu',
    title: 'Súplica al Espíritu que «convence del pecado»',
    author: 'San Juan Pablo II (Encíclica Dominum et Vivificantem / Magisterio)',
    subtitle: 'Invocación magisterial para suscitar la contrición perfecta y acoger el perdón de la Cruz',
    moment: 'antes-examen',
    sourceType: 'magisterio',
    isHolySpirit: true,
    text: `Espíritu Santo, Huésped dulcísimo del alma:
Tú que, según la promesa de Jesucristo, vienes a «convencer al mundo en lo referente al pecado, a la justicia y al juicio» (Jn 16, 8):

Te suplicamos que penetres hasta la raíz más íntima de nuestra conciencia.
No permitas que caigamos en la ceguera del endurecimiento del corazón, ni en la indiferencia ante la ofensa cometida contra el Padre.

Convéncenos de nuestras faltas no para hundirnos en la desesperanza, sino para revelarnos la abundancia supereminente del amor redentor de Cristo en el madero de la Cruz.

Infunde en nosotros lágrimas de sincero arrepentimiento, una contrición nacida del amor y la prontitud alegre para correr al sacramento de la reconciliación. Amén.`,
  },
  {
    id: 'san-simeon-espiritu',
    title: 'Súplica de luz viva y lágrimas de compunción',
    author: 'San Simeón el Nuevo Teólogo (949 – 1022 d.C., Padre Místico)',
    subtitle: 'Para derribar la ceguera interior y pedir el fuego del Paráclito',
    moment: 'antes-examen',
    sourceType: 'patristica',
    isHolySpirit: true,
    text: `Ven, Luz verdadera. Ven, Vida eterna.
Ven, misterio oculto. Ven, tesoro sin nombre.
Ven, presencia inefable. Ven, Tú que despiertas a los que yacen dormidos en las tinieblas de la culpa.

Ven, Tú que purificas a los pecadores y los revistes con vestiduras de gracia.
Ven, Espíritu Santo, penetra lo más recóndito de mis pensamientos. Disipa la soberbia y la autosuficiencia de mi corazón.

Derrama en mí el don de las lágrimas puras, para que conociendo el abismo de mis culpas, corra confiado al abrazo de la infinita misericordia del Padre. Amén.`,
  },
  {
    id: 'san-hilario-espiritu',
    title: 'Plegaria para conservar pura la voz de la conciencia',
    author: 'San Hilario de Poitiers (315 – 367 d.C., Doctor de la Iglesia)',
    subtitle: 'Súplica patrística del tratado De Trinitate para examinar rectamente las obras de la vida',
    moment: 'antes-examen',
    sourceType: 'patristica',
    isHolySpirit: true,
    text: `Conserva incontaminada, te lo ruego, Señor, esta religión de mi fe, y hasta la partida de mi espíritu concédeme esta voz de mi conciencia:
Que conserve siempre lo que profesé en mi regeneración bautismal.

Dígnate, oh Espíritu Santo, Padre y Guía, infundir en mí tu luz clarísima para que examine con justicia las obras de mis manos, conozca la fragilidad de mi carne y confiese con sinceridad de alma mis caídas.

Haz que nada encubra a mis propios ojos, a fin de ser renovado incesantemente por tu gracia santificadora. Por Cristo nuestro Señor. Amén.`,
  },
  {
    id: 'san-juan-avila-espiritu',
    title: 'Oración para descubrir los engaños del amor propio',
    author: 'San Juan de Ávila (1499 – 1569 d.C., Doctor de la Iglesia)',
    subtitle: 'Súplica para desarmar las excusas de la soberbia antes de confesarse',
    moment: 'antes-examen',
    sourceType: 'doctores',
    isHolySpirit: true,
    text: `Oh Espíritu Santo, fuego de amor y espejo de pureza celestial:
Ven y alumbra las tinieblas de mi entendimiento con tu divina lumbre.

Descúbreme los lazos y rodeos con que mi propio amor se engaña a sí mismo y procura disculpar o atenuar lo que a tus ojos es pecado y ofensa.

Dame tal luz para contemplar mis pecados, que los llore con dolor de verdadero amor; y tal firmeza en tu bondad, que nunca desconfíe de tu perdón.

Hazme dócil, humilde y transparente, para que manifieste al confesor mis llagas tal como son, sin añadiduras ni paliativos, y regrese reconciliado a la paz de tu casa. Amén.`,
  },
  {
    id: 'san-bernardo-espiritu',
    title: 'Plegaria al Espíritu de Verdad por un corazón de carne',
    author: 'San Bernardo de Claraval (1090 – 1153 d.C., Doctor de la Iglesia)',
    subtitle: 'Para ablandar la tibieza del alma y suscitar compunción profunda',
    moment: 'antes-examen',
    sourceType: 'doctores',
    isHolySpirit: true,
    text: `Espíritu de Verdad, desciende sobre este corazón árido y estéril.
Haz brotar en él los manantiales de la compunción santa.

Quita de mí el corazón de piedra, indiferente y olvidadizo de los inmensos beneficios del Creador, y pon en mí un corazón de carne sensible a tu gracia y compungido por sus extravíos.

Ilumina los senderos de mi memoria para que no oculte mis desvíos ante tus ojos. Concédeme que el dolor de haber ofendido al Padre engendre en mí el firme propósito de no pecar jamás. Amén.`,
  },
  {
    id: 'san-buenaventura-espiritu',
    title: 'Súplica de los Siete Dones del Espíritu Santo',
    author: 'San Buenaventura (1221 – 1274 d.C., Doctor Seráfico)',
    subtitle: 'Para implorar discernimiento, piedad y temor filial de Dios antes del examen',
    moment: 'antes-examen',
    sourceType: 'doctores',
    isHolySpirit: true,
    text: `Espíritu Santo, divino Consolador:
Te adoro como a mi Dios verdadero y te suplico que derrames en mi alma tus siete sagrados dones.

Concédeme el don de Sabiduría, para estimar los bienes eternos;
el don de Entendimiento, para penetrar la verdad de tus mandamientos;
el don de Consejo, para discernir el camino recto en las encrucijadas morales;
el don de Fortaleza, para rechazar las tentaciones y vencer el respeto humano;
el don de Ciencia, para distinguir el bien del mal y ver las cosas según Dios;
el don de Piedad, para amar al Padre con ternura filial;
y el don de Temor de Dios, para aborrecer todo aquello que me aparta de tu santa amistad.

Haz que iluminado por estos dones, examine con verdad mi conciencia y alcance la reconciliación perfecta. Amén.`,
  },
  {
    id: 'san-francisco-sales-espiritu',
    title: 'Súplica de luz para el tribunal de la conciencia',
    author: 'San Francisco de Sales (1567 – 1622 d.C., Doctor de la Iglesia)',
    subtitle: 'Invocación de mansedumbre y lucidez antes de acusarse de las faltas',
    moment: 'antes-examen',
    sourceType: 'doctores',
    isHolySpirit: true,
    text: `Espíritu de Dios, Huésped de mi corazón:
Disipa las nieblas de mi memoria y pon de manifiesto ante mis ojos aquellas faltas con las que he agraviado a tu infinita bondad.

No permitas que ni el temor me paralice, ni la vergüenza me silencie, ni el orgullo me justifique.

Dame la dulzura de la mansedumbre para reconocerme tal cual soy: miserable sin tu gracia, pero infinitamente amado por tu misericordia.

Toca mis labios y mi alma para que mi confesión sea humilde, íntegra y fecunda. Amén.`,
  },
  {
    id: 'san-gregorio-nacianceno-espiritu',
    title: 'Plegaria patrística contra la ceguera interior',
    author: 'San Gregorio Nacianceno (329 – 390 d.C., Padre y Doctor)',
    subtitle: 'Para iluminar las profundidades veladas del alma que se engaña a sí misma',
    moment: 'antes-examen',
    sourceType: 'patristica',
    isHolySpirit: true,
    text: `¡Espíritu de Dios, Dios Tú mismo, que escudriñas las profundidades divinas!
Tú conoces los secretos más recónditos del corazón humano.

Sé fuego que purifique las escorias de mi alma;
sé viento recio que barra las ilusiones vanas de mi amor propio;
sé rocío suave que apacigüe las tempestades de mis pasiones desordenadas.

Concede a mi inteligencia la lucidez para no engañarme a mí mismo en este examen, y a mi voluntad la valentía de no ocultar nada en el sacramento del perdón. Amén.`,
  },
  {
    id: 'san-damasceno-espiritu',
    title: 'Oración de purificación y lengua de fuego',
    author: 'San Juan Damasceno (675 – 749 d.C., Padre de la Iglesia)',
    subtitle: 'Súplica patrística para aligerar la pesada carga de las culpas',
    moment: 'antes-examen',
    sourceType: 'patristica',
    isHolySpirit: true,
    text: `Señor, aligera la pesada carga de mis pecados, con los que gravemente te ofendí; purifica mi corazón y mi mente. Condúceme por el camino recto, Tú que eres la lámpara que alumbra las sendas oscuras.

Pon tus palabras en mis labios; dame un lenguaje claro y dócil mediante la lengua de fuego de tu Espíritu, para que tu presencia siempre me vigile.

Apaciéntame, Señor, para que mi corazón no se desvíe a la derecha ni a la izquierda, sino que reconozca sus desvíos y viva en tu verdad. Amén.`,
  },
  {
    id: 'espiritu-santo',
    title: 'Invocación al Espíritu Santo para el Examen',
    author: 'Tradición Pastoral Católica / CONALI',
    subtitle: 'Invocación comunitaria para reconocer las debilidades con humildad y confianza',
    moment: 'antes-examen',
    sourceType: 'tradicional',
    isHolySpirit: true,
    text: `Oh Espíritu Santo, amor del Padre y del Hijo, infunde en mi corazón la gracia de tu caridad. Que pueda abrir mi corazón a la Palabra de Dios, que me ilumina y me transforma.

Que sea capaz de conocer la inmensidad del amor divino, que reconozca con humildad y confianza mi realidad débil y mis muchos pecados, que sepa abrir mi corazón a la misericordia infinita de Dios.

De tal manera que pueda recibir el perdón que el Señor me ofrece con tanta generosidad. Amén.`,
  },

  // =========================================================================
  // 2. ORACIONES PATRÍSTICAS Y DE DOCTORES PARA ANTES DEL EXAMEN
  // =========================================================================
  {
    id: 'santo-tomas',
    title: 'Oración para pedir claridad y agudeza',
    author: 'Santo Tomás de Aquino (1225 – 1274 d.C., Doctor Angélico)',
    subtitle: 'Para pedir la luz de la inteligencia antes de examinar la conciencia',
    moment: 'antes-examen',
    sourceType: 'doctores',
    text: `Oh inefable Creador nuestro, altísimo principio y fuente verdadera de luz y sabiduría, dígnate infundir el rayo de tu claridad sobre las tinieblas de mi inteligencia, removiendo la doble oscuridad con la que nací: la del pecado y la ignorancia.

¡Tú, que haces elocuentes las lenguas de los pequeños, instruye la mía, e infunde en mis labios la gracia de tu bendición! Dame agudeza para entender, capacidad para retener, método y facilidad para atender, sutileza para interpretar y gracia abundante para hablar.

Dame acierto al empezar, dirección al progresar y perfección al acabar. ¡Oh Señor! Dios y hombre verdadero, que vives y reinas por los siglos de los siglos. Amén.`,
  },
  {
    id: 'san-agustin',
    title: 'Súplica de los Soliloquios y Confesiones',
    author: 'San Agustín de Hipona (354 – 430 d.C., Padre de la Iglesia)',
    subtitle: 'Petición fundamental: «Conózcame a mí, conózcate a ti»',
    moment: 'antes-examen',
    sourceType: 'patristica',
    text: `¡Oh Dios, siempre el mismo!, conózcame a mí, conózcate a ti. He aquí mi plegaria.

Estrecho es el aposento de mi alma para que puedas darte acogida en él: ensánchalo Tú. Está en ruinas: repáralo. Tiene cosas que ofenden a tus ojos. Lo reconozco y lo sé.

Pero ¿quién va a limpiarlo? ¿A qué otro fuera de ti voy a dirigir la plegaria: Límpiame, Señor, de mis manchas ocultas y no me abandones a mi propia ruina? Amén.`,
  },
  {
    id: 'san-efren',
    title: 'Oración de Purificación y Humildad',
    author: 'San Efrén el Sirio (306 – 373 d.C., Padre de la Iglesia)',
    subtitle: 'Petición patrística de castidad, humildad y gracia de ver las propias faltas',
    moment: 'antes-examen',
    sourceType: 'patristica',
    text: `Señor y Soberano de mi vida, aleja de mí el espíritu de la pereza, negligencia, egoísmo y conversaciones vanas.

Concede a tu servidor el espíritu de castidad, humildad, paciencia y amor.

¡Sí, Señor y Soberano! Concédeme la gracia de ver mis propios pecados y no juzgar a mi hermano, porque Tú eres bendito por los siglos de los siglos. Amén.`,
  },
  {
    id: 'san-ambrosio',
    title: 'Oración de preparación ante la presencia divina',
    author: 'San Ambrosio de Milán (340 – 397 d.C., Padre de la Iglesia)',
    subtitle: 'Súplica humilde ante la presencia santa del Juez y Salvador',
    moment: 'antes-examen',
    sourceType: 'patristica',
    text: `Señor mío Jesucristo, yo pecador indigno, confiando en tu misericordia y bondad, vengo a tu presencia.

Reconozco que tanto mi corazón como mi mente están manchados con muchos pecados; y que mi cuerpo y mis sentidos no han sido custodiados cuidadosamente. Por lo cual, Dios adorable, yo miserable pecador, en medio de tantas angustias y peligros, recurro a Ti que eres fuente de misericordia.

Deseo vivamente obtener tu perdón, ya que eres mi Redentor y Salvador. A Ti Señor presento mis debilidades y pecados para que me perdones. Me humillo, me arrepiento y espero en tu misericordia infinita. Olvida mis culpas y perdóname, Tú que eres la misma bondad. Amén.`,
  },
  {
    id: 'san-crisostomo',
    title: 'Súplica de arrepentimiento y lágrimas de contrición',
    author: 'San Juan Crisóstomo (347 – 407 d.C., Padre de la Iglesia)',
    subtitle: 'Petición de humildad, sincera confesión y liberación de la soberbia',
    moment: 'antes-examen',
    sourceType: 'patristica',
    text: `Señor, no me prives de tus bendiciones celestiales y eternas. Señor, si he pecado de palabra o de obra, de mente o de espíritu, perdóname. Señor, líbrame de toda ignorancia, olvido, pereza y dureza de corazón...

Señor, concédeme buenos pensamientos. Señor, concédeme lágrimas de arrepentimiento y sincera contrición. Señor, concédeme una sincera confesión de lo que habita en mi interior.

Señor, concédeme humildad, liberación de mi propia voluntad y obediencia a tu ley. Hágase tu santa voluntad en mí, porque Tú eres bendito por los siglos. Amén.`,
  },
  {
    id: 'san-alfonso',
    title: 'Oración de examen sincero y comprensión',
    author: 'San Alfonso María de Ligorio (1696 – 1787 d.C., Doctor Moral)',
    subtitle: 'Petición para conocer la malicia de las faltas y enmendarse',
    moment: 'antes-examen',
    sourceType: 'doctores',
    text: `Señor mío y Dios mío, que investigas los corazones y conoces las conciencias de los hombres: dame la gracia de examinar sinceramente mis pecados y de comprender su malicia.

Haz que los confiese bien y me enmiende de ellos, para que merezca tu perdón y tu gracia en esta vida, y después la gloria eterna. Amén.`,
  },
  {
    id: 'san-ignacio',
    title: 'Método del Examen General de Conciencia',
    author: 'San Ignacio de Loyola (1491 – 1556 d.C.)',
    subtitle: 'Los cinco puntos ignacianos fundamentales para examinar el alma',
    moment: 'antes-examen',
    sourceType: 'tradicional',
    text: `Contiene en sí cinco puntos:

1. Dar gracias a Dios nuestro Señor por los beneficios recibidos.
2. Pedir gracia para conocer los pecados y lanzarlos.
3. Demandar cuenta al alma, desde la hora que se levantó hasta el examen presente de hora en hora, o de tiempo en tiempo; y primero de pensamiento, y después de palabra, y después de la obra.
4. Pedir perdón a Dios nuestro Señor de las faltas.
5. Proponer enmienda con su gracia.

Pater Noster.`,
  },
  {
    id: 'san-newman',
    title: 'Oración de petición de claridad interior',
    author: 'San Juan Henry Newman (1801 – 1890 d.C., Cardenal y Doctor)',
    subtitle: 'Súplica para afinar los oídos interiores y limpiar el corazón',
    moment: 'antes-examen',
    sourceType: 'doctores',
    isHolySpirit: true,
    text: `Te necesito a ti, Señor, como mi maestro; cada día te necesito. Dame la claridad de la conciencia, que sólo puede alcanzar tu Espíritu.

Mis oídos son sordos, no puedo oír tu voz. Mi vista está empañada, no puedo ver tu signo. Sólo tú puedes afinar mi oído, aclarar mi mirada y limpiar mi corazón.

Enséñame a sentarme a tus pies, y a escuchar con docilidad tu palabra santa. Amén.`,
  },
  {
    id: 'ritual-penitencia',
    title: 'Oración para el Examen Comunitario',
    author: 'Ritual Romano de la Penitencia (1975)',
    subtitle: 'Reconocimiento de la debilidad e ingratitud ante la infinita misericordia del Padre',
    moment: 'antes-examen',
    sourceType: 'magisterio',
    text: `Padre santo, el profeta Isaías habla del pueblo de Israel como una esposa infiel, como un hijo ingrato que rechaza los bienes que su padre le otorga… Ese pasaje bíblico está hablando de mí, de mi infidelidad y de mi ingratitud.

Por eso te pido que me ayudes a reconocer mi debilidad y mi pecado, para confiarme completamente en tus manos misericordiosas.

Señor, por los méritos de la pasión de nuestro Salvador Jesucristo, apiádate de mí, que soy pecador y confío en ti. Amén.`,
  },

  // =========================================================================
  // 3. ORACIONES PARA ANTES DE LA CONFESIÓN (ACTOS DE CONTRICIÓN)
  // =========================================================================
  {
    id: 'acto-contricion',
    title: 'Acto de Contrición Tradicional (Señor mío Jesucristo)',
    subtitle: 'Oración clásica de dolor de amor perfecto por haber ofendido a Dios',
    moment: 'antes-confesion',
    sourceType: 'tradicional',
    text: `Señor mío Jesucristo, Dios y Hombre verdadero, Creador, Padre y Redentor mío; por ser Vos quien sois, Bondad infinita, y porque os amo sobre todas las cosas, me pesa de todo corazón haberos ofendido.

También me pesa porque podéis castigarme con las penas del infierno. Ayudado de vuestra divina gracia, propongo firmemente nunca más pecar, confesarme y cumplir la penitencia que me fuere impuesta. Amén.`,
  },
  {
    id: 'yo-confieso',
    title: 'Yo Confieso (Confiteor)',
    subtitle: 'Rezo litúrgico de humildad ante Dios Todopoderoso y los santos',
    moment: 'antes-confesion',
    sourceType: 'liturgica',
    text: `Yo confieso ante Dios Todopoderoso y ante vosotros, hermanos, que he pecado mucho de pensamiento, palabra, obra y omisión.

Por mi culpa, por mi culpa, por mi gran culpa.

Por eso ruego a Santa María, siempre Virgen, a los ángeles, a los santos y a vosotros, hermanos, que intercedáis por mí ante Dios, nuestro Señor. Amén.`,
  },

  // =========================================================================
  // 4. ACCIÓN DE GRACIAS TRAS LA ABSOLUCIÓN SACRAMENTAL
  // =========================================================================
  {
    id: 'agradecimiento-post',
    title: 'Acción de Gracias tras la Confesión',
    subtitle: 'Oración de alabanza tras recibir la absolución y la gracia santificante',
    moment: 'despues-confesion',
    sourceType: 'tradicional',
    text: `Te doy gracias, Señor y Dios mío, porque en tu infinita misericordia has vuelto a lavar mi alma en la Sangre preciosa de tu Hijo Jesucristo.

Has perdonado mis faltas y me has devuelto la paz y el vestido de la gracia santificante. Concédeme la gracia de guardar tu divina ley, evitar las ocasiones próximas de pecado y vivir en tu santo amor hasta el último momento de mi vida. Amén.

Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.`,
  },
];
