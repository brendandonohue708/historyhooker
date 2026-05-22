// Hard validation rules from the original spec. Topics that fail any
// rule are rejected and the generation pipeline attempts a replacement.

const AI_TELLS = [
  'in conclusion',
  'it is worth noting',
  'fascinating',
  'delve',
  'navigate',
  'tapestry',
  'rich history',
];

interface DraftTopic {
  title: string;
  category: string;
  clue: { type: string; value: string; transcript?: string };
  questions: Array<{
    text: string;
    choices: string[];
    correctAnswer: string;
    difficulty: string;
    coinsReward: number;
  }>;
  expansionParagraphs: string[];
  sources: Array<{ url: string; title: string }>;
  tags?: string[];
}

export type ValidationFailure = { rule: string; detail?: string };

export function validate(t: DraftTopic): ValidationFailure | null {
  if (!t.title || !t.category) {
    return { rule: 'missing_required', detail: 'title or category empty' };
  }

  const allowed = [
    'history', 'science', 'space', 'mythology',
    'tech', 'biology', 'philosophy',
  ];
  if (!allowed.includes(t.category)) {
    return { rule: 'bad_category', detail: t.category };
  }

  if (!Array.isArray(t.questions) || t.questions.length !== 3) {
    return { rule: 'question_count', detail: `${t.questions?.length ?? 0} questions` };
  }

  const difficulties = t.questions.map((q) => q.difficulty);
  const expectedDiffs = ['easy', 'medium', 'hard'];
  if (
    !expectedDiffs.every((d) => difficulties.includes(d)) ||
    difficulties.length !== 3
  ) {
    return { rule: 'difficulty_distribution', detail: difficulties.join(',') };
  }

  for (const q of t.questions) {
    if (!Array.isArray(q.choices) || q.choices.length !== 4) {
      return { rule: 'choices_count', detail: q.text };
    }
    if (!q.choices.includes(q.correctAnswer)) {
      return {
        rule: 'correct_answer_missing_from_choices',
        detail: `${q.text} — correct: "${q.correctAnswer}"`,
      };
    }
    // Plausibility heuristic: at least three choices > 2 chars (rules out
    // "yes/no/maybe/idk" style filler).
    const meaningful = q.choices.filter((c) => c.trim().length > 2).length;
    if (meaningful < 3) {
      return { rule: 'low_quality_choices', detail: q.text };
    }
  }

  if (!Array.isArray(t.expansionParagraphs) || t.expansionParagraphs.length < 2) {
    return { rule: 'expansion_too_short', detail: `${t.expansionParagraphs?.length ?? 0} paragraphs` };
  }

  const blob = t.expansionParagraphs.join(' ').toLowerCase();
  for (const tell of AI_TELLS) {
    if (blob.includes(tell)) return { rule: 'ai_tell', detail: tell };
  }

  // Clue must not state the correct answer verbatim
  const clueText = (t.clue.value + ' ' + (t.clue.transcript ?? '')).toLowerCase();
  for (const q of t.questions) {
    if (clueText.includes(q.correctAnswer.toLowerCase())) {
      return {
        rule: 'clue_reveals_answer',
        detail: q.correctAnswer,
      };
    }
  }

  // Sources: at least 2, and not 100% Wikipedia
  if (!Array.isArray(t.sources) || t.sources.length < 2) {
    return { rule: 'too_few_sources', detail: `${t.sources?.length ?? 0}` };
  }
  const allWiki = t.sources.every((s) => s.url.includes('wikipedia.org'));
  if (allWiki) return { rule: 'wikipedia_only_sources' };

  return null;
}
