const OpenAI = require('openai');
const LLMProvider = require('./LLMProvider');

// [SOLID: Liskov Substitution]
// OpenAI 제공자 구현
class OpenAIProvider extends LLMProvider {
  constructor(config) {
    super(config);
    if (!config.apiKey) {
      throw new Error('OpenAI API 키가 필요합니다.');
    }
    this.client = new OpenAI({
      apiKey: config.apiKey
    });
  }

  async generateCompletion(messages, options = {}) {
    try {
      const completion = await this.client.chat.completions.create({
        model: options.model || 'gpt-3.5-turbo',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500
      });

      return {
        content: completion.choices[0].message.content,
        usage: completion.usage
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`OpenAI API 오류 (${error.response.status}): ${error.response.data.error?.message || '알 수 없는 오류'}`);
      }
      throw new Error(`OpenAI API 호출 중 오류 발생: ${error.message}`);
    }
  }
}

module.exports = OpenAIProvider; 