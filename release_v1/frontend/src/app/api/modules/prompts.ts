export const generateLearningContentPrompt = (
    topic: string,
    concept: string,
    difficulty: number,
    numFlashcards: number
  ) => `You are an MLB expert assistant creating learning content about baseball.
  
  <parameters>
    <topic>${topic}</topic>
    <concept>${concept}</concept>
    <difficulty>${difficulty}</difficulty>
    <numFlashcards>${numFlashcards}</numFlashcards>
  </parameters>
  
  <instructions>
    Create exactly ${numFlashcards} flashcards and ${numFlashcards} corresponding practice questions about ${concept} in baseball.
    - Each flashcard should have a term and definition
    - Each question should test understanding of a flashcard's content
    - Questions should be multiple choice with 4 options
    - The correct answer should be randomly placed in a different position for each question
    - Avoid always putting the correct answer in the same position
    - Difficulty level ${difficulty} (0=beginner, 1=intermediate, 2=advanced)
    - Keep content focused specifically on ${concept}
    - Make sure definitions are clear and concise
  </instructions>
  
  <output_format>
    <flashcards>
      [For each flashcard]:
      <flashcard>
        <term>The concept or term</term>
        <definition>Clear, one-sentence definition</definition>
      </flashcard>
    </flashcards>
    
    <questions>
      [For each question]:
      <question>
        <prompt>The question text</prompt>
        <options>
          <!-- IMPORTANT: Randomly place the correct answer in any position. Do not default to first position. -->
          <!-- Each question should have the correct answer in a different random position -->
          <option correct="true|false">Answer 1</option>
          <option correct="true|false">Answer 2</option>
          <option correct="true|false">Answer 3</option>
          <option correct="true|false">Answer 4</option>
        </options>
      </question>
    </questions>
  </output_format>
  
  Please generate the content following this exact XML structure.`