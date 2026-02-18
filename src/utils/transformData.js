export const transformSheet = (json, sheetPrefix) => {
  return json.map((cat, cIdx) => {
    // Some sheets have empty "topic" but use the first subtopic as the category name
    let categoryName = cat.topic;
    let patternsSource = cat.subtopics;

    if (!categoryName && cat.subtopics.length > 0) {
       categoryName = cat.subtopics[0].subtopic; 
    }

    return {
      id: `${sheetPrefix}-cat-${cIdx}`,
      name: categoryName || "General",
      patterns: patternsSource.map((pat, pIdx) => ({
        id: `${sheetPrefix}-pat-${cIdx}-${pIdx}`,
        name: pat.subtopic || "Questions",
        questions: pat.questions.map((q, qIdx) => ({
          uid: `${sheetPrefix}-${cIdx}-${pIdx}-${qIdx}`, // Unique ID for persistence
          id: qIdx + 1,
          title: q.title,
          link: q.leetcode || q.gfg || "#",
          difficulty: q.difficulty || "Medium",
          tags: [] 
        }))
      }))
    };
  });
};