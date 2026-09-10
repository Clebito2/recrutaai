/**
 * Formatadores para textos de anúncios e relatórios de R&S
 */

/**
 * Remove asteriscos de negrito e formata o texto com quebras de linha limpas
 * ideal para cópia no LinkedIn, WhatsApp e murais de vagas.
 */
export function cleanJobAdText(rawText) {
  if (!rawText) return "";

  let text = rawText;

  // 1. Remove marcadores markdown bold **texto** -> texto limpo
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");

  // 2. Remove marcadores markdown italic *texto* soltos que não sejam listas
  text = text.replace(/(^|[^\*])\*([^\*\n]+)\*([^\*]|$)/g, "$1$2$3");

  // 3. Normaliza marcadores de bullet (* item -> - item)
  text = text.replace(/^[ \t]*\*[ \t]+/gm, "- ");

  // 4. Garante que títulos fiquem em nova linha com espaçamento duplo
  const sectionHeaders = [
    "TÍTULO DA VAGA",
    "SOBRE A",
    "SOBRE O",
    "SOBRE",
    "RESPONSABILIDADES E ATRIBUIÇÕES",
    "ATRIBUIÇÕES",
    "REQUISITOS COMPORTAMENTAIS",
    "REQUISITOS TÉCNICOS OBRIGATÓRIOS",
    "REQUISITOS OBRIGATÓRIOS",
    "REQUISITOS TÉCNICOS",
    "DIFERENCIAIS DESEJÁVEIS",
    "REQUISITOS DESEJÁVEIS",
    "O QUE OFERECEMOS",
    "COMPROMISSO COM A DIVERSIDADE",
    "DIVERSIDADE"
  ];

  sectionHeaders.forEach(header => {
    const regex = new RegExp("([^\\n])\\s*(" + header + ")", "gi");
    text = text.replace(regex, "$1\n\n$2");
  });

  // 5. Normaliza quebras de linha excessivas (máximo 2 seguidas)
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

/**
 * Remove asteriscos e limpa formatação de Roteiros Socráticos e Role Play
 */
export function cleanGuideText(rawText) {
  if (!rawText) return "";

  let text = rawText;

  // 1. Remove **texto**
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");

  // 2. Remove marcadores markdown soltos
  text = text.replace(/(^|[^\*])\*([^\*\n]+)\*([^\*]|$)/g, "$1$2$3");

  // 3. Normaliza marcadores de bullet (* item -> - item)
  text = text.replace(/^[ \t]*\*[ \t]+/gm, "- ");

  // 4. Normaliza quebras de linha excessivas
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}
