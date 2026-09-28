// src/data/questions.js

// =========================================================
// ESCALA 8 A 12 AÑOS
// =========================================================

const scale8to12 = [
  {
    value: 5,
    label: "Siempre",
    emoji: "💖",
  },
  {
    value: 4,
    label: "Casi siempre",
    emoji: "😊",
  },
  {
    value: 3,
    label: "A veces",
    emoji: "🙂",
  },
  {
    value: 2,
    label: "Casi nunca",
    emoji: "😕",
  },
  {
    value: 1,
    label: "Nunca",
    emoji: "💭",
  },
];

// =========================================================
// ESCALA 13 AÑOS EN ADELANTE
// =========================================================

const scale13plus = [
  {
    value: 5,
    label: "Siempre",
    emoji: "💖",
  },
  {
    value: 4,
    label: "Casi siempre",
    emoji: "😊",
  },
  {
    value: 3,
    label: "Algunas veces",
    emoji: "🙂",
  },
  {
    value: 2,
    label: "Casi nunca",
    emoji: "😕",
  },
  {
    value: 1,
    label: "Nunca",
    emoji: "💭",
  },
];

// =========================================================
// PREGUNTAS 8 A 12 AÑOS
// =========================================================

export const questions8to12 = [
  {
    id: 1,
    dimension: "Entorno familiar",
    text: "¿Tienes en tu familia alguien con quien puedes hablar cuando estás preocupado, triste o tienes un problema?",
    type: "scale",
  },

  {
    id: 2,
    dimension: "Entorno familiar",
    text: "¿En tu familia te escuchan cuando quieres contar algo que te pasó o cómo te sientes?",
    type: "scale",
  },

  {
    id: 3,
    dimension: "Entorno familiar",
    text: "¿Compartes tiempo con tu familia para hablar, jugar, comer o hacer alguna actividad juntos?",
    type: "scale",
  },

  {
    id: 4,
    dimension: "Entorno familiar",
    text: "Cuando tienes un problema, ¿sientes que tu familia te ayuda a encontrar una solución?",
    type: "scale",
  },

  {
    id: 5,
    dimension: "Entorno familiar",
    text: "En mi casa me siento seguro(a) y tranquilo(a).",
    type: "scale",
  },

  {
    id: 6,
    dimension: "Entorno familiar",
    text: "Cuando tengo un problema o algo me preocupa, siento que alguien de mi familia me respalda y me ayuda.",
    type: "scale",
  },

  {
    id: 7,
    dimension: "Proyecto de vida",
    text: "¿Sabes qué te gustaría aprender, hacer o ser cuando seas grande?",
    type: "scale",
  },

  {
    id: 8,
    dimension: "Proyecto de vida",
    text: "¿Sientes que tienes habilidades o cosas buenas que puedes desarrollar para alcanzar tus sueños?",
    type: "scale",
  },

  {
    id: 9,
    dimension: "Proyecto de vida",
    text: "¿Hay personas que te ayudan y te animan a cumplir tus sueños?",
    type: "scale",
  },

  {
    id: 10,
    dimension: "Bienestar emocional",
    text: "Cuando estás triste, enojado o preocupado, ¿sabes qué puedes hacer para sentirte mejor?",
    type: "scale",
  },

  {
    id: 11,
    dimension: "Bienestar emocional",
    text: "Cuando tienes un problema, ¿buscas ayuda de un adulto en quien confías?",
    type: "scale",
  },

  {
    id: 12,
    dimension: "Bienestar emocional",
    text: "¿Te sientes con ilusión por las cosas que quieres hacer en el futuro?",
    type: "scale",
  },

  {
    id: 13,
    dimension: "Voz estudiantil",
    text: "Si pudieras cambiar o mejorar algo de tu colegio o de Mosquera para que los niños, niñas y jóvenes estuvieran mejor, ¿qué cambiarías y por qué?",
    type: "textarea",
  },
];

// =========================================================
// PREGUNTAS 13 A 17 AÑOS
// =========================================================

export const questions13to17 = [
  {
    id: 1,
    dimension: "Entorno familiar",
    text: "Tengo en mi familia una persona de confianza con quien puedo hablar cuando tengo dificultades.",
    type: "scale",
  },

  {
    id: 2,
    dimension: "Entorno familiar",
    text: "En mi familia puedo expresar lo que pienso y siento sin miedo a ser rechazado(a) o juzgado(a).",
    type: "scale",
  },

  {
    id: 3,
    dimension: "Entorno familiar",
    text: "Mi familia dedica tiempo para compartir y conversar conmigo.",
    type: "scale",
  },

  {
    id: 4,
    dimension: "Entorno familiar",
    text: "Cuando enfrento una dificultad, siento que mi familia me brinda apoyo.",
    type: "scale",
  },

  {
    id: 5,
    dimension: "Entorno familiar",
    text: "Me siento seguro(a) y tranquilo(a) en mi hogar.",
    type: "scale",
  },

  {
    id: 6,
    dimension: "Entorno familiar",
    text: "Cuando enfrento un problema o una situación difícil, siento que cuento con el respaldo de mi familia.",
    type: "scale",
  },

  {
    id: 7,
    dimension: "Proyecto de vida",
    text: "Tengo claridad sobre algunas metas que quiero alcanzar en los próximos años.",
    type: "scale",
  },

  {
    id: 8,
    dimension: "Proyecto de vida",
    text: "Reconozco capacidades y habilidades personales que pueden ayudarme a alcanzar mis metas.",
    type: "scale",
  },

  {
    id: 9,
    dimension: "Proyecto de vida",
    text: "Mi familia, colegio u otras personas cercanas me orientan para tomar decisiones sobre mi futuro.",
    type: "scale",
  },

  {
    id: 10,
    dimension: "Bienestar emocional",
    text: "Cuando tengo emociones difíciles, encuentro maneras saludables de manejarlas.",
    type: "scale",
  },

  {
    id: 11,
    dimension: "Bienestar emocional",
    text: "Cuando una situación me supera, sé a quién acudir para pedir ayuda o consejo.",
    type: "scale",
  },

  {
    id: 12,
    dimension: "Bienestar emocional",
    text: "Tengo esperanza y motivación frente a mi futuro, incluso cuando encuentro dificultades.",
    type: "scale",
  },

  {
    id: 13,
    dimension: "Voz estudiantil",
    text: "Desde tu experiencia como estudiante, ¿qué mejorarías en tu colegio o en el municipio para contribuir al bienestar, las oportunidades y el futuro de los niños, niñas y jóvenes?",
    type: "textarea",
  },
];

// =========================================================
// OBTENER PREGUNTAS SEGÚN EDAD
// =========================================================

export function getQuestions(age) {
  if (age === "18+") {
    return questions13to17;
  }

  const numericAge = Number(age);

  if (numericAge >= 8 && numericAge <= 12) {
    return questions8to12;
  }

  if (numericAge >= 13 && numericAge <= 17) {
    return questions13to17;
  }

  return [];
}

// =========================================================
// OBTENER ESCALA SEGÚN EDAD
// =========================================================

export function getScale(age) {
  if (age === "18+") {
    return scale13plus;
  }

  const numericAge = Number(age);

  if (numericAge >= 8 && numericAge <= 12) {
    return scale8to12;
  }

  if (numericAge >= 13 && numericAge <= 17) {
    return scale13plus;
  }

  return [];
}