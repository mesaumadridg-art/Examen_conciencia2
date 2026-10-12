export interface PrayerItem {
  id: string;
  title: string;
  author?: string;
  subtitle: string;
  moment: 'antes-examen' | 'antes-confesion' | 'despues-confesion';
  text: string;
  latinText?: string;
  notes?: string;
}

export const PRAYERS: PrayerItem[] = [
  // --- ORACIONES DE PREPARACIÓN PARA ANTES DEL EXAMEN DE CONCIENCIA ---
  {
    id: 'santo-tomas',
    title: 'Oración para pedir claridad y agudeza',
    author: 'Santo Tomás de Aquino (1225 – 1274)',
    subtitle: 'Para pedir la luz de la inteligencia antes de examinar la conciencia',
    moment: 'antes-examen',
    text: `Oh inefable Creador nuestro, altísimo principio y fuente verdadera de luz y sabiduría, dígnate infundir el rayo de tu claridad sobre las tinieblas de mi inteligencia, removiendo la doble oscuridad con la que nací: la del pecado y la ignorancia.

¡Tú, que haces elocuentes las lenguas de los pequeños, instruye la mía, e infunde en mis labios la gracia de tu bendición! Dame agudeza para entender, capacidad para retener, método y facilidad para atender, sutileza para interpretar y gracia abundante para hablar.

Dame acierto al empezar, dirección al progresar y perfección al acabar. ¡Oh Señor! Dios y hombre verdadero, que vives y reinas por los siglos de los siglos. Amén.`,
  },
  {
    id: 'san-ignacio',
    title: 'Método del Examen General de Conciencia',
    author: 'San Ignacio de Loyola (1491 – 1556)',
    subtitle: 'Cinco puntos fundamentales para examinar el alma',
    moment: 'antes-examen',
    text: `Contiene en sí cinco puntos:

1. Dar gracias a Dios nuestro Señor por los beneficios recibidos.
2. Pedir gracia para conocer los pecados y lanzarlos.
3. Demandar cuenta al alma, desde la hora que se levantó hasta el examen presente de hora en hora, o de tiempo en tiempo; y primero de pensamiento, y después de palabra, y después de la obra.
4. Pedir perdón a Dios nuestro Señor de las faltas.
5. Proponer enmienda con su gracia.

Pater Noster.`,
  },
  {
    id: 'san-alfonso',
    title: 'Oración de examen sincero y comprensión',
    author: 'San Alfonso María de Ligorio (1696 – 1787)',
    subtitle: 'Petición para conocer la malicia de las faltas y enmendarse',
    moment: 'antes-examen',
    text: `Señor mío y Dios mío, que investigas los corazones y conoces las conciencias de los hombres: dame la gracia de examinar sinceramente mis pecados y de comprender su malicia.

Haz que los confiese bien y me enmiende de ellos, para que merezca tu perdón y tu gracia en esta vida, y después la gloria eterna. Amén.`,
  },
  {
    id: 'san-newman',
    title: 'Oración de petición de claridad interior',
    author: 'San Juan Henry Newman (1801 – 1890)',
    subtitle: 'Súplica para afinarnos los oídos y limpiar el corazón',
    moment: 'antes-examen',
    text: `Te necesito a ti, Señor, como mi maestro, cada día te necesito. Dame la claridad de la conciencia, que solo puede alcanzar tu Espíritu.

Mis oídos son sordos, no puedo oír tu voz. Mi vista está empañada, no puedo ver tu signo. Sólo tú puedes afinar mi oído, aclarar mi mirada y limpiar mi corazón.

Enséñame a sentarme a tus pies, y a escuchar tu palabra. Amén.`,
  },
  {
    id: 'ritual-penitencia',
    title: 'Oración para el Examen Comunitario',
    author: 'Ritual de la Penitencia (1975)',
    subtitle: 'Reconocimiento de la debilidad e infidelidad ante la misericordia',
    moment: 'antes-examen',
    text: `Padre santo, el profeta Isaías habla del pueblo de Israel como una esposa infiel, como un hijo ingrato que rechaza los bienes que su padre le otorga… Ese pasaje bíblico está hablando de mí, de mi infidelidad y de mi ingratitud.

Por eso te pido que me ayudes a reconocer mi debilidad y mi pecado, para confiarme completamente en tus manos misericordiosas.

Señor, por los méritos de la pasión de nuestro Salvador Jesucristo, apiádate de mí, que soy pecador y confío en ti. Amén.`,
  },
  {
    id: 'espiritu-santo',
    title: 'Invocación al Espíritu Santo',
    author: 'CONALI / Diócesis de Raleigh',
    subtitle: 'Invocación para reconocer las debilidades con humildad y confianza',
    moment: 'antes-examen',
    text: `Oh Espíritu Santo, amor del Padre, y del Hijo, infunde en mi corazón la gracia de tu caridad. Que pueda abrir mi corazón a la Palabra de Dios, que me ilumina y me transforma.

Que sea capaz de conocer la inmensidad del amor divino, que reconozca con humildad y confianza mi realidad débil y mis muchos pecados, que sepa abrir mi corazón a la misericordia infinita de Dios.

De tal manera que pueda recibir el perdón que el Señor me ofrece con tanta generosidad. Amén.`,
  },
  {
    id: 'san-efren',
    title: 'Oración de Cuaresma y Purificación',
    author: 'San Efrén el Sirio (306 – 373 d.C.)',
    subtitle: 'Petición de humildad, castidad y no juzgar al hermano',
    moment: 'antes-examen',
    text: `Señor y Soberano de mi vida, aleja de mí el espíritu de la pereza, negligencia, egoísmo y conversaciones vanas.

Concede a tu servidor el espíritu de castidad, humildad, paciencia y amor.

¡Sí, Señor y Soberano! Concédeme la gracia de ver mis propios pecados y no juzgar a mi hermano, porque Tú eres bendito por los siglos de los siglos. Amén.`,
  },
  {
    id: 'san-ambrosio',
    title: 'Oración de preparación ante la presencia divina',
    author: 'San Ambrosio de Milán (340 – 397 d.C.)',
    subtitle: 'Súplica humilde antes del banquete sacramental',
    moment: 'antes-examen',
    text: `Señor mío Jesucristo, yo pecador indigno, confiando en tu misericordia y bondad, vengo a tomar parte en este Banquete Santísimo del Altar.

Reconozco que tanto mi corazón como mi mente están manchados con muchos pecados; y, que mi cuerpo y mi lengua no han sido guardados cuidadosamente. Por lo cual, Dios adorable, yo miserable pecador, en medio de tantas angustias y peligros, recurro a Ti que eres fuente de misericordia, ya que me es imposible excusarme ante tu mirada de Juez irritado.

Deseo vivamente obtener tu perdón, ya que eres mi Redentor y Salvador. A Ti Señor presento mis debilidades y pecados para que me perdones. Reconozco que te he ofendido frecuentemente. Por eso me humillo y me arrepiento y espero en tu misericordia infinita. Olvida mis culpas y no me castigues como merecen mis pecados. Perdóname, Tú que eres la misma bondad. Amén.`,
  },
  {
    id: 'san-crisostomo',
    title: 'Súplica de arrepentimiento y lágrimas de contrición',
    author: 'San Juan Crisóstomo (347 – 407 d.C.)',
    subtitle: 'Petición de humildad, sincera confesión y liberación de la propia voluntad',
    moment: 'antes-examen',
    text: `Señor, no me prives de tus bendiciones celestiales y eternas. Señor, líbrame de los tormentos eternos. Señor, si he pecado de palabra o de obra, de mente o de espíritu, perdóname. Señor, líbrame de toda angustia, ignorancia, olvido, pereza y dureza de corazón...

Señor, concédeme buenos pensamientos. Señor, concédeme lágrimas de arrepentimiento, recuerdo de la muerte y contrición. Señor, concédeme una sincera confesión de mi pensamiento.

Señor, concédeme humildad, liberación de mi propia voluntad y obediencia... Señor, que se haga tu voluntad, no la mía... porque tú eres bendito para siempre. Amén.`,
  },
  {
    id: 'san-agustin',
    title: 'Súplica de purificación de los Soliloquios y Confesiones',
    author: 'San Agustín de Hipona (354 – 430 d.C.)',
    subtitle: 'Petición para ensanchar y reparar la casa del alma',
    moment: 'antes-examen',
    text: `¡Oh Dios, siempre el mismo!, conózcame a mí, conózcate a ti. He aquí mi plegaria.

Estrecho es el aposento de mi alma para que puedas darte acogida en él: ensánchalo Tú. Está en ruinas: repáralo. Tiene cosas que ofenden a tus ojos. Lo reconozco y lo sé.

Pero ¿quién va a limpiarlo? ¿A qué otro fuera de ti voy a dirigir la plegaria: Límpiame, Señor, de mis manchas ocultas. Amén.`,
  },
  {
    id: 'san-damasceno',
    title: 'Oración de purificación y camino recto',
    author: 'San Juan Damasceno (675 – 749 d.C.)',
    subtitle: 'Súplica para aligerar la pesada carga de los pecados',
    moment: 'antes-examen',
    text: `Por la imposición de manos del obispo, me llamaste para servir a tus hijos. Ignoro por qué razón me elegiste; tú solo lo sabes.

Pero tú, Señor, aligera la pesada carga de mis pecados, con los que gravemente te ofendí; purifica mi corazón y mi mente. Condúceme por el camino recto, tú que eres una lámpara que alumbra.

Pon tus palabras en mis labios; dame un lenguaje claro y fácil, mediante la lengua de fuego de tu Espíritu, para que tu presencia siempre vigile. Apaciéntame, Señor, y apacienta tú conmigo, para que mi corazón no se desvíe a derecha ni izquierda... hasta el último momento. Amén.`,
  },

  // --- ORACIONES TRADICIONALES DE CONFESIÓN Y ACCIÓN DE GRACIAS ---
  {
    id: 'acto-contricion',
    title: 'Acto de Contrición (Señor mío Jesucristo)',
    subtitle: 'Oración tradicional de dolor perfecto por el pecado',
    moment: 'antes-confesion',
    text: `Señor mío Jesucristo, Dios y Hombre verdadero, Creador, Padre y Redentor mío; por ser Vos quien sois, Bondad infinita, y porque os amo sobre todas las cosas, me pesa de todo corazón haberos ofendido.

También me pesa porque podéis castigarme con las penas del infierno. Ayudado de vuestra divina gracia, propongo firmemente nunca más pecar, confesarme y cumplir la penitencia que me fuere impuesta. Amén.`,
  },
  {
    id: 'yo-confieso',
    title: 'Yo Confieso (Confiteor)',
    subtitle: 'Rezo de humildad ante Dios y la comunidad',
    moment: 'antes-confesion',
    text: `Yo confieso ante Dios Todopoderoso y ante vosotros, hermanos, que he pecado mucho de pensamiento, palabra, obra y omisión.

Por mi culpa, por mi culpa, por mi gran culpa.

Por eso ruego a Santa María, siempre Virgen, a los ángeles, a los santos y a vosotros, hermanos, que intercedáis por mí ante Dios, nuestro Señor. Amén.`,
  },
  {
    id: 'agradecimiento-post',
    title: 'Acción de Gracias tras la Confesión',
    subtitle: 'Oración para rezar tras recibir la Absolución',
    moment: 'despues-confesion',
    text: `Te doy gracias, Señor y Dios mío, porque en tu infinita misericordia has vuelto a lavar mi alma en la Sangre preciosa de tu Hijo Jesucristo.

Has perdonado mis faltas y me has devuelto la paz y el vestido de la gracia santificante. Concédeme la gracia de guardar tu divina ley, evitar las ocasiones de pecado y vivir en tu santo amor hasta el último momento de mi vida. Amén.

Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.`,
  },
];
