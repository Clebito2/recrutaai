/**
 * Utilitário de Geração e Estratégia de Divulgação de Vagas
 * Metodologia Live Consultoria: WhatsApp Groups & Instagram
 */

/**
 * Gera mensagem pronta e formatada para grupos de WhatsApp
 * Utiliza marcações nativas do WhatsApp (*negrito*, _itálico_, • listas)
 */
export function generateWhatsAppJobPost(job) {
    if (!job) return "";
    const title = job.title || "Vaga em Aberto";
    const company = job.companyName || "Empresa Contratante";
    const workModel = job.workModel || "A combinar";
    const salary = job.salary ? `*Remuneração:* ${job.salary}` : null;
    const benefits = job.benefits ? `*Benefícios:* ${job.benefits}` : null;
    const mustHaves = job.mustHaves || "";
    const responsibilities = job.responsibilities || "";
    const repository = job.repositoryUrl || "";

    let text = `🚨 *OPORTUNIDADE DE TRABALHO | ${company.toUpperCase()}*\n\n`;
    text += `A *${company}* está com processo seletivo aberto para a posição de:\n`;
    text += `💼 *${title.toUpperCase()}*\n\n`;
    text += `🏢 *Empresa:* ${company}\n`;
    text += `📍 *Modelo de Atuação:* ${workModel}\n`;
    if (salary) text += `💰 ${salary}\n`;
    if (benefits) text += `🎁 ${benefits}\n`;

    if (mustHaves.trim()) {
        text += `\n🎯 *Requisitos Obrigatórios (Gate Check):*\n`;
        const reqLines = mustHaves.split("\n").map(l => l.trim()).filter(Boolean).slice(0, 5);
        reqLines.forEach(line => {
            text += `• ${line.replace(/^[-*•]\s*/, "")}\n`;
        });
    }

    if (responsibilities.trim()) {
        text += `\n📋 *Principais Atribuições:*\n`;
        const respLines = responsibilities.split("\n").map(l => l.trim()).filter(Boolean).slice(0, 4);
        respLines.forEach(line => {
            text += `• ${line.replace(/^[-*•]\s*/, "")}\n`;
        });
    }

    text += `\n📩 *Como se candidatar:*\n`;
    if (repository.trim()) {
        text += `Envie seu currículo ou preencha a ficha pelo link abaixo:\n👉 ${repository.trim()}\n\n`;
    } else {
        text += `Envie seu currículo atualizado em PDF para o contato responsável deste anúncio.\n\n`;
    }

    text += `_Conhece alguém com esse perfil? Encaminhe esta vaga em seus grupos e redes!_`;
    return text;
}

/**
 * Gera legenda e chamada atraente para publicação no Feed do Instagram
 */
export function generateInstagramFeedPost(job) {
    if (!job) return "";
    const title = job.title || "Vaga em Aberto";
    const company = job.companyName || "Nossa Empresa";
    const workModel = job.workModel || "A combinar";
    const salary = job.salary ? `Remuneração: ${job.salary}` : null;
    const mustHaves = job.mustHaves || "";

    let text = `🚀 ESTAMOS CONTRATANDO: ${title.toUpperCase()}!\n\n`;
    text += `A equipe da ${company} está crescendo e abrimos uma nova oportunidade para profissionais que buscam desenvolvimento, autonomia e excelência em sua carreira.\n\n`;
    text += `📍 Modelo de Trabalho: ${workModel}\n`;
    if (salary) text += `💰 ${salary}\n`;
    if (job.benefits) text += `✨ Benefícios: ${job.benefits}\n`;

    if (mustHaves.trim()) {
        text += `\n🔍 O que buscamos no profissional ideal:\n`;
        const reqLines = mustHaves.split("\n").map(l => l.trim()).filter(Boolean).slice(0, 5);
        reqLines.forEach(line => {
            text += `✔ ${line.replace(/^[-*•]\s*/, "")}\n`;
        });
    }

    text += `\n👉 COMO SE CANDIDATAR:\n`;
    text += `Acesse o link oficial na nossa bio ou envie uma mensagem com "QUERO" no Direct para receber o link de envio de currículo.\n\n`;
    text += `👥 Conhece alguém com este perfil? Marque aqui nos comentários ou compartilhe!\n\n`;
    
    // Hashtags temáticas
    const cleanTag = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "");
    text += `#Vagas #OportunidadeDeTrabalho #RecrutamentoESelecao #${cleanTag} #Carreira #Trabalho #VagasAbertas`;

    return text;
}

/**
 * Gera roteiro de 3 lâminas sequenciais para Stories de alta conversão no Instagram
 */
export function generateInstagramStoriesScript(job) {
    if (!job) return [];
    const title = job.title || "Oportunidade";
    const company = job.companyName || "Nossa Empresa";
    const workModel = job.workModel || "Híbrido";

    const reqLines = (job.mustHaves || "Experiência na função")
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean)
        .slice(0, 4)
        .map(r => `• ${r.replace(/^[-*•]\s*/, "")}`)
        .join("\n");

    return [
        {
            slide: "Lâmina 1 — Gancho e Atenção",
            badge: "Story 1 de 3",
            instruction: "Utilize uma foto profissional do time, ambiente ou fundo de cor sólida institucional com tipografia grande e limpa.",
            copy: `ESTAMOS CONTRATANDO! 🚀\n\nA ${company} abriu vaga para:\n\n🔥 ${title.toUpperCase()}\n\n📍 Modelo: ${workModel}\n\n👉 Toque para ver os requisitos!`
        },
        {
            slide: "Lâmina 2 — Perfil Desejado e Diferenciais",
            badge: "Story 2 de 3",
            instruction: "Destaque os 3 a 4 requisitos centrais de forma visual e objetiva. Evite blocos de texto denso.",
            copy: `O QUE BUSCAMOS:\n\n${reqLines}\n\n${job.benefits ? `🎁 Benefícios: ${job.benefits}` : "🚀 Ambiente com forte cultura e crescimento!"}`
        },
        {
            slide: "Lâmina 3 — Chamada para Ação (CTA)",
            badge: "Story 3 de 3",
            instruction: "Insira a figurinha interativa de 'LINK' do Instagram com o endereço da vaga ou a figurinha 'Envie uma mensagem' com o texto 'Quero me candidatar'.",
            copy: `QUER FAZER PARTE DO TIME? 🎯\n\nToque na figurinha de link abaixo para cadastrar seu currículo ou responda este Story com "EU QUERO" para enviarmos as instruções no Direct!`
        }
    ];
}

/**
 * Playbook e melhores práticas estratégicas da Live Consultoria
 */
export const DISSEMINATION_STRATEGIES = {
    whatsapp: [
        {
            title: "Horários de Maior Leitura",
            tip: "Envie entre 08h-09h (início do expediente) ou 18h-19h30 (saída do trabalho), quando os profissionais checam mensagens com mais atenção."
        },
        {
            title: "Peça Indicações Qualificadas",
            tip: "A frase 'Conhece alguém com esse perfil? Encaminhe esta vaga' aumenta em até 3x o alcance orgânico em grupos de networking."
        },
        {
            title: "Respeito às Regras dos Grupos",
            tip: "Verifique se o grupo permite anúncios de vagas. Evite mensagens repetitivas em dias seguidos no mesmo grupo."
        }
    ],
    instagram: [
        {
            title: "Sequência Completa de Stories",
            tip: "Publique as 3 lâminas de Stories com intervalo de 1 a 2 minutos entre elas para garantir que o algoritmo do Instagram mantenha a retenção."
        },
        {
            title: "Destaques no Perfil (Highlight)",
            tip: "Crie um destaque permanente no perfil chamado 'Trabalhe Conosco' ou 'Vagas' e adicione os Stories com a figurinha de link ativa."
        },
        {
            title: "Uso do Sticker de Link",
            tip: "Nunca coloque links não clicáveis no texto do Story. Use a figurinha oficial 'Link' do Instagram para maximizar conversão."
        }
    ]
};
