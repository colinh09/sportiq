import { AzureOpenAI } from 'openai';
import { generateLearningContentPrompt } from './prompts';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({ ignoreAttributes: false });

interface ModuleInput {
  topic: 'player' | 'team' | 'rule' | 'tournament' | 'position';
  concept: string;
  difficulty: 0 | 1 | 2;
  sport: string;
}

interface GeneratedContent {
  flashcards: Array<{
    term: string;
    definition: string;
  }>;
  questions: Array<{
    content: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    correct_option_index: number;
  }>;
}

export async function createModule(input: ModuleInput): Promise<GeneratedContent | Error> {
  console.log('Creating module with input:', input);
  
  const client = new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY!,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  });

  console.log('OpenAI client configured with:', {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION,
    deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT
  });

  const NUM_RETRIES = 3;
  const NUM_FLASHCARDS = 5;

  for (let attempt = 0; attempt < NUM_RETRIES; attempt++) {
    try {
      console.log(`\nAttempt ${attempt + 1}/${NUM_RETRIES}`);
      
      const prompt = generateLearningContentPrompt(
        input.topic,
        input.concept,
        input.difficulty,
        NUM_FLASHCARDS
      );
      console.log('\nGenerated prompt:', prompt);

      const completion = await client.chat.completions.create({
        model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
        messages: [{
          role: "system",
          content: prompt
        }],
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      console.log('\nOpenAI Response:', response);
      
      if (!response) {
        console.error('Empty response from OpenAI');
        throw new Error("Empty response from OpenAI");
      }

      console.log('\nParsing XML response...');
      const parsed = parser.parse(response);
      console.log('Parsed response:', JSON.stringify(parsed, null, 2));

      // Validate response structure
      if (!parsed.flashcards?.flashcard || !parsed.questions?.question) {
        console.error('Invalid response structure:', parsed);
        throw new Error("Invalid response structure");
      }

      // Ensure arrays even if single item
      const flashcardsArr = Array.isArray(parsed.flashcards.flashcard) 
        ? parsed.flashcards.flashcard 
        : [parsed.flashcards.flashcard];

      const questionsArr = Array.isArray(parsed.questions.question)
        ? parsed.questions.question
        : [parsed.questions.question];

      console.log('\nExtracted arrays:', {
        flashcardsCount: flashcardsArr.length,
        questionsCount: questionsArr.length
      });

      if (flashcardsArr.length !== NUM_FLASHCARDS || questionsArr.length !== NUM_FLASHCARDS) {
        console.error('Incorrect count:', {
          expectedCount: NUM_FLASHCARDS,
          flashcardsCount: flashcardsArr.length,
          questionsCount: questionsArr.length
        });
        throw new Error("Incorrect number of flashcards or questions");
      }

      const formattedQuestions = questionsArr.map((q: any, idx: number) => {
        console.log(`\nProcessing question ${idx + 1}:`, q);
        const options = Array.isArray(q.options.option) ? q.options.option : [q.options.option];
        const correctIndex = options.findIndex((opt: any) => 
          opt['@_correct'] === 'true' || opt['@_correct'] === true
        );

        return {
          content: q.prompt,
          option1: options[0]?.['#text'] || options[0],
          option2: options[1]?.['#text'] || options[1],
          option3: options[2]?.['#text'] || options[2],
          option4: options[3]?.['#text'] || options[3],
          correct_option_index: correctIndex,
        };
      });

      const result = {
        flashcards: flashcardsArr.map((f: any) => ({
          term: f.term,
          definition: f.definition,
        })),
        questions: formattedQuestions,
      };

      console.log('\nFinal formatted result:', JSON.stringify(result, null, 2));
      return result;

    } catch (error) {
      console.error(`\nError in attempt ${attempt + 1}:`, error);
      if (attempt === NUM_RETRIES - 1) {
        return new Error(`Failed to generate module after ${NUM_RETRIES} attempts: ${error}`);
      }
      continue;
    }
  }

  return new Error("Failed to generate module");
}