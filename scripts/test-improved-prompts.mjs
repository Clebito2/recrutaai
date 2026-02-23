import { analyzeCandidate } from "../src/skills/cv-analyst/index.js";

// Manually setting API key for testing purposes in this environment
process.env.GEMINI_API_KEY = "REMOVED_FOR_SECURITY"

async function runTest() {
    console.log("🚀 Iniciando Teste de Prompts Melhorados (Elite V6.0)...");

    const mockCV = `
    NOME: João Silva
    EXPERIÊNCIA: 
    - Desenvolvedor Sênior na TechCorp (2020-2024). Melhorei a performance do sistema.
    - Fullstack na WebSolutions (2018-2020).
    SKILLS: React, Node.js, AWS.
    `;

    const mockInterview = `
    Entrevistador: João, me fale sobre um desafio técnico.
    Candidato: Ah, eu tive muitos. Uma vez o servidor caiu e eu tive que consertar. Foi bem difícil mas no final deu tudo certo e o cliente ficou feliz. Eu usei várias tecnologias.
    Entrevistador: Você pode quantificar a melhoria de performance?
    Candidato: Não tenho os números exatos, mas ficou bem mais rápido.
    `;

    try {
        console.log("\n--- TESTE 1: ANALISANDO TRANSCRIÇÃO DE ENTREVISTA ---");
        const result = await analyzeCandidate("Elite Recruit", mockInterview, {
            profileLevel: "tecnico"
        });

        console.log("\n✅ Análise Concluída!");
        console.log("--------------------------------------------------");
        console.log(`NOME: ${result.nome}`);
        console.log(`CONSISTÊNCIA DE DADOS: ${result.consistencia_dados}/5`);
        console.log(`RED FLAGS: ${JSON.stringify(result.red_flags)}`);
        console.log(`RECOMENDAÇÃO: ${result.recomendacao}`);

        if (result.consistencia_dados !== undefined && result.red_flags !== undefined) {
            console.log("\n🎯 VALIDAÇÃO: Novos campos detectados com sucesso!");
        } else {
            console.error("\n❌ ERRO: Novos campos não encontrados no resultado.");
            console.log("Resultado bruto:", JSON.stringify(result, null, 2));
        }

    } catch (error) {
        console.error("❌ Erro no teste:", error);
    }
}

runTest();
