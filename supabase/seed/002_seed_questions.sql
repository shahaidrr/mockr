-- Phase 1 seed: 7 published questions + 21 public test cases (3 per question)
-- Mirrors the live Supabase data seeded via 002_seed_questions in the SQL editor.

-- ─── 1. find-matching-pair ───────────────────────────────────────────────────

insert into public.questions (
  slug, title, short_summary, difficulty, topic, estimated_minutes, role_level, status, version,
  problem_statement, input_description, output_description, constraints, examples,
  expected_time_complexity, expected_space_complexity, expected_complexity_notes,
  supported_languages, starter_code, hints, follow_up_prompts, clarification_notes, rubric_notes
) values (
  'find-matching-pair',
  'Find Matching Pair',
  'Use a hash map to efficiently find two numbers in an array that add up to a target value.',
  'easy', 'Hash maps', 15, 'intern_grad', 'published', 1,
  'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. You may assume that each input has exactly one solution, and you may not use the same element twice. Return the answer in any order.',
  'An array of integers nums and an integer target.',
  'An array of two integers representing the indices of the two numbers that add up to target.',
  E'2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nExactly one valid answer exists.',
  '[
    {"input": "nums = [2, 7, 11, 15], target = 9", "output": "[0, 1]", "explanation": "nums[0] + nums[1] == 9, so we return [0, 1]."},
    {"input": "nums = [3, 2, 4], target = 6", "output": "[1, 2]", "explanation": "nums[1] + nums[2] == 6, so we return [1, 2]."},
    {"input": "nums = [3, 3], target = 6", "output": "[0, 1]", "explanation": "nums[0] + nums[1] == 6, so we return [0, 1]."}
  ]'::jsonb,
  'O(n)', 'O(n)',
  'Use a hash map to store the complement of each number as you iterate. This avoids the O(n^2) brute-force approach.',
  array['javascript', 'python', 'cpp'],
  '{"javascript": "function findMatchingPair(nums, target) {\n  // Write your solution here\n}", "python": "def findMatchingPair(nums, target):\n    # Write your solution here\n    pass", "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> findMatchingPair(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}"}'::jsonb,
  '["Think about what information you need to store as you iterate through the array.", "For each number, what value would complete the pair to reach the target?", "A hash map gives O(1) lookup — can you use that to check if the complement already exists?"]'::jsonb,
  '["What if the array is sorted — can you solve it in O(1) space?", "What if multiple valid pairs exist?", "How would you handle an array with all duplicates?"]'::jsonb,
  '["Can I assume the array is non-empty?", "Are indices 0-based?", "Can the same element be used twice?", "Is there always exactly one solution?"]'::jsonb,
  '{"problem_understanding": "Can the candidate identify that a hash map eliminates the need for nested loops?", "code_quality": "Is the complement variable clearly named and the logic easy to follow?"}'::jsonb
);

with q as (select id from public.questions where slug = 'find-matching-pair')
insert into public.question_test_cases (question_id, label, input, expected_output, is_hidden, weight, explanation)
values
  ((select id from q), 'Basic case', '{"nums": [2, 7, 11, 15], "target": 9}', '[0, 1]', false, 1, 'The first two elements sum to the target.'),
  ((select id from q), 'Mid-array pair', '{"nums": [3, 2, 4], "target": 6}', '[1, 2]', false, 1, 'The pair is not at the start of the array.'),
  ((select id from q), 'Duplicate values', '{"nums": [3, 3], "target": 6}', '[0, 1]', false, 1, 'Both elements are the same value.');

-- ─── 2. compress-repeated-characters ─────────────────────────────────────────

insert into public.questions (
  slug, title, short_summary, difficulty, topic, estimated_minutes, role_level, status, version,
  problem_statement, input_description, output_description, constraints, examples,
  expected_time_complexity, expected_space_complexity, expected_complexity_notes,
  supported_languages, starter_code, hints, follow_up_prompts, clarification_notes, rubric_notes
) values (
  'compress-repeated-characters',
  'Compress Repeated Characters',
  'Implement run-length encoding: replace consecutive repeated characters with the character followed by its count.',
  'easy', 'Strings', 15, 'intern_grad', 'published', 1,
  'Given a string s, compress it using run-length encoding. Replace each group of consecutive repeated characters with the character followed by the number of repetitions. If a character appears only once, it should still be followed by 1. Return the compressed string.',
  'A non-empty string s containing only lowercase English letters.',
  'The run-length encoded string.',
  E'1 <= s.length <= 10^4\ns contains only lowercase English letters.',
  '[
    {"input": "s = \"aaabbc\"", "output": "\"a3b2c1\"", "explanation": "a appears 3 times, b appears 2 times, c appears 1 time."},
    {"input": "s = \"abcd\"", "output": "\"a1b1c1d1\"", "explanation": "Each character appears exactly once."},
    {"input": "s = \"aaaaaa\"", "output": "\"a6\"", "explanation": "The same character repeated 6 times."}
  ]'::jsonb,
  'O(n)', 'O(n)',
  'One linear pass through the string is sufficient. Track the current character and count as you go.',
  array['javascript', 'python', 'cpp'],
  '{"javascript": "function compressRepeatedCharacters(s) {\n  // Write your solution here\n}", "python": "def compressRepeatedCharacters(s):\n    # Write your solution here\n    pass", "cpp": "#include <string>\nusing namespace std;\n\nstring compressRepeatedCharacters(string s) {\n    // Write your solution here\n    return \"\";\n}"}'::jsonb,
  '["Iterate through the string and track the current character and how many times it has appeared consecutively.", "When you see a different character (or reach the end), append the current character and count to your result.", "Be careful about the transition between groups — when do you reset your counter?"]'::jsonb,
  '["What if you only compress when it saves space (i.e. count > 1)?", "How would you handle Unicode characters?", "Can you do this in-place for a character array?"]'::jsonb,
  '["Should single characters be followed by 1, or omitted?", "Are there only lowercase letters?", "What should happen with an empty string?"]'::jsonb,
  '{"code_correctness": "Does the solution correctly handle the boundary between character groups?", "testing_debugging": "Did the candidate test single-character runs, multi-character runs, and a single repeated character?"}'::jsonb
);

with q as (select id from public.questions where slug = 'compress-repeated-characters')
insert into public.question_test_cases (question_id, label, input, expected_output, is_hidden, weight, explanation)
values
  ((select id from q), 'Mixed groups', '{"s": "aaabbc"}', '"a3b2c1"', false, 1, 'Three groups of different lengths.'),
  ((select id from q), 'All unique', '{"s": "abcd"}', '"a1b1c1d1"', false, 1, 'Every character appears once.'),
  ((select id from q), 'Single group', '{"s": "aaaaaa"}', '"a6"', false, 1, 'Only one character repeated.');

-- ─── 3. longest-unique-segment ───────────────────────────────────────────────

insert into public.questions (
  slug, title, short_summary, difficulty, topic, estimated_minutes, role_level, status, version,
  problem_statement, input_description, output_description, constraints, examples,
  expected_time_complexity, expected_space_complexity, expected_complexity_notes,
  supported_languages, starter_code, hints, follow_up_prompts, clarification_notes, rubric_notes
) values (
  'longest-unique-segment',
  'Longest Unique Segment',
  'Find the length of the longest contiguous substring that contains no repeating characters using a sliding window.',
  'medium', 'Sliding window', 25, 'intern_grad', 'published', 1,
  'Given a string s, find the length of the longest contiguous segment (substring) that contains no repeating characters.',
  'A string s.',
  'An integer representing the length of the longest substring without repeating characters.',
  E'0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols, and spaces.',
  '[
    {"input": "s = \"abcabcbb\"", "output": "3", "explanation": "The answer is \"abc\", with a length of 3."},
    {"input": "s = \"bbbbb\"", "output": "1", "explanation": "The answer is \"b\", with a length of 1."},
    {"input": "s = \"pwwkew\"", "output": "3", "explanation": "The answer is \"wke\", with a length of 3."}
  ]'::jsonb,
  'O(n)', 'O(min(n, m)) where m is the character set size',
  'Expand the right pointer and shrink the left pointer when a duplicate is found. A hash map (or set) tracks the characters currently in the window.',
  array['javascript', 'python', 'cpp'],
  '{"javascript": "function longestUniqueSegment(s) {\n  // Write your solution here\n}", "python": "def longestUniqueSegment(s):\n    # Write your solution here\n    pass", "cpp": "#include <string>\nusing namespace std;\n\nint longestUniqueSegment(string s) {\n    // Write your solution here\n    return 0;\n}"}'::jsonb,
  '["Think about maintaining a window of characters with no duplicates.", "When you encounter a repeated character, what is the minimum you need to shrink the window by?", "Storing the last-seen index of each character lets you jump the left pointer directly instead of moving it one step at a time."]'::jsonb,
  '["What is the brute-force O(n^2) or O(n^3) approach?", "Can you extend this to find the actual substring, not just the length?", "What changes if the input can contain Unicode?"]'::jsonb,
  '["Are spaces and digits considered valid characters?", "Should I return the length or the substring itself?", "What should I return for an empty string?"]'::jsonb,
  '{"algorithmic_approach": "Did the candidate articulate the sliding window idea before coding?", "complexity_analysis": "Can the candidate explain both the time and space complexity and why?"}'::jsonb
);

with q as (select id from public.questions where slug = 'longest-unique-segment')
insert into public.question_test_cases (question_id, label, input, expected_output, is_hidden, weight, explanation)
values
  ((select id from q), 'Repeating pattern', '{"s": "abcabcbb"}', '3', false, 1, 'Longest unique segment is "abc".'),
  ((select id from q), 'All same', '{"s": "bbbbb"}', '1', false, 1, 'Longest unique segment is a single "b".'),
  ((select id from q), 'Mixed', '{"s": "pwwkew"}', '3', false, 1, 'Longest unique segment is "wke".');

-- ─── 4. balanced-brackets ────────────────────────────────────────────────────

insert into public.questions (
  slug, title, short_summary, difficulty, topic, estimated_minutes, role_level, status, version,
  problem_statement, input_description, output_description, constraints, examples,
  expected_time_complexity, expected_space_complexity, expected_complexity_notes,
  supported_languages, starter_code, hints, follow_up_prompts, clarification_notes, rubric_notes
) values (
  'balanced-brackets',
  'Balanced Brackets',
  'Use a stack to check whether every opening bracket in a string has a matching closing bracket in the correct order.',
  'easy', 'Stacks', 15, 'intern_grad', 'published', 1,
  'Given a string s containing only the characters (, ), {, }, [ and ], determine if the input string is valid. A string is valid if every open bracket is closed by the same type of bracket, every open bracket is closed in the correct order, and every close bracket has a corresponding open bracket.',
  'A string s containing only bracket characters: (, ), {, }, [, ].',
  'true if the string is valid, false otherwise.',
  E'1 <= s.length <= 10^4\ns consists of bracket characters only.',
  '[
    {"input": "s = \"()\"", "output": "true"},
    {"input": "s = \"()[]{}\"", "output": "true"},
    {"input": "s = \"(]\"", "output": "false"}
  ]'::jsonb,
  'O(n)', 'O(n)',
  'A stack is a natural fit: push open brackets, pop and match when you see a closing bracket. If the stack is empty at the end, the string is balanced.',
  array['javascript', 'python', 'cpp'],
  '{"javascript": "function balancedBrackets(s) {\n  // Write your solution here\n}", "python": "def balancedBrackets(s):\n    # Write your solution here\n    pass", "cpp": "#include <string>\nusing namespace std;\n\nbool balancedBrackets(string s) {\n    // Write your solution here\n    return false;\n}"}'::jsonb,
  '["Think about which data structure lets you match the most recent unmatched open bracket.", "What should happen when you see a closing bracket and the stack is empty?", "After processing the whole string, what should the stack look like if the string is valid?"]'::jsonb,
  '["What if the string can also contain letters or digits (you ignore non-bracket characters)?", "How would you extend this to return the index of the first unmatched bracket?"]'::jsonb,
  '["Is the string guaranteed to contain only bracket characters?", "Can the string be empty — and if so, is it valid?"]'::jsonb,
  '{"problem_understanding": "Did the candidate identify the stack pattern without prompting?", "testing_debugging": "Did the candidate test mismatched brackets, extra closing brackets, and an empty string?"}'::jsonb
);

with q as (select id from public.questions where slug = 'balanced-brackets')
insert into public.question_test_cases (question_id, label, input, expected_output, is_hidden, weight, explanation)
values
  ((select id from q), 'Simple valid', '{"s": "()"}', 'true', false, 1, 'A single matched pair.'),
  ((select id from q), 'Multiple types', '{"s": "()[]{}"}', 'true', false, 1, 'Three different matched pairs.'),
  ((select id from q), 'Mismatched', '{"s": "(]"}', 'false', false, 1, 'Opening paren closed by square bracket — invalid.');

-- ─── 5. count-connected-rooms ────────────────────────────────────────────────

insert into public.questions (
  slug, title, short_summary, difficulty, topic, estimated_minutes, role_level, status, version,
  problem_statement, input_description, output_description, constraints, examples,
  expected_time_complexity, expected_space_complexity, expected_complexity_notes,
  supported_languages, starter_code, hints, follow_up_prompts, clarification_notes, rubric_notes
) values (
  'count-connected-rooms',
  'Count Connected Rooms',
  'Count the number of connected groups of rooms in a 2D grid using DFS or BFS.',
  'medium', 'DFS/BFS', 30, 'intern_grad', 'published', 1,
  'You are given an m x n 2D binary grid where 1 represents a room and 0 represents empty space. Two rooms are connected if they are adjacent horizontally or vertically. Return the number of connected groups of rooms (islands).',
  'A 2D binary grid grid of size m x n where each cell is either "1" (room) or "0" (empty).',
  'An integer representing the number of connected groups of rooms.',
  E'm == grid.length\nn == grid[i].length\n1 <= m, n <= 300\ngrid[i][j] is "0" or "1".',
  '[
    {"input": "grid = [[\"1\",\"1\",\"1\"],[\"0\",\"1\",\"0\"],[\"0\",\"0\",\"0\"]]", "output": "1", "explanation": "All rooms are connected into one group."},
    {"input": "grid = [[\"1\",\"0\",\"1\"],[\"0\",\"0\",\"0\"],[\"1\",\"0\",\"1\"]]", "output": "4", "explanation": "Four isolated rooms, each its own group."},
    {"input": "grid = [[\"1\",\"1\",\"0\"],[\"1\",\"0\",\"0\"],[\"0\",\"0\",\"1\"]]", "output": "2", "explanation": "One L-shaped group and one isolated room."}
  ]'::jsonb,
  'O(m * n)', 'O(m * n)',
  'DFS or BFS from each unvisited room. Mark cells as visited (by flipping "1" to "0" or using a visited set) to avoid counting the same group twice.',
  array['javascript', 'python', 'cpp'],
  '{"javascript": "function countConnectedRooms(grid) {\n  // Write your solution here\n}", "python": "def countConnectedRooms(grid):\n    # Write your solution here\n    pass", "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint countConnectedRooms(vector<vector<char>>& grid) {\n    // Write your solution here\n    return 0;\n}"}'::jsonb,
  '["Iterate over every cell. When you find a room (1) you have not visited, that is the start of a new group.", "From that starting cell, explore all connected rooms using DFS or BFS, marking each as visited.", "Count how many times you start a new exploration — that is your answer."]'::jsonb,
  '["How would you solve this using Union-Find instead of DFS/BFS?", "What changes if diagonal connections also count?", "How would you also return the size of the largest group?"]'::jsonb,
  '["Do diagonal adjacencies count as connected?", "Can I modify the grid in place, or do I need a separate visited structure?", "What should I return for an empty grid?"]'::jsonb,
  '{"algorithmic_approach": "Did the candidate connect the problem to graph traversal without being told?", "communication": "Did the candidate explain their traversal strategy before implementing?"}'::jsonb
);

with q as (select id from public.questions where slug = 'count-connected-rooms')
insert into public.question_test_cases (question_id, label, input, expected_output, is_hidden, weight, explanation)
values
  ((select id from q), 'All connected', '{"grid": [["1","1","1"],["0","1","0"],["0","0","0"]]}', '1', false, 1, 'All rooms form one connected group.'),
  ((select id from q), 'All isolated', '{"grid": [["1","0","1"],["0","0","0"],["1","0","1"]]}', '4', false, 1, 'Four corner rooms, each isolated.'),
  ((select id from q), 'Two groups', '{"grid": [["1","1","0"],["1","0","0"],["0","0","1"]]}', '2', false, 1, 'An L-shaped group and a lone room.');

-- ─── 6. sum-pair-exists ──────────────────────────────────────────────────────

insert into public.questions (
  slug, title, short_summary, difficulty, topic, estimated_minutes, role_level, status, version,
  problem_statement, input_description, output_description, constraints, examples,
  expected_time_complexity, expected_space_complexity, expected_complexity_notes,
  supported_languages, starter_code, hints, follow_up_prompts, clarification_notes, rubric_notes
) values (
  'sum-pair-exists',
  'Sum Pair Exists',
  'Determine whether any two distinct elements in an array sum to a given target — return true or false.',
  'easy', 'Arrays and hash maps', 15, 'intern_grad', 'published', 1,
  'Given an array of integers nums and an integer target, return true if there exist two distinct elements in the array whose sum equals target, or false otherwise.',
  'An array of integers nums and an integer target.',
  'true if any two distinct elements sum to target, false otherwise.',
  E'2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
  '[
    {"input": "nums = [1, 2, 3, 4], target = 7", "output": "true", "explanation": "3 + 4 = 7."},
    {"input": "nums = [1, 2, 3, 4], target = 8", "output": "false", "explanation": "No two elements sum to 8."},
    {"input": "nums = [5, 5], target = 10", "output": "true", "explanation": "5 + 5 = 10, and they are at different indices."}
  ]'::jsonb,
  'O(n)', 'O(n)',
  'Store seen numbers in a set. For each number, check if its complement (target - num) is already in the set.',
  array['javascript', 'python', 'cpp'],
  '{"javascript": "function sumPairExists(nums, target) {\n  // Write your solution here\n}", "python": "def sumPairExists(nums, target):\n    # Write your solution here\n    pass", "cpp": "#include <vector>\nusing namespace std;\n\nbool sumPairExists(vector<int>& nums, int target) {\n    // Write your solution here\n    return false;\n}"}'::jsonb,
  '["For each element, ask: what number would complete the pair?", "A set gives O(1) lookup — can you check for the complement as you iterate?", "Make sure you are using two distinct elements, not the same element twice."]'::jsonb,
  '["How would you find all pairs, not just check existence?", "What if the array is sorted — can you use two pointers?"]'::jsonb,
  '["What does distinct mean here — different values or different indices?", "Can the same element be used twice?", "Is the array sorted?"]'::jsonb,
  '{"problem_understanding": "Did the candidate clarify whether distinct means different indices or different values?", "code_quality": "Is the solution clean and free of unnecessary nested loops?"}'::jsonb
);

with q as (select id from public.questions where slug = 'sum-pair-exists')
insert into public.question_test_cases (question_id, label, input, expected_output, is_hidden, weight, explanation)
values
  ((select id from q), 'Pair exists', '{"nums": [1, 2, 3, 4], "target": 7}', 'true', false, 1, '3 + 4 = 7.'),
  ((select id from q), 'No pair', '{"nums": [1, 2, 3, 4], "target": 8}', 'false', false, 1, 'No two elements sum to 8.'),
  ((select id from q), 'Duplicate values', '{"nums": [5, 5], "target": 10}', 'true', false, 1, 'Two copies of 5 at different indices.');

-- ─── 7. sum-nodes-in-binary-tree ─────────────────────────────────────────────

insert into public.questions (
  slug, title, short_summary, difficulty, topic, estimated_minutes, role_level, status, version,
  problem_statement, input_description, output_description, constraints, examples,
  expected_time_complexity, expected_space_complexity, expected_complexity_notes,
  supported_languages, starter_code, hints, follow_up_prompts, clarification_notes, rubric_notes
) values (
  'sum-nodes-in-binary-tree',
  'Sum Nodes in Binary Tree',
  'Recursively sum all node values in a binary tree — a clean introduction to tree traversal.',
  'easy', 'Trees and recursion', 20, 'intern_grad', 'published', 1,
  'Given the root of a binary tree where each node holds an integer value, return the sum of all node values in the tree.',
  'The root of a binary tree. Each node has a val (integer), left, and right property.',
  'An integer representing the total sum of all node values.',
  E'The number of nodes is in the range [0, 10^4].\n-1000 <= Node.val <= 1000.',
  '[
    {"input": "root = [1, 2, 3]", "output": "6", "explanation": "1 + 2 + 3 = 6."},
    {"input": "root = [1, null, 2]", "output": "3", "explanation": "1 + 2 = 3 (left child is null)."},
    {"input": "root = []", "output": "0", "explanation": "Empty tree — sum is 0."}
  ]'::jsonb,
  'O(n)', 'O(h) where h is the height of the tree',
  'Recurse on left and right subtrees. The base case is when the node is null — return 0.',
  array['javascript', 'python', 'cpp'],
  '{"javascript": "// A TreeNode is: { val: number, left: TreeNode | null, right: TreeNode | null }\nfunction sumNodes(root) {\n  // Write your solution here\n}", "python": "# A TreeNode has: val (int), left (TreeNode or None), right (TreeNode or None)\ndef sumNodes(root):\n    # Write your solution here\n    pass", "cpp": "// struct TreeNode { int val; TreeNode* left; TreeNode* right; };\nint sumNodes(TreeNode* root) {\n    // Write your solution here\n    return 0;\n}"}'::jsonb,
  '["Think about the smallest possible input — what is the sum of an empty tree?", "If you know the sum of the left subtree and the sum of the right subtree, how do you combine them?", "This is a natural fit for recursion. What is your base case?"]'::jsonb,
  '["How would you do this iteratively using a stack or queue?", "What if you needed the sum of only leaf nodes?", "How does the space complexity change between a balanced tree and a degenerate (linked-list-like) tree?"]'::jsonb,
  '["What should I return for a null root?", "Are node values guaranteed to be integers?", "Can values be negative?"]'::jsonb,
  '{"algorithmic_approach": "Did the candidate identify the recursive substructure before coding?", "communication": "Did the candidate explain the base case and recursive case clearly?"}'::jsonb
);

with q as (select id from public.questions where slug = 'sum-nodes-in-binary-tree')
insert into public.question_test_cases (question_id, label, input, expected_output, is_hidden, weight, explanation)
values
  ((select id from q), 'Simple tree', '{"root": [1, 2, 3]}', '6', false, 1, '1 + 2 + 3 = 6.'),
  ((select id from q), 'Right-skewed', '{"root": [1, null, 2]}', '3', false, 1, '1 + 2 = 3, left child is absent.'),
  ((select id from q), 'Empty tree', '{"root": null}', '0', false, 1, 'No nodes — sum is 0.');
