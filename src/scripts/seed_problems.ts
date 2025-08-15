import mongoose from "mongoose";
import { Question } from "../models/Question";
import { MONGODB_URI } from "../config";

const blind75Questions = [
  // Array & Hashing
  {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    link: "https://leetcode.com/problems/two-sum/",
    active: true
  },
  {
    slug: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    tags: ["Array", "Dynamic Programming"],
    link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    active: true
  },
  {
    slug: "contains-duplicate",
    title: "Contains Duplicate",
    difficulty: "Easy",
    tags: ["Array", "Hash Table", "Sorting"],
    link: "https://leetcode.com/problems/contains-duplicate/",
    active: true
  },
  {
    slug: "product-of-array-except-self",
    title: "Product of Array Except Self",
    difficulty: "Medium",
    tags: ["Array", "Prefix Sum"],
    link: "https://leetcode.com/problems/product-of-array-except-self/",
    active: true
  },
  {
    slug: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    link: "https://leetcode.com/problems/maximum-subarray/",
    active: true
  },
  {
    slug: "maximum-product-subarray",
    title: "Maximum Product Subarray",
    difficulty: "Medium",
    tags: ["Array", "Dynamic Programming"],
    link: "https://leetcode.com/problems/maximum-product-subarray/",
    active: true
  },
  {
    slug: "find-minimum-in-rotated-sorted-array",
    title: "Find Minimum in Rotated Sorted Array",
    difficulty: "Medium",
    tags: ["Array", "Binary Search"],
    link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    active: true
  },
  {
    slug: "search-in-rotated-sorted-array",
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    tags: ["Array", "Binary Search"],
    link: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    active: true
  },
  {
    slug: "3sum",
    title: "3Sum",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Sorting"],
    link: "https://leetcode.com/problems/3sum/",
    active: true
  },
  {
    slug: "container-with-most-water",
    title: "Container With Most Water",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Greedy"],
    link: "https://leetcode.com/problems/container-with-most-water/",
    active: true
  },

  // Binary
  {
    slug: "sum-of-two-integers",
    title: "Sum of Two Integers",
    difficulty: "Medium",
    tags: ["Math", "Bit Manipulation"],
    link: "https://leetcode.com/problems/sum-of-two-integers/",
    active: true
  },
  {
    slug: "number-of-1-bits",
    title: "Number of 1 Bits",
    difficulty: "Easy",
    tags: ["Divide and Conquer", "Bit Manipulation"],
    link: "https://leetcode.com/problems/number-of-1-bits/",
    active: true
  },
  {
    slug: "counting-bits",
    title: "Counting Bits",
    difficulty: "Easy",
    tags: ["Dynamic Programming", "Bit Manipulation"],
    link: "https://leetcode.com/problems/counting-bits/",
    active: true
  },
  {
    slug: "missing-number",
    title: "Missing Number",
    difficulty: "Easy",
    tags: ["Array", "Hash Table", "Math", "Bit Manipulation", "Sorting"],
    link: "https://leetcode.com/problems/missing-number/",
    active: true
  },
  {
    slug: "reverse-bits",
    title: "Reverse Bits",
    difficulty: "Easy",
    tags: ["Divide and Conquer", "Bit Manipulation"],
    link: "https://leetcode.com/problems/reverse-bits/",
    active: true
  },

  // Dynamic Programming
  {
    slug: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    tags: ["Math", "Dynamic Programming", "Memoization"],
    link: "https://leetcode.com/problems/climbing-stairs/",
    active: true
  },
  {
    slug: "coin-change",
    title: "Coin Change",
    difficulty: "Medium",
    tags: ["Array", "Dynamic Programming", "Breadth-First Search"],
    link: "https://leetcode.com/problems/coin-change/",
    active: true
  },
  {
    slug: "longest-increasing-subsequence",
    title: "Longest Increasing Subsequence",
    difficulty: "Medium",
    tags: ["Array", "Binary Search", "Dynamic Programming"],
    link: "https://leetcode.com/problems/longest-increasing-subsequence/",
    active: true
  },
  {
    slug: "longest-common-subsequence",
    title: "Longest Common Subsequence",
    difficulty: "Medium",
    tags: ["String", "Dynamic Programming"],
    link: "https://leetcode.com/problems/longest-common-subsequence/",
    active: true
  },
  {
    slug: "word-break",
    title: "Word Break",
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Dynamic Programming", "Trie", "Memoization"],
    link: "https://leetcode.com/problems/word-break/",
    active: true
  },
  {
    slug: "combination-sum-iv",
    title: "Combination Sum IV",
    difficulty: "Medium",
    tags: ["Array", "Dynamic Programming"],
    link: "https://leetcode.com/problems/combination-sum-iv/",
    active: true
  },
  {
    slug: "house-robber",
    title: "House Robber",
    difficulty: "Medium",
    tags: ["Array", "Dynamic Programming"],
    link: "https://leetcode.com/problems/house-robber/",
    active: true
  },
  {
    slug: "house-robber-ii",
    title: "House Robber II",
    difficulty: "Medium",
    tags: ["Array", "Dynamic Programming"],
    link: "https://leetcode.com/problems/house-robber-ii/",
    active: true
  },
  {
    slug: "decode-ways",
    title: "Decode Ways",
    difficulty: "Medium",
    tags: ["String", "Dynamic Programming"],
    link: "https://leetcode.com/problems/decode-ways/",
    active: true
  },
  {
    slug: "unique-paths",
    title: "Unique Paths",
    difficulty: "Medium",
    tags: ["Math", "Dynamic Programming", "Combinatorics"],
    link: "https://leetcode.com/problems/unique-paths/",
    active: true
  },
  {
    slug: "jump-game",
    title: "Jump Game",
    difficulty: "Medium",
    tags: ["Array", "Dynamic Programming", "Greedy"],
    link: "https://leetcode.com/problems/jump-game/",
    active: true
  },

  // Graph
  {
    slug: "clone-graph",
    title: "Clone Graph",
    difficulty: "Medium",
    tags: ["Hash Table", "Depth-First Search", "Breadth-First Search", "Graph"],
    link: "https://leetcode.com/problems/clone-graph/",
    active: true
  },
  {
    slug: "course-schedule",
    title: "Course Schedule",
    difficulty: "Medium",
    tags: ["Depth-First Search", "Breadth-First Search", "Graph", "Topological Sort"],
    link: "https://leetcode.com/problems/course-schedule/",
    active: true
  },
  {
    slug: "pacific-atlantic-water-flow",
    title: "Pacific Atlantic Water Flow",
    difficulty: "Medium",
    tags: ["Array", "Depth-First Search", "Breadth-First Search", "Matrix"],
    link: "https://leetcode.com/problems/pacific-atlantic-water-flow/",
    active: true
  },
  {
    slug: "number-of-islands",
    title: "Number of Islands",
    difficulty: "Medium",
    tags: ["Array", "Depth-First Search", "Breadth-First Search", "Union Find", "Matrix"],
    link: "https://leetcode.com/problems/number-of-islands/",
    active: true
  },
  {
    slug: "longest-consecutive-sequence",
    title: "Longest Consecutive Sequence",
    difficulty: "Medium",
    tags: ["Array", "Hash Table", "Union Find"],
    link: "https://leetcode.com/problems/longest-consecutive-sequence/",
    active: true
  },
  {
    slug: "alien-dictionary",
    title: "Alien Dictionary",
    difficulty: "Hard",
    tags: ["Array", "String", "Depth-First Search", "Breadth-First Search", "Graph", "Topological Sort"],
    link: "https://leetcode.com/problems/alien-dictionary/",
    active: true
  },
  {
    slug: "graph-valid-tree",
    title: "Graph Valid Tree",
    difficulty: "Medium",
    tags: ["Depth-First Search", "Breadth-First Search", "Union Find", "Graph"],
    link: "https://leetcode.com/problems/graph-valid-tree/",
    active: true
  },
  {
    slug: "number-of-connected-components-in-an-undirected-graph",
    title: "Number of Connected Components in an Undirected Graph",
    difficulty: "Medium",
    tags: ["Depth-First Search", "Breadth-First Search", "Union Find", "Graph"],
    link: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/",
    active: true
  },

  // Interval
  {
    slug: "insert-interval",
    title: "Insert Interval",
    difficulty: "Medium",
    tags: ["Array"],
    link: "https://leetcode.com/problems/insert-interval/",
    active: true
  },
  {
    slug: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    tags: ["Array", "Sorting"],
    link: "https://leetcode.com/problems/merge-intervals/",
    active: true
  },
  {
    slug: "non-overlapping-intervals",
    title: "Non-overlapping Intervals",
    difficulty: "Medium",
    tags: ["Array", "Dynamic Programming", "Greedy", "Sorting"],
    link: "https://leetcode.com/problems/non-overlapping-intervals/",
    active: true
  },
  {
    slug: "meeting-rooms",
    title: "Meeting Rooms",
    difficulty: "Easy",
    tags: ["Array", "Sorting"],
    link: "https://leetcode.com/problems/meeting-rooms/",
    active: true
  },
  {
    slug: "meeting-rooms-ii",
    title: "Meeting Rooms II",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Greedy", "Sorting", "Heap (Priority Queue)"],
    link: "https://leetcode.com/problems/meeting-rooms-ii/",
    active: true
  },

  // Linked List
  {
    slug: "reverse-linked-list",
    title: "Reverse Linked List",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    link: "https://leetcode.com/problems/reverse-linked-list/",
    active: true
  },
  {
    slug: "linked-list-cycle",
    title: "Linked List Cycle",
    difficulty: "Easy",
    tags: ["Hash Table", "Linked List", "Two Pointers"],
    link: "https://leetcode.com/problems/linked-list-cycle/",
    active: true
  },
  {
    slug: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    link: "https://leetcode.com/problems/merge-two-sorted-lists/",
    active: true
  },
  {
    slug: "merge-k-sorted-lists",
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    tags: ["Linked List", "Divide and Conquer", "Heap (Priority Queue)", "Merge Sort"],
    link: "https://leetcode.com/problems/merge-k-sorted-lists/",
    active: true
  },
  {
    slug: "remove-nth-node-from-end-of-list",
    title: "Remove Nth Node From End of List",
    difficulty: "Medium",
    tags: ["Linked List", "Two Pointers"],
    link: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    active: true
  },
  {
    slug: "reorder-list",
    title: "Reorder List",
    difficulty: "Medium",
    tags: ["Linked List", "Two Pointers", "Stack", "Recursion"],
    link: "https://leetcode.com/problems/reorder-list/",
    active: true
  },

  // Matrix
  {
    slug: "set-matrix-zeroes",
    title: "Set Matrix Zeroes",
    difficulty: "Medium",
    tags: ["Array", "Hash Table", "Matrix"],
    link: "https://leetcode.com/problems/set-matrix-zeroes/",
    active: true
  },
  {
    slug: "spiral-matrix",
    title: "Spiral Matrix",
    difficulty: "Medium",
    tags: ["Array", "Matrix", "Simulation"],
    link: "https://leetcode.com/problems/spiral-matrix/",
    active: true
  },
  {
    slug: "rotate-image",
    title: "Rotate Image",
    difficulty: "Medium",
    tags: ["Array", "Math", "Matrix"],
    link: "https://leetcode.com/problems/rotate-image/",
    active: true
  },
  {
    slug: "word-search",
    title: "Word Search",
    difficulty: "Medium",
    tags: ["Array", "Backtracking", "Matrix"],
    link: "https://leetcode.com/problems/word-search/",
    active: true
  },

  // String
  {
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Sliding Window"],
    link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    active: true
  },
  {
    slug: "longest-repeating-character-replacement",
    title: "Longest Repeating Character Replacement",
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Sliding Window"],
    link: "https://leetcode.com/problems/longest-repeating-character-replacement/",
    active: true
  },
  {
    slug: "minimum-window-substring",
    title: "Minimum Window Substring",
    difficulty: "Hard",
    tags: ["Hash Table", "String", "Sliding Window"],
    link: "https://leetcode.com/problems/minimum-window-substring/",
    active: true
  },
  {
    slug: "valid-anagram",
    title: "Valid Anagram",
    difficulty: "Easy",
    tags: ["Hash Table", "String", "Sorting"],
    link: "https://leetcode.com/problems/valid-anagram/",
    active: true
  },
  {
    slug: "group-anagrams",
    title: "Group Anagrams",
    difficulty: "Medium",
    tags: ["Array", "Hash Table", "String", "Sorting"],
    link: "https://leetcode.com/problems/group-anagrams/",
    active: true
  },
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["String", "Stack"],
    link: "https://leetcode.com/problems/valid-parentheses/",
    active: true
  },
  {
    slug: "valid-palindrome",
    title: "Valid Palindrome",
    difficulty: "Easy",
    tags: ["Two Pointers", "String"],
    link: "https://leetcode.com/problems/valid-palindrome/",
    active: true
  },
  {
    slug: "longest-palindromic-substring",
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    tags: ["String", "Dynamic Programming"],
    link: "https://leetcode.com/problems/longest-palindromic-substring/",
    active: true
  },
  {
    slug: "palindromic-substrings",
    title: "Palindromic Substrings",
    difficulty: "Medium",
    tags: ["String", "Dynamic Programming"],
    link: "https://leetcode.com/problems/palindromic-substrings/",
    active: true
  },
  {
    slug: "encode-and-decode-strings",
    title: "Encode and Decode Strings",
    difficulty: "Medium",
    tags: ["Array", "String", "Design"],
    link: "https://leetcode.com/problems/encode-and-decode-strings/",
    active: true
  },

  // Tree
  {
    slug: "maximum-depth-of-binary-tree",
    title: "Maximum Depth of Binary Tree",
    difficulty: "Easy",
    tags: ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Tree"],
    link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    active: true
  },
  {
    slug: "same-tree",
    title: "Same Tree",
    difficulty: "Easy",
    tags: ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Tree"],
    link: "https://leetcode.com/problems/same-tree/",
    active: true
  },
  {
    slug: "invert-binary-tree",
    title: "Invert Binary Tree",
    difficulty: "Easy",
    tags: ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Tree"],
    link: "https://leetcode.com/problems/invert-binary-tree/",
    active: true
  },
  {
    slug: "binary-tree-maximum-path-sum",
    title: "Binary Tree Maximum Path Sum",
    difficulty: "Hard",
    tags: ["Dynamic Programming", "Tree", "Depth-First Search", "Binary Tree"],
    link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    active: true
  },
  {
    slug: "binary-tree-level-order-traversal",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    tags: ["Tree", "Breadth-First Search", "Binary Tree"],
    link: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    active: true
  },
  {
    slug: "serialize-and-deserialize-binary-tree",
    title: "Serialize and Deserialize Binary Tree",
    difficulty: "Hard",
    tags: ["String", "Tree", "Depth-First Search", "Breadth-First Search", "Design", "Binary Tree"],
    link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    active: true
  },
  {
    slug: "subtree-of-another-tree",
    title: "Subtree of Another Tree",
    difficulty: "Easy",
    tags: ["Tree", "Depth-First Search", "String Matching", "Binary Tree", "Hash Function"],
    link: "https://leetcode.com/problems/subtree-of-another-tree/",
    active: true
  },
  {
    slug: "construct-binary-tree-from-preorder-and-inorder-traversal",
    title: "Construct Binary Tree from Preorder and Inorder Traversal",
    difficulty: "Medium",
    tags: ["Array", "Hash Table", "Divide and Conquer", "Tree", "Binary Tree"],
    link: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
    active: true
  },
  {
    slug: "validate-binary-search-tree",
    title: "Validate Binary Search Tree",
    difficulty: "Medium",
    tags: ["Tree", "Depth-First Search", "Binary Search Tree", "Binary Tree"],
    link: "https://leetcode.com/problems/validate-binary-search-tree/",
    active: true
  },
  {
    slug: "kth-smallest-element-in-a-bst",
    title: "Kth Smallest Element in a BST",
    difficulty: "Medium",
    tags: ["Tree", "Depth-First Search", "Binary Search Tree", "Binary Tree"],
    link: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
    active: true
  },
  {
    slug: "lowest-common-ancestor-of-a-binary-search-tree",
    title: "Lowest Common Ancestor of a Binary Search Tree",
    difficulty: "Medium",
    tags: ["Tree", "Depth-First Search", "Binary Search Tree", "Binary Tree"],
    link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    active: true
  },
  {
    slug: "implement-trie-prefix-tree",
    title: "Implement Trie (Prefix Tree)",
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Design", "Trie"],
    link: "https://leetcode.com/problems/implement-trie-prefix-tree/",
    active: true
  },
  {
    slug: "add-and-search-word-data-structure-design",
    title: "Design Add and Search Words Data Structure",
    difficulty: "Medium",
    tags: ["String", "Depth-First Search", "Design", "Trie"],
    link: "https://leetcode.com/problems/design-add-and-search-words-data-structure/",
    active: true
  },
  {
    slug: "word-search-ii",
    title: "Word Search II",
    difficulty: "Hard",
    tags: ["Array", "String", "Backtracking", "Trie", "Matrix"],
    link: "https://leetcode.com/problems/word-search-ii/",
    active: true
  },

  // Heap / Priority Queue
  {
    slug: "merge-k-sorted-lists",
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    tags: ["Linked List", "Divide and Conquer", "Heap (Priority Queue)", "Merge Sort"],
    link: "https://leetcode.com/problems/merge-k-sorted-lists/",
    active: true
  },
  {
    slug: "top-k-frequent-elements",
    title: "Top K Frequent Elements",
    difficulty: "Medium",
    tags: ["Array", "Hash Table", "Divide and Conquer", "Sorting", "Heap (Priority Queue)", "Bucket Sort", "Counting", "Quickselect"],
    link: "https://leetcode.com/problems/top-k-frequent-elements/",
    active: true
  },
  {
    slug: "find-median-from-data-stream",
    title: "Find Median from Data Stream",
    difficulty: "Hard",
    tags: ["Two Pointers", "Design", "Sorting", "Heap (Priority Queue)", "Data Stream"],
    link: "https://leetcode.com/problems/find-median-from-data-stream/",
    active: true
  }
];

async function seedProblems() {
  try {
    console.log("🌱 Starting to seed Blind 75 problems...");

    // Connect to MongoDB
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined.");
    }
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing questions (optional - remove if you want to keep existing)
    console.log("🗑️ Clearing existing questions...");
    await Question.deleteMany({});

    // Insert Blind 75 questions
    console.log("📚 Inserting Blind 75 questions...");
    const result = await Question.insertMany(blind75Questions);
    
    console.log(`✅ Successfully seeded ${result.length} Blind 75 problems!`);
    
    // Display some stats
    const easyCount = result.filter(q => q.difficulty === "Easy").length;
    const mediumCount = result.filter(q => q.difficulty === "Medium").length;
    const hardCount = result.filter(q => q.difficulty === "Hard").length;
    
    console.log("📊 Breakdown:");
    console.log(`   🟢 Easy: ${easyCount}`);
    console.log(`   🟡 Medium: ${mediumCount}`);
    console.log(`   🔴 Hard: ${hardCount}`);
    console.log(`   📋 Total: ${result.length}`);

    console.log("\n🎯 Popular topics covered:");
    const allTags = result.flatMap(q => q.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    topTags.forEach(([tag, count]) => {
      console.log(`   • ${tag}: ${count} problems`);
    });

  } catch (error) {
    console.error("❌ Error seeding problems:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the seeding function
if (require.main === module) {
  seedProblems();
}

export { seedProblems };