// [SOLID: Interface Segregation]
// LLM 제공자 인터페이스 정의
class LLMProvider {
  constructor(config) {
    this.config = config;
  }

  async generateCompletion(messages, options = {}) {
    throw new Error('generateCompletion 메서드가 구현되지 않았습니다.');
  }
}

module.exports = LLMProvider; 