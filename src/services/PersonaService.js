const fs = require('fs').promises;
const path = require('path');
const LLMProviderFactory = require('./llm/LLMProviderFactory');

// [SOLID: Single Responsibility]
// 페르소나 관리와 댓글 생성에 대한 책임만 가짐
class PersonaService {
  constructor(llmConfig = {}) {
    if (!llmConfig.type) {
      throw new Error('LLM 제공자 타입이 지정되지 않았습니다.');
    }
    this.llmProvider = LLMProviderFactory.createProvider(llmConfig.type, llmConfig);
    this.personas = new Map();
  }

  // [SOLID: Single Responsibility]
  // 페르소나 로딩과 관리에 대한 책임만 가짐
  async loadPersonas() {
    try {
      const personasDir = path.join(__dirname, '../personas');
      const files = await fs.readdir(personasDir);
      
      if (files.length === 0) {
        throw new Error('페르소나 정의 파일이 없습니다. src/personas 디렉토리에 JSON 파일을 추가해주세요.');
      }

      for (const file of files) {
        if (file.endsWith('.json')) {
          const personaPath = path.join(personasDir, file);
          const personaData = await fs.readFile(personaPath, 'utf8');
          const persona = JSON.parse(personaData);
          this.personas.set(persona.name, persona);
        }
      }

      if (this.personas.size === 0) {
        throw new Error('유효한 페르소나 정의를 찾을 수 없습니다. JSON 파일 형식을 확인해주세요.');
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('페르소나 디렉토리를 찾을 수 없습니다: ' + error.path);
      }
      throw new Error(`페르소나 로딩 중 오류 발생: ${error.message}`);
    }
  }

  // [SOLID: Single Responsibility]
  // 댓글 생성에 대한 책임만 가짐
  async generateComment(personaName, content) {
    const persona = this.personas.get(personaName);
    if (!persona) {
      throw new Error(`페르소나를 찾을 수 없습니다: ${personaName}. 사용 가능한 페르소나: ${Array.from(this.personas.keys()).join(', ')}`);
    }

    const prompt = persona.promptTemplate.replace('{{content}}', content);

    try {
      const startTime = Date.now();
      const messages = [
        {
          role: "system",
          content: `당신은 ${persona.name}입니다. ${persona.background} 배경을 가지고 있으며, ${persona.personality} 성격을 가지고 있습니다.`
        },
        {
          role: "user",
          content: prompt
        }
      ];

      const result = await this.llmProvider.generateCompletion(messages, {
        temperature: 0.7,
        maxTokens: 500
      });

      const generationTime = Date.now() - startTime;

      return {
        personaName: persona.name,
        comment: result.content,
        metadata: {
          generationTime: `${generationTime}ms`,
          usage: result.usage
        }
      };
    } catch (error) {
      throw new Error(`댓글 생성 중 오류 발생: ${error.message}`);
    }
  }
}

module.exports = PersonaService; 