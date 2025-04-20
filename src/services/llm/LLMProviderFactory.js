const OpenAIProvider = require('./OpenAIProvider');
const HuggingFaceProvider = require('./HuggingFaceProvider');

// [SOLID: Factory Method]
// LLM 제공자 생성 팩토리
class LLMProviderFactory {
  static createProvider(type, config) {
    switch (type.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'huggingface':
        return new HuggingFaceProvider(config);
      // 다른 제공자 추가 가능
      // case 'anthropic':
      //   return new AnthropicProvider(config);
      // case 'google':
      //   return new GoogleProvider(config);
      default:
        throw new Error(`지원하지 않는 LLM 제공자입니다: ${type}`);
    }
  }
}

module.exports = LLMProviderFactory; 