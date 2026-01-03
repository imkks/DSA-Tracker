// Extract ID, Title and generate LeetCode link
const parseQuestion = (rawStr) => {
    const match = rawStr.match(/^\s*(\d+)\s*[\.:\s]\s*(.*)$/);
    
    if (!match) {
      return {
        id: "misc",
        title: rawStr,
        link: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(rawStr)}`
      };
    }
  
    const id = match[1];
    let title = match[2].trim();
    
    let slug = title.toLowerCase()
      .replace(/\(.*\)/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
      
    return {
      id,
      title,
      link: `https://leetcode.com/problems/${slug}/`
    };
  };
  
  // Hydrate the raw array-based data into objects
  export const hydrateData = (data) => {
    let uniqueIdCounter = 0;
    return data.map((cat, catIdx) => ({
      id: `cat-${catIdx}`,
      name: cat[0],
      patterns: cat[1].map((pat, patIdx) => ({
        id: `pat-${catIdx}-${patIdx}`,
        name: pat[0],
        questions: pat[1].map((qStr) => {
          const qData = parseQuestion(qStr);
          return {
            ...qData,
            uid: `${qData.id}-${uniqueIdCounter++}` 
          };
        })
      }))
    }));
  };