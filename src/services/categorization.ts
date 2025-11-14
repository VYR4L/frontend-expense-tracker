/**
 * Serviço de categorização automática de transações
 * Usa regex simples para mapear palavras-chave em descrições para categorias
 */

interface CategoryRule {
  keywords: RegExp;
  category: string;
}

const categoryRules: CategoryRule[] = [
  // Alimentação
  {
    keywords: /ifood|uber\s*eats|rappi|restaurante|padaria|lanchonete|pizzaria|bar|cafe|cafeteria|supermercado|mercado|açougue|hortifruti/i,
    category: 'Alimentação',
  },
  
  // Transporte
  {
    keywords: /uber|99|cabify|taxi|ônibus|onibus|metrô|metro|combustível|combustivel|gasolina|posto|estacionamento|pedágio|pedagio/i,
    category: 'Transporte',
  },
  
  // Moradia
  {
    keywords: /aluguel|condomínio|condominio|iptu|água|agua|luz|energia|elétrica|eletrica|gás|gas/i,
    category: 'Moradia',
  },
  
  // Saúde
  {
    keywords: /farmácia|farmacia|droga|remédio|remedio|medicamento|hospital|clínica|clinica|médico|medico|dentista|plano\s*de\s*saúde|plano\s*de\s*saude|consulta|exame/i,
    category: 'Saúde',
  },
  
  // Educação
  {
    keywords: /escola|faculdade|universidade|curso|aula|mensalidade|livro|material\s*escolar/i,
    category: 'Educação',
  },
  
  // Compras
  {
    keywords: /amazon|mercado\s*livre|shopee|magazine\s*luiza|casas\s*bahia|loja|compra|roupa|calçado|calcado|vestuário|vestuario/i,
    category: 'Compras',
  },
  
  // Lazer / Entretenimento
  {
    keywords: /cinema|teatro|show|evento|spotify|netflix|disney|hbo|amazon\s*prime|youtube\s*premium|jogo|game|steam/i,
    category: 'Lazer',
  },
  
  // Telefone / Internet
  {
    keywords: /vivo|tim|claro|oi|telefone|celular|internet|banda\s*larga/i,
    category: 'Telefone',
  },
  
  // Investimentos
  {
    keywords: /investimento|ação|ações|acoes|fundo|tesouro|cdb|lci|lca|renda\s*fixa|bolsa/i,
    category: 'Investimentos',
  },
  
  // Salário / Renda
  {
    keywords: /salário|salario|pagamento|vencimento|remuneração|remuneracao|honorário|honorarios|freelance|renda/i,
    category: 'Salário',
  },
  
  // Pet
  {
    keywords: /pet\s*shop|veterinário|veterinario|ração|racao|pet|cachorro|gato|animal/i,
    category: 'Pet',
  },
  
  // Manutenção
  {
    keywords: /manutenção|manutencao|reparo|conserto|oficina|mecânico|mecanico|encanador|eletricista/i,
    category: 'Manutenção',
  },
];

/**
 * Tenta categorizar automaticamente uma transação baseado em sua descrição
 * @param description - Descrição da transação
 * @returns Nome da categoria sugerida ou null se não encontrar correspondência
 */
export const autoCategorize = (description: string): string | null => {
  if (!description || description.trim() === '') {
    return null;
  }

  const normalizedDescription = description.trim();

  // Procurar por correspondência em cada regra
  for (const rule of categoryRules) {
    if (rule.keywords.test(normalizedDescription)) {
      return rule.category;
    }
  }

  // Nenhuma categoria encontrada
  return null;
};

/**
 * Obtém todas as categorias disponíveis no sistema de categorização automática
 * @returns Array com nomes das categorias
 */
export const getAvailableAutoCategories = (): string[] => {
  return Array.from(new Set(categoryRules.map((rule) => rule.category)));
};
